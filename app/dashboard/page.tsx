"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Play,
  Users,
  TrendingUp,
  Video,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Eye,
  MessageSquare,
  Home,
  Sparkles,
  Mail,
  ChevronRight,
  Youtube,
  User,
  GitCompare,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

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

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [channelLoading, setChannelLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  // Fetch YouTube channel data
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setChannelLoading(true)
        // Try to get channel data from localStorage first
        const storedChannel = localStorage.getItem("youtube_channel")
        if (storedChannel) {
          setYoutubeChannel(JSON.parse(storedChannel))
        }
        
        // Always fetch fresh data from API to ensure it's up to date
        const storedToken = localStorage.getItem("youtube_access_token")
        if (storedToken) {
          const response = await fetch(`/api/youtube/channel?access_token=${storedToken}`)
          const data = await response.json()
          
          if (data.success && data.channel) {
            setYoutubeChannel(data.channel)
            // Store in localStorage for quick access
            localStorage.setItem("youtube_channel", JSON.stringify(data.channel))
          } else if (data.expired) {
            // Token expired, try to refresh it
            const refreshToken = localStorage.getItem("youtube_refresh_token")
            if (refreshToken) {
              try {
                const refreshResponse = await fetch("/api/youtube/refresh", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ refreshToken }),
                })
                
                const refreshData = await refreshResponse.json()
                
                if (refreshData.success && refreshData.access_token) {
                  const newAccessToken = refreshData.access_token
                  localStorage.setItem("youtube_access_token", newAccessToken)
                  
                  // Try fetching channel data again with new token
                  const retryResponse = await fetch(`/api/youtube/channel?access_token=${newAccessToken}`)
                  const retryData = await retryResponse.json()
                  
                  if (retryData.success && retryData.channel) {
                    setYoutubeChannel(retryData.channel)
                    localStorage.setItem("youtube_channel", JSON.stringify(retryData.channel))
                  }
                }
              } catch (refreshError) {
                console.error("Token refresh failed:", refreshError)
                // Clear stored tokens if refresh fails
                localStorage.removeItem("youtube_access_token")
                localStorage.removeItem("youtube_refresh_token")
                localStorage.removeItem("youtube_channel")
                setYoutubeChannel(null)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching YouTube channel:", error)
      } finally {
        setChannelLoading(false)
      }
    }

    fetchChannelData()
  }, [])

  // Function to refresh YouTube channel data
  const refreshYouTubeChannel = async () => {
    try {
      setChannelLoading(true)
      // Clear stored channel data
      localStorage.removeItem("youtube_channel")
      
      // Refresh from API
      const storedToken = localStorage.getItem("youtube_access_token")
      if (storedToken) {
        const response = await fetch(`/api/youtube/channel?access_token=${storedToken}`)
        const data = await response.json()
        
        if (data.success && data.channel) {
          setYoutubeChannel(data.channel)
          // Store in localStorage for quick access
          localStorage.setItem("youtube_channel", JSON.stringify(data.channel))
        } else if (data.expired) {
          // Token expired, try to refresh it
          const refreshToken = localStorage.getItem("youtube_refresh_token")
          if (refreshToken) {
            try {
              const refreshResponse = await fetch("/api/youtube/refresh", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
              })
              
              const refreshData = await refreshResponse.json()
              
              if (refreshData.success && refreshData.access_token) {
                const newAccessToken = refreshData.access_token
                localStorage.setItem("youtube_access_token", newAccessToken)
                
                // Try fetching channel data again with new token
                const retryResponse = await fetch(`/api/youtube/channel?access_token=${newAccessToken}`)
                const retryData = await retryResponse.json()
                
                if (retryData.success && retryData.channel) {
                  setYoutubeChannel(retryData.channel)
                  localStorage.setItem("youtube_channel", JSON.stringify(retryData.channel))
                }
              }
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError)
              // Clear stored tokens if refresh fails
              localStorage.removeItem("youtube_access_token")
              localStorage.removeItem("youtube_refresh_token")
              localStorage.removeItem("youtube_channel")
              setYoutubeChannel(null)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing YouTube channel:", error)
    } finally {
      setChannelLoading(false)
    }
  }

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  const stats = youtubeChannel ? [
    {
      icon: Users,
      label: "Subscribers",
      value: formatNumber(youtubeChannel.subscriberCount),
      change: "+2.5%",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: formatNumber(youtubeChannel.viewCount),
      change: "+12.4%",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Video,
      label: "Videos",
      value: formatNumber(youtubeChannel.videoCount),
      change: "+3",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      label: "Avg Views",
      value: "9.4K",
      change: "+5.2%",
      color: "from-green-500 to-green-600",
    },
  ] : [
    {
      icon: Users,
      label: "Subscribers",
      value: "125,432",
      change: "+2.5%",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: "2.3M",
      change: "+12.4%",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Video,
      label: "Videos",
      value: "245",
      change: "+3",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      label: "Avg Views",
      value: "9.4K",
      change: "+5.2%",
      color: "from-green-500 to-green-600",
    },
  ]

  const navLinks = [
    { icon: Home, label: "Dashboard", href: "#", id: "dashboard", active: true },
    { icon: GitCompare, label: "Compare", href: "#", id: "compare", active: false },
    { icon: Video, label: "Content", href: "#", id: "content", active: false },
    { icon: BarChart3, label: "Analytics", href: "#", id: "analytics", active: false },
    { icon: Sparkles, label: "AI Tools", href: "#", id: "ai-tools", active: false },
    { icon: Settings, label: "Settings", href: "#", id: "settings", active: false },
  ]

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId)
    setSidebarOpen(false)
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 pt-2 pb-2 px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
                <Play className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">YouTubeAI Pro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {session && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-md">
                <span className="text-white text-sm font-bold uppercase">
                  {session.user?.email?.substring(0, 2) || "U"}
                </span>
              </div>
            )}
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
              title="Sign Out"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 border-b border-gray-200 bg-white h-16">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
              <Play className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">YouTubeAI Pro</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "Creator Studio"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email || "Premium Plan"}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-200 shadow-md flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 md:hidden z-30 top-16" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:hidden z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-sm ${
                    activePage === link.id
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-700 border border-blue-300/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg bg-transparent border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r border-gray-200 bg-white fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-sm ${
                    activePage === link.id
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-700 border border-blue-300/50 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg bg-transparent border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          {activePage === "dashboard" && <DashboardView stats={stats} isLoading={isLoading} youtubeChannel={youtubeChannel} channelLoading={channelLoading} />}
          {activePage === "compare" && <CompareView />}
          {activePage === "content" && <ContentStudioView />}
          {activePage === "analytics" && <AnalyticsView />}
          {activePage === "ai-tools" && <AIToolsView />}
          {activePage === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only show sidebar button */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-center py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-3 rounded-full"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>
      
      {/* Footer with Terms and Privacy Links */}
      <footer className="mt-auto py-4 text-center text-xs text-gray-500 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms of Service
          </Link>
          <span className="hidden md:inline">•</span>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy Policy
          </Link>
          <span className="hidden md:inline">•</span>
          <span>© {new Date().getFullYear()} YouTubeAI Pro</span>
        </div>
      </footer>
    </div>
  )
}

function CompareView() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Channel Comparison</h1>
        <p className="text-sm md:text-base text-gray-700">
          Compare two YouTube channels to see which one performs better. 
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
        <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Compare YouTube Channels</h2>
        <p className="text-gray-600 mb-6">Enter two channel IDs to compare their performance metrics and see which one ranks higher.</p>
        <Link href="/compare">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
            Go to Comparison Tool
          </Button>
        </Link>
      </div>
    </div>
  )
}

