"use client"

import Link from "next/link"
import Image from "next/image"
import SidebarButton from '@/components/ui/sidebar-button'
import { Button } from '@/components/ui/button'
import { Home, User, GitCompare, Video, Upload, Play, LogOut, Menu, X, TrendingUp, Users, Eye, Clock, BarChart3, Sparkles, Calendar, CheckCircle, AlertCircle, Zap, Target, Award, ArrowUpRight, Bell, Search, Settings, ChevronDown, Youtube, Activity, FileText, Layers, TrendingDown, DollarSign, Heart, MessageSquare, Share2, MoreHorizontal, Lightbulb, Image as ImageIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import ChannelSummary from '@/components/channel-summary'
import SharedSidebar from "@/components/shared-sidebar"
import DashboardHeader from "@/components/dashboard-header"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chartSeries, setChartSeries] = useState<'views' | 'subs'>('views')
  const [activePage, setActivePage] = useState('dashboard')
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [additionalChannels, setAdditionalChannels] = useState<YouTubeChannel[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showChannelDropdown, setShowChannelDropdown] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)

  // Load YouTube channel data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        setYoutubeChannel(JSON.parse(stored))
      }

      const additionalStored = localStorage.getItem('additional_youtube_channels')
      if (additionalStored) {
        setAdditionalChannels(JSON.parse(additionalStored))
      }

      const activeId = localStorage.getItem('active_youtube_channel_id')
      if (activeId) {
        setActiveChannelId(activeId)
      } else if (stored) {
        const channel = JSON.parse(stored)
        setActiveChannelId(channel.id)
        localStorage.setItem('active_youtube_channel_id', channel.id)
      }
    } catch (error) {
      console.error('Failed to load channel data:', error)
    }
  }, [])

  const disconnectChannel = () => {
    localStorage.removeItem('youtube_channel')
    localStorage.removeItem('youtube_access_token')
    localStorage.removeItem('youtube_refresh_token')
    setYoutubeChannel(null)
    setShowChannelDropdown(false)
    window.location.href = '/connect'
  }

  const connectMoreChannels = () => {
    setShowChannelDropdown(false)
    if (youtubeChannel) {
      setShowConnectModal(true)
    } else {
      window.location.href = '/connect'
    }
  }

  const startYouTubeAuth = () => {
    setIsConnecting(true)
    
    const popup = window.open('/api/auth/youtube', 'youtube-auth', 'width=500,height=600')
    
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
        setIsConnecting(false)
        setShowConnectModal(false)
        window.removeEventListener('message', messageListener)
        if (popup) popup.close()
        
        // Reload the page to fetch new channel data
        window.location.reload()
      } else if (event.data.type === 'YOUTUBE_AUTH_ERROR') {
        setIsConnecting(false)
        window.removeEventListener('message', messageListener)
        if (popup) popup.close()
        console.error('Authentication failed:', event.data.error)
      }
    }

    window.addEventListener('message', messageListener)
    
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        setIsConnecting(false)
        window.removeEventListener('message', messageListener)
      }
    }, 1000)

    setTimeout(() => {
      clearInterval(checkClosed)
      setIsConnecting(false)
      window.removeEventListener('message', messageListener)
      if (popup && !popup.closed) {
        popup.close()
      }
    }, 300000)
  }

  const navLinks = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', id: 'dashboard', badge: null },
    { icon: FileText, label: 'Vid-Info', href: '/vid-info', id: 'vid-info', badge: null },
    { icon: Video, label: 'Content', href: '/content', id: 'content', badge: '12' },
    { icon: Upload, label: 'Bulk Upload', href: '/bulk-upload', id: 'bulk-upload', badge: null },
    { icon: GitCompare, label: 'Compare', href: '/compare', id: 'compare', badge: null },
    { icon: Layers, label: 'AI Tools', href: '/ai-tools', id: 'ai-tools', badge: 'New' },
  ]

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push('/')
  }

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  // Enhanced reusable base classes for cards with better mobile responsiveness
  const cardBase = 'group relative bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-sm'
  const smallCardBase = 'bg-white/70 hover:bg-white rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-gray-100 hover:border-gray-200 flex flex-col gap-3'

  // Mock analytics data
  const analyticsData = {
    views: youtubeChannel ? parseInt(youtubeChannel.viewCount) : 127500,
    subscribers: youtubeChannel ? parseInt(youtubeChannel.subscriberCount) : 45200,
    watchTime: 8200,
    engagement: 12.5,
    revenue: 2450,
    growth: {
      views: 23,
      subscribers: 18,
      watchTime: 31,
      engagement: 15,
      revenue: 28
    }
  }

  // Mock notifications data 
  const notifications = [
    { id: 1, type: 'success', message: 'Video published successfully', time: '5m ago' },
    { id: 2, type: 'info', message: 'New subscriber milestone: 45K', time: '1h ago' },
    { id: 3, type: 'warning', message: 'Scheduled video in 2 hours', time: '2h ago' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* Shared Sidebar */}
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="dashboard" />

        {/* Main Content */}
        <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8 mt-8 md:mt-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                    Welcome back, {session?.user?.name?.split(' ')[0] || 'Creator'}! 👋
                  </h1>
                  <p className="text-gray-600 text-lg">Here's your channel performance overview</p>
                </div>
                <div className="flex items-center gap-3">
                  {!youtubeChannel && (
                    <Link href="/connect">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                        <Youtube className="w-4 h-4 mr-2" />
                        Connect Channel
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Enhanced Stats Cards Grid - Mobile First Design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {/* Views */}
                <div className={`${cardBase} hover:border-blue-300/50 hover:shadow-blue-500/20`}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{analyticsData.growth.views}%</span>
                      </div>
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Views</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{formatNumber(analyticsData.views)}</p>
                    </div>
                    <Button
                      onClick={() => router.push('/vid-info')}
                      aria-label="Analyze Videos"
                      title="Analyze Videos"
                      variant="dashboard-blue"
                      size="dashboard"
                      className="w-full"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">Analyze</span>
                    </Button>
                  </div>
                </div>

                {/* Subscribers */}
                <div className={`${cardBase} hover:border-purple-300/50 hover:shadow-purple-500/20`}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{analyticsData.growth.subscribers}%</span>
                      </div>
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Subscribers</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{formatNumber(analyticsData.subscribers)}</p>
                    </div>
                    <Button
                      onClick={() => router.push('/bulk-upload')}
                      aria-label="Smart Bulk Upload"
                      title="Smart Bulk Upload"
                      variant="dashboard-purple"
                      size="dashboard"
                      className="w-full"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">Smart Upload</span>
                    </Button>
                  </div>
                </div>

                {/* Watch Time */}
                <div className={`${cardBase} hover:border-green-300/50 hover:shadow-green-500/20`}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500/15 to-emerald-500/15 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{analyticsData.growth.watchTime}%</span>
                      </div>
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Watch Time</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{formatNumber(analyticsData.watchTime)}h</p>
                    </div>
                    <Button
                      onClick={() => router.push('/ai-tools?tool=idea')}
                      aria-label="Find Best Idea"
                      title="Find Best Idea"
                      variant="dashboard-green"
                      size="dashboard"
                      className="w-full"
                    >
                      <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">Best Ideas</span>
                    </Button>
                  </div>
                </div>

                {/* Engagement */}
                <div className={`${cardBase} hover:border-orange-300/50 hover:shadow-orange-500/20`}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/15 to-red-500/15 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{analyticsData.growth.engagement}%</span>
                      </div>
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Engagement</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{analyticsData.engagement}%</p>
                    </div>
                    <Button
                      onClick={() => router.push('/compare')}
                      aria-label="Compare Performance"
                      title="Compare Performance"
                      variant="dashboard-orange"
                      size="dashboard"
                      className="w-full"
                    >
                      <GitCompare className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">Compare</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
              {/* Performance Chart */}
              <div className="lg:col-span-2">
                <div className={`${cardBase}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 mb-1">Performance Overview</h3>
                      <p className="text-sm text-gray-600">Track your channel's growth over time</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setChartSeries('views')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded transition-colors ${
                          chartSeries === 'views' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Views
                      </button>
                      <button
                        onClick={() => setChartSeries('subs')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded transition-colors ${
                          chartSeries === 'subs' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Subscribers
                      </button>
                    </div>
                  </div>

                  {/* Simple Chart Visualization */}
                  <div className="space-y-3">
                    {[...Array(7)].map((_, i) => {
                      const value = Math.floor(Math.random() * 80) + 20
                      const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-600 w-8">{day}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 group-hover/bar:shadow-lg ${
                                chartSeries === 'views' 
                                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 group-hover/bar:from-blue-700 group-hover/bar:to-pink-700' 
                                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 group-hover/bar:from-purple-700 group-hover/bar:to-rose-700'
                              }`}
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-gray-900 w-8 text-right">{value}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900">Quick Actions</h3>
                
                <div className={`${smallCardBase}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Upload Video</p>
                      <p className="text-xs text-gray-600">Create new content</p>
                    </div>
                  </div>
                </div>

                <div className={`${smallCardBase}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Analytics</p>
                      <p className="text-xs text-gray-600">View detailed stats</p>
                    </div>
                  </div>
                </div>

                <div className={`${smallCardBase}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">AI Ideas</p>
                      <p className="text-xs text-gray-600">Get content suggestions</p>
                    </div>
                  </div>
                </div>

                <div className={`${smallCardBase}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Target className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Optimize</p>
                      <p className="text-xs text-gray-600">Improve performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Tips */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Recent Activity */}
              <div className={`${cardBase}`}>
                <h3 className="text-lg font-black text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Video uploaded successfully</p>
                      <p className="text-xs text-gray-600">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">New subscriber milestone reached</p>
                      <p className="text-xs text-gray-600">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Engagement rate improved</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Tips */}
              <div className={`${cardBase}`}>
                <h3 className="text-lg font-black text-gray-900 mb-4">Growth Tips</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Optimize your thumbnails</p>
                      <p className="text-xs text-gray-600">Use bright colors and clear text to increase CTR</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Target className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Post consistently</p>
                      <p className="text-xs text-gray-600">Regular uploads help maintain audience engagement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Engage with comments</p>
                      <p className="text-xs text-gray-600">Respond to viewers to build community</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Connect Additional Channel</h3>
              <p className="text-sm text-gray-600 mt-1">Add another YouTube channel to manage multiple accounts</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">YouTube Channel</p>
                  <p className="text-sm text-gray-600">Connect via Google OAuth</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={startYouTubeAuth}
                  disabled={isConnecting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Channel'}
                </Button>
                <Button
                  onClick={() => setShowConnectModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}