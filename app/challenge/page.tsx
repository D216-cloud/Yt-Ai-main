"use client"

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Sparkles, Youtube, Monitor, Smartphone, Calendar, Clock, Eye, Heart, MessageCircle } from 'lucide-react' 
import SharedSidebar from '@/components/shared-sidebar'
import DashboardHeader from '@/components/dashboard-header'
import { useToast } from '@/hooks/use-toast'

type CreatorChallengePlan = {
  durationMonths: number
  cadenceEveryDays: number
  videosPerCadence: number
  createdAt: string
}

type CreatorChallengeVideo = {
  videoNumber: number
  uploadDay: number
  uploadIndexInDay: number
}

interface YouTubeChannel {
  id: string
  title: string
  description?: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
  viewCount: string
}

function formatNumber(num: string | number) {
  const n = typeof num === 'string' ? Number(num) : num
  if (!Number.isFinite(n)) return '0'

  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(Math.round(n))
}

export default function ChallengePage() {
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [additionalChannelsList, setAdditionalChannelsList] = useState<YouTubeChannel[]>([])
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const channelMenuRef = useRef<HTMLDivElement | null>(null)

  const [plan, setPlan] = useState<CreatorChallengePlan | null>(null)
  const [setupHidden, setSetupHidden] = useState(false)
  const [durationMonths, setDurationMonths] = useState(6)
  const [cadenceEveryDays, setCadenceEveryDays] = useState(2)
  const [videosPerCadence, setVideosPerCadence] = useState(1)
  const [showMore, setShowMore] = useState(false)

  const [challengeStartedAt, setChallengeStartedAt] = useState<string | null>(null)
  const [showAllVideos, setShowAllVideos] = useState(false)

  // UI states while preparing a schedule (shows spinner & disables actions)
  const [isPreparing, setIsPreparing] = useState(false)
  const [isStartingAnimation, setIsStartingAnimation] = useState(false)

  // New states for the step-by-step flow
  const [step, setStep] = useState<'start' | 'setup' | 'videoType' | 'progress'>('start')
  const [selectedDuration, setSelectedDuration] = useState(6) // months
  const [selectedFrequency, setSelectedFrequency] = useState(2) // days
  const [selectedVideoType, setSelectedVideoType] = useState<'long' | 'shorts' | null>(null)
  const [challengeStartDate, setChallengeStartDate] = useState<Date | null>(null)

  // Staged animation when selecting video type: 'idle' | 'running' (first gif) | 'loading2' (second gif)
  const [animStage, setAnimStage] = useState<'idle' | 'running' | 'loading2'>('idle')
  const animT1 = useRef<number | null>(null)
  const animT2 = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (animT1.current) clearTimeout(animT1.current)
      if (animT2.current) clearTimeout(animT2.current)
    }
  }, [])

  const handleSelectVideoType = (type: 'long' | 'shorts') => {
    // select immediately for visual state
    setSelectedVideoType(type)
    // start first animation (running gif)
    setAnimStage('running')
    // after 3s switch to loading2
    animT1.current = window.setTimeout(() => {
      setAnimStage('loading2')
    }, 3000)
    // after 5s finish and proceed to progress and persist selection
    animT2.current = window.setTimeout(async () => {
      setAnimStage('idle')
      setStep('progress')
      // persist to server if we have a challenge id
      try {
        const id = localStorage.getItem('creator_challenge_id')
        if (id) {
          const res = await fetch(`/api/user-challenge?id=${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config: { videoType: type } })
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Server error' }))
            const { error } = err as any
            toast({ title: 'Could not save selection', description: error || 'Server error' })
          } else {
            toast({ title: 'Saved format', description: `Selected ${type === 'long' ? 'Long Video (16:9)' : 'Shorts (9:16)'}` })
          }
        }
      } catch (e) {
        console.error('Failed to persist videoType', e)
        toast({ title: 'Save failed', description: String(e?.message || e) })
      }
    }, 5000)
  }

  // Custom / flexible setup states
  const [customDurationEnabled, setCustomDurationEnabled] = useState(false)
  const [customMonths, setCustomMonths] = useState<number>(3)



  // Keep inputs synced with computed defaults when base settings change


  // Schedule count: show fewer items on small screens for clarity
  const scheduleCount = useMemo(() => {
    const months = customDurationEnabled ? customMonths : selectedDuration
    const daysBetween = selectedFrequency || 1
    const totalUploads = Math.max(1, Math.floor((months * 30) / daysBetween))
    if (typeof window === 'undefined') return Math.min(10, totalUploads)
    return window.innerWidth < 640 ? Math.min(5, totalUploads) : Math.min(10, totalUploads)
  }, [customDurationEnabled, customMonths, selectedDuration, selectedFrequency])

  // Toggle to view the full schedule list
  const [showFullSchedule, setShowFullSchedule] = useState(false)

  // Total uploads derived from plan (used for View more and full expansion)
  const totalUploads = useMemo(() => {
    const months = customDurationEnabled ? customMonths : selectedDuration
    const daysBetween = selectedFrequency || 1
    return Math.max(1, Math.floor((months * 30) / daysBetween))
  }, [customDurationEnabled, customMonths, selectedDuration, selectedFrequency])

  // Schedule dates for the whole plan (used for heatmap and stats)
  const scheduleDates = useMemo(() => {
    if (!challengeStartDate) return [] as Date[]
    const out: Date[] = []
    for (let i = 0; i < totalUploads; i++) {
      out.push(new Date(challengeStartDate.getTime() + i * (selectedFrequency || 1) * 24 * 60 * 60 * 1000))
    }
    return out
  }, [challengeStartDate, totalUploads, selectedFrequency])

  // Simple derived consistency metrics (based on dates that are in the past)
  const uploadedCount = useMemo(() => scheduleDates.filter(d => d < new Date()).length, [scheduleDates])
  const consistencyPercent = useMemo(() => Math.round((uploadedCount / Math.max(1, totalUploads)) * 100), [uploadedCount, totalUploads])
  const currentStreak = useMemo(() => {
    // Count consecutive past uploads starting from the most recent scheduled date
    let streak = 0
    const today = new Date().setHours(0,0,0,0)
    for (let i = scheduleDates.length - 1; i >= 0; i--) {
      const d = scheduleDates[i].setHours(0,0,0,0)
      if (d < today) streak++
      else break
    }
    return streak
  }, [scheduleDates])

  // Metadata for scheduled videos (titles, thumbnails, notes, uploaded state)
  type ScheduledMeta = {
    title?: string
    thumbnail?: string
    notes?: string
    duration?: string
    uploaded?: boolean
    uploadedAt?: string | null
  }

  const [scheduledMeta, setScheduledMeta] = useState<Record<number, ScheduledMeta>>({})
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editorDraft, setEditorDraft] = useState<ScheduledMeta>({})

  // Load saved meta from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('challenge_scheduled_meta')
      if (raw) setScheduledMeta(JSON.parse(raw))
    } catch {
      // noop
    }
  }, [])

  // Persist scheduled meta
  useEffect(() => {
    try {
      localStorage.setItem('challenge_scheduled_meta', JSON.stringify(scheduledMeta))
    } catch {
      // noop
    }
  }, [scheduledMeta])

  const toggleUploaded = (index: number) => {
    setScheduledMeta(prev => {
      const next = { ...prev };
      const current = next[index] || {};
      if (current.uploaded) {
        current.uploaded = false
        current.uploadedAt = null
      } else {
        current.uploaded = true
        current.uploadedAt = new Date().toISOString()
      }
      next[index] = current

      // Persist change to server in background
      ;(async () => {
        try {
          const id = localStorage.getItem('creator_challenge_id')
          if (!id) return
          const progressArr = Object.keys(next).map((k) => next[Number(k)])
          const res = await fetch(`/api/user-challenge?id=${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progress: progressArr })
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Server error' }))
            toast({ title: 'Failed to save progress', description: err?.error || 'Server error' })
          }
        } catch (e) {
          console.error('Failed to persist progress to server', e)
          toast({ title: 'Failed to save progress', description: String(e?.message || e) })
        }
      })()

      return next
    })
  }

  const openEditor = (index: number) => {
    setEditingIndex(index)
    setEditorDraft(scheduledMeta[index] || {
      title: `Video ${index + 1}`
    })
  }

  const saveEditor = async () => {
    if (editingIndex === null) return
    setScheduledMeta(prev => {
      const next = { ...prev, [editingIndex]: editorDraft };

      // Persist progress to server
      ;(async () => {
        try {
          const id = localStorage.getItem('creator_challenge_id')
          if (!id) return
          const progressArr = Object.keys(next).map((k) => next[Number(k)])
          const res = await fetch(`/api/user-challenge?id=${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progress: progressArr })
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Server error' }))
            toast({ title: 'Failed to save progress', description: err?.error || 'Server error' })
          }
        } catch (e) {
          console.error('Failed to persist progress to server', e)
          toast({ title: 'Failed to save progress', description: String(e?.message || e) })
        }
      })()

      return next
    })
    setEditingIndex(null)
  }

  const closeEditor = () => {
    setEditingIndex(null)
  }

  const visibleAdditionalChannels = useMemo(() => {
    return (additionalChannelsList || []).filter((ch) => ch && ch.id && ch.id !== youtubeChannel?.id)
  }, [additionalChannelsList, youtubeChannel?.id])

  const uniqueChannelCount = useMemo(() => {
    const map: Record<string, boolean> = {}
    if (youtubeChannel?.id) map[youtubeChannel.id] = true
    for (const ch of (additionalChannelsList || [])) {
      if (ch && ch.id) map[String(ch.id)] = true
    }
    return Object.keys(map).length
  }, [youtubeChannel, additionalChannelsList])

  const startYouTubeAuth = () => {
    try {
      localStorage.setItem('oauth_return_page', 'challenge')
    } catch {}
    window.location.href = '/api/youtube/auth'
  }

  const computed = useMemo(() => {
    const safeDurationMonths = Math.max(1, Math.min(24, Number(durationMonths) || 1))
    const safeCadenceEveryDays = Math.max(1, Math.min(30, Number(cadenceEveryDays) || 1))
    const safeVideosPerCadence = Math.max(1, Math.min(10, Number(videosPerCadence) || 1))

    // Use 30 days/month for simple, predictable math.
    const totalDays = safeDurationMonths * 30

    // Uploads happen on day 1, then every N days: 1, 1+N, 1+2N...
    const uploadDaysCount = Math.floor((Math.max(1, totalDays) - 1) / safeCadenceEveryDays) + 1
    const totalVideos = uploadDaysCount * safeVideosPerCadence
    const perMonth = Math.round((totalVideos / safeDurationMonths) * 10) / 10
    const perWeek = Math.round(((totalVideos / totalDays) * 7) * 10) / 10

    return {
      durationMonths: safeDurationMonths,
      cadenceEveryDays: safeCadenceEveryDays,
      videosPerCadence: safeVideosPerCadence,
      totalDays,
      totalVideos,
      perMonth,
      perWeek,
    }
  }, [durationMonths, cadenceEveryDays, videosPerCadence])

  // Setup summary for user-friendly calculations shown in the UI
  const setupSummary = useMemo(() => {
    const months = selectedDuration || 6
    const totalDays = months * 30
    const daysPerVideo = Math.max(1, selectedFrequency || 2)
    const totalVideos = Math.max(1, Math.floor(totalDays / daysPerVideo))
    const perDay = totalVideos / totalDays
    const perWeek = perDay * 7
    const perMonth = totalVideos / months
    const avgSpacing = Math.max(1, Math.round(totalDays / Math.max(1, totalVideos)))
    return { months, totalDays, daysPerVideo, totalVideos, perDay, perWeek, perMonth, avgSpacing }
  }, [selectedDuration, selectedFrequency])



  const plannedVideos = useMemo((): CreatorChallengeVideo[] => {
    const safeTotalDays = Math.max(1, computed.totalDays)
    const cadence = Math.max(1, computed.cadenceEveryDays)
    const perCadence = Math.max(1, computed.videosPerCadence)

    const out: CreatorChallengeVideo[] = []
    let videoNumber = 1

    for (let day = 1; day <= safeTotalDays; day += cadence) {
      for (let i = 1; i <= perCadence; i++) {
        out.push({
          videoNumber,
          uploadDay: day,
          uploadIndexInDay: i,
        })
        videoNumber += 1
      }
    }

    return out
  }, [computed.totalDays, computed.cadenceEveryDays, computed.videosPerCadence])

  const persistPlan = (nextPlan: CreatorChallengePlan) => {
    try {
      localStorage.setItem('creator_challenge_plan', JSON.stringify(nextPlan))
    } catch {}
    setPlan(nextPlan)
  }

  const startChallenge = async () => {
    const nextPlan: CreatorChallengePlan = {
      durationMonths: computed.durationMonths,
      cadenceEveryDays: computed.cadenceEveryDays,
      videosPerCadence: computed.videosPerCadence,
      createdAt: new Date().toISOString(),
    }
    persistPlan(nextPlan)

    const ts = new Date().toISOString()
    try {
      localStorage.setItem('creator_challenge_started_at', ts)
      localStorage.setItem('creator_challenge_setup_hidden', '1')
    } catch {}
    setChallengeStartedAt(ts)
    setSetupHidden(true)
    setShowAllVideos(false)

    // Attempt to persist to server
    try {
      const res = await fetch('/api/user-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: nextPlan, progress: Object.values(scheduledMeta) })
      })

      if (!res.ok) {
        if (res.status === 401) {
          toast({ title: 'Sign in required', description: 'Please sign in to save your challenge' })
          return
        }
        const err = await res.json().catch(() => ({ error: 'Unknown server error' }))
        toast({ title: 'Failed to start challenge', description: err?.error || 'Server error' })
        return
      }

      const json = await res.json()
      try { localStorage.setItem('creator_challenge_id', json?.id || '') } catch {}
      toast({ title: 'Challenge started', description: 'Saved to your account' })
    } catch (e) {
      console.error('Failed to persist challenge to server', e)
      toast({ title: 'Failed to start challenge', description: String(e?.message || e) })
    }
  }

  const handleSaveAndHide = async () => {
    const nextPlan: CreatorChallengePlan = {
      durationMonths: computed.durationMonths,
      cadenceEveryDays: computed.cadenceEveryDays,
      videosPerCadence: computed.videosPerCadence,
      createdAt: new Date().toISOString(),
    }
    persistPlan(nextPlan)
    setShowMore(false)
    setSetupHidden(true)
    try {
      localStorage.setItem('creator_challenge_setup_hidden', '1')
    } catch {}

    // Persist config to server
    try {
      const id = localStorage.getItem('creator_challenge_id')
      if (!id) return
      await fetch(`/api/user-challenge?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: nextPlan })
      })
    } catch (e) {
      console.error('Failed to persist challenge config to server', e)
    }
  }

  const handleEditPlan = () => {
    setSetupHidden(false)
    setShowMore(false)
    try {
      localStorage.setItem('creator_challenge_setup_hidden', '0')
    } catch {}
  }

  const handleResetPlan = async () => {
    if (!confirm('Clear your challenge plan?')) return

    // Attempt to delete on server
    try {
      const id = localStorage.getItem('creator_challenge_id')
      if (id) await fetch(`/api/user-challenge?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    } catch (e) {
      console.error('Failed to delete challenge on server', e)
    }

    try {
      localStorage.removeItem('creator_challenge_plan')
      localStorage.removeItem('creator_challenge_setup_hidden')
      localStorage.removeItem('creator_challenge_started_at')
      localStorage.removeItem('creator_challenge_id')
    } catch {}
    setPlan(null)
    setSetupHidden(false)
    setShowMore(false)
    setChallengeStartedAt(null)
    setShowAllVideos(false)
    setDurationMonths(6)
    setCadenceEveryDays(2)
    setVideosPerCadence(1)
  }

  // Load channels from DB (same source as dashboard)
  useEffect(() => {
    const loadChannelData = async () => {
      try {
        const res = await fetch('/api/channels')
        if (!res.ok) return
        const data = await res.json()
        if (!data?.channels || !Array.isArray(data.channels)) return

        const primary = data.channels.find((ch: any) => ch.is_primary)
        if (primary) {
          setYoutubeChannel({
            id: primary.channel_id,
            title: primary.title,
            description: primary.description,
            thumbnail: primary.thumbnail,
            subscriberCount: primary.subscriber_count?.toString() || '0',
            videoCount: primary.video_count?.toString() || '0',
            viewCount: primary.view_count?.toString() || '0',
          })
        }

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
      } catch (error) {
        console.error('Failed to load channel data:', error)
      }
    }

    loadChannelData()
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('creator_challenge_plan')
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CreatorChallengePlan>
        if (
          parsed &&
          typeof parsed.durationMonths === 'number' &&
          typeof parsed.cadenceEveryDays === 'number' &&
          typeof parsed.videosPerCadence === 'number'
        ) {
          const loadedPlan: CreatorChallengePlan = {
            durationMonths: parsed.durationMonths,
            cadenceEveryDays: parsed.cadenceEveryDays,
            videosPerCadence: parsed.videosPerCadence,
            createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
          }
          setPlan(loadedPlan)
          setDurationMonths(loadedPlan.durationMonths)
          setCadenceEveryDays(loadedPlan.cadenceEveryDays)
          setVideosPerCadence(loadedPlan.videosPerCadence)
        }
      }

      const hidden = localStorage.getItem('creator_challenge_setup_hidden')
      setSetupHidden(hidden === '1')

      const started = localStorage.getItem('creator_challenge_started_at')
      setChallengeStartedAt(started)
    } catch {
      // no-op
    }

    // Fetch persisted active challenge from server and merge
    const fetchActive = async () => {
      try {
        const res = await fetch('/api/user-challenge')
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Server error' }))
          console.error('Failed to fetch active challenge:', err)
          return
        }
        const json = await res.json()
        const ch = json?.challenge
        if (!ch) return

        // Apply to UI state
        if (ch.config) {
          const cfg = ch.config
          setPlan({
            durationMonths: cfg.durationMonths || durationMonths,
            cadenceEveryDays: cfg.cadenceEveryDays || cadenceEveryDays,
            videosPerCadence: cfg.videosPerCadence || videosPerCadence,
            createdAt: cfg.createdAt || new Date().toISOString(),
          })
          setDurationMonths(cfg.durationMonths || durationMonths)
          setCadenceEveryDays(cfg.cadenceEveryDays || cadenceEveryDays)
          setVideosPerCadence(cfg.videosPerCadence || videosPerCadence)
        }
        if (ch.started_at) {
          try { localStorage.setItem('creator_challenge_started_at', ch.started_at) } catch {}
          setChallengeStartedAt(ch.started_at)
          setSetupHidden(true)
        }
        if (Array.isArray(ch.progress) && ch.progress.length) {
          const map: Record<number, ScheduledMeta> = {}
          ch.progress.forEach((p: any, i: number) => {
            map[i] = {
              title: p.title,
              notes: p.notes,
              thumbnail: p.thumbnail,
              uploaded: !!p.uploaded,
              uploadedAt: p.uploadedAt || null,
            }
          })
          setScheduledMeta(map)
        }
        if (ch.id) {
          try { localStorage.setItem('creator_challenge_id', ch.id) } catch {}
        }
      } catch (e) {
        console.error('Failed to load persisted challenge from server', e)
      }
    }

    fetchActive()
  }, [])

  // Close channel menu on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!showChannelMenu) return
      const target = e.target as Node
      if (channelMenuRef.current && !channelMenuRef.current.contains(target)) {
        setShowChannelMenu(false)
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [showChannelMenu])

  const handleDisconnectAdditional = async (channelId: string) => {
    if (!confirm('Disconnect this channel?')) return
    try {
      const deleteRes = await fetch(`/api/channels?channelId=${encodeURIComponent(channelId)}`, { method: 'DELETE' })
      if (deleteRes.ok) {
        setAdditionalChannelsList((prev) => prev.filter((ch) => ch.id !== channelId))
        localStorage.removeItem(`youtube_access_token_${channelId}`)
        localStorage.removeItem(`youtube_refresh_token_${channelId}`)
      }
    } catch (error) {
      console.error('Failed to disconnect additional channel:', error)
    }
  }

  const handleDisconnectPrimary = () => {
    if (!confirm('Disconnect primary channel?')) return
    try {
      localStorage.removeItem('youtube_channel')
      localStorage.removeItem('youtube_access_token')
      localStorage.removeItem('youtube_refresh_token')
      setYoutubeChannel(null)
      setShowChannelMenu(false)
    } catch (error) {
      console.error('Failed to disconnect primary channel', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        <SharedSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activePage="challenge"
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        <main className={`flex-1 pt-14 md:pt-16 p-4 md:p-8 pb-20 md:pb-8 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 mt-8 md:mt-10">
              {/* Channel Selector (same dashboard style) */}
              {youtubeChannel && (
                <div className="flex justify-center mb-3 px-3 relative" ref={channelMenuRef}>
                  <div className="inline-flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full shadow-sm max-w-full truncate">
                    <img src={youtubeChannel.thumbnail} alt={youtubeChannel.title} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-sm font-medium truncate max-w-40">{youtubeChannel.title}</span>

                    <span className="ml-2 inline-flex items-center text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      <span className="font-semibold mr-1">{uniqueChannelCount}</span>
                      <span className="text-xs">{uniqueChannelCount === 1 ? 'channel' : 'channels'}</span>
                    </span>

                    <button
                      aria-haspopup="menu"
                      aria-expanded={showChannelMenu}
                      onClick={() => setShowChannelMenu((s) => !s)}
                      className="ml-2 flex items-center justify-center w-7 h-7 rounded-full bg-black/30 hover:bg-white/10 transition"
                      title="Channel actions"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {showChannelMenu && (
                    <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] sm:w-full max-w-md text-gray-800 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-linear-to-r from-indigo-50 to-pink-50 border-b border-gray-100">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <img src={youtubeChannel?.thumbnail} alt={youtubeChannel?.title} className="w-14 h-14 rounded-full object-cover shadow-lg ring-2 ring-white" />
                            <span className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 shadow-sm">
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
                            <span className="hidden sm:inline">Disconnect</span>
                          </button>
                        </div>
                      </div>

                      <div className="px-3 py-3 max-h-64 sm:max-h-72 overflow-y-auto">
                        {visibleAdditionalChannels.length > 0 ? visibleAdditionalChannels.map((ch) => (
                          <div key={ch.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                            <img src={ch.thumbnail} alt={ch.title} className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{ch.title}</div>
                              <div className="text-xs text-gray-500">{formatNumber(ch.videoCount)} videos • {formatNumber(ch.subscriberCount)} subs</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
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

                      <div className="px-5 py-4 bg-white border-t border-gray-100">
                        <button
                          onClick={() => {
                            setShowChannelMenu(false)
                            startYouTubeAuth()
                          }}
                          className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full py-3 px-6 flex items-center justify-center gap-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 font-semibold text-sm transition-all active:scale-95"
                        >
                          <Youtube className="w-4 sm:w-5 h-4 sm:h-5" />
                          Connect Another Channel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Connect CTA if no channel connected */}
              {!youtubeChannel && (
                <div className="flex justify-center mb-8 px-3">
                  <button
                    onClick={startYouTubeAuth}
                    className="inline-flex items-center gap-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-sm font-semibold">Connect Your YouTube Channel</span>
                  </button>
                </div>
              )}

              {/* Plan banner (same style) */}
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
            </div>

            {/* Creator Challenge Header */}
            <div className="w-full mb-8">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-white border border-gray-100">
                    <Youtube className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                        Creator Challenge
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base max-w-full sm:max-w-xl leading-snug wrap-break-word">Build consistent upload habits and grow your YouTube channel with structured challenges</p>
                    </div>
                    {youtubeChannel && (
                      <span className="ml-0 sm:ml-2 mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-100 text-xs font-semibold text-gray-700 shadow-sm">
                        Using: <span className="ml-2 font-medium">{youtubeChannel.title}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Challenge Card (persisted) */}
            {plan && challengeStartedAt && (
              <div className="rounded-2xl bg-white border border-gray-100 p-4 mb-6 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-gray-500">Active • Started {new Date(challengeStartedAt).toLocaleDateString()}</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1 truncate">{computed.totalVideos} videos • {consistencyPercent}% consistency</div>
                  <div className="text-sm text-gray-500 mt-1">{uploadedCount} uploads scheduled before today • {currentStreak} day streak</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowAllVideos((s) => !s)} className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50">{showAllVideos ? 'Close' : 'Open'}</button>
                  <button onClick={handleEditPlan} className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold hover:bg-gray-50">Edit</button>
                  <button onClick={handleResetPlan} className="px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-100 text-sm font-semibold hover:bg-red-100">Delete</button>
                </div>
              </div>
            )}

            {/* Challenge Flow Cards */}
            <div className="space-y-6">
              {step === 'start' && (
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-5 sm:p-8">
                  <div className="max-w-2xl mx-auto">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                          <Youtube className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-gray-100 text-xs font-semibold text-gray-700 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            New challenge plan
                          </div>
                          <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-gray-900">Build a consistent upload streak</h3>
                          <p className="mt-2 text-gray-600 text-sm sm:text-base leading-relaxed">
                            Pick a schedule, generate your full upload calendar, and track progress day by day.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          onClick={async () => {
                            if (isPreparing) return
                            setIsPreparing(true)
                            try {
                              // small preparation delay so users see the animation
                              await new Promise((r) => setTimeout(r, 700))
                              setStep('setup')
                            } finally {
                              setIsPreparing(false)
                            }
                          }}
                          disabled={isPreparing}
                          aria-busy={isPreparing}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 ${isPreparing ? 'opacity-90 cursor-wait' : ''} bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-sm transition-all duration-150`}
                        >
                          {isPreparing ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Preparing...
                            </span>
                          ) : (
                            'Create schedule'
                          )}
                        </button>

                        <button
                          onClick={async () => {
                            if (isPreparing) return
                            setIsPreparing(true)
                            try {
                              setCustomDurationEnabled(false)
                              setSelectedDuration(6)
                              setSelectedFrequency(2)
                              setVideosPerCadence(1)
                              // small delay for consistent UX
                              await new Promise((r) => setTimeout(r, 500))
                              setStep('setup')
                            } finally {
                              setIsPreparing(false)
                            }
                          }}
                          disabled={isPreparing}
                          aria-busy={isPreparing}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-200 bg-white/80 px-6 py-3 rounded-full text-gray-800 font-semibold hover:bg-white transition ${isPreparing ? 'opacity-70 cursor-wait' : ''}`}
                        >
                          {isPreparing ? (
                            <span className="inline-flex items-center gap-2 text-gray-800">
                              <span className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                              Preparing...
                            </span>
                          ) : (
                            'Quick start (2 days)'
                          )}
                        </button>
                      </div>
                  </div>
                </div>
              )}

              {step === 'setup' && (
                <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_30px_60px_rgba(8,15,52,0.06)] p-8">
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Set up your challenge</h3>
                    <p className="text-gray-600 mb-6">Choose your challenge duration and upload frequency to create a personalized plan.</p>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Duration</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[1,3,6,12].map((m) => (
                            <button
                              key={m}
                              onClick={() => { setSelectedDuration(m); setCustomDurationEnabled(false) }}
                              className={`w-full px-3 py-3 rounded-xl border text-sm font-semibold transition ${selectedDuration === m && !customDurationEnabled ? 'bg-blue-600 border-blue-700 text-white shadow' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                              {m}m
                            </button>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={customMonths}
                            onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setCustomMonths(v); setCustomDurationEnabled(true); setSelectedDuration(v) }}
                            className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                            aria-label="Custom months"
                          />
                          <div className="text-sm text-gray-600">months</div>
                          <div className="ml-3 text-xs text-gray-500">Presets: 1m / 3m / 6m / 12m</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Frequency</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[1,2,3].map((d) => (
                            <button
                              key={d}
                              onClick={() => setSelectedFrequency(d)}
                              className={`w-full px-3 py-3 rounded-xl border text-sm font-semibold transition ${selectedFrequency === d ? 'bg-blue-600 border-blue-700 text-white shadow' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                              1 / {d}d
                            </button>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={90}
                            value={selectedFrequency}
                            onChange={(e) => setSelectedFrequency(Math.max(1, Number(e.target.value) || 1))}
                            className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                            aria-label="Days per video" />
                          <div className="text-sm text-gray-600">days</div>
                          <div className="ml-3 text-xs text-gray-500">Choose spacing: 1 video every N days</div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-xs text-gray-500">/ day</div>
                            <div className="text-lg font-extrabold text-gray-900 mt-1">{(1/selectedFrequency).toFixed(2)}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-xs text-gray-500">/ week</div>
                            <div className="text-lg font-extrabold text-gray-900 mt-1">{(1/selectedFrequency*7).toFixed(1)}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-xs text-gray-500">/ month</div>
                            <div className="text-lg font-extrabold text-gray-900 mt-1">{(1/selectedFrequency*30).toFixed(1)}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-600">
                          <div className="font-medium">1 video every <span className="font-semibold">{selectedFrequency}</span> day(s)</div>
                          <div className="text-gray-500">Duration ≈ <span className="font-semibold">{selectedDuration} months</span> • Total ≈ <span className="font-semibold">{Math.max(1, Math.floor((selectedDuration*30)/selectedFrequency))}</span> videos</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
                        <button
                          onClick={() => setStep('start')}
                          className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => {
                            // derive values from selected months & frequency
                            const months = Math.max(1, selectedDuration)
                            const daysBetween = Math.max(1, selectedFrequency)
                            const videosPerDay = 1

                            const nextPlan: CreatorChallengePlan = {
                              durationMonths: months,
                              cadenceEveryDays: daysBetween,
                              videosPerCadence: videosPerDay,
                              createdAt: new Date().toISOString(),
                            }
                            persistPlan(nextPlan)

                            setSelectedDuration(months)
                            setSelectedFrequency(daysBetween)
                            setVideosPerCadence(videosPerDay)

                            // Play the start animation for 3s, then move to video type
                            setIsStartingAnimation(true)
                            setTimeout(() => {
                              setIsStartingAnimation(false)
                              setChallengeStartDate(new Date())
                              setStep('videoType')
                            }, 3000)
                          }}
                          className="w-full sm:w-auto px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all"
                        >
                          Start Challenge
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isStartingAnimation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
                    <div className="w-72 h-44 overflow-hidden rounded-md">
                      <video src="/animation/calander.mp4" autoPlay muted playsInline className="w-full h-full object-cover" />
                    </div>
                    <div className="w-64 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-blue-600 animate-[load_3s_ease-in-out]" style={{ width: '100%' }} />
                    </div>
                    <div className="text-sm text-gray-700">Preparing your schedule…</div>
                  </div>
                </div>
              )}

              {step === 'videoType' && (
                <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_30px_60px_rgba(8,15,52,0.06)] p-8">
                  <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Choose your video type</h3>
                    <p className="text-gray-600 mb-8">Select the primary format for your challenge videos.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleSelectVideoType('long')}
                        aria-pressed={selectedVideoType === 'long'}
                        className={`w-full p-5 rounded-2xl border transition-transform duration-150 text-left flex items-center gap-4 ${selectedVideoType === 'long' ? 'border-indigo-200 shadow-lg scale-100' : 'border-gray-200 hover:shadow-sm'} bg-white`}
                      >
                        <div className={`flex items-center justify-center rounded-md border ${selectedVideoType === 'long' ? 'border-indigo-200 shadow-sm' : 'border-gray-100'} bg-white w-16 h-10`}> 
                          <Monitor className="w-7 h-7 text-gray-700" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Long Video</h4>
                            <span className="ml-auto text-xs sm:text-sm font-semibold text-gray-500">16:9</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Standard horizontal videos — great for tutorials and long-form content.</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSelectVideoType('shorts')}
                        aria-pressed={selectedVideoType === 'shorts'}
                        className={`w-full p-5 rounded-2xl border transition-transform duration-150 text-left flex items-center gap-4 ${selectedVideoType === 'shorts' ? 'border-indigo-200 shadow-lg scale-100' : 'border-gray-200 hover:shadow-sm'} bg-white`}
                      >
                        <div className={`flex items-center justify-center rounded-md border ${selectedVideoType === 'shorts' ? 'border-indigo-200 shadow-sm' : 'border-gray-100'} bg-white w-12 h-16`}>
                          <Smartphone className="w-6 h-6 text-gray-700" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Shorts</h4>
                            <span className="ml-auto text-xs sm:text-sm font-semibold text-gray-500">9:16</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Vertical short-form videos — optimized for reach and quick engagement.</p>
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => setStep('setup')}
                      className="mt-6 sm:mt-8 px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                    >
                      Back
                    </button>

                    {/* Selection animation overlay */}
                    {animStage !== 'idle' && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl">
                          {animStage === 'running' ? (
                            <img src="/animation/running.gif" alt="Preparing" className="w-48 h-48 object-contain" />
                          ) : (
                            <img src="/animation/loading2.gif" alt="Loading" className="w-40 h-40 object-contain" />
                          )}
                          <div className="text-gray-800 font-semibold">Preparing your challenge…</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 'progress' && selectedVideoType && challengeStartDate && (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_30px_60px_rgba(8,15,52,0.06)] p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Your Challenge Progress</h3>
                        <p className="text-gray-600">Track your upload consistency and growth metrics</p>
                      </div>

                      <div className="flex flex-col sm:items-end items-start gap-2 mt-3 sm:mt-0">
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-600">Day {Math.max(0, Math.floor((new Date().getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24))) + 1} of {selectedDuration * 30}</div>
                        </div>

                        <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Active</div>
                      </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm font-semibold text-gray-500">Total Videos</div>
                        <div className="text-2xl font-bold text-gray-900">{Math.floor((selectedDuration * 30) / selectedFrequency)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm font-semibold text-gray-500">Days Elapsed</div>
                        <div className="text-2xl font-bold text-gray-900">{Math.floor((new Date().getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24))}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm font-semibold text-gray-500">Next Upload</div>
                        <div className="text-lg font-bold text-gray-900">
                          {new Date(challengeStartDate.getTime() + (Math.floor((new Date().getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1) * selectedFrequency * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm font-semibold text-gray-500">Status</div>
                        <div className="text-lg font-bold text-green-600">Active</div>
                      </div>
                    </div>

                    {/* Compact progress stats + heatmap */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                          <div className="text-xs text-gray-500">Next upload</div>
                          <div className="text-base font-semibold text-gray-900 mt-1">{challengeStartDate ? new Date(challengeStartDate.getTime() + (Math.floor((new Date().getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1) * selectedFrequency * 24 * 60 * 60 * 1000).toLocaleDateString() : '--'}</div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                          <div className="text-xs text-gray-500">Days Elapsed</div>
                          <div className="text-base font-semibold text-gray-900 mt-1">{challengeStartDate ? Math.floor((new Date().getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24)) : 0}</div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                          <div className="text-xs text-gray-500">Total videos</div>
                          <div className="text-base font-semibold text-gray-900 mt-1">{totalUploads}</div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                          <div className="text-xs text-gray-500">Status</div>
                          <div className="text-base font-semibold text-green-600 mt-1">{uploadedCount === 0 ? 'Upcoming' : (uploadedCount >= totalUploads ? 'Completed' : 'Active')}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row gap-3 items-start">
                        <div className="sm:flex-1 bg-white border border-gray-100 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-900">Consistency</div>
                            <div className="text-sm font-semibold text-gray-900">{consistencyPercent}%</div>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                            <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${consistencyPercent}%` }}></div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">Streak: <span className="font-semibold text-gray-900">{currentStreak} days</span></div>
                        </div>

                        <div className="sm:w-48 bg-white border border-gray-100 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-2">Upcoming schedule</div>
                          <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Upload schedule heatmap">
                            {scheduleDates.slice(0, 28).map((d, idx) => {
                              const isPast = d < new Date()
                              const isToday = d.toDateString() === new Date().toDateString()
                              return (
                                <div
                                  key={idx}
                                  role="gridcell"
                                  aria-label={`${d.toLocaleDateString()} ${isPast ? 'Uploaded' : isToday ? 'Today' : 'Upcoming'}`}
                                  title={`${d.toLocaleDateString()} ${isPast ? 'Uploaded' : isToday ? 'Today' : 'Upcoming'}`}
                                  className={`w-4 h-4 rounded-sm ${isPast ? 'bg-green-400' : isToday ? 'bg-blue-400' : 'bg-gray-200'}`}
                                />
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Placeholders — improved with icons and mobile-friendly layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                        <Eye className="w-5 h-5 text-gray-500 shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Views</div>
                          <div className="text-2xl font-bold text-gray-900">--</div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                        <Heart className="w-5 h-5 text-gray-500 shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Likes</div>
                          <div className="text-2xl font-bold text-gray-900">--</div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-gray-500 shrink-0" />
                        <div>
                          <div className="text-xs text-gray-500">Comments</div>
                          <div className="text-2xl font-bold text-gray-900">--</div>
                        </div>
                      </div>
                    </div> 
                  </div>

                  {/* Upload Schedule */}
                  <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_30px_60px_rgba(8,15,52,0.06)] p-4 sm:p-8">
                    <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">Upload Schedule</h4>

                    {/* Real-time video cards — previews show selected format (16:9 or 9:16) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {Array.from({ length: (showFullSchedule ? totalUploads : scheduleCount) }, (_, i) => {
                        const uploadDate = new Date(challengeStartDate.getTime() + i * selectedFrequency * 24 * 60 * 60 * 1000)
                        const isPast = uploadDate < new Date()
                        const isToday = uploadDate.toDateString() === new Date().toDateString()

                        const primaryClass = selectedVideoType === 'long' ? 'aspect-video' : 'aspect-9/16'
                        const previewWidthClass = selectedVideoType === 'long' ? 'w-full' : 'w-full max-w-[320px] mx-auto sm:max-w-none'

                        return (
                          <div
                            key={i}
                            className={`group rounded-2xl border border-gray-100 bg-white p-3 sm:p-5 shadow-sm transition-shadow hover:shadow-md ${isToday ? 'ring-2 ring-blue-100' : ''}`}
                          >
                            <div className="flex flex-col h-full">
                              <div className="mb-3 sm:mb-4">
                                <div className={`${previewWidthClass} overflow-hidden rounded-xl border border-gray-100 ${primaryClass}`}>
                                  <div className="w-full h-full bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                      <Youtube className="w-8 h-8" />
                                      <div className="text-xs font-medium">Thumbnail preview</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900">Day {i * selectedFrequency + 1} of {selectedDuration * 30}</div>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>{uploadDate.toLocaleDateString()}</span>
                                    </div>
                                  </div>

                                  <div className="sm:text-right">
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isPast ? 'bg-green-100 text-green-700' : isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                      {isPast ? 'Uploaded' : isToday ? 'Today' : 'Upcoming'}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                  <div className="bg-gray-50 rounded-lg px-2 py-2">
                                    <div className="text-[11px] sm:text-xs text-gray-500">Views</div>
                                    <div className="text-sm sm:text-base font-semibold text-gray-900">--</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg px-2 py-2">
                                    <div className="text-[11px] sm:text-xs text-gray-500">Likes</div>
                                    <div className="text-sm sm:text-base font-semibold text-gray-900">--</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg px-2 py-2">
                                    <div className="text-[11px] sm:text-xs text-gray-500">Comments</div>
                                    <div className="text-sm sm:text-base font-semibold text-gray-900">--</div>
                                  </div>
                                </div>

                                {/* Card footer: Title + small details */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="text-sm font-semibold text-gray-900 truncate">{scheduledMeta[i]?.title || `Video ${i + 1}`}</div>
                                  {scheduledMeta[i]?.notes ? (
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{scheduledMeta[i]?.notes}</div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* View more / show less */}
                    {totalUploads > scheduleCount && (
                      <div className="mt-4 text-right">
                        <button
                          onClick={() => setShowFullSchedule((s) => !s)}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                        >
                          {showFullSchedule ? 'Show less' : `View more (${totalUploads - scheduleCount} more)`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