function DashboardView({ stats, isLoading, youtubeChannel, channelLoading }: { stats: any[]; isLoading: boolean; youtubeChannel: YouTubeChannel | null; channelLoading: boolean }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {isLoading ? (
        <div className="mb-6 rounded-2xl bg-white border border-gray-200 p-6 backdrop-blur-sm shadow-sm">
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-6 w-full" />
        </div>
      ) : (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-6 backdrop-blur-sm shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-sm md:text-base text-gray-700">Here's what's happening with your YouTube channel today.</p>
        </div>
      )}

      {/* YouTube Channel Info */}
      {channelLoading ? (
        <div className="mb-6 rounded-2xl bg-white border border-gray-200 p-6 backdrop-blur-sm shadow-sm">
          <Skeleton className="h-20 w-full" />
        </div>
      ) : youtubeChannel ? (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Youtube className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{youtubeChannel.title}</h2>
              <p className="text-gray-600 text-sm">{youtubeChannel.customUrl || youtubeChannel.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="font-semibold">{stats[0].value} subscribers</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-gray-600" />
              <span className="font-semibold">{stats[2].value} videos</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-600" />
              <span className="font-semibold">{stats[1].value} views</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Youtube className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Connect Your YouTube Channel</h2>
              <p className="text-gray-600 text-sm mb-3">You haven't connected your YouTube channel yet.</p>
              <Link href="/connect">
                <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold">
                  Connect Channel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Performance Trend</h2>
            <button className="text-gray-400 hover:text-gray-900 transition">
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
          <div className="h-48 md:h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
              <p className="text-gray-400 font-medium text-sm">Chart visualization</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
          <div className="space-y-2 md:space-y-3">
            <QuickActionButton icon={Video} label="Upload Video" color="from-blue-500 to-blue-600" />
            <QuickActionButton icon={Eye} label="View Analytics" color="from-purple-500 to-purple-600" />
            <QuickActionButton icon={GitCompare} label="Compare Channels" color="from-orange-500 to-orange-600" />
            <QuickActionButton icon={MessageSquare} label="Generate Scripts" color="from-green-500 to-green-600" />
          </div>
        </div>
      </div>

      {/* Engagement Distribution */}
      <div className="mt-6 md:mt-8 bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Engagement Distribution</h2>
        <div className="h-48 md:h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
            <p className="text-gray-400 font-medium text-sm">Chart visualization</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContentStudioView() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-100 to-red-50 border border-gray-200 p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Content Studio</h1>
        <p className="text-sm md:text-base text-gray-700">
          Manage, edit, and organize your video content all in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <ContentCard
          title="Upload New Video"
          icon={Video}
          description="Create and upload new video content"
          color="from-blue-500 to-blue-600"
        />
        <ContentCard
          title="Edit Videos"
          icon={Zap}
          description="Trim, edit, and enhance your videos"
          color="from-purple-500 to-purple-600"
        />
        <ContentCard
          title="Manage Playlists"
          icon={BarChart3}
          description="Organize videos into playlists"
          color="from-orange-500 to-orange-600"
        />
        <ContentCard
          title="Schedule Posts"
          icon={Video}
          description="Plan content for future publishing"
          color="from-green-500 to-green-600"
        />
      </div>
    </div>
  )
}

function AnalyticsView() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-green-100 to-emerald-50 border border-gray-200 p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-sm md:text-base text-gray-700">
          Deep dive into your channel's performance metrics and insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <AnalyticsCard title="Viewer Demographics" description="Age, gender, and location data" />
        <AnalyticsCard title="Traffic Sources" description="See where your viewers come from" />
        <AnalyticsCard title="Watch Time" description="Total and average watch time metrics" />
        <AnalyticsCard title="Engagement Metrics" description="Likes, comments, and shares analysis" />
      </div>
    </div>
  )
}

