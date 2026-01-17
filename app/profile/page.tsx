"use client"

export const dynamic = 'force-dynamic'

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import SidebarButton from '@/components/ui/sidebar-button'
import { Button } from "@/components/ui/button"
import {
  Play,
  Users,
  TrendingUp,
  Video,
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
  User,
  GitCompare,
  Calendar,
  Globe,
  CheckCircle,
  RefreshCw,
  Youtube,
  ChevronRight,
  Upload,
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

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [channelLoading, setChannelLoading] = useState(true)
  const [videos, setVideos] = useState<any[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [allChannels, setAllChannels] = useState<YouTubeChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null)
  const [showChannelDropdown, setShowChannelDropdown] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  // Fetch YouTube channel data
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        if (typeof window === 'undefined') return
        
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
            localStorage.setItem("youtube_channel", JSON.stringify(data.channel))
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

  // Fetch videos when channel is loaded
  useEffect(() => {
    if (youtubeChannel) {
      // sync selected channel and load videos
      setSelectedChannel(youtubeChannel)
      fetchVideos()
    }
  }, [youtubeChannel])

  // Load additional channels and keep a combined list
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const channels: YouTubeChannel[] = []
    if (youtubeChannel) channels.push(youtubeChannel)

    const stored = localStorage.getItem('additional_youtube_channels')
    if (stored) {
      try {
        const extra = JSON.parse(stored)
        extra.forEach((ch: YouTubeChannel) => {
          if (!channels.find(c => c.id === ch.id)) channels.push(ch)
        })
      } catch (e) {
        console.error('Failed to parse additional_youtube_channels', e)
      }
    }

    setAllChannels(channels)

    // restore selected channel if saved
    const saved = localStorage.getItem('selected_channel_id')
    if (saved) {
      const sel = channels.find(c => c.id === saved)
      if (sel) setSelectedChannel(sel)
    }
  }, [youtubeChannel])

  const fetchVideos = async () => {
    if (!youtubeChannel) return

    try {
      setVideosLoading(true)
      // Request all pages from the API so we can show all videos (including unlisted/private if returned by the API)
      // use `fetchAll=true` to instruct the server to aggregate paginated results
      const storedToken = localStorage.getItem("youtube_access_token")
      let response
      if (storedToken) {
        // When we have an OAuth access token, request the authenticated user's videos using mine=true
        response = await fetch(`/api/youtube/videos?mine=true&fetchAll=true&access_token=${storedToken}`)
      } else {
        response = await fetch(`/api/youtube/videos?channelId=${youtubeChannel.id}&fetchAll=true`)
      }
      const data = await response.json()

      if (data.success && data.videos) {
        // Show all videos returned by the API (no slicing)
        setVideos(Array.isArray(data.videos) ? data.videos : [])
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
    } finally {
      setVideosLoading(false)
    }
  }

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
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

  const navLinks = [
    { icon: Home, label: "Dashboard", href: "/dashboard", id: "dashboard" },
    { icon: Upload, label: "Upload", href: "/upload", id: "upload" },
    { icon: User, label: "Profile", href: "/profile", id: "profile" },
    { icon: GitCompare, label: "Compare", href: "/compare", id: "compare" },
    { icon: Video, label: "Content", href: "#", id: "content" },
    { icon: BarChart3, label: "Analytics", href: "#", id: "analytics" },
    { icon: Upload, label: "Bulk Upload", href: "/upload/normal", id: "bulk-upload" },
    { icon: Settings, label: "Settings", href: "#", id: "settings" },
  ]

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 pt-2 pb-2 px-4">
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
              size="sm"
              className="p-2"
              title="Sign Out"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white h-16">
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
              const isActive = link.id === "profile"
              return (
                <SidebarButton
                  key={link.id}
                  id={link.id}
                  href={link.href}
                  label={link.label}
                  Icon={Icon}
                  isActive={isActive}
                  onClick={() => setSidebarOpen(false)}
                />
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start h-12 text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
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
              const isActive = link.id === "profile"
              return (
                <SidebarButton
                  key={link.id}
                  id={link.id}
                  href={link.href}
                  label={link.label}
                  Icon={Icon}
                  isActive={isActive}
                />
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start h-12 text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-20 md:pt-20 md:ml-64 pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">
      {/* Header with Gradient Animation */}
      <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border border-blue-300 p-[2px] shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-md opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-2.5 shadow-lg">
                <User className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Channel Profile
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            View and manage your YouTube channel information, analytics, and settings
          </p>
        </div>
      </div>            {channelLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            ) : youtubeChannel ? (
              <div className="space-y-6">
          {/* Channel Profile Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-purple-300">
            {/* Cover/Banner Area with Animation */}
            <div className="h-32 md:h-48 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-x"></div>
              <div className="absolute inset-0 bg-black/10"></div>
              {/* Animated Pattern Overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              </div>
            </div>                  {/* Profile Info */}
                  <div className="relative px-6 pb-6">
              {/* Channel Avatar */}
              <div className="relative -mt-16 md:-mt-20 mb-4">
                <div className="relative inline-block group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse"></div>
                  <div className="relative">
                    <img
                      src={youtubeChannel.thumbnail}
                      alt={youtubeChannel.title}
                      className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl object-cover ring-4 ring-purple-200 group-hover:ring-purple-400 transition-all duration-300 group-hover:scale-105"
                    />
                    {/* Verified Badge */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Youtube className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>                    {/* Channel Details */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{youtubeChannel.title}</h2>
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      </div>
                      {youtubeChannel.customUrl && (
                        <p className="text-gray-600 mb-2">@{youtubeChannel.customUrl}</p>
                      )}
                      <p className="text-sm text-gray-500 mb-4">Channel ID: {youtubeChannel.id}</p>
                      
                      {youtubeChannel.description && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {youtubeChannel.description}
                          </p>
                        </div>
                      )}
                    </div>

              {/* Stats Grid with Enhanced Design */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 border-2 border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-white/90">Subscribers</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                    {formatNumber(youtubeChannel.subscriberCount)}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>+2.5% growth</span>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 border-2 border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Eye className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-white/90">Total Views</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                    {formatNumber(youtubeChannel.viewCount)}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.4% growth</span>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 border-2 border-orange-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Video className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-white/90">Videos</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                    {formatNumber(youtubeChannel.videoCount)}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>Total uploads</span>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 border-2 border-green-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-white/90">Avg Views</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                    {formatNumber(Math.floor(parseInt(youtubeChannel.viewCount) / parseInt(youtubeChannel.videoCount)))}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
                    <BarChart3 className="w-3 h-3" />
                    <span>Per video</span>
                  </div>
                </div>
              </div>                    {/* Channel Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">Channel Created</h3>
                        </div>
                        <p className="text-gray-700">{formatDate(youtubeChannel.publishedAt)}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Globe className="w-5 h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">Channel URL</h3>
                        </div>
                        <a
                          href={`https://youtube.com/channel/${youtubeChannel.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm break-all hover:underline"
                        >
                          youtube.com/channel/{youtubeChannel.id}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Connected Channels / Quick Actions */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Connected Channels</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowChannelDropdown(true)}
                          className="text-sm px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 hover:bg-indigo-100"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => {
                            const width = 600
                            const height = 700
                            const left = (window.screen.width - width) / 2
                            const top = (window.screen.height - height) / 2
                            window.open('/api/youtube/auth', 'YouTube OAuth', `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`)
                          }}
                          className="text-sm px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md hover:opacity-95"
                        >
                          Connect Channel
                        </button>
                      </div>
                    </div>

                    {allChannels.length > 0 ? (
                      <div className="space-y-2">
                        {allChannels.map((ch) => (
                          <div key={ch.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                            <img src={ch.thumbnail} alt={ch.title} className="w-10 h-10 rounded-full object-cover border" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{ch.title}</p>
                              <p className="text-xs text-gray-500 truncate">{formatNumber(ch.subscriberCount)} subscribers</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a href={`https://youtube.com/channel/${ch.id}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                              <button
                                onClick={() => {
                                  try {
                                    localStorage.setItem('selected_channel_id', ch.id)
                                    setSelectedChannel(ch)
                                    // update main local cache
                                    localStorage.setItem('youtube_channel', JSON.stringify(ch))
                                    alert('Selected channel switched')
                                  } catch (e) {
                                    console.error(e)
                                  }
                                }}
                                className={`text-xs px-2 py-1 ${selectedChannel && selectedChannel.id === ch.id ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-700'} rounded-md border`}
                              >
                                {selectedChannel && selectedChannel.id === ch.id ? 'Active' : 'Use'}
                              </button>
                              <button
                                onClick={() => {
                                  // disconnect locally
                                  if (youtubeChannel && youtubeChannel.id === ch.id) {
                                    localStorage.removeItem('youtube_access_token')
                                    localStorage.removeItem('youtube_refresh_token')
                                    localStorage.removeItem('youtube_channel')
                                    setAllChannels(prev => prev.filter(c => c.id !== ch.id))
                                    setSelectedChannel(null)
                                    alert('Main channel disconnected. You may need to reconnect.')
                                  } else {
                                    const stored = localStorage.getItem('additional_youtube_channels')
                                    if (stored) {
                                      try {
                                        const extra = JSON.parse(stored)
                                        const filtered = extra.filter((ec: YouTubeChannel) => ec.id !== ch.id)
                                        localStorage.setItem('additional_youtube_channels', JSON.stringify(filtered))
                                        setAllChannels(prev => prev.filter(c => c.id !== ch.id))
                                      } catch (e) { console.error(e) }
                                    }
                                  }
                                }}
                                className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-md border border-red-100 hover:bg-red-100"
                              >
                                Disconnect
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-600">No channels connected yet</p>
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              const width = 600
                              const height = 700
                              const left = (window.screen.width - width) / 2
                              const top = (window.screen.height - height) / 2
                              window.open('/api/youtube/auth', 'YouTube OAuth', `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`)
                            }}
                            className="text-sm px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md"
                          >
                            Connect Your First Channel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Info Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-blue-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Account Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">Email</span>
                </div>
                <span className="text-gray-900 font-medium text-sm md:text-base">{session?.user?.email || 'Not available'}</span>
              </div>
              <div className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">Account Name</span>
                </div>
                <span className="text-gray-900 font-medium text-sm md:text-base">{session?.user?.name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-50 animate-pulse"></div>
                    <CheckCircle className="relative w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-semibold">Connection Status</span>
                </div>
                <span className="flex items-center gap-2 text-green-600 font-bold text-sm md:text-base">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Active & Connected
                </span>
              </div>
            </div>
          </div>                {/* Actions Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/connect">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12">
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Refresh Channel Data
                      </Button>
                    </Link>
                    <Link href={`https://youtube.com/channel/${youtubeChannel.id}`} target="_blank">
                      <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50 font-semibold h-12">
                        <Youtube className="w-5 h-5 mr-2" />
                        View on YouTube
                      </Button>
                    </Link>
                  </div>
                </div>

          {/* Videos Section */}
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                  <div className="relative p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">My Latest YouTube Videos</h3>
              </div>
              {videos.length > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-blue-900">{videos.length} videos</span>
                </div>
              )}
              <div className="text-xs text-gray-500 ml-4">(API returned: {videos.length})</div>
            </div>                  {videosLoading ? (
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
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                                  {video.title}
                                </h4>
                                {video.privacyStatus && video.privacyStatus !== 'public' && (
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${video.privacyStatus === 'private' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-yellow-50 text-yellow-800 border border-yellow-100'}`}>
                                    {video.privacyStatus.charAt(0).toUpperCase() + video.privacyStatus.slice(1)}
                                  </span>
                                )}
                              </div>
                              
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
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
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

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
