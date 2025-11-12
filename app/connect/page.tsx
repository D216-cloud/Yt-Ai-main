"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, ChevronRight, Lock, Loader2, Youtube, CheckCircle, User, LogOut, RefreshCw, AlertCircle, X } from "lucide-react"

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
        
        if (returnPage === "content") {
          // Content page - add to additional channels array (don't replace main)
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
      {/* Mobile & Desktop Header */}
      <div className="w-full md:hidden pt-2 px-4 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">YouTubeAI Pro</p>
              {session?.user && (
                <p className="text-xs text-gray-500">{session.user.email}</p>
              )}
            </div>
          </div>
          {session?.user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/signup" })}
              className="text-gray-600 text-xs"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex h-16 items-center px-8 border-b border-gray-200 bg-white w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">YouTubeAI Pro</span>
          </Link>
          {session?.user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm">
                  {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {session.user.name || session.user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/signup" })}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-center md:py-12">
        {/* Desktop Centered Container */}
        <div className="w-full md:max-w-6xl md:mx-auto flex flex-col md:flex-row md:gap-8 md:px-8">
          {/* Left Section - Auth Methods */}
          <div className="w-full md:w-1/2 flex flex-col p-4 md:p-8 overflow-y-auto">
            <div className="flex flex-col justify-center h-full md:h-auto md:min-h-[500px]">
              <div className="max-w-md mx-auto w-full">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mb-4">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span className="text-xs md:text-sm font-semibold text-gray-700">Connect YouTube</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">Unlock Automation</h1>
                  <p className="text-sm md:text-lg text-gray-600">
                    Securely connect your channel to access AI-powered growth tools
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Connect Your YouTube Channel</h2>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-800 text-sm font-medium">{error}</p>
                        <button
                          onClick={() => setError(null)}
                          className="text-red-600 text-xs underline hover:text-red-800 mt-1"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                 
                  {/* Google OAuth Button */}
                  <button
                    onClick={handleConnectWithGoogle}
                    disabled={isAuthLoading}
                    className="w-full p-4 md:p-5 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-lg flex items-center justify-center font-bold text-lg md:text-xl border border-gray-200 flex-shrink-0">
                        G
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Google Sign-In</h3>
                        <p className="text-gray-600 text-xs md:text-sm">Connect your YouTube channel with Google OAuth</p>
                      </div>
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>

                  {/* Security Badge */}
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3 md:p-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                    <p className="text-green-700 text-xs md:text-sm font-medium">
                      Secure connection with Google OAuth
                    </p>
                  </div>
                  
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                    <h3 className="font-semibold text-blue-900 text-sm mb-2">Connection Instructions</h3>
                    <ul className="text-blue-800 text-xs space-y-1">
                      <li>• Click the button above to start the connection process</li>
                      <li>• Sign in with your Google account</li>
                      <li>• Grant permission to access your YouTube channel</li>
                      <li>• You'll be redirected back to this page when complete</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Channel Preview */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 border-t md:border-t-0 md:border-l border-gray-200">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg p-6 md:p-8 w-full max-w-md mx-auto border border-gray-200 shadow-sm relative overflow-hidden">
              {/* Unlock Animation Overlay */}
              {showUnlockAnimation && (
                <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center">
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
              
              <div className="text-center">
                {isLoading ? (
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 flex items-center justify-center">
                    <div className="animate-spin">
                      <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-blue-600" />
                    </div>
                  </div>
                ) : youtubeChannel?.thumbnail ? (
                  // Show actual channel logo/thumbnail
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <img
                      src={youtubeChannel.thumbnail}
                      alt={youtubeChannel.title}
                      className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-xl object-cover ring-2 ring-blue-200 hover:ring-blue-400 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg hover:shadow-xl transition">
                      <Youtube className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {isLoading ? "Connecting..." : youtubeChannel ? youtubeChannel.title : "Your Channel"}
                </h3>
                <p className="text-gray-600 text-sm md:text-base mb-6">
                  {isLoading
                    ? "Setting up your YouTube automation..."
                    : youtubeChannel
                      ? youtubeChannel.customUrl || "Channel connected successfully"
                      : "Ready to connect and automate your YouTube growth"}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 bg-gray-50 rounded-lg p-4 md:p-5 mb-6 border border-gray-200">
                  <div>
                    <p className="text-gray-600 text-xs md:text-sm mb-1 font-medium">Subscribers</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {youtubeChannel ? formatNumber(youtubeChannel.subscriberCount) : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs md:text-sm mb-1 font-medium">Videos</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {youtubeChannel ? formatNumber(youtubeChannel.videoCount) : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs md:text-sm mb-1 font-medium">Views</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {youtubeChannel ? formatNumber(youtubeChannel.viewCount) : "--"}
                    </p>
                  </div>
                </div>

                {/* Permissions */}
                <div className="text-left bg-gray-50 rounded-lg p-4 md:p-5 space-y-2 mb-6 border border-gray-200">
                  <p className="text-gray-900 font-semibold text-xs md:text-sm">We'll access:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2 text-gray-600 text-xs md:text-sm">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                      Channel analytics
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 text-xs md:text-sm">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                      Video management
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 text-xs md:text-sm">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                      AI optimization
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {youtubeChannel ? (
                    <>
                      <Button
                        onClick={() => router.push("/dashboard")}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 md:py-4 rounded-lg text-base"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Go to Dashboard
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleRefreshChannel}
                          variant="outline"
                          disabled={isLoading}
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 py-2 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-1" />
                          )}
                          Refresh
                        </Button>
                        
                        <Button
                          onClick={handleDisconnect}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 py-2"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={handleConnectWithGoogle}
                      disabled={isAuthLoading || isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 md:py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {isAuthLoading || isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                          {isLoading ? "Initializing..." : "Authenticating..."}
                        </>
                      ) : (
                        "Connect with Google"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Connected Channels Section */}
      <div className="w-full border-t border-gray-200 bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </h3>
                {recentActivities.length > 0 && (
                  <span className="text-xs text-gray-500">{recentActivities.length} activities</span>
                )}
              </div>
              
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Youtube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No recent activity yet</p>
                  <p className="text-gray-400 text-xs mt-1">Connect a channel to see activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'connect' ? 'bg-green-100' : 
                        activity.type === 'disconnect' ? 'bg-red-100' : 
                        activity.type === 'refresh' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'connect' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {activity.type === 'disconnect' && <X className="w-5 h-5 text-red-600" />}
                        {activity.type === 'refresh' && <RefreshCw className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'oauth' && <Youtube className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.channelName}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{activity.details}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connected Channels */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  Connected Channels
                </h3>
                <span className="text-xs text-gray-500">
                  {youtubeChannel ? (additionalChannels.length + 1) : additionalChannels.length} channel{(youtubeChannel ? additionalChannels.length + 1 : additionalChannels.length) !== 1 ? 's' : ''}
                </span>
              </div>

              {!youtubeChannel && additionalChannels.length === 0 ? (
                <div className="text-center py-8">
                  <Youtube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No channels connected</p>
                  <p className="text-gray-400 text-xs mt-1">Connect your first channel to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Main Channel */}
                  {youtubeChannel && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                      <img
                        src={youtubeChannel.thumbnail}
                        alt={youtubeChannel.title}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{youtubeChannel.title}</p>
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">Main</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{formatNumber(youtubeChannel.subscriberCount)} subscribers</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    </div>
                  )}

                  {/* Additional Channels */}
                  {additionalChannels.map((channel) => (
                    <div key={channel.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <img
                        src={channel.thumbnail}
                        alt={channel.title}
                        className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{channel.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{formatNumber(channel.subscriberCount)} subscribers</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
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
  )
}