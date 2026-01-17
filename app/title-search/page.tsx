"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import SharedSidebar from '@/components/shared-sidebar'
import DashboardHeader from '@/components/dashboard-header'
import TitleSearchScoreComponent from '@/components/title-search-score'
import VideoCard from '@/components/video-card'
import AnalysisModal from '@/components/analysis-modal'
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

  const visibleAdditionalChannels = additionalChannelsList.filter(ch => ch && ch.id && ch.id !== youtubeChannel?.id)
  const uniqueChannelCount = React.useMemo(() => {
    const map: Record<string, boolean> = {}
    if (youtubeChannel?.id) map[youtubeChannel.id] = true
    for (const ch of (additionalChannelsList || [])) {
      if (ch && ch.id) map[String(ch.id)] = true
    }
    return Object.keys(map).length
  }, [youtubeChannel, additionalChannelsList])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        const channel = JSON.parse(stored)
        setYoutubeChannel(channel)
      }

      const additionalStored = localStorage.getItem('additional_youtube_channels')
      if (additionalStored) {
        setAdditionalChannelsList(JSON.parse(additionalStored))
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

  const formatNumber = (num: number | string): string => {
    const n = typeof num === 'string' ? parseInt(num, 10) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  // Fetch a single page of videos from channel
  const fetchVideos = async (pageToken?: string) => {
    const channelIdToUse = channelId.trim() || youtubeChannel?.id

    if (!channelIdToUse) {
      setVideosError("Please enter a YouTube channel ID or connect your channel")
      return
    }

    setIsLoadingVideos(true)
    setVideosError("")

    try {
      const url = `/api/channel/videos?channelId=${encodeURIComponent(channelIdToUse)}${pageToken ? `&pageToken=${pageToken}` : ''}`
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
      setVideosError(err.message || 'Failed to fetch channel videos')
      console.error('Error fetching videos:', err)
    } finally {
      setIsLoadingVideos(false)
    }
  }

  // Fetch all videos by iterating through playlist pages (safe cap at 200 videos)
  const fetchAllVideos = async () => {
    const channelIdToUse = channelId.trim() || youtubeChannel?.id

    if (!channelIdToUse) return

    setIsLoadingVideos(true)
    setVideosError("")

    try {
      let allVideos: Video[] = []
      let pageToken: string | undefined = undefined

      do {
        const url = `/api/channel/videos?channelId=${encodeURIComponent(channelIdToUse)}${pageToken ? `&pageToken=${pageToken}` : ''}&maxResults=50`
        const response = await fetch(url)
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Failed to fetch videos')
        }

        const data = await response.json()
        allVideos = [...allVideos, ...data.videos]
        pageToken = data.nextPageToken

        // Safety cap
        if (allVideos.length >= 200) break
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
    // If channelId provided, fetch first page; otherwise fetch all for connected channel
    if (channelId.trim()) fetchVideos()
    else fetchAllVideos()
  }

  const loadMore = () => {
    if (nextPageToken) {
      fetchVideos(nextPageToken)
    }
  }

  // Auto-load connected channel videos on mount
  useEffect(() => {
    if (youtubeChannel?.id && videos.length === 0) {
      // auto-fetch all videos for connected channel
      fetchAllVideos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeChannel])

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
            <AnalysisModal />
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
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
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

              {/* Videos Grid / Loading / Empty states */}

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
                      Your Channel Videos
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-linear-to-r from-slate-50 to-amber-50 text-sm font-semibold text-amber-700 border border-amber-100">{videos.length} videos</span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      Open the <strong>Analyze</strong> panel on any video to view title insights
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videos.map((video) => (
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
                            <span>Load More Videos</span>
                          </>
                        )}
                      </button>
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
