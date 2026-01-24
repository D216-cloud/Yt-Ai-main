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
  const [suggestedTags, setSuggestedTags] = useState<Array<{tag: string, score: number, color: string, viralScore?: number, confidence?: string}>>([])
  const [showAllTags, setShowAllTags] = useState(false)
  const [cardExpanded, setCardExpanded] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')

  // Input suggestion states
  const [inputSuggestions, setInputSuggestions] = useState<Array<{tag: string, score?: number}>>([])
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [showInputSuggestions, setShowInputSuggestions] = useState(false)
  const suggestionTimerRef = useRef<number | null>(null)
  const addTagInputRef = useRef<HTMLInputElement | null>(null)
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
    return () => {
      window.removeEventListener('storage', onStorage)
      if (suggestionTimerRef.current) {
        window.clearTimeout(suggestionTimerRef.current)
        suggestionTimerRef.current = null
      }
    }
  }, [])

  // Load YouTube channel data from database
  useEffect(() => {
    const loadChannelData = async () => {
      try {
        const res = await fetch('/api/channels')
        if (res.ok) {
          const data = await res.json()
          if (data?.channels && Array.isArray(data.channels)) {
            const primary = data.channels.find((ch: any) => ch.is_primary)
            if (primary) {
              const main = {
                id: primary.channel_id,
                title: primary.title,
                description: primary.description,
                thumbnail: primary.thumbnail,
                subscriberCount: primary.subscriber_count?.toString() || '0',
                videoCount: primary.video_count?.toString() || '0',
                viewCount: primary.view_count?.toString() || '0',
              }
              setYoutubeChannel(main as YouTubeChannel)
              console.log('Loaded primary channel from DB:', main.title)
            }

            // Load additional channels
            const additional = data.channels
              .filter((ch: any) => !ch.is_primary)
              .map((ch: any) => ({
                id: ch.channel_id,
                title: ch.title,
                description: ch.description,
                thumbnail: ch.thumbnail,
                subscriberCount: ch.subscriber_count?.toString() || '0',
                videoCount: ch.video_count?.toString() || '0',
                viewCount: ch.view_count?.toString() || '0',
              }))
            setAdditionalChannelsList(additional)
            console.log('Loaded additional channels from DB:', additional.length)
          }
        } else {
          console.error('Failed to fetch channels:', await res.text())
        }
      } catch (error) {
        console.error('Failed to load channel data from database:', error)
      }
    }

    loadChannelData()
  }, [])

  // Disconnect a specific additional channel (keeps primary intact)
  const handleDisconnectAdditional = async (channelId: string) => {
    if (!confirm('Disconnect this channel?')) return
    try {
      // Delete from database
      const deleteRes = await fetch(`/api/channels?channelId=${encodeURIComponent(channelId)}`, { method: 'DELETE' })
      if (deleteRes.ok) {
        // Update local state by removing the channel
        setAdditionalChannelsList(prev => prev.filter(ch => ch.id !== channelId))
        // remove any stored tokens for this channel
        localStorage.removeItem(`youtube_access_token_${channelId}`)
        localStorage.removeItem(`youtube_refresh_token_${channelId}`)
        console.log('Successfully disconnected additional channel:', channelId)
      } else {
        console.error('Failed to delete channel from database')
      }
    } catch (dbErr) {
      console.warn('Failed to delete channel from DB:', dbErr)
    }

    // If the removed channel was currently set as youtube_channel, clear it
    try {
      const primary = localStorage.getItem('youtube_channel')
      if (primary) {
        const primaryObj = JSON.parse(primary)
        if (primaryObj?.id === channelId) {
          localStorage.removeItem('youtube_channel')
          localStorage.removeItem('youtube_access_token')
          localStorage.removeItem('youtube_refresh_token')
          setYoutubeChannel(null)
        }
      }
    } catch (err) {
      console.error('Failed to disconnect channel', err)
    }
  }

  // Disconnect primary channel (clears primary and tokens)
  const handleDisconnectPrimary = () => {
    if (!confirm('Disconnect primary channel?')) return
    try {
      localStorage.removeItem('youtube_channel')
      localStorage.removeItem('youtube_access_token')
      localStorage.removeItem('youtube_refresh_token')
      setYoutubeChannel(null)
      setShowChannelMenu(false)
    } catch (err) {
      console.error('Failed to disconnect primary channel', err)
    }
  }

  // Fetch latest and top videos when channel is loaded
  useEffect(() => {
    const fetchLatestVideo = async () => {
      if (!youtubeChannel) return
      
      setLoadingVideo(true)
      try {
        // Fetch videos server-side; server will use stored tokens or API key fallback
        const response = await fetch(`/api/youtube/best-videos?channelId=${youtubeChannel.id}`)

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          console.error('Failed to fetch videos:', err)
          setLoadingVideo(false)
          return
        }

        let data = await response.json()
        
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
          // Pre-generate tags locally for quick publish (hidden UI)
          try { generateTagsLocally(video.title || '') } catch {}

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

  // Local tag generator from video title - generates tags without API calls (saves quota)
  const generateTagsLocally = (title: string) => {
    if (!title) {
      setSuggestedTags([])
      return
    }

    // Normalize title and extract candidate tags (1-3 word phrases)
    const commonWords = new Set([
      'the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','am','be','been','being',
      'have','has','had','do','does','did','will','would','could','should','can','may','might','must','this','that',
      'these','those','video','shorts','how','what','why','when','where','who'
    ])

    const cleaned = title
      .toLowerCase()
      .replace(/[#@]/g, '')
      .replace(/["'“”‘’()\[\]:;!?.,/\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const words = cleaned.split(' ').filter(Boolean)
    const candidates: string[] = []

    // Single words
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      if (w.length > 2 && !commonWords.has(w)) candidates.push(w)
    }

    // 2-word phrases
    for (let i = 0; i + 2 <= words.length; i++) {
      const seq = words.slice(i, i + 2).filter(w => !commonWords.has(w)).join(' ')
      if (seq.split(' ').length === 2) candidates.push(seq)
    }

    // 3-word phrases
    for (let i = 0; i + 3 <= words.length; i++) {
      const seq = words.slice(i, i + 3).filter(w => !commonWords.has(w)).join(' ')
      if (seq.split(' ').length >= 2) candidates.push(seq)
    }

    // Unique + score + color
    const seen = new Set<string>()
    const colors = ['emerald','orange','blue','amber','purple','rose','cyan','indigo']
    const final: any[] = []

    for (const t of candidates) {
      const tag = t.trim()
      if (!tag || seen.has(tag)) continue
      seen.add(tag)

      const wordCount = tag.split(' ').length
      const baseScore = wordCount === 1 ? 65 : wordCount === 2 ? 55 : 45
      const randomBonus = Math.floor(Math.random() * 25)

      final.push({
        tag,
        score: baseScore + randomBonus,
        color: colors[final.length % colors.length]
      })

      if (final.length >= 20) break
    }

    setSuggestedTags(final)
  }

  // Local lightweight fallback generator (kept for offline cases) — simpler than old generator
  const generateTagsFallback = (title: string) => {
    if (!title) return []
    const commonWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','am','be','been','being','have','has','had','do','does','did','will','would','could','should','can','may','might','must','this','that','these','those','video','shorts'])
    const cleaned = title.toLowerCase().replace(/[#@]/g, '').replace(/["'“”‘’()\[\]:;!?.,/\\]/g, '').replace(/\s+/g, ' ').trim()
    const words = cleaned.split(' ').filter(Boolean)
    const ngrams: string[] = []
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      if (w.length > 1 && !commonWords.has(w)) ngrams.push(w)
    }
    for (let n = 2; n <= 2; n++) {
      for (let i = 0; i + n <= words.length; i++) {
        const seq = words.slice(i, i + n).filter(w => !commonWords.has(w)).join(' ')
        if (seq) ngrams.push(seq)
      }
    }
    // Unique and color map
    const seen = new Set<string>()
    const final: any[] = []
    const colors = ['emerald','orange','blue','amber','purple','rose','cyan','indigo']
    for (const t of ngrams) {
      const tag = t.trim()
      if (!tag) continue
      if (seen.has(tag)) continue
      seen.add(tag)
      final.push({ tag, score: 40 + Math.floor(Math.random() * 40), color: colors[final.length % colors.length] })
      if (final.length >= 12) break
    }
    return final
  }

  // Fetch suggestions for the Add Tag input (debounced)
  const fetchInputSuggestions = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setInputSuggestions([])
      setShowInputSuggestions(false)
      return
    }

    setSuggestionLoading(true)
    try {
      const res = await fetch(`/api/youtube/tag-suggest?title=${encodeURIComponent(query)}&maxResults=10&minScore=20`)
      if (!res.ok) throw new Error('Failed to fetch tag suggestions')
      const data = await res.json()
      const tags = (data.tags || []).slice(0, 10)
      // Sort to prefer single-word tags and higher viralScore
      tags.sort((a: any, b: any) => {
        const aw = (a.tag || '').split(' ').length
        const bw = (b.tag || '').split(' ').length
        if (aw !== bw) return aw - bw
        return (b.viralScore || 0) - (a.viralScore || 0)
      })
      setInputSuggestions(tags.map((t: any) => ({ tag: t.tag, score: t.score })))
      setShowInputSuggestions(true)
    } catch (err) {
      console.error('Input suggestion fetch failed:', err)
      setInputSuggestions([])
      setShowInputSuggestions(false)
    } finally {
      setSuggestionLoading(false)
    }
  }

  const handleAddSuggestedTag = (tagStr: string) => {
    const normalized = tagStr.trim().toLowerCase()
    if (!normalized) return
    // Prevent duplicates
    const exists = suggestedTags.some(t => t.tag.toLowerCase() === normalized)
    if (exists) {
      setNewTagInput('')
      setInputSuggestions([])
      setShowInputSuggestions(false)
      return
    }
    const colors = ['emerald','orange','blue','amber','purple','rose','cyan','indigo']
    const newTag = { tag: normalized, score: 50, color: colors[suggestedTags.length % colors.length] }
    setSuggestedTags(prev => [...prev, newTag])
    setNewTagInput('')
    setInputSuggestions([])
    setShowInputSuggestions(false)
  }

  useEffect(() => {
    if (!latestVideo?.title) {
      setSuggestedTags([])
      return
    }

    // Generate tags locally from video title without using search.list API (saves quota)
    console.log('🏷️ Generating tags locally from title:', latestVideo.title)
    const tags = generateTagsFallback(latestVideo.title)
    setSuggestedTags(tags)
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

    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
        setIsConnecting(false)
        setShowConnectModal(false)
        window.removeEventListener('message', messageListener)
        if (popup) popup.close()

        const { channel, token, refreshToken } = event.data as any

        try {
          // Check if channel already connected via Supabase (will fetch on reload)
          setAdditionalChannelsList((list) => {
            // Dedupe defensively
            const exists = list.some((l) => l.id === channel.id)
            return exists ? list : [...list, channel]
          })

          // Store channel in database
          console.log('📤 Sending channel to /api/channels:', {
            channelId: channel.id,
            title: channel.title,
            description: channel.description
          })
          const storeRes = await fetch('/api/channels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelId: channel.id,
              title: channel.title,
              description: channel.description,
              thumbnail: channel.thumbnail,
              subscriberCount: channel.subscriberCount,
              videoCount: channel.videoCount,
              viewCount: channel.viewCount,
              isPrimary: false
            })
          })
          const storeData = await storeRes.json()
          if (!storeRes.ok) {
            console.error('❌ API Error:', storeRes.status, storeData)
            alert('Failed to save channel: ' + (storeData.error || 'Unknown error'))
          } else {
            console.log('✅ Channel stored in database:', storeData)
          }

          // Inform user and redirect to dashboard
          alert(`Successfully connected ${channel.title}`)
          router.push('/dashboard')
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
              generateTagsLocally(next.title)
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
    const val = newTagInput.trim()
    if (!val) return

    const normalized = val.toLowerCase()
    // prevent duplicates
    if (suggestedTags.some(t => t.tag.toLowerCase() === normalized)) {
      setNewTagInput('')
      setInputSuggestions([])
      setShowInputSuggestions(false)
      return
    }

    const colors = ['emerald', 'orange', 'blue', 'amber', 'purple', 'rose', 'cyan', 'indigo']
    const newTag = {
      tag: normalized,
      score: 50,
      color: colors[suggestedTags.length % colors.length]
    }

    setSuggestedTags(prev => [...prev, newTag])
    setNewTagInput('')
    setInputSuggestions([])
    setShowInputSuggestions(false)
  }

  const handleRemoveTag = (index: number) => {
    setSuggestedTags(suggestedTags.filter((_, i) => i !== index))
  }

  const handleShowMore = () => {
    const next = !showAllTags
    setShowAllTags(next)
    setCardExpanded(next)

    // Focus the add-tag input when expanding so it's quick to add tags on mobile/desktop
    if (next) {
      setTimeout(() => addTagInputRef.current?.focus(), 120)
    }
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
        // First try to fetch cached analytics from database
        const cachedRes = await fetch(`/api/analytics?channelId=${youtubeChannel.id}`)
        const cachedData = await cachedRes.json()

        // Check if cache is fresh (less than 1 hour old)
        if (cachedData?.data?.last_fetched) {
          const lastFetch = new Date(cachedData.data.last_fetched).getTime()
          const now = Date.now()
          const ageHours = (now - lastFetch) / (1000 * 60 * 60)

          if (ageHours < 1) {
            // Cache is fresh, use it
            console.log('✅ Using cached analytics from database')
            setAnalyticsData((prev) => ({
              ...prev,
              views: Number(cachedData.data.total_views || youtubeChannel.viewCount || 0),
              subscribers: Number(cachedData.data.total_subscribers || youtubeChannel.subscriberCount || 0),
              watchTime: Number(cachedData.data.total_watch_time_hours || 0)
            }))
            return
          }
        }

        // Cache is stale or missing, fetch fresh analytics from server (server will resolve tokens)
        const res = await fetch(`/api/youtube/analytics/summary?channelId=${youtubeChannel.id}`)
        if (!res.ok) {
          console.warn('Analytics summary fetch failed', res.status)
          return
        }

        const data = await res.json()
        const totalWatchMinutes = Number(data?.summary?.totalWatchMinutes || 0)
        const totalViews = Number(data?.summary?.totalViews || youtubeChannel.viewCount || 0)
        const totalSubscribers = parseInt(youtubeChannel.subscriberCount || '0') || 0

        // Store fresh analytics in database
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: youtubeChannel.id,
            totalViews,
            totalSubscribers,
            totalWatchTimeHours: Math.round(totalWatchMinutes / 60)
          })
        })

        setAnalyticsData((prev) => ({
          ...prev,
          views: totalViews,
          subscribers: totalSubscribers,
          watchTime: Math.round(totalWatchMinutes / 60) // convert minutes to hours
        }))
      } catch (err) {
        console.error('Failed to fetch analytics summary:', err)
        // Fallback to channel stored stats
        setAnalyticsData((prev) => ({
          ...prev,
          views: parseInt(youtubeChannel?.viewCount || '0') || 0,
          subscribers: parseInt(youtubeChannel?.subscriberCount || '0') || 0,
          watchTime: 0
        }))
      }
    }

    fetchAnalyticsSummary()
  }, [youtubeChannel])

  return (
    <div className="min-h-screen bg-slate-50">
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
            {loadingVideo && (
              <div className="mb-4 px-2">
                <div className="h-1 w-full rounded-full overflow-hidden bg-gray-200/60">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-80 animate-pulse" />
                </div>
              </div>
            )}
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
                    <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] sm:w-full max-w-md text-gray-800 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Header */}
                      <div className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-gradient-to-r from-indigo-50 to-pink-50 border-b border-gray-100">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <img src={youtubeChannel?.thumbnail} alt={youtubeChannel?.title} className="w-14 h-14 rounded-full object-cover shadow-lg ring-2 ring-white" />
                            <span className="absolute -right-1 -bottom-1 bg-white rounded-full p-[2px] shadow-sm">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold">{uniqueChannelCount}</span>
                            </span>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="text-sm sm:text-base font-bold truncate" title={youtubeChannel?.title}>{youtubeChannel?.title}</div>
                            <div className="text-xs text-gray-500">Connected • <span className="font-semibold text-gray-800">{formatNumber(youtubeChannel?.videoCount || 0)} videos</span></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDisconnectPrimary()}
                            className="inline-flex items-center gap-2 text-sm text-red-600 bg-white border border-red-200 px-3 py-1 rounded-md hover:bg-red-50 focus:outline-none font-semibold transition-colors"
                            title="Disconnect primary channel"
                          >
                            <X className="w-3 h-3" />
                            <span className="hidden sm:inline">Disconnect</span>
                          </button>
                        </div>
                      </div>

                      {/* Channels List */}
                      <div className="px-3 py-3 max-h-64 sm:max-h-72 overflow-y-auto">
                        {visibleAdditionalChannels.length > 0 ? visibleAdditionalChannels.map((ch: YouTubeChannel) => (
                          <div key={ch.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                            <img src={ch.thumbnail} alt={ch.title} className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{ch.title}</div>
                              <div className="text-xs text-gray-500">{formatNumber(ch.videoCount)} videos • {formatNumber(ch.subscriberCount)} subs</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  // Switch to this channel (refresh to ensure server state)
                                  localStorage.setItem('youtube_channel', JSON.stringify(ch))
                                  const token = localStorage.getItem(`youtube_access_token_${ch.id}`) || null
                                  if (token) localStorage.setItem('youtube_access_token', token)
                                  setYoutubeChannel(ch)
                                  setShowChannelMenu(false)
                                }}
                                className="text-sm text-blue-600 px-3 py-1 rounded-md bg-white border border-blue-50 hover:bg-blue-50 font-semibold"
                              >
                                Use
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDisconnectAdditional(ch.id)
                                }}
                                className="text-sm text-red-600 px-3 py-1 rounded-md bg-white border border-red-50 hover:bg-red-50 font-semibold"
                                title="Disconnect this channel"
                              >
                                Disconnect
                              </button>
                            </div>
                          </div>
                        )) : (
                          <div className="flex items-center justify-center px-6 py-10 text-sm text-gray-500 font-medium bg-gray-50 rounded-xl">No other channels connected</div>
                        )}
                      </div>

                      {/* Footer actions */}
                      <div className="px-5 py-4 bg-white border-t border-gray-100">
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              localStorage.setItem('oauth_return_page', 'sidebar')
                              setShowChannelMenu(false)
                              startYouTubeAuth()
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full py-3 px-6 flex items-center justify-center gap-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 font-semibold text-sm transition-all active:scale-95"
                          >
                            <Youtube className="w-4 sm:w-5 h-4 sm:h-5" />
                            Connect Another Channel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show Connect Channel Card if no channel connected */}
              {!youtubeChannel && (
                <div className="flex justify-center mb-8 px-3">
                  <Link href="/connect">
                    <button className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span className="text-sm font-semibold">Connect Your YouTube Channel</span>
                    </button>
                  </Link>
                </div>
              )}

              <div className="flex justify-center mb-6 px-3">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/5 border border-gray-100 px-4 py-2 text-sm text-gray-700 shadow-sm max-w-full overflow-hidden">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Plan: Free</span>
                    <span className="text-gray-500 hidden sm:inline">• Limited features</span>
                  </div>
                  <Link href="/settings" className="ml-3 hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-800 text-sm font-semibold">Manage plan</Link>
                </div>
              </div>

              {/* Hero / Overview */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-extrabold text-gray-900 mb-2">🙏 Namaste, {firstName}!</h1>

                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-sm sm:text-base text-gray-700">Quick snapshot — YouTube growth & earnings</span>
                    </div>

                    <div className="flex-1 hidden sm:block">
                      <span className="inline-block h-px bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 ml-3 w-full"></span>
                    </div>

                    <div className="mt-3 sm:mt-0 flex w-full sm:w-auto">
                      <Link href="/challenge" className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-full font-semibold shadow-sm text-sm text-center">Start Challenge</Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* Three main statistic cards (clean, spacious style) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Views</p>
                      <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">{formatNumber(analyticsData.views)}</p>
                      <p className="text-xs text-gray-500 mt-2">Across connected channels</p>
                    </div>
                    <div className="ml-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                        <ViewsIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Subscribers</p>
                      <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">{formatNumber(analyticsData.subscribers)}</p>
                      <p className="text-xs text-gray-500 mt-2">Across connected channels</p>
                    </div>
                    <div className="ml-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-sm">
                        <SubscribersIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-lg col-span-2 sm:col-span-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Watch Time</p>
                      <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">{formatNumber(analyticsData.watchTime)}h</p>
                      <p className="text-xs text-gray-500 mt-2">Hours watched</p>
                    </div>
                    <div className="ml-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                        <WatchTimeIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Missing Tags Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl ring-1 ring-slate-900/20 border border-slate-700/40 backdrop-blur-sm">
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

                {loadingVideo ? (
                  <div className={`transition-all duration-300 overflow-hidden ${cardExpanded ? 'max-h-300 p-6' : 'max-h-40 p-2'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start mb-4">
                      <div className="md:col-span-3">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-200 animate-pulse" />
                      </div>
                      <div className="md:col-span-9">
                        <div className="h-6 w-3/4 bg-gray-200 rounded mb-3 animate-pulse" />
                        <div className="flex flex-wrap gap-2 mb-3">
                          {[0,1,2,3,4].map(i => (
                            <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
                          ))}
                        </div>
                        <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-4" />
                      </div>
                    </div>
                  </div>
                ) : latestVideo ? (
                  <div className="transition-all duration-300 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                      {/* Thumbnail */}
                      <div className="md:col-span-3">
                        <div className="relative w-full h-32 md:h-40 rounded-lg overflow-hidden bg-gray-700">
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

                      {/* Details Section (no tags UI) */}
                      <div className="md:col-span-9">
                        <p className="text-white font-semibold mb-3 line-clamp-2">{latestVideo.title}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-4">No video selected yet</p>
                  </div>
                )}

                <div className="mt-6">
                  <Button 
                    onClick={handlePublishTags}
                    disabled={!latestVideo || isPublishing}
                    className="w-full bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold py-3 rounded-lg border border-slate-600/50 hover:border-slate-600 transition-colors"
                  >
                    {isPublishing ? 'Adding...' : 'Add Tags'}
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
                                generateTagsLocally(video.title)
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
                      {loadingVideo ? (
                    // Loading skeletons for top performing videos
                    [0,1,2].map((i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 animate-pulse">
                        <div className="flex items-start gap-4">
                          <div className="w-28 h-16 rounded-md overflow-hidden bg-gray-200 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                            <div className="mt-3 flex items-center gap-2">
                              <div className="h-6 w-10 bg-gray-200 rounded" />
                              <div className="h-6 w-14 bg-gray-200 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    topVideos && topVideos.length > 0 ? (
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
                    )
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
