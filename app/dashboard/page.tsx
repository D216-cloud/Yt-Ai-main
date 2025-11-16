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
  Calendar,
  Globe,
  CheckCircle,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  Hash,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import AiToolsSection from '@/components/ai-tools-section'
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import TrendingVideosCard from '@/components/TrendingVideosCard'

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
  const searchParams = useSearchParams()

  // Function to update the current channel (used by ProfileView)
  const updateCurrentChannel = (channel: YouTubeChannel) => {
    setYoutubeChannel(channel)
    localStorage.setItem("youtube_channel", JSON.stringify(channel))
  }

  // Check for page parameter in URL and set active page
  useEffect(() => {
    const pageParam = searchParams.get("page")
    if (pageParam) {
      setActivePage(pageParam)
      // Clean up URL
      router.replace("/dashboard", { scroll: false })
    }
  }, [searchParams, router])

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
    { icon: User, label: "Profile", href: "#", id: "profile", active: false },
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
        {/* Mobile sidebar and mobile bottom nav removed for simplified mobile UI */}

        {/* Desktop Sidebar (narrow icon column centered inside the existing width) */}
        <aside className="hidden md:block w-64 border-r border-gray-200 fixed left-0 top-16 bottom-0 bg-slate-900 text-slate-100">
          <div className="h-full flex flex-col items-center py-6">
            <div className="mb-6">
              <Link href="/" className="flex items-center flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-xs font-semibold text-slate-200">YouTubeAI</span>
              </Link>
            </div>

            <nav className="flex-1 flex flex-col items-center gap-3 w-full">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = activePage === link.id
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`w-full flex flex-col items-center gap-1 py-3 transition-all ${active ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'}`}
                    title={link.label}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${active ? 'bg-white/10 ring-1 ring-white/20' : 'bg-transparent'} hover:bg-white/5 transition`}>
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-300'}`} />
                    </div>
                    <span className="text-[11px] mt-1 uppercase tracking-wide font-medium">{link.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="mt-6 w-full px-4">
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:opacity-95 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3 9 4-18 3 9h4" />
                </svg>
                <span className="text-sm">Upgrade</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile bottom navigation removed */}
      
      {/* Footer with Terms and Privacy Links */}
        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          {activePage === "dashboard" && <DashboardView stats={stats} isLoading={isLoading} youtubeChannel={youtubeChannel} channelLoading={channelLoading} router={router} />}
          {activePage === "profile" && <ProfileView youtubeChannel={youtubeChannel} channelLoading={channelLoading} session={session} onChannelChange={updateCurrentChannel} />}
          {activePage === "compare" && <CompareView />}
          {activePage === "content" && <ContentStudioView youtubeChannel={youtubeChannel} />}
          {activePage === "analytics" && <AnalyticsView />}
          {activePage === "ai-tools" && <AIToolsView />}
          {activePage === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Mobile bottom single-button nav removed */}
      
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

