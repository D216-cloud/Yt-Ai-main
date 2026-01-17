"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import SharedSidebar from '@/components/shared-sidebar'
import DashboardHeader from '@/components/dashboard-header'
import TitleSearchScoreComponent from '@/components/title-search-score'
import VideoCard from '@/components/video-card'
import { Sparkles, ChevronDown, Youtube, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface YouTubeChannel {
  id: string
  title: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
  viewCount: string
}

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  views: string
  likes: string
  comments: string
  duration: string
  privacyStatus?: 'public' | 'unlisted' | 'private'
}

export default function TitleSearchPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Creator'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [additionalChannelsList, setAdditionalChannelsList] = useState<YouTubeChannel[]>([])
  const channelMenuRef = useRef<HTMLDivElement | null>(null)

  // Channel Video Analyzer States
  const [channelId, setChannelId] = useState("")
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [videosError, setVideosError] = useState("")
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts'>('videos')
  
  // Featured videos
  const [latestVideo, setLatestVideo] = useState<Video | null>(null)
  const [topVideo, setTopVideo] = useState<Video | null>(null)
  // Access token availability state
  const [accessTokenAvailable, setAccessTokenAvailable] = useState(false)

  const visibleAdditionalChannels = additionalChannelsList.filter(ch => ch && ch.id && ch.id !== youtubeChannel?.id)
  const uniqueChannelCount = React.useMemo(() => {
    const map: Record<string, boolean> = {}
    if (youtubeChannel?.id) map[youtubeChannel.id] = true
    for (const ch of (additionalChannelsList || [])) {
      if (ch && ch.id) map[String(ch.id)] = true
    }
    return Object.keys(map).length
  }, [youtubeChannel, additionalChannelsList])

  // Filter videos based on duration (shorts < 3 minutes, videos >= 3 minutes)
  const isShortDuration = (duration: string): boolean => {
    if (!duration) return false
    try {
      // Handle ISO 8601 duration format: PT1H2M30S, PT1M30S, PT45S, etc.
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (!match) return false
      
      const h = parseInt(match[1] || '0')
      const m = parseInt(match[2] || '0')
      const s = parseInt(match[3] || '0')
      const totalSeconds = h * 3600 + m * 60 + s
      
      // Shorts are videos under 3 minutes (180 seconds)
      return totalSeconds < 180
    } catch (e) {
      console.error('Duration parsing error:', e, 'for duration:', duration)
      return false
    }
  }

  const filteredVideos = activeTab === 'shorts' 
    ? videos.filter(v => isShortDuration(v.duration))
    : videos.filter(v => !isShortDuration(v.duration))

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        const channel = JSON.parse(stored)
        setYoutubeChannel(channel)
        return
      }

      const additionalStored = localStorage.getItem('additional_youtube_channels')
      if (additionalStored) {
        try {
          const parsed = JSON.parse(additionalStored) || []
          setAdditionalChannelsList(parsed)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Fallback: use first additional channel as active
            const first = parsed[0]
            setYoutubeChannel(first)
            localStorage.setItem('youtube_channel', JSON.stringify(first))
            localStorage.setItem('active_youtube_channel_id', first.id)
            const tokenForFirst = localStorage.getItem(`youtube_access_token_${first.id}`) || null
            if (tokenForFirst) localStorage.setItem('youtube_access_token', tokenForFirst)
          }
        } catch (err) {
          console.error('Failed to parse additional channels:', err)
        }
      }
    } catch (error) {
      console.error('Failed to load channel data:', error)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (channelMenuRef.current && !channelMenuRef.current.contains(e.target as Node)) {
        setShowChannelMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null) return '0'
    const n = typeof num === 'string' ? parseInt(num, 10) : num
    if (isNaN(n)) return '0'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  // Utility: resolve access token (channel-scoped fallback)
  const getResolvedAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null
    try {
      const byId = youtubeChannel?.id ? (localStorage.getItem(`youtube_access_token_${youtubeChannel.id}`) || localStorage.getItem(`youtube_token_${youtubeChannel.id}`)) : null
      const global = localStorage.getItem('youtube_access_token')
      const token = byId || global
      // Persist channel-scoped token to the global key for compatibility so subsequent calls see it
      if (token && byId && !global) {
        localStorage.setItem('youtube_access_token', byId)
      }
      return token
    } catch (err) {
      console.error('Error resolving access token:', err)
      return null
    }
  }

  // Fetch a single page of videos from channel
  const fetchVideos = async (pageToken?: string) => {
    setIsLoadingVideos(true)
    setVideosError("")

    try {
      if (typeof window === 'undefined') return
      
      // Get access token (try channel-scoped tokens first)
      const accessToken = getResolvedAccessToken()
      
      if (!accessToken) {
        // If a channel is connected but token missing, give a clearer message
        if (youtubeChannel) {
          setVideosError("Connected channel found but access token missing. Reconnect via Settings > Connect YouTube to re-authorize.")
        } else {
          setVideosError("Please connect your YouTube channel first. Go to Settings > Connect YouTube to authorize access.")
        }
        setIsLoadingVideos(false)
        return
      }

      // Use same endpoint as content page with mine=true and access token
      const url = `/api/youtube/videos?mine=true&fetchAll=false&maxResults=50&access_token=${accessToken}${pageToken ? `&pageToken=${pageToken}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch videos')
      }

      const data = await response.json()
      
      if (pageToken) {
        setVideos(prev => [...prev, ...data.videos])
      } else {
        setVideos(data.videos)
      }
      
      setNextPageToken(data.nextPageToken)
      setShowAnalyzer(true)
    } catch (err: any) {
      setVideosError(err.message || 'Failed to fetch videos')
      console.error('Error fetching videos:', err)
    } finally {
      setIsLoadingVideos(false)
    }
  }

  // Fetch all videos by iterating through playlist pages (same as content page - all videos: private, unlisted, public)
  const fetchAllVideos = async () => {
    setIsLoadingVideos(true)
    setVideosError("")

    try {
      if (typeof window === 'undefined') return
      
      // Get access token (try channel-scoped tokens first)
      const accessToken = getResolvedAccessToken()
      
      if (!accessToken) {
        if (youtubeChannel) {
          setVideosError("Connected channel found but access token missing. Reconnect via Settings > Connect YouTube to re-authorize.")
        } else {
          setVideosError("Please connect your YouTube channel first. Go to Settings > Connect YouTube to authorize access.")
        }
        setIsLoadingVideos(false)
        return
      }

      let allVideos: Video[] = []
      let pageToken: string | undefined = undefined
      let pageCount = 0
      const pageLimit = 100 // Fetch up to 100 pages (5000+ videos max)

      do {
        // Use same endpoint as content page with mine=true to get all videos
        const url = `/api/youtube/videos?mine=true&fetchAll=false&maxResults=50&access_token=${accessToken}${pageToken ? `&pageToken=${pageToken}` : ''}`
        
        const response = await fetch(url)
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Failed to fetch videos')
        }

        const data = await response.json()
        if (data.videos && data.videos.length > 0) {
          allVideos = [...allVideos, ...data.videos]
        }
        pageToken = data.nextPageToken
        pageCount += 1

        if (pageCount >= pageLimit) {
          console.warn(`⚠️ Reached page limit of ${pageLimit} pages (${allVideos.length} videos)`)
          break
        }
      } while (pageToken)

      setVideos(allVideos)
      setNextPageToken(null)
      setShowAnalyzer(true)
    } catch (err: any) {
      setVideosError(err.message || 'Failed to fetch all channel videos')
      console.error('Error fetching all videos:', err)
    } finally {
      setIsLoadingVideos(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setVideos([])
    setNextPageToken(null)
    // Always fetch all videos for authenticated user (same as content page)
    fetchAllVideos()
  }

  const loadMore = () => {
    if (nextPageToken) {
      fetchVideos(nextPageToken)
    }
  }

  // Keep token availability in sync when channel or additional channels change
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = getResolvedAccessToken()
    setAccessTokenAvailable(!!token)
  }, [youtubeChannel, additionalChannelsList])

  // Update debug info when videos load
  useEffect(() => {
    if (videos.length > 0) {
      // Get latest video (most recently published)
      const latest = [...videos].sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )[0]
      setLatestVideo(latest)

      // No localStorage caching here — Dashboard will fetch latest video directly from API for live data
      // (Removed caching for consistency and to always show fresh results)

      
      // Get top performing video (most views)
      const top = [...videos].sort((a, b) => {
        const aViews = parseInt(a.views) || 0
        const bViews = parseInt(b.views) || 0
        return bViews - aViews
      })[0]
      setTopVideo(top)
    }
  }, [videos, youtubeChannel])

  // Auto-load connected channel videos on mount or when token becomes available
  useEffect(() => {
    if (youtubeChannel?.id && videos.length === 0 && accessTokenAvailable) {
      // auto-fetch all videos for connected channel
      setVideosError("")
      fetchAllVideos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeChannel, accessTokenAvailable])

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* Shared Sidebar */}
        <SharedSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          activePage="title-search"
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Main Content */}
        <main className={`flex-1 pt-14 md:pt-16 p-4 md:p-8 pb-20 md:pb-8 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Channel Selector & Upgrade Banner Section */}
            <div className="mb-8 mt-8 md:mt-10">
              {/* Channel Selector */}
              {youtubeChannel && (
                <div className="flex justify-center mb-3 px-3 relative" ref={channelMenuRef}>
                  <div className="inline-flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full shadow-sm max-w-full truncate">
                    <img 
                      src={youtubeChannel.thumbnail} 
                      alt={youtubeChannel.title} 
                      className="w-6 h-6 rounded-full object-cover" 
                    />
                    <span className="text-sm font-medium truncate max-w-40">{youtubeChannel.title}</span>
                    <span className="ml-2 inline-flex items-center text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      <span className="font-semibold mr-1">{uniqueChannelCount}</span>
                      <span className="text-xs">{uniqueChannelCount === 1 ? 'channel' : 'channels'}</span>
                    </span>
                    <button
                      onClick={() => setShowChannelMenu((s: boolean) => !s)}
                      className="ml-2 flex items-center justify-center w-7 h-7 rounded-full bg-black/30 hover:bg-white/10 transition"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upgrade Banner */}
              <div className="flex justify-center mb-3 px-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-100 px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm text-yellow-800 shadow-sm max-w-full overflow-hidden">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium truncate">You're on Free Plan</span>
                  <span className="text-gray-700 hidden md:inline">Unlock unlimited access to all features and get paid.</span>
                  <Link href="/pricing" className="text-blue-600 font-semibold underline ml-2">Upgrade now</Link>
                </div>
              </div>


            </div>

            {/* Channel Video Analyzer Section (moved up) */}
            <div className="w-full mb-8">
              {/* Section Header with Tabs */}
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-white/5">
                    <img src="/icons/youtube-play.svg" alt="YouTube" className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                        Channel Video Analyzer
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base max-w-full sm:max-w-xl leading-snug wrap-break-word">Optimize your video titles using real YouTube search queries and suggestions</p>
                    </div>
                    {youtubeChannel && (
                      <span className="ml-0 sm:ml-2 mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-100 text-xs font-semibold text-gray-700 shadow-sm">
                        Using: <span className="ml-2 font-medium">{youtubeChannel.title}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold text-base transition-all ${activeTab === 'videos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    📹 Videos
                  </button>
                  <button
                    onClick={() => setActiveTab('shorts')}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold text-base transition-all ${activeTab === 'shorts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    ⏱️ Shorts
                  </button>
                </div>
              </div>

              {/* Videos Grid / Loading / Empty states */}

              {/* Featured Videos Section */}
              {(latestVideo || topVideo) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {latestVideo && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img 
                          src={latestVideo.thumbnail} 
                          alt={latestVideo.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Latest Video
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{latestVideo.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">👁️ {formatNumber(latestVideo.views)}</span>
                          <span className="flex items-center gap-1">❤️ {formatNumber(latestVideo.likes)}</span>
                          <span className="flex items-center gap-1">💬 {formatNumber(latestVideo.comments)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {topVideo && topVideo.id !== latestVideo?.id && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img 
                          src={topVideo.thumbnail} 
                          alt={topVideo.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Top Performing
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{topVideo.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">👁️ {formatNumber(topVideo.views)}</span>
                          <span className="flex items-center gap-1">❤️ {formatNumber(topVideo.likes)}</span>
                          <span className="flex items-center gap-1">💬 {formatNumber(topVideo.comments)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* If a channel is connected and videos are still loading, show a focused loading card */}
              {youtubeChannel && isLoadingVideos && videos.length === 0 && (
                <div className="p-8 rounded-xl bg-white shadow-sm border border-gray-100 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    <p className="text-lg font-semibold text-gray-900">Loading videos from your channel</p>
                    <p className="text-sm text-gray-600">This may take a few moments — we’re fetching your uploads. <span className="animate-pulse">...</span></p>
                    <div className="mt-4">
                      <button onClick={() => fetchAllVideos()} className="px-4 py-2 bg-linear-to-r from-slate-700 to-amber-500 text-white rounded-lg">Refresh</button>
                    </div>
                  </div>
                </div>
              )}

              {/* If we have videos, show grid */}
              {videos.length > 0 && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                      {activeTab === 'videos' ? 'Videos' : 'Shorts'}
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-linear-to-r from-slate-50 to-amber-50 text-sm font-semibold text-amber-700 border border-amber-100">{filteredVideos.length} items</span>
                    </h3>
                  </div>

                  {filteredVideos.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredVideos.map((video) => (
                          <VideoCard key={video.id} video={video} />
                        ))}
                      </div>

                      {/* Load More Button */}
                      {nextPageToken && (
                        <div className="mt-6 flex justify-center">
                          <button
                            onClick={loadMore}
                            disabled={isLoadingVideos}
                            className="w-full sm:w-auto px-8 py-3 bg-linear-to-r from-slate-700 to-amber-500 text-white rounded-xl hover:from-slate-800 hover:to-amber-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                          >
                            {isLoadingVideos ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-5 h-5" />
                                <span>Load More {activeTab === 'videos' ? 'Videos' : 'Shorts'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 rounded-xl bg-white shadow-sm border border-gray-100 text-center">
                      <p className="text-lg font-semibold text-gray-900">No {activeTab === 'videos' ? 'videos' : 'shorts'} found</p>
                      <p className="text-sm text-gray-600 mt-2">Your channel doesn't have any {activeTab === 'videos' ? 'long-form videos' : 'short videos'} yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Error state */}
              {videosError && (
                <div className="p-8 rounded-xl bg-white shadow-sm border border-red-100 text-center mt-6">
                  <p className="text-sm text-red-700 font-semibold">{videosError}</p>
                  <div className="mt-4">
                    <button onClick={() => fetchAllVideos()} className="px-4 py-2 bg-linear-to-r from-slate-700 to-amber-500 text-white rounded-lg mr-2">Retry</button>
                    <button onClick={() => setChannelId('')} className="px-4 py-2 border border-gray-200 rounded-lg">Change Channel</button>
                  </div>
                </div>
              )}

              {/* Empty state (no videos found) */}
              {!isLoadingVideos && videos.length === 0 && !videosError && showAnalyzer && (
                <div className="p-8 rounded-xl bg-white shadow-sm border border-gray-100 text-center">
                  <p className="text-lg font-semibold text-gray-900">No videos found for this channel</p>
                  <p className="text-sm text-gray-600 mt-2">Try refreshing, checking your connection, or connecting a different channel.</p>
                </div>
              )}

              {/* Feature Info */}
              <div className="mt-8 bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🎯 What you'll get:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-semibold text-gray-900">Title Score Analysis</p>
                      <p className="text-sm text-gray-600">Get a 0-100 score based on length, keywords, and engagement factors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <p className="font-semibold text-gray-900">Real User Searches</p>
                      <p className="text-sm text-gray-600">See actual YouTube autocomplete queries from real users</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <p className="font-semibold text-gray-900">Search Insights</p>
                      <p className="text-sm text-gray-600">Understand demand, competition, and trend direction</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="font-semibold text-gray-900">Title Suggestions</p>
                      <p className="text-sm text-gray-600">Get optimized title alternatives with copy buttons</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Title Search Component */}
            <div className="w-full mb-12">
              <TitleSearchScoreComponent />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
