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
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
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
    if (status === 'authenticated' && youtubeChannel && !showUnlockAnimation && !isRedirecting) {
      router.push('/dashboard')
    }
  }, [status, youtubeChannel, showUnlockAnimation, isRedirecting, router])

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

        // Show unlock animation
        setShowUnlockAnimation(true)

        // Redirect to the correct page after animation (3 seconds)
        setTimeout(() => {
          setIsRedirecting(true)
          setTimeout(() => {
            // Check where to redirect
            if (returnPage === "content") {
              localStorage.removeItem("oauth_return_page")
              router.push("/dashboard?page=content")
            } else {
              localStorage.removeItem("oauth_return_page")
              router.push("/dashboard")
            }
          }, 500)
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
    setIsAuthLoading(true)
    setError(null)
    console.log("Initiating Google OAuth flow")
    // Redirect to YouTube OAuth
    window.location.href = "/api/youtube/auth"
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
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-20 md:pt-20 py-12 px-4">
        {/* Centered Container */}
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          {/* Decorative gradient background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -z-10" />

          {/* Unlock Animation Overlay */}
          {showUnlockAnimation && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center rounded-3xl">
              <div className="relative mb-6">
                {/* Animated unlock icon */}
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                    <CheckCircle className="w-16 h-16 text-white animate-bounce-in" />
                  </div>
                </div>
              </div>

              {/* Channel Logo */}
              {youtubeChannel?.thumbnail && (
                <div className="relative mb-4 animate-scale-in">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <img
                    src={youtubeChannel.thumbnail}
                    alt={youtubeChannel.title}
                    className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up">
                Channel Unlocked! 🎉
              </h2>
              <p className="text-gray-600 text-center px-4 mb-4 animate-fade-in-up-delay">
                {youtubeChannel?.title}
              </p>

              {isRedirecting ? (
                <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-semibold">Redirecting to Dashboard...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 animate-fade-in">
                  Loading your dashboard...
                </p>
              )}
            </div>
          )}

          <div className="text-center relative z-10">
            {isLoading ? (
              <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-8 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <Loader2 className="relative w-16 h-16 md:w-20 md:h-20 text-blue-600 animate-spin" />
                </div>
              </div>
            ) : youtubeChannel?.thumbnail ? (
              // Show actual channel logo/thumbnail
              <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                <img
                  src={youtubeChannel.thumbnail}
                  alt={youtubeChannel.title}
                  className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl object-cover ring-4 ring-blue-200 group-hover:ring-blue-400 transition-all"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-2xl ring-4 ring-red-200 group-hover:ring-red-300 transition-all">
                  <Youtube className="w-14 h-14 md:w-16 md:h-16 text-white" />
                </div>
              </div>
            )}

            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              {isLoading ? "Connecting..." : youtubeChannel ? youtubeChannel.title : "Your Channel"}
            </h3>
            <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed">
              {isLoading
                ? "Setting up your YouTube automation..."
                : youtubeChannel
                  ? youtubeChannel.customUrl || "Channel connected successfully"
                  : "Ready to connect and automate your YouTube growth"}
            </p>

            {/* Stats Grid - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 md:p-6 mb-8 border border-gray-200 shadow-inner">
              <div className="text-center">
                <p className="text-gray-600 text-xs md:text-sm mb-2 font-semibold">Subscribers</p>
                <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {youtubeChannel ? formatNumber(youtubeChannel.subscriberCount) : "--"}
                </p>
              </div>
              <div className="text-center border-x border-gray-300">
                <p className="text-gray-600 text-xs md:text-sm mb-2 font-semibold">Videos</p>
                <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {youtubeChannel ? formatNumber(youtubeChannel.videoCount) : "--"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-xs md:text-sm mb-2 font-semibold">Views</p>
                <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  {youtubeChannel ? formatNumber(youtubeChannel.viewCount) : "--"}
                </p>
              </div>
            </div>

            {/* Permissions - Enhanced */}
            <div className="text-left bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 md:p-6 space-y-3 mb-8 border border-blue-200 shadow-sm">
              <p className="text-gray-900 font-bold text-sm md:text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Secure Access Permissions
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-3 text-gray-700 text-xs md:text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Channel analytics & insights</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700 text-xs md:text-sm">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>Video management tools</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700 text-xs md:text-sm">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-pink-600" />
                  </div>
                  <span>AI-powered optimization</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons - Enhanced */}
            <div className="space-y-3">
              {youtubeChannel ? (
                <>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 md:py-5 rounded-xl text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleRefreshChannel}
                      variant="outline"
                      disabled={isLoading}
                      className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 py-3 disabled:opacity-50 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Refresh
                    </Button>

                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleConnectWithGoogle}
                    disabled={isAuthLoading || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 md:py-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isAuthLoading || isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {isLoading ? "Initializing..." : "Authenticating..."}
                      </>
                    ) : (
                      <>
                        <Youtube className="w-5 h-5 mr-2" />
                        Connect with Google
                      </>
                    )}
                  </Button>

                  {/* Skip Button */}
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 py-3 rounded-xl font-medium transition-all"
                  >
                    Skip for now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Safe Area */}
        <div className="md:hidden h-4 bg-white"></div>

        {/* Animations */}
        <style jsx>{`
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
      `}</style>
      </div>
    </div>
  )
}