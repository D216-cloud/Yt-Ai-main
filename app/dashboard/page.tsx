"use client"

import React from 'react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { GitCompare, Upload, BarChart3, ArrowUpRight, Lightbulb, Youtube, Lock, Sparkles, Users, MessageSquare, Eye, Play, DollarSign, Calendar, ThumbsUp, ChevronDown, Plus, X, Check } from "lucide-react"
import { ViewsIcon, SubscribersIcon, WatchTimeIcon, EngagementIcon } from "@/components/icons/dashboard-icons"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import SharedSidebar from "@/components/shared-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import Image from "next/image"
import { TagBox } from "@/components/tag-box"

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [latestVideo, setLatestVideo] = useState<LatestVideo | null>(null)
  const [topVideos, setTopVideos] = useState<LatestVideo[]>([])
  const [loadingVideo, setLoadingVideo] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState<Array<{tag: string, score: number, color: string}>>([])
  const [showAllTags, setShowAllTags] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [publishError, setPublishError] = useState('')
  const [videosWithoutTags, setVideosWithoutTags] = useState<LatestVideo[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

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

          // Filter videos that don't have tags yet
          const videosNoTags = data.videos
            .filter((v: any) => !v.tags || v.tags.length === 0)
            .map((v: any) => ({
              id: v.id || '',
              title: v.title || 'Untitled',
              thumbnail: v.thumbnail || '',
              publishedAt: v.publishedAt || new Date().toISOString(),
              viewCount: v.viewCount || 0,
              titleScore: v.titleScore || 0
            }))

          setVideosWithoutTags(videosNoTags)
          setCurrentVideoIndex(0)

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

  // Generate suggested tags from video title (improved, up to 20 tags)
  const generateTags = (title: string) => {
    if (!title) return []

    const commonWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','am','be','been','being','have','has','had','do','does','did','will','would','could','should','can','may','might','must','this','that','these','those','video','shorts'])

    const cleaned = title
      .toLowerCase()
      .replace(/[#@]/g, '')
      .replace(/["'“”‘’()\[\]:;!?.,/\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const words = cleaned.split(' ').filter(Boolean)

    const ngrams: string[] = []

    // unigrams
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      if (w.length > 1 && !commonWords.has(w)) ngrams.push(w)
    }

    // bigrams and trigrams
    for (let n = 2; n <= 3; n++) {
      for (let i = 0; i + n <= words.length; i++) {
        const seq = words.slice(i, i + n).filter(w => !commonWords.has(w)).join(' ')
        if (seq && seq.split(' ').length >= 1) ngrams.push(seq)
      }
    }

    // Add some suffix variants to increase diversity
    const suffixes = ['review','tutorial','tips','how to','guide','2026','best','top']
    for (const w of words.slice(0, 6)) {
      for (const s of suffixes) {
        const candidate = `${w} ${s}`.trim()
        if (candidate.split(' ').length <= 4) ngrams.push(candidate)
      }
    }

    // Build unique list preserving order, limit to 20
    const seen = new Set<string>()
    const final: string[] = []
    for (const t of ngrams) {
      const tag = t.trim()
      if (!tag) continue
      if (seen.has(tag)) continue
      if (tag.length > 60) continue
      seen.add(tag)
      final.push(tag)
      if (final.length >= 20) break
    }

    const colors = ['emerald','orange','blue','amber','purple','rose','cyan','indigo']
    const tags = final.map((tag, i) => ({ tag, score: Math.floor(Math.random() * 40 + 45), color: colors[i % colors.length] }))

    return tags
  }

  useEffect(() => {
    if (!latestVideo?.title) {
      setSuggestedTags([])
      return
    }

    let mounted = true
    const fetchSuggested = async () => {
      try {
        const encodedTitle = encodeURIComponent(latestVideo.title)
        
        // Step 1: Fetch REAL YouTube videos matching this title/keyword
        console.log('🔍 Fetching real YouTube videos for keyword:', latestVideo.title)
        const keywordsRes = await fetch(`/api/youtube/keywords?query=${encodedTitle}&maxResults=25`)
        
        if (!keywordsRes.ok) {
          throw new Error('Failed to fetch keywords from YouTube')
        }

        const keywordsData = await keywordsRes.json()
        const realTitles = keywordsData.titles || []
        const realTags = keywordsData.allTags || []
        
        console.log('✅ Found', realTitles.length, 'real videos. Extracting tags from their titles...')

        if (realTitles.length === 0 && realTags.length === 0) {
          console.warn('No real tags found, using fallback')
          if (mounted) setSuggestedTags(generateTags(latestVideo.title))
          return
        }

        // Step 2: Send real titles to tag suggestion API for scoring
        const tagRes = await fetch('/api/youtube/tag-suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titles: [...realTitles, ...realTags], // Combine titles and tags
            maxResults: 20,
            minScore: 25
          })
        })

        if (!tagRes.ok) {
          throw new Error('Failed to score tags')
        }

        const tagData = await tagRes.json()
        const scoredTags: Array<any> = tagData.tags || []

        console.log('🎯 Got', scoredTags.length, 'scored tags:', scoredTags.slice(0, 5).map((t: any) => t.tag).join(', '))

        if (scoredTags.length > 0 && mounted) {
          // Format with viral scores for display
          setSuggestedTags(scoredTags.map((t: any) => ({
            tag: t.tag,
            score: t.score,
            viralScore: t.viralScore,
            color: t.color,
            confidence: t.confidence
          })))
          return
        }

        // Fallback: Use local generation
        if (mounted) setSuggestedTags(generateTags(latestVideo.title))
      } catch (err) {
        console.error('❌ Tag suggestion failed:', err)
        if (mounted) setSuggestedTags(generateTags(latestVideo.title))
      }
    }

    fetchSuggested()
    return () => { mounted = false }
  }, [latestVideo])

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

  const handlePublishTags = async () => {
    if (!latestVideo || suggestedTags.length === 0) return

    setIsPublishing(true)
    setPublishError('')
    try {
      // Extract just the tag names
      const tagNames = suggestedTags.map(t => t.tag)

      console.log('Publishing tags:', tagNames)

      // Call API to publish tags to YouTube
      const response = await fetch('/api/tags/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: latestVideo.id,
          tags: tagNames,
          channelId: youtubeChannel?.id,
          accessToken: localStorage.getItem('youtube_access_token')
        })
      })

      console.log('Response status:', response.status)

      // Parse response as JSON
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        setPublishError('Invalid response from server')
        setIsPublishing(false)
        return
      }

      console.log('Response data:', data)

      if (response.ok && (data.success || data.message)) {
        setPublishSuccess(true)
        setPublishError('')
        console.log('Tags published successfully')

        // Remove published video from the untagged list (if present) and pick next
        setVideosWithoutTags(prev => {
          const updated = prev.filter(v => v.id !== latestVideo.id)

          // after short delay, open the next untagged video if available
          setTimeout(() => {
            setPublishSuccess(false)
            if (updated.length > 0) {
              const next = updated[0]
              setLatestVideo(next)
              setSuggestedTags(generateTags(next.title))
            }
          }, 1200)

          return updated
        })

        // Reset success message after 3 seconds
        setTimeout(() => setPublishSuccess(false), 3000)
      } else {
        const errorMsg = data.error || data.message || 'Failed to publish tags'
        setPublishError(errorMsg)
        console.error('Failed to publish tags:', errorMsg)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error publishing tags'
      setPublishError(errorMsg)
      console.error('Error publishing tags:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleAddTag = () => {
    if (!newTagInput.trim()) return

    const colors = ['emerald', 'orange', 'blue', 'amber', 'purple', 'rose', 'cyan', 'indigo']
    const newTag = {
      tag: newTagInput.trim().toLowerCase(),
      score: Math.floor(Math.random() * 40 + 50),
      color: colors[suggestedTags.length % colors.length]
    }

    setSuggestedTags([...suggestedTags, newTag])
    setNewTagInput('')
  }

  const handleRemoveTag = (index: number) => {
    setSuggestedTags(suggestedTags.filter((_, i) => i !== index))
  }

  const handleShowMore = () => {
    setShowAllTags(!showAllTags)
  }

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  // Enhanced reusable base classes for cards with better mobile responsiveness
  const cardBase = 'group relative bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-sm'

  // Analytics data (fetched from server when channel is available)
  const [analyticsData, setAnalyticsData] = useState({
    views: youtubeChannel ? parseInt(youtubeChannel.viewCount) : 0,
    subscribers: youtubeChannel ? parseInt(youtubeChannel.subscriberCount) : 0,
    watchTime: 0, // in hours (computed from totalWatchMinutes)
    engagement: 0,
    revenue: 0,
    growth: {
      views: 0,
      subscribers: 0,
      watchTime: 0,
      engagement: 0,
      revenue: 0
    }
  })

  // Fetch analytics summary (total views & watch minutes) for the active channel
  useEffect(() => {
    const fetchAnalyticsSummary = async () => {
      if (!youtubeChannel) return
      try {
        // Check for channel-scoped token first, then fallback to primary token
        const token = localStorage.getItem(`youtube_access_token_${youtubeChannel.id}`) || localStorage.getItem('youtube_access_token')
        if (!token) {
          console.log('No access token for analytics')
          return
        }

        const res = await fetch(`/api/youtube/analytics/summary?channelId=${youtubeChannel.id}&access_token=${encodeURIComponent(token)}`)
        if (!res.ok) {
          console.warn('Analytics summary fetch failed', res.status)
          return
        }

        const data = await res.json()
        const totalWatchMinutes = Number(data?.summary?.totalWatchMinutes || 0)
        const totalViews = Number(data?.summary?.totalViews || youtubeChannel.viewCount || 0)

        setAnalyticsData((prev) => ({
          ...prev,
          views: totalViews,
          subscribers: parseInt(youtubeChannel.subscriberCount || '0') || 0,
          watchTime: Math.round(totalWatchMinutes / 60) // convert minutes to hours
        }))
      } catch (err) {
        console.error('Failed to fetch analytics summary:', err)
      }
    }

    fetchAnalyticsSummary()
  }, [youtubeChannel])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* Shared Sidebar */}
        <SharedSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          activePage="dashboard"
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Main Content */}
        <main className={`flex-1 pt-14 md:pt-16 p-4 md:p-8 pb-20 md:pb-8 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
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
              {/* Three main statistic cards (clean, spacious style) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Views</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{formatNumber(analyticsData.views)}</p>
                      <p className="text-xs text-gray-500 mt-2">Across connected channels</p>
                    </div>
                    <div className="ml-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Subscribers</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{formatNumber(analyticsData.subscribers)}</p>
                      <p className="text-xs text-gray-500 mt-2">Across connected channels</p>
                    </div>
                    <div className="ml-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-sm">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm col-span-2 sm:col-span-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Watch Time</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{formatNumber(analyticsData.watchTime)}h</p>
                      <p className="text-xs text-gray-500 mt-2">Hours watched</p>
                    </div>
                    <div className="ml-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Missing Tags Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">Add Missing Tags</h3>
                    {publishSuccess && <Check className="w-5 h-5 text-green-400" />}
                    {latestVideo && (
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(latestVideo.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  {publishSuccess && (
                    <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <p className="text-green-400 text-sm font-semibold">✓ Tags published successfully</p>
                    </div>
                  )}
                </div>

                {publishError && (
                  <div className="mb-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm font-semibold">{publishError}</p>
                  </div>
                )}

                {latestVideo ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start mb-4">
                    {/* Thumbnail */}
                    <div className="md:col-span-3">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-700">
                        {latestVideo?.thumbnail ? (
                          <Image 
                            src={latestVideo.thumbnail} 
                            alt="Video thumbnail" 
                            fill 
                            className="object-cover" 
                            unoptimized 
                            onError={(e: any) => { const target = e.target as HTMLImageElement; target.style.display = 'none' }} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <Youtube className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div className="md:col-span-9">
                      <p className="text-white font-semibold mb-3 line-clamp-2">{latestVideo.title}</p>
                      
                      {suggestedTags.length > 0 ? (
                        <div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {suggestedTags.slice(0, showAllTags ? 20 : 5).map((tag, index) => {
                              const realIndex = suggestedTags.indexOf(tag)
                              const colorMap: Record<string, {bg: string, border: string, text: string, textColor: string}> = {
                                emerald: { bg: 'bg-emerald-900/40', border: 'border-emerald-700/50', text: 'text-emerald-400', textColor: 'text-emerald-200' },
                                orange: { bg: 'bg-orange-900/40', border: 'border-orange-700/50', text: 'text-orange-400', textColor: 'text-orange-200' },
                                blue: { bg: 'bg-blue-900/40', border: 'border-blue-700/50', text: 'text-blue-400', textColor: 'text-blue-200' },
                                amber: { bg: 'bg-amber-900/40', border: 'border-amber-700/50', text: 'text-amber-400', textColor: 'text-amber-200' },
                                purple: { bg: 'bg-purple-900/40', border: 'border-purple-700/50', text: 'text-purple-400', textColor: 'text-purple-200' },
                                rose: { bg: 'bg-rose-900/40', border: 'border-rose-700/50', text: 'text-rose-400', textColor: 'text-rose-200' },
                                cyan: { bg: 'bg-cyan-900/40', border: 'border-cyan-700/50', text: 'text-cyan-400', textColor: 'text-cyan-200' },
                                indigo: { bg: 'bg-indigo-900/40', border: 'border-indigo-700/50', text: 'text-indigo-400', textColor: 'text-indigo-200' },
                              }
                              const colors = colorMap[tag.color] || colorMap.blue
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} border ${colors.border} rounded-full hover:scale-105 transition-transform`}
                                  title={`Relevance: ${tag.score}, Viral Potential: ${tag.viralScore}, Confidence: ${tag.confidence}`}
                                >
                                  <span className={`${colors.text} font-bold text-sm`}>{tag.score}</span>
                                  <span className={`${colors.textColor} text-sm`}>{tag.tag}</span>
                                  {tag.viralScore && tag.viralScore > 60 && (
                                    <span className={`${colors.text} text-xs font-bold`}>⚡</span>
                                  )}
                                  <X 
                                    className={`w-4 h-4 ${colors.text} cursor-pointer hover:opacity-70`}
                                    onClick={() => handleRemoveTag(realIndex)}
                                  />
                                </div>
                              )
                            })}
                            {suggestedTags.length > 5 && !showAllTags && (
                              <button onClick={handleShowMore} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-full transition-colors">
                                <span className="text-slate-300 text-sm">+{suggestedTags.length - 5} more</span>
                              </button>
                            )}
                          </div>

                          {showAllTags && suggestedTags.length > 5 && (
                            <button 
                              onClick={handleShowMore}
                              className="text-slate-400 hover:text-slate-300 text-sm font-medium flex items-center gap-1 transition-colors mb-3"
                            >
                              <ChevronDown className="w-4 h-4 transform rotate-180" />
                              Show less
                            </button>
                          )}
                          {!showAllTags && suggestedTags.length > 5 && (
                            <button 
                              onClick={handleShowMore}
                              className="text-slate-400 hover:text-slate-300 text-sm font-medium flex items-center gap-1 transition-colors mb-3"
                            >
                              <ChevronDown className="w-4 h-4" />
                              Show more
                            </button>
                          )}

                          {/* Add Tag Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newTagInput}
                              onChange={(e) => setNewTagInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                              placeholder="Add new tag..."
                              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                            />
                            <button
                              onClick={handleAddTag}
                              disabled={!newTagInput.trim()}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
                            >
                              + Add Tag
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mb-4 animate-pulse">
                          {[0,1,2,3,4].map((i) => (
                            <div key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700/30 border border-slate-600 rounded-full">
                              <span className="text-slate-400 font-semibold text-sm">—</span>
                              <span className="text-slate-400 text-sm">loading...</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-4">No video selected yet</p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button 
                    onClick={() => setSuggestedTags([])}
                    disabled={suggestedTags.length === 0 || isPublishing}
                    variant="outline"
                    className="flex-1 px-4 py-3 rounded-lg text-white border-white/10"
                  >
                    Remove all
                  </Button>

                  <Button 
                    onClick={handlePublishTags}
                    disabled={!latestVideo || suggestedTags.length === 0 || isPublishing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish tags'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Videos Without Tags Carousel */}
            {videosWithoutTags.length > 0 && publishSuccess && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">✓ Next Videos to Tag</h3>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  {/* Carousel Container */}
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {videosWithoutTags.slice(currentVideoIndex, currentVideoIndex + 3).map((video, idx) => (
                        <div key={video.id} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-700/50 hover:shadow-lg transition-shadow">
                          {/* Thumbnail */}
                          <div className="relative w-full h-40 bg-gray-700 overflow-hidden">
                            {video.thumbnail ? (
                              <Image
                                src={video.thumbnail}
                                alt={video.title}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                                unoptimized
                                onError={(e: any) => { const target = e.target as HTMLImageElement; target.style.display = 'none' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <Youtube className="w-12 h-12" />
                              </div>
                            )}
                          </div>

                          {/* Video Info */}
                          <div className="p-4">
                            <h4 className="text-white font-semibold mb-2 line-clamp-2 text-sm">{video.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                              <span>{Number(video.viewCount).toLocaleString()} views</span>
                              <span>•</span>
                              <span>{new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <button 
                              onClick={() => {
                                // Open this video in the tag editor
                                setLatestVideo(video)
                                setSuggestedTags(generateTags(video.title))
                                setPublishSuccess(false)
                              }}
                              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
                            >
                              Tag This Video
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dot Navigation */}
                    {videosWithoutTags.length > 3 && (
                      <div className="flex justify-center gap-2 mb-4">
                        {Array.from({ length: Math.ceil(videosWithoutTags.length / 3) }).map((_, dotIndex) => (
                          <button
                            key={dotIndex}
                            onClick={() => setCurrentVideoIndex(dotIndex * 3)}
                            className={`transition-all duration-300 ${
                              dotIndex === Math.floor(currentVideoIndex / 3)
                                ? 'w-8 h-2 bg-blue-600 rounded-full'
                                : 'w-2 h-2 bg-gray-400 rounded-full hover:bg-gray-300'
                            }`}
                            aria-label={`Go to video group ${dotIndex + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {videosWithoutTags.length > 3 && (
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 3))}
                          disabled={currentVideoIndex === 0}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                          ← Previous
                        </button>
                        <span className="text-gray-400 text-sm font-semibold">
                          {Math.floor(currentVideoIndex / 3) + 1} / {Math.ceil(videosWithoutTags.length / 3)}
                        </span>
                        <button
                          onClick={() => setCurrentVideoIndex(Math.min(videosWithoutTags.length - 3, currentVideoIndex + 3))}
                          disabled={currentVideoIndex >= videosWithoutTags.length - 3}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
