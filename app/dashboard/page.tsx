"use client"

import React from 'react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { GitCompare, Upload, BarChart3, ArrowUpRight, Lightbulb, Youtube, Lock, Sparkles, Users, MessageSquare, Eye, Play, DollarSign, Calendar, ThumbsUp, ChevronDown, Plus, X } from "lucide-react"
import { ViewsIcon, SubscribersIcon, WatchTimeIcon, EngagementIcon } from "@/components/icons/dashboard-icons"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import SharedSidebar from "@/components/shared-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import Image from "next/image"

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

interface LatestVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  viewCount: number
  titleScore?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Creator' 
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [latestVideo, setLatestVideo] = useState<LatestVideo | null>(null)
  const [topVideos, setTopVideos] = useState<LatestVideo[]>([])
  const [loadingVideo, setLoadingVideo] = useState(false)

  // Channel menu state
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const channelMenuRef = useRef<HTMLDivElement | null>(null)

  // Additional channels (for switching)
  const [additionalChannelsList, setAdditionalChannelsList] = useState<YouTubeChannel[]>([])

  // Derived values for UI
  const visibleAdditionalChannels = additionalChannelsList.filter(ch => ch && ch.id && ch.id !== youtubeChannel?.id)
  const uniqueChannelCount = React.useMemo(() => {
    const map: Record<string, boolean> = {}
    if (youtubeChannel?.id) map[youtubeChannel.id] = true
    for (const ch of (additionalChannelsList || [])) {
      if (ch && ch.id) { map[String(ch.id)] = true }
    }
    return Object.keys(map).length
  }, [youtubeChannel, additionalChannelsList])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('additional_youtube_channels')
      if (stored) {
        const parsed = JSON.parse(stored) || []
        // Deduplicate by id defensively
        const map = new Map<string, YouTubeChannel>()
        parsed.forEach((ch: YouTubeChannel) => { if (ch && ch.id) map.set(ch.id, ch) })
        setAdditionalChannelsList(Array.from(map.values()))
      }
    } catch (e) {
      console.error('Failed to load additional channels:', e)
    }

    // Listen for storage changes (other tabs) to update channel lists live
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'additional_youtube_channels') {
        try {
          const val = e.newValue ? JSON.parse(e.newValue) : []
          setAdditionalChannelsList(val)
        } catch (err) { console.error('Failed parsing additional channels from storage event', err) }
      }
      if (e.key === 'youtube_channel') {
        try {
          const val = e.newValue ? JSON.parse(e.newValue) : null
          setYoutubeChannel(val)
        } catch (err) { console.error('Failed parsing youtube_channel from storage event', err) }
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Load YouTube channel data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        setYoutubeChannel(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load channel data:', error)
    }
  }, [])

  // Fetch latest and top videos when channel is loaded
  useEffect(() => {
    const fetchLatestVideo = async () => {
      if (!youtubeChannel) return
      
      setLoadingVideo(true)
      try {
        const accessToken = localStorage.getItem('youtube_access_token')
        if (!accessToken) {
          console.log('No access token found')
          setLoadingVideo(false)
          return
        }

        const response = await fetch(`/api/youtube/best-videos?channelId=${youtubeChannel.id}&accessToken=${accessToken}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos')
        }
        
        const data = await response.json()
        
        console.log('Fetched videos data:', data)
        
        // Check if we have videos in the response
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          // set latest video to the first item
          const video = data.videos[0]
          setLatestVideo({
            id: video.id || '',
            title: video.title || 'Untitled Video',
            thumbnail: video.thumbnail || '',
            publishedAt: video.publishedAt || new Date().toISOString(),
            viewCount: video.viewCount || 0,
            titleScore: video.titleScore || 67
          })

          // compute top 3 videos by viewCount
          const sorted = data.videos
            .slice()
            .sort((a: any, b: any) => (parseInt(b.viewCount || 0, 10) || 0) - (parseInt(a.viewCount || 0, 10) || 0))
          const top3 = sorted.slice(0, 3).map((v: any) => ({
            id: v.id || '',
            title: v.title || 'Untitled',
            thumbnail: v.thumbnail || '',
            publishedAt: v.publishedAt || new Date().toISOString(),
            viewCount: v.viewCount || 0,
            titleScore: v.titleScore || 0
          }))

          setTopVideos(top3)
        } else {
          console.log('No videos found for this channel')
          setLatestVideo(null)
          setTopVideos([])
        }
      } catch (error) {
        console.error('Error fetching latest video:', error)
        // Set null instead of keeping loading state
        setLatestVideo(null)
        setTopVideos([])
      } finally {
        setLoadingVideo(false)
      }
    }

    fetchLatestVideo()
  }, [youtubeChannel])

  // Close channel menu on outside clicks
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (channelMenuRef.current && !channelMenuRef.current.contains(e.target as Node)) {
        setShowChannelMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const startYouTubeAuth = () => {
    setIsConnecting(true)

    // Indicate where to return so server logic can treat this as additional channel flow
    localStorage.setItem('oauth_return_page', 'dashboard')

    // Open the correct popup URL and request a popup response
    const popup = window.open('/api/youtube/auth?popup=true', 'youtube-auth', 'width=500,height=600')

    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
        setIsConnecting(false)
        setShowConnectModal(false)
        window.removeEventListener('message', messageListener)
        if (popup) popup.close()

        const { channel, token, refreshToken } = event.data as any

        try {
          const existing = JSON.parse(localStorage.getItem('additional_youtube_channels') || '[]')
          const already = existing.some((ch: any) => ch.id === channel.id)
          if (!already) {
            const updated = [...existing, channel]
            localStorage.setItem('additional_youtube_channels', JSON.stringify(updated))
            if (token) localStorage.setItem(`youtube_access_token_${channel.id}`, token)
            if (refreshToken) localStorage.setItem(`youtube_refresh_token_${channel.id}`, refreshToken)
            setAdditionalChannelsList((list) => {
              // Dedupe defensively
              const exists = list.some((l) => l.id === channel.id)
              return exists ? list : [...list, channel]
            })
            // Inform user and redirect to dashboard
            alert(`Successfully connected ${channel.title}`)
            router.push('/dashboard')
          } else {
            alert(`${channel.title} is already connected`)
            router.push('/dashboard')
          }
        } catch (err) {
          console.error('Failed to save connected channel:', err)
          router.push('/dashboard')
        }
      } else if (event.data.type === 'YOUTUBE_AUTH_ERROR') {
        setIsConnecting(false)
        window.removeEventListener('message', messageListener)
        if (popup) popup.close()
        console.error('Authentication failed:', event.data.error)
        alert('YouTube authentication failed. Please try again.')
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

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  // Enhanced reusable base classes for cards with better mobile responsiveness
  const cardBase = 'group relative bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-sm'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* Shared Sidebar */}
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="dashboard" />

        {/* Main Content */}
        <main className="flex-1 pt-14 md:pt-16 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Redesigned Welcome Section */}
            <div className="mb-8 mt-8 md:mt-10">
              {/* Upgrade Banner */}
              {youtubeChannel && (
                <div className="flex justify-center mb-3 px-3 relative" ref={channelMenuRef}>
                  <div className="inline-flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full shadow-sm max-w-full truncate">
                    <img src={youtubeChannel.thumbnail} alt={youtubeChannel.title} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-sm font-medium truncate max-w-[160px]">{youtubeChannel.title}</span>

                    {/* Connected channels count */}
                    <span className="ml-2 inline-flex items-center text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      <span className="font-semibold mr-1">{uniqueChannelCount}</span>
                      <span className="text-xs">{uniqueChannelCount === 1 ? 'channel' : 'channels'}</span>
                    </span>

                    <button
                      aria-haspopup="menu"
                      aria-expanded={showChannelMenu}
                      onClick={() => setShowChannelMenu((s: boolean) => !s)}
                      className="ml-2 flex items-center justify-center w-7 h-7 rounded-full bg-black/30 hover:bg-white/10 transition"
                      title="Channel actions"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Menu */}
                  {showChannelMenu && (
                    <div className="absolute top-full mt-2 right-1 bg-white rounded-xl shadow-xl w-80 text-sm text-gray-800 overflow-hidden z-40">
                      {/* Header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-white">
                        <div className="flex items-center gap-3">
                          <img src={youtubeChannel?.thumbnail} alt={youtubeChannel?.title} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                          <div className="flex flex-col">
                            <div className="text-sm font-bold truncate" title={youtubeChannel?.title}>{youtubeChannel?.title}</div>
                            <div className="text-xs text-gray-500">Connected • <span className="font-medium text-gray-700">{formatNumber(youtubeChannel?.videoCount || 0)} videos</span></div>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <span className="inline-flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{uniqueChannelCount} {uniqueChannelCount === 1 ? 'channel' : 'channels'}</span>
                        </div>
                      </div>

                      {/* Channels List */}
                      <div className="divide-y divide-gray-100">
                        {visibleAdditionalChannels.length > 0 ? visibleAdditionalChannels.map((ch: YouTubeChannel) => (
                          <button
                            key={ch.id}
                            onClick={() => {
                              // Switch channel: set as main and attempt to set token if stored
                              localStorage.setItem('youtube_channel', JSON.stringify(ch))
                              const token = localStorage.getItem(`youtube_access_token_${ch.id}`) || null
                              if (token) localStorage.setItem('youtube_access_token', token)
                              setYoutubeChannel(ch)
                              setShowChannelMenu(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <img src={ch.thumbnail} alt={ch.title} className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1 text-left">
                              <div className="text-sm font-semibold truncate">{ch.title}</div>
                              <div className="text-xs text-gray-500">{formatNumber(ch.videoCount)} videos</div>
                            </div>
                            <div className="text-xs text-gray-400">{formatNumber(ch.subscriberCount)} subs</div>
                          </button>
                        )) : (
                          <div className="px-4 py-4 text-sm text-gray-600">No other channels connected</div>
                        )}
                      </div>

                      {/* Footer actions */}
                      <div className="px-4 py-3 bg-white">
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              localStorage.setItem('oauth_return_page', 'sidebar')
                              setShowChannelMenu(false)
                              startYouTubeAuth()
                            }}
                            className="w-full bg-blue-600 text-white rounded-full py-2.5 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
                          >
                            <Plus className="w-4 h-4" />
                            Add another channel
                          </button>

                          <button
                            onClick={() => {
                              if (!confirm('Disconnect channel?')) return
                              localStorage.removeItem('youtube_channel')
                              localStorage.removeItem('youtube_access_token')
                              localStorage.removeItem('youtube_refresh_token')
                              setYoutubeChannel(null)
                              setShowChannelMenu(false)
                            }}
                            className="w-full border border-red-100 text-red-600 rounded-lg py-2 text-sm font-semibold hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <X className="w-4 h-4" />
                              Disconnect
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center mb-6 px-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-100 px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm text-yellow-800 shadow-sm max-w-full overflow-hidden">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium truncate">You're on Free Plan</span>
                  <span className="text-gray-700 hidden md:inline">Unlock unlimited access to all features and get paid.</span>
                  <Link href="/pricing" className="text-blue-600 font-semibold underline ml-2">Upgrade now</Link>
                </div>
              </div>

              {/* Hero / Overview */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 mb-2">🙏 Namaste, {firstName}!</h1>
                  <p className="text-gray-600 text-sm sm:text-lg flex items-center gap-2"><span className="text-base">📈</span> Quick snapshot — YouTube growth & earnings.</p>
                </div>
              </div>
              {/* Three main statistic cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-violet-500 flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Automations</p>
                    <p className="text-2xl font-extrabold text-gray-900">8</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Followers</p>
                    <p className="text-2xl font-extrabold text-gray-900">{formatNumber(analyticsData.subscribers)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-4 col-span-2 sm:col-span-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-400 flex items-center justify-center text-white shadow-md">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">AutoDM Sent</p>
                    <p className="text-2xl font-extrabold text-gray-900">3,412</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimize / Connect Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-900">Optimize Your Latest Video</h2>
                <Link href="/videos">
                  <Button variant="link" className="text-blue-600 hover:text-blue-700">
                    View All
                  </Button>
                </Link>
              </div>

              {youtubeChannel ? (
                // Existing optimize UI when channel connected
                (loadingVideo ? (
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-white">Loading video...</div>
                    </div>
                  </div>
                ) : latestVideo ? (
                  <Link href={`/videos?videoId=${latestVideo.id}`} className="block">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-3">
                          <div className="relative w-full h-40 md:h-32 rounded-lg overflow-hidden bg-gray-700">
                            {latestVideo.thumbnail ? (
                              <Image src={latestVideo.thumbnail} alt={latestVideo.title} fill className="object-cover" unoptimized onError={(e: any) => { const target = e.target as HTMLImageElement; target.style.display = 'none' }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <Youtube className="w-12 h-12" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-6">
                          <h3 className="text-white font-bold text-lg sm:text-xl mb-2 line-clamp-2">{latestVideo.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                            <span>{latestVideo.viewCount.toLocaleString()} views</span>
                            <span>•</span>
                            <span>{new Date(latestVideo.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className="ml-2 px-2 py-0.5 rounded-md bg-white/5 text-xs">Title score: <strong className="ml-1 text-white">{latestVideo.titleScore || 67}</strong></span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="px-2 py-1 text-xs rounded-full bg-white/6 text-white">Add end screen</div>
                            <div className="px-2 py-1 text-xs rounded-full bg-white/6 text-white">Shorten intro</div>
                            <div className="px-2 py-1 text-xs rounded-full bg-white/6 text-white">Add tags</div>
                          </div>

                          <p className="text-sm text-gray-300">Quick suggestions to improve discovery and watch time — estimated uplift <span className="font-semibold text-white">+12%</span></p>
                        </div>

                        <div className="md:col-span-3 flex flex-col gap-3">
                          <Link href={`/videos?videoId=${latestVideo.id}`} className="w-full">
                            <Button className="w-full bg-amber-500 text-white py-3 font-semibold flex items-center justify-center gap-2">Optimize <ArrowUpRight className="w-4 h-4" /></Button>
                          </Link>
                          <a href={`https://youtube.com/watch?v=${latestVideo.id}`} target="_blank" rel="noreferrer" className="w-full">
                            <Button variant="outline" className="w-full text-white/90 flex items-center justify-center gap-2">Preview <Eye className="w-4 h-4" /></Button>
                          </a>
                          <button onClick={(e) => { e.preventDefault() }} className="w-full bg-white text-slate-900 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">Generate Titles <Lightbulb className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-white text-lg font-semibold mb-2">No Videos Found</div>
                      <div className="text-gray-400 text-sm mb-6">Upload your first video to see it here</div>
                      <Link href="/upload/normal">
                        <Button className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-2 rounded-lg">
                          Upload Video
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                // Channel not connected - show connect card with same size
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg mb-2">Connect your YouTube channel</h3>
                      <p className="text-gray-300 mb-4">Link your channel to unlock personalized recommendations, analytics, and optimization tools directly in your dashboard.</p>
                      <div className="flex items-center gap-3">
                        <Link href="/connect">
                          <Button className="bg-white text-gray-900 font-semibold px-6 py-2 rounded-lg">Connect Channel</Button>
                        </Link>
                        <Link href="/docs">
                          <Button variant="outline" className="text-white border-white/20">Learn more</Button>
                        </Link>
                      </div>
                    </div>
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center">
                      <Image src="/images/connect-illustration.png" alt="Connect" width={240} height={160} className="object-cover opacity-80"/>
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Top Performing Videos */}
              <div className="mb-8">
                <h3 className="text-lg font-black text-gray-900 mb-4">Top Performing Videos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {topVideos && topVideos.length > 0 ? (
                    topVideos.map((v) => (
                      <div key={v.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-28 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                            {v.thumbnail ? (
                              <Image src={v.thumbnail} alt={v.title} width={224} height={128} className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400"><Play className="w-6 h-6" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{v.title}</p>
                            <div className="text-xs text-gray-500 mt-1">{`${Number(v.viewCount).toLocaleString()} views • ${new Date(v.publishedAt).toLocaleDateString()}`}</div>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700">Top</span>
                              <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">Boost</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback placeholders when no topVideos
                    [0,1,2].map((i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-28 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">—</p>
                            <div className="text-xs text-gray-500 mt-1">— views • —</div>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-white/6 text-white">—</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
