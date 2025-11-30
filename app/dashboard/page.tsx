"use client"

import Link from "next/link"
import Image from "next/image"
import SidebarButton from '@/components/ui/sidebar-button'
import { Button } from '@/components/ui/button'
import { Home, User, GitCompare, Video, Upload, Play, LogOut, Menu, X, TrendingUp, Users, Eye, Clock, BarChart3, Sparkles, Calendar, CheckCircle, AlertCircle, Zap, Target, Award, ArrowUpRight, Bell, Search, Settings, ChevronDown, Youtube, Activity, FileText, Layers, TrendingDown, DollarSign, Heart, MessageSquare, Share2, MoreHorizontal, Lightbulb, Image as ImageIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

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
    } catch (error) {
      console.error('Failed to load channel data:', error)
    }
  }, [])

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

  // Reusable base class for analytics cards and small cards
  const cardBase = 'group relative bg-white rounded-2xl border border-gray-200 p-4 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden'
  const smallCardBase = 'bg-white/50 hover:bg-white rounded-xl p-3 transition-all hover:shadow-md border border-transparent hover:border-gray-200 flex flex-col gap-2'

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

  function ChannelSummary({ channel }: { channel: YouTubeChannel | null }) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {channel?.thumbnail ? (
              <img src={channel.thumbnail} alt={channel.title} className="w-16 h-16 object-cover rounded-lg" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-black text-gray-900 truncate">{channel?.title || 'Creator Studio'}</h2>
            <p className="text-sm text-gray-500 truncate">{channel?.customUrl || channel?.id || 'No channel connected'}</p>
          </div>
        </div>
        <div className="w-full md:w-auto grid grid-cols-3 gap-4 text-center mt-3 md:mt-0 md:ml-auto">
          <div>
            <div className="text-xs text-gray-500">Subscribers</div>
            <div className="text-lg font-bold text-gray-900">{formatNumber(analyticsData.subscribers)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Views</div>
            <div className="text-lg font-bold text-gray-900">{formatNumber(analyticsData.views)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Watch Time</div>
            <div className="text-lg font-bold text-gray-900">{formatNumber(analyticsData.watchTime)}h</div>
          </div>
        </div>
      </div>
    )
  }

  const recentVideos = [
    { id: 1, title: "How to Grow Your YouTube Channel Fast", views: "12.5K", likes: "1.2K", comments: "234", status: "published", thumbnail: "🎥" },
    { id: 2, title: "AI Tools for Content Creators 2024", views: "8.3K", likes: "890", comments: "156", status: "published", thumbnail: "🤖" },
    { id: 3, title: "YouTube Algorithm Explained Simply", views: "15.7K", likes: "1.5K", comments: "312", status: "published", thumbnail: "📊" },
    { id: 4, title: "Best Video Editing Software Review", views: "6.2K", likes: "645", comments: "89", status: "draft", thumbnail: "✂️" },
  ]

  const notifications = [
    { id: 1, type: 'success', message: 'Video published successfully', time: '5m ago' },
    { id: 2, type: 'info', message: 'New subscriber milestone: 45K', time: '1h ago' },
    { id: 3, type: 'warning', message: 'Scheduled video in 2 hours', time: '2h ago' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Desktop Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-sm h-16">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Left: Logo & Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              <div className="hidden md:block">
                <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TubeBoost AI
                </span>
                <p className="text-xs text-gray-500 font-medium">Creator Studio</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-xl ml-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos, analytics, insights..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Search Icon - Mobile */}
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notif.type === 'success' ? 'bg-green-500' :
                              notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 text-center">
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link href="/settings">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {session?.user?.name || "Creator"}
                  </p>
                  <p className="text-xs text-gray-500">Premium Plan</p>
                </div>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <p className="font-bold text-gray-900">{session?.user?.name || "Creator"}</p>
                    <p className="text-sm text-gray-600">{session?.user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/profile">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Profile Settings</span>
                      </button>
                    </Link>
                    <Link href="/connect">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                        <Youtube className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Manage Channels</span>
                      </button>
                    </Link>
                    <Link href="/settings">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                        <Settings className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Settings</span>
                      </button>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-30 top-16"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Enhanced Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 transform transition-all duration-300 z-40 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
        >
          {/* Channel Selector */}
          {youtubeChannel && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="relative shrink-0">
                  <img
                    src={youtubeChannel.thumbnail}
                    alt={youtubeChannel.title}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{youtubeChannel.title}</p>
                  <p className="text-xs text-gray-600">{formatNumber(youtubeChannel.subscriberCount)} subscribers</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Main Menu</p>
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = activePage === link.id
              return (
                <Link key={link.id} href={link.href}>
                  <button
                    onClick={() => {
                      setActivePage(link.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {link.label}
                      </span>
                    </div>
                    {link.badge && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive
                          ? 'bg-white/20 text-white'
                          : link.badge === 'New'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                        {link.badge}
                      </span>
                    )}
                  </button>
                </Link>
              )
            })}
          </nav>

          {/* Quick Stats removed per request */}

          {/* Upgrade Card */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-sm">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-white/80 mb-3">Unlock advanced AI features and unlimited uploads</p>
              <button className="w-full bg-white text-purple-600 font-bold text-sm py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </aside>

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
                  <Button variant="outline" className="border-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last 30 days
                  </Button>
                </div>
              </div>
            </div>

            {/* Channel Summary */}
            <div className="mb-6">
              <ChannelSummary channel={youtubeChannel} />
            </div>

            {/* Analytics Overview - Enhanced Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Views */}
              <div className={`${cardBase} hover:border-blue-300`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{analyticsData.growth.views}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">Total Views</p>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => router.push('/ai-tools')}
                      aria-label="Find keywords for your channel"
                      title="Find keywords for your channel"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find Keywords</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Subscribers */}
              <div className={`${cardBase} hover:border-purple-300`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{analyticsData.growth.subscribers}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">Subscribers</p>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => router.push('/bulk-upload')}
                      aria-label="Smart Bulk Upload"
                      title="Smart Bulk Upload"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Smart Bulk Upload</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Watch Time */}
              <div className={`${cardBase} hover:border-green-300`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{analyticsData.growth.watchTime}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">Watch Time</p>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => router.push('/ai-tools?tool=idea')}
                      aria-label="Find Best Idea"
                      title="Find Best Idea"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Find Best Idea</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Engagement */}
              <div className={`${cardBase} hover:border-orange-300`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{analyticsData.growth.engagement}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 mb-3">Engagement</p>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => router.push('/ai-tools?tool=thumbnail')}
                      aria-label="Generate Thumbnail"
                      title="Generate Thumbnail"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md transition"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Generate Thumbnail</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Est. Revenue card removed per design request */}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Chart & Videos */}
              <div className="lg:col-span-2 space-y-8">
                {/* Growth Chart */}
                <div className={`${cardBase} shadow-sm`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Channel Growth</h3>
                      <p className="text-sm text-gray-600 mt-1">Your performance over the last 30 days</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChartSeries('views')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${chartSeries === 'views' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                        Views
                      </button>
                      <button
                        onClick={() => setChartSeries('subs')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${chartSeries === 'subs' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Subs
                      </button>
                    </div>
                  </div>
                  <div className="h-36 sm:h-44 md:h-72 flex items-end justify-between gap-1.5">
                    {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 95, 88, 100, 92, 98, 85, 94, 89, 96].map((height, i) => (
                      <div key={i} className="flex-1 group/bar cursor-pointer relative">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 group-hover/bar:shadow-lg ${chartSeries === 'views' ? 'bg-gradient-to-t from-blue-600 via-purple-600 to-pink-600 group-hover/bar:from-blue-700 group-hover/bar:via-purple-700 group-hover/bar:to-pink-700' : 'bg-gradient-to-t from-purple-600 via-pink-600 to-indigo-600 group-hover/bar:from-purple-700 group-hover/bar:via-pink-700 group-hover/bar:to-indigo-700'}`}
                          style={{ height: `${height}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                          {chartSeries === 'views' ? `${Math.round(height * 100)} views` : `${Math.round(height * 10)} subs`}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Chart axis labels */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                    <span>Day 1</span>
                    <span>Day 5</span>
                    <span>Day 10</span>
                    <span>Day 15</span>
                    <span>Day 20</span>
                  </div>
                </div>

                {/* Recent Videos */}
                <div className={`${cardBase} shadow-sm`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Recent Videos</h3>
                      <p className="text-sm text-gray-600 mt-1">Your latest content performance</p>
                    </div>
                    <Link href="/content">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentVideos.map((video) => (
                      <div key={video.id} className={`${smallCardBase} hover:shadow-lg hover:-translate-y-1 transition-transform`}>
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                            <div className="w-full h-full flex items-center justify-center text-2xl">{video.thumbnail}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate mb-1">{video.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{video.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{video.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{video.comments}</span>
                              </div>
                            </div>
                          </div>
                          <div className="items-start hidden sm:flex">
                            <div className="flex flex-col items-end gap-2">
                              <button className="p-1 rounded-md hover:bg-gray-100 transition-colors" title="More">
                                <MoreHorizontal className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1 rounded-md hover:bg-gray-100 transition-colors" title="Share">
                                <Share2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${video.status === 'published' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className={`w-2 h-2 rounded-full ${video.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className={`text-xs font-bold capitalize ${video.status === 'published' ? 'text-green-700' : 'text-yellow-700'}`}>{video.status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-xs px-3 py-1 rounded-md border hover:bg-gray-100">Edit</button>
                            <button className="text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200">Details</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Actions & Insights */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className={`${cardBase} shadow-sm`}>
                  <h3 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3 md:block">
                    <Link href="/upload">
                      <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                        <Upload className="w-5 h-5" />
                        <span className="font-semibold">Upload Video</span>
                      </button>
                    </Link>
                    <Link href="/content">
                      <button className="w-full flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all hover:-translate-y-0.5">
                        <Video className="w-5 h-5 text-gray-700" />
                        <span className="font-semibold text-gray-900">Manage Content</span>
                      </button>
                    </Link>
                    <Link href="/analytics">
                      <button className="w-full flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all hover:-translate-y-0.5">
                        <BarChart3 className="w-5 h-5 text-gray-700" />
                        <span className="font-semibold text-gray-900">View Analytics</span>
                      </button>
                    </Link>
                    <Link href="/upload/shorts">
                      <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                        <Video className="w-5 h-5" />
                        <span className="font-semibold">Create Short</span>
                      </button>
                    </Link>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-black">AI Insights</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Zap className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">Your engagement is <strong>15% higher</strong> than similar channels</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Target className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">Best posting time: <strong>Tuesday, 2-4 PM</strong></p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Award className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">On track for <strong>50K subscribers</strong> this month!</p>
                    </div>
                  </div>
                </div>

                {/* Top Performing */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-4">Top Performing</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        🏆
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">YouTube Algorithm</p>
                        <p className="text-xs text-gray-600">15.7K views • 1.5K likes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        🥈
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Grow Your Channel</p>
                        <p className="text-xs text-gray-600">12.5K views • 1.2K likes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        🥉
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">AI Tools for Creators</p>
                        <p className="text-xs text-gray-600">8.3K views • 890 likes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