function AIToolsView() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-100 to-pink-50 border border-gray-200 p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">AI Tools</h1>
        <p className="text-sm md:text-base text-gray-700">Leverage AI to boost your content creation and growth</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <AIToolCard title="Script Generator" description="Generate video scripts with AI" icon={Sparkles} />
        <AIToolCard
          title="Title Optimizer"
          description="AI-powered title suggestions for more clicks"
          icon={Sparkles}
        />
        <AIToolCard title="Thumbnail Creator" description="Auto-generate eye-catching thumbnails" icon={Sparkles} />
        <AIToolCard title="Video Tags" description="Intelligent tag recommendations" icon={Sparkles} />
      </div>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-slate-100 to-gray-50 border border-gray-200 p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-sm md:text-base text-gray-700">Manage your account preferences and configurations</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <SettingCard title="Account Settings" description="Update your profile and basic information" />
        <SettingCard title="Notifications" description="Customize your notification preferences" />
        <SettingCard title="API Keys" description="Manage API keys for integrations" />
        <SettingCard title="Privacy & Security" description="Control your privacy and security settings" />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  change: string
  color: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4 backdrop-blur-sm hover:border-gray-300 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-700 text-xs md:text-sm font-medium">{label}</p>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-green-600 font-semibold">
        {change} <span className="text-gray-600">from last month</span>
      </p>
    </div>
  )
}

function QuickActionButton({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${color} text-white font-medium text-xs md:text-sm hover:opacity-90 transition shadow-md hover:shadow-lg`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

function ContentCard({
  title,
  icon: Icon,
  description,
  color,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 hover:shadow-lg transition">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${color} w-fit mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-xs md:text-sm">{description}</p>
    </div>
  )
}

function AnalyticsCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 hover:shadow-lg transition">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-xs md:text-sm mb-4">{description}</p>
      <div className="h-40 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-lg flex items-center justify-center border border-gray-200">
        <p className="text-gray-400 text-xs md:text-sm">Chart placeholder</p>
      </div>
    </div>
  )
}

function AIToolCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 hover:shadow-lg transition">
      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 w-fit mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-xs md:text-sm">{description}</p>
      <Button className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
        Try Now
      </Button>
    </div>
  )
}

function SettingCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 flex items-center justify-between hover:shadow-lg transition">
      <div>
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-xs md:text-sm">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </div>
  )
}