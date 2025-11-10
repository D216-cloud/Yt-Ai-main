"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, ChevronRight, Lock, Loader2, Youtube, CheckCircle, User, LogOut } from "lucide-react"
import { LockAnimation } from "@/components/lock-animation"

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

export default function ConnectPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/signup"
    }

    // Check if YouTube token is in URL
    const token = searchParams.get("youtube_token")
    const refreshToken = searchParams.get("refresh_token")
    
    if (token) {
      setYoutubeToken(token)
      // Store tokens in localStorage
      if (refreshToken) {
        localStorage.setItem("youtube_refresh_token", refreshToken)
      }
      localStorage.setItem("youtube_access_token", token)
      
      // Fetch channel data
      fetchYouTubeChannel(token)
    } else {
      // Try to load from localStorage
      const storedToken = localStorage.getItem("youtube_access_token")
      if (storedToken) {
        setYoutubeToken(storedToken)
        fetchYouTubeChannel(storedToken)
      }
    }
  }, [status, searchParams])

  const fetchYouTubeChannel = async (accessToken: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/youtube/channel?access_token=${accessToken}`)
      const data = await response.json()

      if (data.success && data.channel) {
        setYoutubeChannel(data.channel)
      } else {
        console.error("Failed to fetch channel:", data.error)
      }
    } catch (error) {
      console.error("Error fetching YouTube channel:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectWithGoogle = () => {
    setIsAuthLoading(true)
    // Redirect to YouTube OAuth
    window.location.href = "/api/youtube/auth"
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
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Channel Preview */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 border-t md:border-t-0 md:border-l border-gray-200">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg p-6 md:p-8 w-full max-w-md mx-auto border border-gray-200 shadow-sm">
              <div className="text-center">
                {isLoading ? (
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 flex items-center justify-center">
                    <div className="animate-spin">
                      <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-blue-600" />
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

                {/* Connect Button */}
                <Button
                  onClick={handleConnectWithGoogle}
                  disabled={isAuthLoading || isLoading || !!youtubeChannel}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 md:py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isAuthLoading || isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                      {isLoading ? "Initializing..." : "Authenticating..."}
                    </>
                  ) : youtubeChannel ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Connected to YouTube
                    </>
                  ) : (
                    "Connect with Google"
                  )}
                </Button>

                {youtubeChannel && (
                  <div className="mt-4 text-center">
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3"
                      >
                        Go to Dashboard
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Safe Area */}
      <div className="md:hidden h-4 bg-white"></div>
    </div>
  )
}