function ProfileView({ youtubeChannel, channelLoading, session, onChannelChange }: { youtubeChannel: YouTubeChannel | null; channelLoading: boolean; session: any; onChannelChange: (channel: YouTubeChannel) => void }) {
  const [videos, setVideos] = useState<any[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [allChannels, setAllChannels] = useState<YouTubeChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(youtubeChannel)
  const [showChannelDropdown, setShowChannelDropdown] = useState(false)

  // Load all channels
  useEffect(() => {
    const channels: YouTubeChannel[] = []
    
    if (youtubeChannel) {
      channels.push(youtubeChannel)
    }
    
    const storedChannels = localStorage.getItem("additional_youtube_channels")
    if (storedChannels) {
      try {
        const additionalChannels = JSON.parse(storedChannels)
        additionalChannels.forEach((ch: YouTubeChannel) => {
          if (!channels.find(c => c.id === ch.id)) {
            channels.push(ch)
          }
        })
      } catch (e) {
        console.error("Failed to parse additional channels", e)
      }
    }
    
    setAllChannels(channels)
    
    // Load selected channel from localStorage (persists across refreshes)
    const savedSelectedChannelId = localStorage.getItem("selected_channel_id")
    if (savedSelectedChannelId && channels.length > 0) {
      // Find the saved channel in the list
      const savedChannel = channels.find(ch => ch.id === savedSelectedChannelId)
      if (savedChannel) {
        setSelectedChannel(savedChannel)
        // Update parent component if different from current
        if (!youtubeChannel || youtubeChannel.id !== savedChannel.id) {
          onChannelChange(savedChannel)
        }
      } else if (youtubeChannel) {
        // If saved channel not found, use the main channel
        setSelectedChannel(youtubeChannel)
      }
    } else if (youtubeChannel) {
      // No saved selection, use the main channel
      setSelectedChannel(youtubeChannel)
    }
  }, [youtubeChannel])

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  // Local stats for the selected channel (avoid referencing global `stats`)
  const channelStats = selectedChannel ? [
    {
      icon: Users,
      label: 'Subscribers',
      value: formatNumber(selectedChannel.subscriberCount),
      change: '+2.5%',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: formatNumber(selectedChannel.viewCount),
      change: '+12.4%',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Video,
      label: 'Videos',
      value: formatNumber(selectedChannel.videoCount),
      change: '+3',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: TrendingUp,
      label: 'Avg Views',
      value: formatNumber(Math.floor(parseInt(selectedChannel.viewCount) / Math.max(1, parseInt(selectedChannel.videoCount)))),
      change: '+5.2%',
      color: 'from-green-500 to-green-600',
    },
  ] : []

  // Fetch videos when channel is loaded or changed
  useEffect(() => {
    if (selectedChannel) {
      fetchVideos()
    }
  }, [selectedChannel])

  const handleChannelSelect = (channel: YouTubeChannel) => {
    setSelectedChannel(channel)
    setShowChannelDropdown(false)

    // Save selected channel ID to localStorage (persists across refreshes)
    localStorage.setItem("selected_channel_id", channel.id)

    // Update main channel through parent component (updates both Dashboard and Profile)
    onChannelChange(channel)
  }

  const fetchVideos = async () => {
    if (!selectedChannel) return

    try {
      setVideosLoading(true)
      const response = await fetch(`/api/youtube/videos?channelId=${selectedChannel.id}&maxResults=12`)
      const data = await response.json()

      if (data.success && data.videos) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
    } finally {
      setVideosLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-4 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
        </div>
        <p className="text-sm md:text-base text-gray-700">
          View and manage your YouTube channel information
        </p>
      </div>

      {channelLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : selectedChannel ? (
        <div className="space-y-6">
          {/* Channel Selector Card - Show if multiple channels */}
          {allChannels.length > 1 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Channel Selector</h3>
                    <p className="text-xs text-indigo-700">You have {allChannels.length} connected channels</p>
                  </div>
                </div>
                
                {/* Dropdown Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-300 rounded-lg hover:bg-indigo-50 transition-all"
                  >
                    <img
                      src={selectedChannel.thumbnail}
                      alt={selectedChannel.title}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-semibold text-gray-900 text-sm max-w-[150px] truncate">
                      {selectedChannel.title}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${showChannelDropdown ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showChannelDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-indigo-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Switch Channel</p>
                        {allChannels.map((channel) => (
                          <button
                            key={channel.id}
                            onClick={() => handleChannelSelect(channel)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-all ${
                              selectedChannel.id === channel.id ? 'bg-indigo-100 border-2 border-indigo-300' : 'border-2 border-transparent'
                            }`}
                          >
                            <img
                              src={channel.thumbnail}
                              alt={channel.title}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{channel.title}</p>
                              <p className="text-xs text-gray-600 truncate">
                                {formatNumber(channel.subscriberCount)} subscribers • {formatNumber(channel.videoCount)} videos
                              </p>
                            </div>
                            {selectedChannel.id === channel.id && (
                              <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Channel Profile Card */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Cover/Banner Area */}
            <div className="h-32 md:h-40 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              {/* Channel Avatar */}
              <div className="relative -mt-16 mb-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-600 rounded-full blur-lg opacity-50"></div>
                  <img
                    src={selectedChannel.thumbnail}
                    alt={selectedChannel.title}
                    className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl object-cover ring-4 ring-red-200"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Channel Details */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedChannel.title}</h2>
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                </div>
                {selectedChannel.customUrl && (
                  <p className="text-gray-600 mb-2">@{selectedChannel.customUrl}</p>
                )}
                <p className="text-sm text-gray-500 mb-4">Channel ID: {selectedChannel.id}</p>
                
                {selectedChannel.description && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedChannel.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <p className="text-xs font-medium text-blue-900">Subscribers</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-blue-900">
                    {formatNumber(selectedChannel.subscriberCount)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <p className="text-xs font-medium text-purple-900">Total Views</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-purple-900">
                    {formatNumber(selectedChannel.viewCount)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-orange-600" />
                    <p className="text-xs font-medium text-orange-900">Videos</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-orange-900">
                    {formatNumber(selectedChannel.videoCount)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="text-xs font-medium text-green-900">Avg Views</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-green-900">
                    {formatNumber(Math.floor(parseInt(selectedChannel.viewCount) / parseInt(selectedChannel.videoCount)))}
                  </p>
                </div>
              </div>

              {/* Channel Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Channel Created</h3>
                  </div>
                  <p className="text-gray-700">{formatDate(selectedChannel.publishedAt)}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Channel URL</h3>
                  </div>
                  <a
                    href={`https://youtube.com/channel/${selectedChannel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all hover:underline"
                  >
                    youtube.com/channel/{selectedChannel.id}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Email</span>
                <span className="text-gray-900">{session?.user?.email || 'Not available'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Account Name</span>
                <span className="text-gray-900">{session?.user?.name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600 font-medium">Connection Status</span>
                <span className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/connect">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Channel Data
                </Button>
              </Link>
              <Link href={`https://youtube.com/channel/${selectedChannel.id}`} target="_blank">
                <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50 font-semibold h-12">
                  <Youtube className="w-5 h-5 mr-2" />
                  View on YouTube
                </Button>
              </Link>
            </div>
          </div>

          {/* Videos Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-6 h-6 text-red-600" />
                Latest Videos
              </h3>
              {videos.length > 0 && (
                <span className="text-sm text-gray-500">{videos.length} videos</span>
              )}
            </div>

            {videosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-red-300">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                          {video.title}
                        </h4>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{formatNumber(video.viewCount || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{formatNumber(video.likeCount || 0)}</span>
                          </div>
                          {video.commentCount > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{formatNumber(video.commentCount)}</span>
                            </div>
                          )}
                        </div>

                        {/* Published Date */}
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(video.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No videos found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <Youtube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Channel Connected</h2>
          <p className="text-gray-600 mb-6">Connect your YouTube channel to view your profile information</p>
          <Link href="/connect">
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold">
              <Youtube className="w-5 h-5 mr-2" />
              Connect YouTube Channel
            </Button>
          </Link>
        </div>
      )}
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

function DashboardView({ stats, isLoading, youtubeChannel, channelLoading, router }: { stats: any[]; isLoading: boolean; youtubeChannel: YouTubeChannel | null; channelLoading: boolean; router: any }) {
  const [trendingKeywords, setTrendingKeywords] = useState<{keyword: string, frequency: number}[]>([])
  const [loadingKeywords, setLoadingKeywords] = useState(true)
  const [trendingVideos, setTrendingVideos] = useState<any[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [latestVideo, setLatestVideo] = useState<any | null>(null)
  const [loadingLatest, setLoadingLatest] = useState(true)

  useEffect(() => {
    const fetchTrendingKeywords = async () => {
      try {
        setLoadingKeywords(true)
        const response = await fetch('/api/youtube/trending?maxResults=20')
        const data = await response.json()
        
        if (data.success) {
          if (data.keywords) setTrendingKeywords(data.keywords)
          if (data.videos) setTrendingVideos(data.videos)
        }
      } catch (error) {
        console.error('Error fetching trending keywords:', error)
        } finally {
        setLoadingKeywords(false)
        setLoadingVideos(false)
      }
    }

    fetchTrendingKeywords()
  }, [])

  // Fetch latest video from connected channel (if available)
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoadingLatest(true)
        if (!youtubeChannel) {
          setLatestVideo(null)
          return
        }

        const response = await fetch(`/api/youtube/videos?channelId=${youtubeChannel.id}&maxResults=1`)
        const data = await response.json()
        if (data.success && data.videos && data.videos.length > 0) {
          setLatestVideo(data.videos[0])
        } else {
          setLatestVideo(null)
        }
      } catch (err) {
        console.error('Error fetching latest video:', err)
        setLatestVideo(null)
      } finally {
        setLoadingLatest(false)
      }
    }

    fetchLatest()
  }, [youtubeChannel])

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
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            {/* Show real channel logo/thumbnail */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img
                src={youtubeChannel.thumbnail}
                alt={youtubeChannel.title}
                className="relative w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover ring-2 ring-red-200 group-hover:ring-red-400 transition-all"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <Youtube className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{youtubeChannel.title}</h2>
              <p className="text-gray-600 text-sm truncate">{youtubeChannel.customUrl || youtubeChannel.id}</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
        {/* Custom action cards as requested */}
        {[
          {
            icon: Hash,
            label: 'Find Trending Keywords',
            value: trendingKeywords?.length ? `${trendingKeywords.length}` : 'Explore',
            change: 'Discover hot terms',
            color: 'from-blue-500 to-blue-600',
              front: true,
              image: '/images/trending-keywords-preview.svg',
              cta: 'Find Trending Keywords',
              onClick: () => {
              // Scroll to the trending keywords section
              const el = document.getElementById('trending-keywords')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          },
          {
            icon: Sparkles,
            label: 'Enhance Your Thumbnails',
            value: 'Improve CTR',
            change: 'AI thumbnail generator',
            color: 'from-purple-500 to-purple-600',
            front: true,
            image: '/images/ai-thumbnails-preview.svg',
            cta: 'Create Thumbnails',
            onClick: () => {
              const el = document.getElementById('ai-thumbnails')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              else router.push('/ai-tools')
            }
          },
          {
            icon: Video,
            label: 'Find Trending Videos',
            value: trendingVideos?.length ? `${trendingVideos.length}` : 'Explore',
            change: 'Top trending vids',
            color: 'from-green-500 to-green-600',
            front: true,
            image: '/images/trending-videos-preview.svg',
            cta: 'Find Trending Videos',
            onClick: () => {
              const el = document.getElementById('trending-videos')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          },
          {
            icon: Zap,
            label: "Add unique features",
            value: 'Exclusive',
            change: "Add things other platforms don't have",
            color: 'from-orange-500 to-orange-600',
            front: true,
            image: '/images/create-thumbnails-preview.svg',
            cta: 'Get Video Ideas',
            onClick: () => router.push('/ai-tools')
          }
        ].map((card, idx) => (
          card.front ? (
            <AIToolButton
              key={idx}
              icon={card.icon}
              title={card.label}
              description={card.change}
              gradient={card.color}
              onClick={card.onClick}
            />
          ) : (
            <StatCard key={idx} {...card} />
          )
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Performance Trend with Trending Keywords */}
        <div id="trending-keywords" className="lg:col-span-2 bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Performance Trend</h2>
            <button className="text-gray-400 hover:text-gray-900 transition">
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Optimize Your Latest Video</h3>
            <a href="/content" className="text-sm text-blue-500 hover:underline">View All</a>
          </div>

          <LatestVideoCard video={latestVideo} loading={loadingLatest} channel={youtubeChannel} />

          {/* Trending videos area (used by action card scroll) */}
          <div id="trending-videos" className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Trending Videos</h3>
            <TrendingVideosCard trendingVideos={trendingVideos} loadingVideos={loadingVideos} />
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

        {/* AI Tools Preview - easier access from the Dashboard */}
        <div className="lg:col-span-1">
          <AiToolsSection />
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

function ContentStudioView({ youtubeChannel }: { youtubeChannel: YouTubeChannel | null }) {
  const [showBulkChannelModal, setShowBulkChannelModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [allChannels, setAllChannels] = useState<YouTubeChannel[]>([])
  const [uploadType, setUploadType] = useState<'short' | 'long'>('long')
  const [selectedChannelsForUpload, setSelectedChannelsForUpload] = useState<string[]>([])
  const [selectedUploadChannel, setSelectedUploadChannel] = useState<YouTubeChannel | null>(null)
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '22', // People & Blogs
    privacy: 'public',
    madeForKids: false
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<Array<{channelId: string, channelName: string, videoUrl: string}>>([])
  const [showUploadResults, setShowUploadResults] = useState(false)

  // Load all connected channels from localStorage
  useEffect(() => {
    const loadAllChannels = () => {
      const channels: YouTubeChannel[] = []
      
      // Load main channel
      if (youtubeChannel) {
        channels.push(youtubeChannel)
      }
      
      // Load additional channels from localStorage
      const storedChannels = localStorage.getItem("additional_youtube_channels")
      if (storedChannels) {
        try {
          const additionalChannels = JSON.parse(storedChannels)
          // Filter out duplicates
          additionalChannels.forEach((ch: YouTubeChannel) => {
            if (!channels.find(c => c.id === ch.id)) {
              channels.push(ch)
            }
          })
        } catch (e) {
          console.error("Failed to parse additional channels", e)
        }
      }
      
      setAllChannels(channels)
      
      // Set default upload channel to the first available channel
      if (channels.length > 0 && selectedChannelsForUpload.length === 0) {
        setSelectedChannelsForUpload([channels[0].id])
        setSelectedUploadChannel(channels[0])
      }
    }
    
    loadAllChannels()
  }, [youtubeChannel])

  const handleConnectNewChannel = () => {
    // Store current page context before OAuth redirect
    localStorage.setItem("oauth_return_page", "content")
    
    // Open OAuth in a popup window instead of redirect (for better UX)
    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const popup = window.open(
      "/api/youtube/auth",
      "YouTube OAuth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    )
    
    // Listen for popup close and refresh channels
    const checkPopupClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopupClosed)
        // Reload channels after OAuth completes
        setTimeout(() => {
          const loadAllChannels = () => {
            const channels: YouTubeChannel[] = []
            
            if (youtubeChannel) {
              channels.push(youtubeChannel)
            }
            
            const storedChannels = localStorage.getItem("additional_youtube_channels")
            if (storedChannels) {
              try {
                const additionalChannels = JSON.parse(storedChannels)
                additionalChannels.forEach((ch: YouTubeChannel) => {
                  if (!channels.find(c => c.id === ch.id)) {
                    channels.push(ch)
                  }
                })
              } catch (e) {
                console.error("Failed to parse additional channels", e)
              }
            }
            
            setAllChannels(channels)
          }
          
          loadAllChannels()
          // Set default upload channel after loading
          if (allChannels.length > 0) {
            setSelectedUploadChannel(allChannels[0])
          }
        }, 1000)
      }
    }, 500)
  }

  const handleRemoveChannel = (channelId: string) => {
    // Remove specific channel
    const updatedChannels = allChannels.filter(ch => ch.id !== channelId)
    
    // If it's the main channel
    if (youtubeChannel && youtubeChannel.id === channelId) {
      localStorage.removeItem("youtube_access_token")
      localStorage.removeItem("youtube_refresh_token")
      localStorage.removeItem("youtube_channel")
    } else {
      // Update additional channels
      const additionalChannels = updatedChannels.filter(ch => ch.id !== youtubeChannel?.id)
      localStorage.setItem("additional_youtube_channels", JSON.stringify(additionalChannels))
    }
    
    setAllChannels(updatedChannels)
  }

  const formatNumber = (num: string | number): string => {
    const number = typeof num === 'string' ? parseInt(num) : num
    if (number >= 1000000) return (number / 1000000).toFixed(1) + "M"
    if (number >= 1000) return (number / 1000).toFixed(1) + "K"
    return number.toString()
  }

  // Local stats for the selected upload channel (used inside upload modal)
  const uploadChannelStats: { icon: React.ComponentType<{ className?: string }>, label: string, value: string, change: string, color: string }[] = selectedUploadChannel ? [
    {
      icon: Users,
      label: 'Subscribers',
      value: formatNumber(selectedUploadChannel.subscriberCount),
      change: '+2.5%',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: formatNumber(selectedUploadChannel.viewCount),
      change: '+12.4%',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Video,
      label: 'Videos',
      value: formatNumber(selectedUploadChannel.videoCount),
      change: '+3',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: TrendingUp,
      label: 'Avg Views',
      value: formatNumber(Math.floor(parseInt(selectedUploadChannel.viewCount) / Math.max(1, parseInt(selectedUploadChannel.videoCount)))),
      change: '+5.2%',
      color: 'from-green-500 to-green-600',
    }
  ] : []

  const totalSubscribers = allChannels.reduce((sum, channel) => {
    return sum + parseInt(channel.subscriberCount)
  }, 0)

  const totalVideos = allChannels.reduce((sum, channel) => {
    return sum + parseInt(channel.videoCount)
  }, 0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, WebM, MOV, AVI)')
        return
      }
      
      // Check file size (max 2GB for Shorts, 128GB for long videos)
      const maxSize = uploadType === 'short' ? 2 * 1024 * 1024 * 1024 : 128 * 1024 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`File size exceeds ${uploadType === 'short' ? '2GB' : '128GB'} limit`)
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a video file')
      return
    }

    if (!uploadData.title.trim()) {
      alert('Please enter a video title')
      return
    }

    if (!selectedUploadChannel) {
      alert('Please select a channel to upload to')
      return
    }

    const accessToken = localStorage.getItem('youtube_access_token')
    if (!accessToken) {
      alert('YouTube access token not found. Please reconnect your channel.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('title', uploadData.title)
      formData.append('description', uploadData.description)
      formData.append('tags', uploadData.tags)
      formData.append('privacy', uploadData.privacy)
      formData.append('madeForKids', uploadData.madeForKids.toString())
      formData.append('category', uploadData.category)
      formData.append('access_token', accessToken)

      // Simulate progress for large files
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 1000)

      // Upload to YouTube API
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        body: formData,
      })
      
      clearInterval(progressInterval)
      const data = await response.json()
      
      if (data.success) {
        setUploadProgress(100)
        
        setTimeout(() => {
          alert(`${uploadType === 'short' ? 'Short' : 'Video'} "${uploadData.title}" uploaded successfully to ${selectedUploadChannel?.title}!\n\nVideo URL: ${data.video.url}`)
          setShowUploadModal(false)
          resetUploadForm()
          
          // Optionally redirect to the video
          if (confirm('Do you want to view the video on YouTube?')) {
            window.open(data.video.url, '_blank')
          }
        }, 500)
      } else if (data.expired) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('youtube_refresh_token')
        if (refreshToken) {
          const refreshResponse = await fetch('/api/youtube/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })
          
          const refreshData = await refreshResponse.json()
          
          if (refreshData.success && refreshData.access_token) {
            localStorage.setItem('youtube_access_token', refreshData.access_token)
            alert('Session refreshed. Please try uploading again.')
          } else {
            alert('Your session has expired. Please reconnect your YouTube channel.')
          }
        } else {
          alert('Your session has expired. Please reconnect your YouTube channel.')
        }
        setIsUploading(false)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message || 'Please try again.'}`)
      setIsUploading(false)
    }
  }

  const resetUploadForm = () => {
    setUploadData({
      title: '',
      description: '',
      tags: '',
      category: '22',
      privacy: 'public',
      madeForKids: false
    })
    setSelectedFile(null)
    setUploadProgress(0)
    setUploadType('long')
    // Reset to first channel
    if (allChannels.length > 0) {
      setSelectedUploadChannel(allChannels[0])
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !isUploading && setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Upload Video</h2>
                    <p className="text-white/80 text-sm">Upload Shorts or Long videos to your channel</p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>
            {/* Channel stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {uploadChannelStats.map((s: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; change: string; color: string }, idx: number) => (
                <StatCard
                  key={idx}
                  icon={s.icon}
                  label={s.label}
                  value={s.value}
                  change={s.change}
                  color={s.color}
                />
              ))}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Video Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">Video Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setUploadType('short')}
                    disabled={isUploading}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      uploadType === 'short'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className={`w-6 h-6 ${uploadType === 'short' ? 'text-red-600' : 'text-gray-600'}`} />
                      <h3 className={`font-bold ${uploadType === 'short' ? 'text-red-900' : 'text-gray-900'}`}>
                        YouTube Shorts
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600">Vertical video, up to 60 seconds</p>
                  </button>

                  <button
                    onClick={() => setUploadType('long')}
                    disabled={isUploading}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      uploadType === 'long'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Video className={`w-6 h-6 ${uploadType === 'long' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <h3 className={`font-bold ${uploadType === 'long' ? 'text-blue-900' : 'text-gray-900'}`}>
                        Long Video
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600">Standard video, any duration</p>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">Video File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <Video className="w-8 h-8 text-green-600" />
                        <div className="text-left">
                          <p className="font-bold text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        {!isUploading && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedFile(null)
                            }}
                            className="ml-4 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="font-semibold text-gray-900 mb-1">Click to upload video</p>
                        <p className="text-sm text-gray-600">
                          {uploadType === 'short' ? 'Max 2GB, up to 60 seconds' : 'Max 128GB'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV, AVI</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Video Details */}
              <div className="space-y-4">
                {/* Channel Selector */}
                {allChannels.length > 1 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Upload to Channel <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {allChannels.map((channel) => (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => setSelectedUploadChannel(channel)}
                          disabled={isUploading}
                          className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl transition-all ${
                            selectedUploadChannel?.id === channel.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <img
                            src={channel.thumbnail}
                            alt={channel.title}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <p className={`font-bold text-sm truncate ${
                              selectedUploadChannel?.id === channel.id ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {channel.title}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {formatNumber(channel.subscriberCount)} subscribers • {formatNumber(channel.videoCount)} videos
                            </p>
                          </div>
                          {selectedUploadChannel?.id === channel.id && (
                            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      You have {allChannels.length} connected channels. Select which channel to upload this video to.
                    </p>
                  </div>
                )}

                {/* Show selected channel if only one channel */}
                {allChannels.length === 1 && selectedUploadChannel && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <label className="block text-sm font-bold text-blue-900 mb-2">Uploading to</label>
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedUploadChannel.thumbnail}
                        alt={selectedUploadChannel.title}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-blue-900 text-sm truncate">{selectedUploadChannel.title}</p>
                        <p className="text-xs text-blue-700 truncate">
                          {formatNumber(selectedUploadChannel.subscriberCount)} subscribers
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Title {uploadType === 'short' && <span className="text-xs text-gray-600">(Add #Shorts for better reach)</span>}
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    disabled={isUploading}
                    placeholder={uploadType === 'short' ? 'Amazing moment! #Shorts' : 'Enter video title'}
                    maxLength={100}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">{uploadData.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    disabled={isUploading}
                    placeholder="Describe your video..."
                    rows={4}
                    maxLength={5000}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{uploadData.description.length}/5000 characters</p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                    disabled={isUploading}
                    placeholder="gaming, tutorial, funny"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                {/* Privacy */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Privacy</label>
                  <select
                    value={uploadData.privacy}
                    onChange={(e) => setUploadData({ ...uploadData, privacy: e.target.value })}
                    disabled={isUploading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {/* Made for Kids */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="madeForKids"
                    checked={uploadData.madeForKids}
                    onChange={(e) => setUploadData({ ...uploadData, madeForKids: e.target.checked })}
                    disabled={isUploading}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="madeForKids" className="text-sm font-medium text-gray-900">
                    Made for kids
                  </label>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-blue-900">Uploading...</span>
                    <span className="text-sm font-bold text-blue-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">Please don't close this window...</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !uploadData.title.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload {uploadType === 'short' ? 'Short' : 'Video'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Channel Modal */}
      {showBulkChannelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulkChannelModal(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Bulk Channel Manager</h2>
                    <p className="text-white/80 text-sm">Manage all your YouTube channels in one place</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBulkChannelModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Stats Overview */}
              {allChannels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-blue-900 text-sm">Connected Channels</h4>
                      <Youtube className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{allChannels.length}</p>
                    <p className="text-xs text-blue-700 mt-1">Active {allChannels.length === 1 ? 'channel' : 'channels'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-purple-900 text-sm">Total Subscribers</h4>
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-purple-900">{formatNumber(totalSubscribers.toString())}</p>
                    <p className="text-xs text-purple-700 mt-1">Across all channels</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-green-900 text-sm">Total Videos</h4>
                      <Video className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-900">{formatNumber(totalVideos.toString())}</p>
                    <p className="text-xs text-green-700 mt-1">Combined content</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Youtube className="w-6 h-6 text-yellow-600" />
                    <h4 className="font-bold text-yellow-900">No Channel Connected</h4>
                  </div>
                  <p className="text-sm text-yellow-800">Connect your YouTube channel to manage it here.</p>
                </div>
              )}

              {/* Channel List */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Your Channels</h3>
                
                {allChannels.length > 0 ? (
                  <div className="space-y-3">
                    {allChannels.map((channel) => (
                      <div key={channel.id} className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all group">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity"></div>
                          <img
                            src={channel.thumbnail}
                            alt={channel.title}
                            className="relative w-14 h-14 rounded-full shadow-lg object-cover border-2 border-white"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors truncate">
                              {channel.title}
                            </h4>
                            <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                              Active
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span className="font-semibold">{formatNumber(channel.subscriberCount)} subscribers</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="w-3.5 h-3.5" />
                              <span className="font-semibold">{formatNumber(channel.videoCount)} videos</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors" title="Manage Channel">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="View Analytics">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveChannel(channel.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors" 
                            title="Disconnect Channel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                    <Youtube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No channels connected yet</p>
                    <Button
                      onClick={handleConnectNewChannel}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      Connect Your First Channel
                    </Button>
                  </div>
                )}
              </div>

              {/* Add New Channel Button - Always show */}
              <button
                onClick={handleConnectNewChannel}
                className="w-full mt-6 p-4 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-indigo-100 group-hover:bg-indigo-200 rounded-full transition-colors">
                    <Plus className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {allChannels.length > 0 ? 'Connect Another Channel' : 'Connect Your First Channel'}
                    </p>
                    <p className="text-sm text-gray-600">Add {allChannels.length > 0 ? 'more' : ''} YouTube channels to manage</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {allChannels.length > 0
                    ? `Managing ${allChannels.length} ${allChannels.length === 1 ? 'channel' : 'channels'} • All channels appear in Profile and Dashboard` 
                    : "Connect channels to manage them here"}
                </p>
                <Button
                  onClick={() => setShowBulkChannelModal(false)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header with Gradient Border */}
      <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 border border-orange-300 p-[2px] shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-full blur-md opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-orange-600 to-red-600 rounded-full p-2.5 shadow-lg">
                <Video className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              Content Studio
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Manage, edit, and organize your video content all in one place with powerful AI tools
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Video className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-white/90">Total Videos</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
            245
          </p>
          <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>+12 this month</span>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-white/90">Draft Videos</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
            8
          </p>
          <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
            <ChevronRight className="w-3 h-3" />
            <span>In progress</span>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-white/90">Playlists</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
            18
          </p>
          <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
            <Sparkles className="w-3 h-3" />
            <span>Organized</span>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-white/90">Scheduled</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
            5
          </p>
          <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
            <Globe className="w-3 h-3" />
            <span>Ready to publish</span>
          </div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <EnhancedContentCard
          title="Upload New Video"
          icon={Video}
          description="Create and upload new video content with AI-powered optimization"
          color="from-blue-500 to-blue-600"
          badge="Quick Start"
          badgeColor="bg-blue-100 text-blue-700"
          onClick={() => setShowUploadModal(true)}
        />
        <EnhancedContentCard
          title="Edit Videos"
          icon={Zap}
          description="Trim, edit, and enhance your videos with advanced editing tools"
          color="from-purple-500 to-purple-600"
          badge="Pro Tools"
          badgeColor="bg-purple-100 text-purple-700"
        />
        <EnhancedContentCard
          title="Manage Playlists"
          icon={BarChart3}
          description="Organize videos into playlists and optimize viewer retention"
          color="from-orange-500 to-orange-600"
          badge="Organize"
          badgeColor="bg-orange-100 text-orange-700"
        />
        <EnhancedContentCard
          title="Schedule Posts"
          icon={Calendar}
          description="Plan content for future publishing with smart scheduling"
          color="from-green-500 to-green-600"
          badge="Auto Publish"
          badgeColor="bg-green-100 text-green-700"
        />
        <EnhancedContentCard
          title="AI Thumbnails"
          icon={Sparkles}
          description="Generate eye-catching thumbnails using AI technology"
          color="from-pink-500 to-rose-600"
          badge="AI Powered"
          badgeColor="bg-pink-100 text-pink-700"
        />
        <EnhancedContentCard
          title="Bulk Channel Manager"
          icon={Users}
          description="Manage multiple YouTube channels in one place with bulk actions"
          color="from-indigo-500 to-indigo-600"
          badge="Multi-Channel"
          badgeColor="bg-indigo-100 text-indigo-700"
          onClick={() => setShowBulkChannelModal(true)}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Recent Activity</h3>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1 group">
            View All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="space-y-3">
          <ActivityItem
            icon={Video}
            title="New video uploaded"
            description="'How to grow your YouTube channel' - Published 2 hours ago"
            color="from-blue-500 to-blue-600"
            time="2h ago"
          />
          <ActivityItem
            icon={Sparkles}
            title="Thumbnail generated"
            description="AI created 5 thumbnail options for your latest video"
            color="from-purple-500 to-purple-600"
            time="5h ago"
          />
          <ActivityItem
            icon={TrendingUp}
            title="Video trending"
            description="'Best YouTube Tips' is gaining 2.5K views/hour"
            color="from-green-500 to-green-600"
            time="1d ago"
          />
          <ActivityItem
            icon={Calendar}
            title="Scheduled post ready"
            description="'Weekly Vlog #45' scheduled for tomorrow at 2 PM"
            color="from-orange-500 to-orange-600"
            time="2d ago"
          />
        </div>
      </div>

      {/* AI Tools Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-50 animate-pulse"></div>
            <div className="relative p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">AI-Powered Tools</h3>
            <p className="text-sm text-gray-600">Supercharge your content creation workflow</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AIToolButton
            icon={Sparkles}
            title="Title Generator"
            description="Create click-worthy titles"
            gradient="from-blue-500 to-cyan-500"
          />
          <AIToolButton
            icon={MessageSquare}
            title="Description Writer"
            description="SEO-optimized descriptions"
            gradient="from-purple-500 to-pink-500"
          />
          <AIToolButton
            icon={Video}
            title="Script Generator"
            description="AI-written video scripts"
            gradient="from-orange-500 to-red-500"
          />
        </div>
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
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  change: string
  color: string
  onClick?: () => void
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick() }}
      onClick={() => onClick?.()}
      className={`bg-white border border-gray-200 rounded-2xl p-4 backdrop-blur-sm hover:border-gray-300 hover:shadow-lg transition transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-700 text-xs md:text-sm font-medium">{label}</p>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {change ? (
        <p className="text-xs text-green-600 font-semibold">
          {change} <span className="text-gray-600">from last month</span>
        </p>
      ) : null}
    </div>
  )
}

function FrontActionCard({
  title,
  cta,
  image,
  description,
  onClick,
}: {
  title: string
  cta: string
  image?: string
  description?: string
  onClick?: () => void
}) {
  // Map titles to appropriate icons
  const getIcon = (title: string) => {
    if (title.includes('Keywords')) return Hash
    if (title.includes('Thumbnails')) return Sparkles
    if (title.includes('Videos')) return Video
    if (title.includes('unique features')) return Zap
    return Hash // fallback
  }

  const getGradient = (title: string) => {
    if (title.includes('Keywords')) return 'from-blue-500 to-cyan-500'
    if (title.includes('Thumbnails')) return 'from-purple-500 to-pink-500'
    if (title.includes('Videos')) return 'from-green-500 to-teal-500'
    if (title.includes('unique features')) return 'from-orange-500 to-red-500'
    return 'from-gray-500 to-gray-600'
  }

  const Icon = getIcon(title)
  const gradient = getGradient(title)

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick() }}
      onClick={() => onClick?.()}
      className="group relative bg-white border-2 border-purple-200 rounded-xl p-4 hover:shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-4"
    >
      <div className="relative flex-shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-lg blur-md opacity-0 group-hover:opacity-60 transition-opacity`} />
        <div className={`relative p-2.5 w-fit rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}> 
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 truncate">{title}</h4>
        <p className="text-gray-600 text-xs truncate mt-1">{description ?? cta}</p>
        <div className="flex items-center gap-1 text-purple-600 text-xs font-semibold mt-3">
          <span>Try Now</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
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

function EnhancedContentCard({
  title,
  icon: Icon,
  description,
  color,
  badge,
  badgeColor,
  onClick,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
  badge: string
  badgeColor: string
  onClick?: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:scale-105 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity`}></div>
          <div className={`relative p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {description}
      </p>
      <button className="w-full mt-auto py-2 px-4 bg-gray-100 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white text-gray-700 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
        <span>Get Started</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

function ActivityItem({
  icon: Icon,
  title,
  description,
  color,
  time,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
  time: string
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
      <div className="relative flex-shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity`}></div>
        <div className={`relative p-2.5 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
            {title}
          </h4>
          <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">{time}</span>
        </div>
        <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
    </div>
  )
}

function AIToolButton({
  icon: Icon,
  title,
  description,
  gradient,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  gradient: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white border border-purple-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 text-left w-full"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg bg-linear-to-br ${gradient} shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1">{title}</h4>
          <p className="text-gray-600 text-xs md:text-sm line-clamp-2">{description}</p>

          <div className="mt-4 text-purple-600 font-semibold text-xs flex items-center gap-1">
            <span>Try Now</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </button>
  )
}

function AnalyticsCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 hover:shadow-lg transition">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-xs md:text-sm">{description}</p>
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
      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 w-fit mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-xs md:text-sm">{description}</p>
    </div>
  )
}

function SettingCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 hover:shadow-lg transition">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-xs md:text-sm">{description}</p>
    </div>
  )
}

function TrendingKeywordsCard({ trendingKeywords, loadingKeywords }: { trendingKeywords: { keyword: string, frequency: number }[], loadingKeywords: boolean }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could add a toast notification here
        console.log('Copied to clipboard:', text)
      })
      .catch(err => {
        console.error('Failed to copy:', err)
      })
  }

  if (loadingKeywords) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading trending keywords...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[300px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
        {trendingKeywords.length > 0 ? (
          trendingKeywords.map((item: { keyword: string, frequency: number }, index: number) => (
            <div 
              key={index}
              className="group relative bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer"
              onClick={() => copyToClipboard(item.keyword)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{item.keyword}</h3>
                  <p className="text-xs text-gray-500 mt-1">Frequency: {item.frequency}</p>
                </div>
                <button 
                  className="ml-2 p-1.5 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(item.keyword)
                  }}
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center py-10">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600">No trending keywords found</p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Click on any keyword to copy it to clipboard
      </div>
    </div>
  )
}

function LatestVideoCard({ video, loading, channel }: { video: any | null, loading: boolean, channel: YouTubeChannel | null }) {
  const formatNumber = (num: string | number): string => {
    const n = typeof num === 'string' ? parseInt(num) : num
    if (isNaN(n)) return '0'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-white border border-gray-200 rounded-xl p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading latest video...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM4 6h8v12H4z" />
          </svg>
          <p className="text-gray-600">No recent videos found</p>
        </div>
      </div>
    )
  }

  const titleScore = Math.min(99, Math.max(0, (video?.title?.length || 0) % 100))
  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center gap-4">
      {/* Thumbnail */}
      <div className="w-full md:w-36 flex-shrink-0">
        <img src={video.thumbnail} alt={video.title} className="w-full h-40 md:h-20 object-cover rounded-md shadow-md" />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-base md:text-lg truncate">{video.title}</h3>
        <p className="text-sm text-slate-300 mt-1">{formatNumber(video.viewCount || 0)} views · {timeAgo(video.publishedAt)}</p>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <div className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-200 font-semibold">Title {titleScore}</div>
          <button className="text-xs px-3 py-1 border border-slate-700 rounded-full text-slate-200 hover:bg-slate-800/60 transition">Generate scores <span className="ml-1 text-slate-400">+</span></button>
        </div>
      </div>

      {/* Optimize button - full width on mobile, compact on desktop */}
      <div className="w-full md:w-auto flex-shrink-0">
        <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" className="w-full md:inline-flex justify-center items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition inline-flex">
          <Sparkles className="w-4 h-4" />
          <span>Optimize</span>
        </a>
      </div>
    </div>
  )
}
