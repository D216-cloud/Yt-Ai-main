"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, ChevronRight, Lock, Loader2, Youtube, CheckCircle, User, LogOut, RefreshCw, AlertCircle, X, Sparkles } from "lucide-react"
import { Header } from "@/components/header"

interface YouTubeChannel {
  id: string
  title: string
  description: string
  customUrl?: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
  viewCount: string
  publishedAt: string
}

interface RecentActivity {
  id: string
  type: 'connect' | 'refresh' | 'disconnect' | 'oauth'
  channelName: string
  channelId: string
  timestamp: number
  details?: string
}

export default function ConnectPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // New states for the updated flow
  const [isStartingAuth, setIsStartingAuth] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisDone, setAnalysisDone] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [additionalChannels, setAdditionalChannels] = useState<YouTubeChannel[]>([])

  // Load all data from localStorage on mount
  useEffect(() => {
    loadMainChannel()
    loadRecentActivities()
    loadAdditionalChannels()
    cleanupTempData()
  }, [])

  // Auto-redirect to dashboard if already connected
  useEffect(() => {
    // If the user is authenticated and already has a connected channel, redirect to dashboard
    // but do not redirect while we are performing an analysis step
    if (status === 'authenticated' && youtubeChannel && !isAnalyzing && !isRedirecting) {
      router.push('/dashboard')
    }
  }, [status, youtubeChannel, isAnalyzing, isRedirecting, router])

  const loadMainChannel = () => {
    try {
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        const channel = JSON.parse(stored)
        setYoutubeChannel(channel)
        console.log('Loaded main channel from storage:', channel.title)
      }

      // Also load the token
      const token = localStorage.getItem('youtube_access_token')
      if (token) {
        setYoutubeToken(token)
      }
    } catch (error) {
      console.error('Failed to load main channel:', error)
    }
  }

  const cleanupTempData = () => {
    // Debug: Check what's in localStorage
    console.log('=== localStorage Debug ===')
    console.log('Main channel:', localStorage.getItem('youtube_channel') ? 'EXISTS' : 'MISSING')
    console.log('Access token:', localStorage.getItem('youtube_access_token') ? 'EXISTS' : 'MISSING')
    console.log('Temp token:', localStorage.getItem('temp_youtube_access_token') ? 'EXISTS (SHOULD BE CLEANED)' : 'NONE')
    console.log('Additional channels:', localStorage.getItem('additional_youtube_channels') ? 'EXISTS' : 'NONE')
    console.log('Recent activities:', localStorage.getItem('youtube_recent_activities') ? 'EXISTS' : 'NONE')
    console.log('========================')

    // Clean up any orphaned temp tokens (older than 10 minutes)
    const tempTokenTime = localStorage.getItem('temp_token_timestamp')
    if (tempTokenTime) {
      const age = Date.now() - parseInt(tempTokenTime)
      if (age > 10 * 60 * 1000) { // 10 minutes
        localStorage.removeItem('temp_youtube_access_token')
        localStorage.removeItem('temp_youtube_refresh_token')
        localStorage.removeItem('temp_token_timestamp')
        console.log('✅ Cleaned up expired temp tokens')
      } else {
        console.log('⚠️ Temp tokens exist but are still valid (less than 10 minutes old)')
      }
    }

    // Force cleanup of temp data if no timestamp exists but temp tokens do
    if (!tempTokenTime && localStorage.getItem('temp_youtube_access_token')) {
      console.log('⚠️ Found temp tokens without timestamp - cleaning up')
      localStorage.removeItem('temp_youtube_access_token')
      localStorage.removeItem('temp_youtube_refresh_token')
    }
  }

  const loadRecentActivities = () => {
    try {
      const stored = localStorage.getItem('youtube_recent_activities')
      if (stored) {
        const activities = JSON.parse(stored)
        // Sort by timestamp descending (newest first) and take last 5
        setRecentActivities(activities.sort((a: RecentActivity, b: RecentActivity) => b.timestamp - a.timestamp).slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to load recent activities:', error)
    }
  }

  const loadAdditionalChannels = () => {
    try {
      const stored = localStorage.getItem('additional_youtube_channels')
      if (stored) {
        setAdditionalChannels(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load additional channels:', error)
    }
  }

  const addActivity = (type: RecentActivity['type'], channelName: string, channelId: string, details?: string) => {
    try {
      const stored = localStorage.getItem('youtube_recent_activities')
      const activities: RecentActivity[] = stored ? JSON.parse(stored) : []

      const newActivity: RecentActivity = {
        id: Date.now().toString(),
        type,
        channelName,
        channelId,
        timestamp: Date.now(),
        details
      }

      activities.unshift(newActivity) // Add to beginning

      // Keep only last 20 activities
      const trimmed = activities.slice(0, 20)

      localStorage.setItem('youtube_recent_activities', JSON.stringify(trimmed))
      loadRecentActivities()
    } catch (error) {
      console.error('Failed to save activity:', error)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/signup"
    }

    // Check for error parameter
    const errorParam = searchParams.get("error")
    if (errorParam) {
      let errorMessage = "Failed to connect to YouTube. Please try again."

      switch (errorParam) {
        case "access_denied":
          errorMessage = "Access denied. Please grant permission to connect your YouTube channel."
          break
        case "invalid_client":
          errorMessage = "Invalid client configuration. Please contact support."
          break
        case "missing_client_id":
          errorMessage = "Missing client ID. Please contact support."
          break
        case "missing_credentials":
          errorMessage = "Missing credentials. Please contact support."
          break
        case "token_failed":
          errorMessage = "Failed to obtain access token. Please try again."
          break
        case "auth_failed":
          errorMessage = "Authentication failed. Please try again."
          break
        default:
          errorMessage = errorParam || errorMessage
      }

      setError(errorMessage)
    }

    // Check if YouTube token is in URL
    const token = searchParams.get("youtube_token")
    const refreshToken = searchParams.get("refresh_token")

    if (token) {
      console.log("Received YouTube token from OAuth flow")
      setYoutubeToken(token)

      // Check where the OAuth was initiated from
      const returnPage = localStorage.getItem("oauth_return_page")

      if (returnPage === "content") {
        // For additional channels, we'll store the token with channel ID after fetching
        // Store temporarily for now
        localStorage.setItem("temp_youtube_access_token", token)
        localStorage.setItem("temp_token_timestamp", Date.now().toString())
        if (refreshToken) {
          localStorage.setItem("temp_youtube_refresh_token", refreshToken)
        }
      } else {
        // Main channel - store as usual
        localStorage.setItem("youtube_access_token", token)
        if (refreshToken) {
          localStorage.setItem("youtube_refresh_token", refreshToken)
        }
      }

      // Fetch channel data
      fetchYouTubeChannel(token)
    } else {
      // Try to load from localStorage
      const storedToken = localStorage.getItem("youtube_access_token")
      if (storedToken) {
        console.log("Using stored YouTube token")
        setYoutubeToken(storedToken)
        fetchYouTubeChannel(storedToken)
      }
    }
  }, [status, searchParams])

  const fetchYouTubeChannel = async (accessToken: string) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Fetching YouTube channel with token:", accessToken.substring(0, 10) + "...")

      const response = await fetch(`/api/youtube/channel?access_token=${accessToken}`)
      const data = await response.json()
      console.log("Channel API response:", data)

      if (data.success && data.channel) {
        const newChannel = data.channel

        // Check where the OAuth was initiated from
        const returnPage = localStorage.getItem("oauth_return_page")

        if (returnPage === "content" || returnPage === "sidebar" || returnPage === "dashboard") {
          // Content/sidebar/dashboard page - add to additional channels array (don't replace main)
          const existingMainChannel = localStorage.getItem("youtube_channel")

          if (existingMainChannel) {
            const mainChannel = JSON.parse(existingMainChannel)

            // Get existing additional channels
            const additionalChannelsStr = localStorage.getItem("additional_youtube_channels")
            const additionalChannels = additionalChannelsStr ? JSON.parse(additionalChannelsStr) : []

            // Check if this is the same as main channel
            const isMainChannel = mainChannel.id === newChannel.id
            // Check if already in additional channels
            const alreadyAdded = additionalChannels.find((ch: YouTubeChannel) => ch.id === newChannel.id)

            if (!isMainChannel && !alreadyAdded) {
              // Add new channel to additional channels
              additionalChannels.push(newChannel)
              localStorage.setItem("additional_youtube_channels", JSON.stringify(additionalChannels))

              // Store channel-specific token
              const tempToken = localStorage.getItem("temp_youtube_access_token")
              const tempRefreshToken = localStorage.getItem("temp_youtube_refresh_token")

              if (tempToken) {
                localStorage.setItem(`youtube_access_token_${newChannel.id}`, tempToken)
                localStorage.removeItem("temp_youtube_access_token")
              }
              if (tempRefreshToken) {
                localStorage.setItem(`youtube_refresh_token_${newChannel.id}`, tempRefreshToken)
                localStorage.removeItem("temp_youtube_refresh_token")
              }
              localStorage.removeItem("temp_token_timestamp")

              console.log("Added new channel with its own token:", newChannel.title)
              addActivity('connect', newChannel.title, newChannel.id, 'Additional channel connected via OAuth')
            } else if (isMainChannel) {
              console.log("Channel is already the main channel:", newChannel.title)
              // Clean up temp tokens
              localStorage.removeItem("temp_youtube_access_token")
              localStorage.removeItem("temp_youtube_refresh_token")
              localStorage.removeItem("temp_token_timestamp")
            } else {
              console.log("Channel already added:", newChannel.title)
              // Clean up temp tokens
              localStorage.removeItem("temp_youtube_access_token")
              localStorage.removeItem("temp_youtube_refresh_token")
              localStorage.removeItem("temp_token_timestamp")
            }
          } else {
            // No main channel yet, set this as main
            setYoutubeChannel(newChannel)
            localStorage.setItem("youtube_channel", JSON.stringify(newChannel))

            // Use temp token as main token
            const tempToken = localStorage.getItem("temp_youtube_access_token")
            const tempRefreshToken = localStorage.getItem("temp_youtube_refresh_token")

            if (tempToken) {
              localStorage.setItem("youtube_access_token", tempToken)
              localStorage.removeItem("temp_youtube_access_token")
            }
            if (tempRefreshToken) {
              localStorage.setItem("youtube_refresh_token", tempRefreshToken)
              localStorage.removeItem("temp_youtube_refresh_token")
            }

            console.log("Set as main channel:", newChannel.title)
          }
        } else {
          // Dashboard or first time - set as main channel
          setYoutubeChannel(newChannel)
          localStorage.setItem("youtube_channel", JSON.stringify(newChannel))
          console.log("Successfully fetched main channel:", newChannel.title)
          addActivity('connect', newChannel.title, newChannel.id, 'Main channel connected successfully')
        }

        // Load additional channels and activities after update
        loadAdditionalChannels()
        loadRecentActivities()

        // New flow: show analyzing screen instead of immediate redirect
        setIsAnalyzing(true)
        setAnalysisDone(false)

        // Simulate analysis work for 3 seconds, then mark done
        setTimeout(() => {
          setIsAnalyzing(false)
          setAnalysisDone(true)
        }, 3000)
      } else {
        console.error("Failed to fetch channel:", data.error)
        setError(data.error || "Failed to fetch channel data")
        // Clear stored tokens if they're invalid
        localStorage.removeItem("youtube_access_token")
        localStorage.removeItem("youtube_refresh_token")
        localStorage.removeItem("youtube_channel")
      }
    } catch (error: any) {
      console.error("Error fetching YouTube channel:", error)
      setError("Network error. Please try again.")
      // Clear stored tokens on error
      localStorage.removeItem("youtube_access_token")
      localStorage.removeItem("youtube_refresh_token")
      localStorage.removeItem("youtube_channel")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectWithGoogle = () => {
    // Trigger the start animation to replace IQ logo with user's logo
    setIsStartingAuth(true)
    setIsAuthLoading(true)
    setError(null)
    console.log("Initiating Google OAuth flow - showing start animation")

    // Use popup flow to avoid navigating away and opening a new tab
    setTimeout(() => {
      setIsStartingAuth(false)
      setIsAuthLoading(true)
      // Mark return page so server knows this was from connect page
      localStorage.setItem('oauth_return_page', 'dashboard')

      const popup = window.open('/api/youtube/auth?popup=true', 'youtube-auth', 'width=500,height=600')

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
          const { channel, token, refreshToken } = event.data as any

          try {
            // If main channel doesn't exist set it, otherwise add to additional channels
            const existingMain = localStorage.getItem('youtube_channel')
            if (!existingMain) {
              localStorage.setItem('youtube_channel', JSON.stringify(channel))
              if (token) localStorage.setItem('youtube_access_token', token)
              if (refreshToken) localStorage.setItem('youtube_refresh_token', refreshToken)
              addActivity('connect', channel.title, channel.id, 'Main channel connected')
            } else {
              // Additional channels
              const existing = JSON.parse(localStorage.getItem('additional_youtube_channels') || '[]')
              const already = existing.some((ch: any) => ch.id === channel.id)
              if (!already) {
                existing.push(channel)
                localStorage.setItem('additional_youtube_channels', JSON.stringify(existing))
                if (token) localStorage.setItem(`youtube_access_token_${channel.id}`, token)
                if (refreshToken) localStorage.setItem(`youtube_refresh_token_${channel.id}`, refreshToken)
                addActivity('connect', channel.title, channel.id, 'Additional channel connected via OAuth')
              }
            }

            alert(`Successfully connected ${channel.title}`)

            // Cleanup and navigate to dashboard
            window.removeEventListener('message', messageListener)
            if (popup && !popup.closed) popup.close()
            router.push('/dashboard')
          } catch (err) {
            console.error('Failed to process connected channel:', err)
            alert('Failed to save connected channel. Please try again.')
            window.removeEventListener('message', messageListener)
            if (popup && !popup.closed) popup.close()
          }
        } else if (event.data.type === 'YOUTUBE_AUTH_ERROR') {
          alert('YouTube auth failed. Please try again.')
          window.removeEventListener('message', messageListener)
          if (popup && !popup.closed) popup.close()
        }
      }

      window.addEventListener('message', messageListener)

      // Fallback in case the popup is blocked or closed
      const checkClosed = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageListener)
          setIsAuthLoading(false)
          setIsStartingAuth(false)
        }
      }, 1000)
    }, 550)
  }

  const handleRefreshChannel = async () => {
    if (!youtubeToken) {
      setError("No access token found. Please reconnect your YouTube channel.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log("Refreshing YouTube channel data")

      // Fetch channel data with current access token
      await fetchYouTubeChannel(youtubeToken)

      if (youtubeChannel) {
        addActivity('refresh', youtubeChannel.title, youtubeChannel.id, 'Channel data refreshed')
      }
    } catch (error) {
      console.error("Refresh error:", error)
      setError("Failed to refresh channel data. Please try reconnecting.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    console.log("Disconnecting YouTube channel")

    if (youtubeChannel) {
      addActivity('disconnect', youtubeChannel.title, youtubeChannel.id, 'Channel disconnected')
    }

    // Clear all YouTube related data
    localStorage.removeItem("youtube_access_token")
    localStorage.removeItem("youtube_refresh_token")
    localStorage.removeItem("youtube_channel")
    setYoutubeToken(null)
    setYoutubeChannel(null)
  }

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Use shared Header component */}
      <Header />



      {/* Main Content - Centered Card */}
      <div className={`relative flex-1 flex items-center justify-center overflow-hidden pt-20 md:pt-20 py-12 px-4 ${!youtubeChannel ? 'bg-gradient-to-b from-sky-900 via-blue-600 to-sky-200 text-white' : 'bg-gradient-to-b from-gray-50 to-white text-gray-900'}`}>
        {/* Centered Container */}
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          {/* Decorative gradient background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -z-10" />



          <div className="text-center relative z-10">
            {/* Not connected — hero-style welcome */}
            {!youtubeChannel && !isLoading && !isAuthLoading ? (
              <div className="min-h-[64vh] flex flex-col items-center justify-center gap-6 text-center text-white">
                <div className="inline-flex items-center gap-3 bg-black/50 px-3 py-1 rounded-full">
                  <div className="flex -space-x-1">
                    <span className="w-6 h-6 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-xs font-bold">A</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-xs font-bold">B</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-xs font-bold">C</span>
                  </div>
                  <span className="text-sm font-medium">Used by 20M+</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isStartingAuth ? 'bg-white/90 ring-4 ring-white shadow-lg' : 'bg-white/10'}`}>
                    {isStartingAuth ? (
                      session?.user?.image ? (
                        <img src={session.user.image} alt={session.user.name || 'Me'} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <span className="text-black font-bold text-lg">{session?.user?.name ? session.user.name[0].toUpperCase() : 'M'}</span>
                      )
                    ) : (
                      <div className="text-white font-black text-lg">IQ</div>
                    )}
                  </div>

                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-red-600">
                    <Youtube className="w-8 h-8" />
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-white">Unlock your feed</h1>
                <p className="text-white/80 max-w-xl mx-auto">Connect your channel to see real insights, titles, and growth opportunities powered by vidiq</p>

                <div className="w-full max-w-md">
                  <Button onClick={handleConnectWithGoogle} className="w-full bg-white text-black py-4 rounded-full shadow-lg flex items-center justify-center gap-3">
                    <Youtube className="w-5 h-5" />
                    <span className="font-semibold">Connect YouTube Channel</span>
                  </Button>
                  <button onClick={() => router.push('/dashboard')} className="mt-3 block text-white/80">Skip for now</button>
                </div>
              </div>
            ) : (
              /* Analyzing / Connected states */
              <div className="min-h-[56vh] flex flex-col items-center justify-center gap-6">
                <h2 className="text-2xl font-bold text-gray-900">Analyzing your channel</h2>
                <p className="text-gray-600">Spotting what's ready to take off</p>

                <div className="w-full max-w-md h-44 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative">
                  {/* Thumbnail strip */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {youtubeChannel ? (
                      <img src={youtubeChannel.thumbnail} alt={youtubeChannel.title} className="w-36 h-36 rounded-md object-cover shadow-lg" />
                    ) : (
                      <div className="w-36 h-36 bg-gray-300 rounded-md animate-pulse" />
                    )}
                    <div className="w-1 h-40 bg-blue-500 rounded-md ml-4" />
                  </div>
                </div>

                {youtubeChannel && (
                  <div className="flex items-center gap-4">
                    <img src={youtubeChannel.thumbnail} alt={youtubeChannel.title} className="w-16 h-16 rounded-full object-cover" />
                    <div className="text-left">
                      <div className="font-bold text-lg">{youtubeChannel.title}</div>
                      <div className="text-sm text-gray-600">{formatNumber(youtubeChannel.videoCount)} videos • {formatNumber(youtubeChannel.subscriberCount)} subscribers</div>
                    </div>
                  </div>
                )}

                <div className="w-full max-w-md">
                  <Button onClick={() => router.push('/dashboard')} disabled={isAnalyzing && !analysisDone} className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 rounded-full shadow-lg">
                    {isAnalyzing && !analysisDone ? 'Analyzing...' : 'Go to Dashboard'}
                  </Button>
                </div>

                {/* small helper */}
                <p className="text-xs text-gray-500">We analyze recent uploads, tags, and title performance for quick recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Safe Area */}
        <div className="md:hidden h-4 bg-white"></div>

        {/* Animations */}
        <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out 0.3s both;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out 0.6s both;
        }
        .animate-fade-in-up-delay {
          animation: fade-in-up 0.5s ease-out 0.8s both;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out 1s both;
        }
      `}} />
      </div>
    </div>
  )
}