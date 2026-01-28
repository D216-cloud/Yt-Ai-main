"use client"

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Sparkles, Youtube, Monitor, Smartphone, Calendar, Clock, Eye, Heart, MessageCircle } from 'lucide-react' 
import SharedSidebar from '@/components/shared-sidebar' 
import AnimationLoader from '@/components/animation-loader'
import ChallengeTrackingCard from '@/components/challenge-tracking-card'
import ChallengeVideosModal from '@/components/challenge-videos-modal'
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
  const [showInitialLoader, setShowInitialLoader] = useState(true)
  const [challengeLoaderDuration, setChallengeLoaderDuration] = useState(4000)
  const ANIMATIONS = ['/animation/running.gif','/animation/loading2.gif','/animation/loading1.gif','/animation/screening.gif','/animation/process.mp4','/animation/calander.mp4']

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
  const [showStartedBanner, setShowStartedBanner] = useState(false)

  // Challenge modal states
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [challengeData, setChallengeData] = useState<any>(null)
  const [challengeVideoSchedule, setChallengeVideoSchedule] = useState<any[]>([])
  const [loadingChallengeData, setLoadingChallengeData] = useState(true)

  // New states for the step-by-step flow
  const [step, setStep] = useState<'start' | 'setup' | 'videoType' | 'progress'>('start')
  const [selectedDuration, setSelectedDuration] = useState(6) // months
  const [selectedFrequency, setSelectedFrequency] = useState(2) // days
  const [selectedVideoType, setSelectedVideoType] = useState<'long' | 'shorts' | null>(null)
  const [challengeStartDate, setChallengeStartDate] = useState<Date | null>(null)
  const [showProgressDetails, setShowProgressDetails] = useState(false)

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
        let id = localStorage.getItem('creator_challenge_id')
        // If we don't have an id yet, try creating the challenge first
        if (!id) {
          const startRes = await startChallenge()
          if (!startRes || startRes?.success === false) {
            toast({ title: 'Failed to save selection', description: startRes?.error || 'Unable to start challenge' })
            return
          }
          id = startRes?.id || localStorage.getItem('creator_challenge_id')
        }

        if (id) {
          const res = await fetch(`/api/user-challenge?id=${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config: { videoType: type }, videoType: type })
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

  // Calculate days until next upload
  const daysUntilNext = useMemo(() => {
    const now = new Date()
    for (const date of scheduleDates) {
      if (date > now) {
        const diffTime = date.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return Math.max(0, diffDays)
      }
    }
    return 0
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

  // Fetch active challenge data
  useEffect(() => {
    const fetchChallengeData = async () => {
      setLoadingChallengeData(true)
      try {
        const res = await fetch('/api/user-challenge')
        if (res.ok) {
          const data = await res.json()
          if (data?.challenge) {
            setChallengeData(data.challenge)
            const progress = data.challenge.progress || []
            setChallengeVideoSchedule(progress)
            console.log('Loaded challenge data on challenge page:', data.challenge)
            
            // If challenge already exists, skip to progress view
            if (data.challenge.started_at) {
              setStep('progress')
              // Set the start date and config from the existing challenge
              const startDate = new Date(data.challenge.started_at)
              setChallengeStartDate(startDate)
              
              // Extract config values
              if (data.challenge.config) {
                setSelectedDuration(data.challenge.config.durationMonths || 6)
                setSelectedFrequency(data.challenge.config.cadenceEveryDays || 2)
                setSelectedVideoType(data.challenge.config.videoType || null)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching challenge on challenge page:', error)
      } finally {
        setLoadingChallengeData(false)
      }
    }

    fetchChallengeData()
  }, [])

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
    // Use the ACTUAL user-selected values, not computed defaults
    const userSelectedDuration = customDurationEnabled ? customMonths : selectedDuration
    const userSelectedFrequency = selectedFrequency
    const userSelectedVideosPerCadence = videosPerCadence
    
    const nextPlan: CreatorChallengePlan = {
      durationMonths: userSelectedDuration,
      cadenceEveryDays: userSelectedFrequency,
      videosPerCadence: userSelectedVideosPerCadence,
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
        body: JSON.stringify({ 
          config: nextPlan, 
          progress: Object.values(scheduledMeta),
          // Send explicit column values from user input
          durationMonths: userSelectedDuration,
          cadenceEveryDays: userSelectedFrequency,
          videosPerCadence: userSelectedVideosPerCadence,
          videoType: selectedVideoType
        })
      })

      if (!res.ok) {
        if (res.status === 401) {
          toast({ title: 'Sign in required', description: 'Please sign in to save your challenge' })
          return { success: false, error: 'Unauthorized' }
        }
        const err = await res.json().catch(() => ({ error: 'Unknown server error' }))
        console.error('Failed to start challenge:', err)
        toast({ title: 'Failed to start challenge', description: err?.error || 'Server error' })
        return { success: false, error: err?.error || 'Server error' }
      }

      const json = await res.json()
      console.log('Challenge started response:', json)
      
      if (json?.id) {
        try { localStorage.setItem('creator_challenge_id', json.id) } catch {}
      } else {
        console.warn('No challenge ID returned from server')
      }
      
      // Return the server response so caller can show success after animations
      return { success: true, id: json?.id, ...json }
    } catch (e) {
      console.error('Failed to persist challenge to server', e)
      // Return an error shape instead of showing toast here; caller will handle message timing
      return { success: false, error: String(e?.message || e) }
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
    setStep('setup')
    toast({ title: 'Edit Mode', description: 'Adjust your challenge settings below' })
    try {
      localStorage.setItem('creator_challenge_setup_hidden', '0')
    } catch {}
  }

  const handleResetPlan = async () => {
    if (!confirm('Are you sure? This will delete your challenge and all progress data.')) return

    try {
      setShowAllVideos(false)
      // Attempt to delete on server
      try {
        const id = localStorage.getItem('creator_challenge_id')
        if (id) {
          const res = await fetch(`/api/user-challenge?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
          if (!res.ok) {
            throw new Error('Failed to delete from server')
          }
        }
      } catch (e) {
        console.error('Failed to delete challenge on server', e)
        toast({ title: 'Warning', description: 'Challenge deleted locally, but server sync failed' })
      }

      // Clear local storage
      try {
        localStorage.removeItem('creator_challenge_plan')
        localStorage.removeItem('creator_challenge_setup_hidden')
        localStorage.removeItem('creator_challenge_started_at')
        localStorage.removeItem('creator_challenge_id')
        localStorage.removeItem('challenge_scheduled_meta')
      } catch {}
      
      // Reset state
      setPlan(null)
      setSetupHidden(false)
      setShowMore(false)
      setChallengeStartedAt(null)
      setShowAllVideos(false)
      setStep('start')
      setSelectedDuration(6)
      setSelectedFrequency(2)
      setVideosPerCadence(1)
      setSelectedVideoType(null)
      setScheduledMeta({})
      
      toast({ title: 'Challenge Deleted', description: 'Your challenge has been removed' })
    } catch (e) {
      console.error('Error deleting challenge:', e)
      toast({ title: 'Error', description: 'Failed to delete challenge' })
    }
  }

  const handleOpenChallenge = () => {
    setShowAllVideos(true)
    setStep('progress')
    toast({ title: 'Challenge Opened', description: 'View your progress below' })
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
          // If a video type was persisted previously, reflect it in the UI
          if (cfg.videoType) {
            setSelectedVideoType(cfg.videoType === 'shorts' ? 'shorts' : 'long')
          }
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

  // Initial loader overlay for Challenge page (4s first show, 1.5s on repeats)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('challenge_loader_count') || '0'
      const count = parseInt(raw, 10) || 0
      const durationMs = count === 0 ? 4000 : 1500
      localStorage.setItem('challenge_loader_count', String(count + 1))
      setChallengeLoaderDuration(durationMs + 200)

      const t = window.setTimeout(() => setShowInitialLoader(false), durationMs + 200)
      return () => window.clearTimeout(t)
    } catch (err) {
      console.warn('challenge loader error', err)
      const t = window.setTimeout(() => setShowInitialLoader(false), 1500)
      return () => window.clearTimeout(t)
    }
  }, [])

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
      <AnimationLoader open={showInitialLoader} items={[ANIMATIONS[0]]} perItemDuration={challengeLoaderDuration} maxDuration={challengeLoaderDuration} useAll={false} sizeClass="w-48 h-48" onFinish={() => setShowInitialLoader(false)} />

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
            {showStartedBanner && (
              <div className="mb-4">
                <div className="rounded-lg p-3 bg-green-50 border border-green-100 text-green-800 text-sm font-semibold max-w-3xl mx-auto text-center">Challenge started successfully — saved to your account</div>
              </div>
            )}

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

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Videos Per Upload Day</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[1,2,3].map((v) => (
                            <button
                              key={v}
                              onClick={() => setVideosPerCadence(v)}
                              className={`w-full px-3 py-3 rounded-xl border text-sm font-semibold transition ${videosPerCadence === v ? 'bg-blue-600 border-blue-700 text-white shadow' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                              {v} video{v > 1 ? 's' : ''}
                            </button>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={videosPerCadence}
                            onChange={(e) => setVideosPerCadence(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                            className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                            aria-label="Videos per day" />
                          <div className="text-sm text-gray-600">video(s)</div>
                          <div className="ml-3 text-xs text-gray-500">Presets: 1 / 2 / 3</div>
                        </div>

                        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="text-sm text-blue-800 font-medium">
                            Total videos: <span className="font-bold">{Math.max(1, Math.floor((selectedDuration * 30) / selectedFrequency) * videosPerCadence)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={() => setStep('start')}
                          className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                        >
                          Back
                        </button>
                        <button
                          onClick={async () => {
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

                            // Start server save and play the start animation for 3s
                            setIsStartingAnimation(true)

                            const startPromise = startChallenge()

                            setTimeout(async () => {
                              setIsStartingAnimation(false)
                              setChallengeStartDate(new Date())
                              setStep('videoType')

                              const startResult = await startPromise.catch((e) => ({ success: false, error: String(e) }))

                              if (startResult && startResult.success !== false) {
                                // saved successfully on server
                                toast({ title: 'Challenge started', description: 'Saved to your account' })
                                setShowStartedBanner(true)
                                setTimeout(() => setShowStartedBanner(false), 4000)
                              } else {
                                toast({ title: 'Failed to start challenge', description: startResult?.error || 'Server error' })
                              }
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

                        {selectedVideoType === 'long' && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">✓</div>
                        )}
                      </button>

                      <button
                        onClick={() => handleSelectVideoType('shorts')}
                        aria-pressed={selectedVideoType === 'shorts'}
                        className={`w-full p-5 rounded-2xl border transition-transform duration-150 text-left flex items-center gap-4 ${selectedVideoType === 'shorts' ? 'border-indigo-200 shadow-lg scale-100' : 'border-gray-200 hover:shadow-sm'} bg-white relative`}
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

                        {selectedVideoType === 'shorts' && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">✓</div>
                        )}
                      </button>
                    </div>

                    {/* Show selected type summary */}
                    {selectedVideoType && (
                      <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                        <div className="text-sm text-indigo-700 font-semibold">
                          Selected: <span className="text-indigo-900 font-bold">{selectedVideoType === 'long' ? 'Long Video (16:9)' : 'Shorts (9:16)'}</span>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
                      <button
                        onClick={() => setStep('setup')}
                        className="px-8 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>

                      <button
                        onClick={async () => {
                          if (!selectedVideoType) {
                            toast({ title: 'Please select a video type', description: 'Choose Long Video or Shorts to continue' })
                            return
                          }
                          
                          setIsStartingAnimation(true)
                          
                          const startPromise = startChallenge()
                          
                          setTimeout(async () => {
                            setIsStartingAnimation(false)
                            setChallengeStartDate(new Date())
                            setStep('progress')
                            
                            const startResult = await startPromise.catch((e) => ({ success: false, error: String(e) }))
                            
                            if (startResult && startResult.success !== false) {
                              toast({ title: 'Challenge started', description: 'Saved to your account' })
                              setShowStartedBanner(true)
                              setTimeout(() => setShowStartedBanner(false), 4000)
                            } else {
                              toast({ title: 'Failed to start challenge', description: startResult?.error || 'Server error' })
                            }
                          }, 3000)
                        }}
                        disabled={!selectedVideoType || isStartingAnimation}
                        className={`px-8 py-3 rounded-full font-semibold transition-all ${selectedVideoType && !isStartingAnimation ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                      >
                        {isStartingAnimation ? 'Starting...' : 'Start Challenge'}
                      </button>
                    </div>

                    {/* Selection animation overlay */}
                    {animStage !== 'idle' && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl">
                          {animStage === 'running' ? (
                            <img src="/animation/running.gif" alt="Preparing" className="w-48 h-48 object-contain" />
                          ) : (
                            <img src="/animation/loading2.gif" alt="Loading" className="w-48 h-48 object-contain" />
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
                  {/* Loading Skeleton */}
                  {loadingChallengeData && (
                    <div className="rounded-2xl bg-slate-800 border border-slate-700 shadow-lg p-4 sm:p-6 mb-6 animate-pulse">
                      {/* Header skeleton */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="h-8 bg-slate-700 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-slate-700 rounded w-64"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
                          <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
                        </div>
                      </div>

                      {/* Latest Upload skeleton */}
                      <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-4 mb-4">
                        <div className="h-3 bg-slate-700 rounded w-32 mb-3"></div>
                        <div className="h-5 bg-slate-700 rounded w-48 mb-3"></div>
                        <div className="flex gap-4">
                          <div className="h-4 bg-slate-700 rounded w-32"></div>
                          <div className="h-4 bg-slate-700 rounded w-32"></div>
                        </div>
                      </div>

                      {/* Next Upload skeleton */}
                      <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-4 mb-4">
                        <div className="h-3 bg-slate-700 rounded w-24 mb-2"></div>
                        <div className="h-6 bg-slate-700 rounded w-40"></div>
                      </div>

                      {/* Progress skeleton */}
                      <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-4 mb-4">
                        <div className="flex justify-between mb-3">
                          <div className="h-4 bg-slate-700 rounded w-32"></div>
                          <div className="h-4 bg-slate-700 rounded w-20"></div>
                        </div>
                        <div className="w-full h-2 bg-slate-600 rounded-full mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded w-48"></div>
                      </div>

                      {/* Stats skeleton */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-700/70 border border-slate-600 p-4 text-center space-y-2">
                          <div className="h-8 bg-slate-700 rounded w-16 mx-auto"></div>
                          <div className="h-3 bg-slate-700 rounded w-20 mx-auto"></div>
                        </div>
                        <div className="rounded-lg bg-slate-700/70 border border-slate-600 p-4 text-center space-y-2">
                          <div className="h-8 bg-slate-700 rounded w-16 mx-auto"></div>
                          <div className="h-3 bg-slate-700 rounded w-20 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Challenge Tracking Card - Show when loaded */}
                  {!loadingChallengeData && (
                    <div 
                      onClick={() => {
                        if (challengeData && challengeVideoSchedule.length > 0) {
                          setShowChallengeModal(true)
                        }
                      }}
                      className={`${challengeData ? 'cursor-pointer' : ''}`}
                    >
                      <ChallengeTrackingCard
                        latestVideoTitle="Your latest upload"
                        latestVideoDate={new Date().toLocaleDateString()}
                        latestVideoViews={1765}
                        nextUploadDate={new Date(challengeStartDate.getTime() + (Math.floor((new Date().getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1) * selectedFrequency * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        daysUntilNext={Math.max(0, daysUntilNext)}
                        dayStreak={currentStreak}
                        uploadProgress={consistencyPercent}
                        totalVideosRequired={totalUploads}
                        videosUploaded={uploadedCount}
                        onEdit={handleEditPlan}
                        onDelete={handleResetPlan}
                      />
                    </div>
                  )}

                  {/* Challenge Configuration Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
                    <div className="text-center py-2 sm:py-4">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Duration</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{selectedDuration} <span className="text-xs sm:text-sm font-normal text-slate-400">months</span></div>
                    </div>
                    <div className="text-center py-2 sm:py-4">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Frequency</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white mt-2">1 <span className="text-xs sm:text-sm font-normal text-slate-400">/ {selectedFrequency}d</span></div>
                    </div>
                    <div className="text-center py-2 sm:py-4">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Per Upload</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{1} <span className="text-xs sm:text-sm font-normal text-slate-400">video</span></div>
                    </div>
                    <div className="text-center py-2 sm:py-4">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Video Type</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{selectedVideoType === 'long' ? '16:9' : '9:16'}</div>
                    </div>
                  </div>

                  {/* Upload Schedule */}
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6 shadow-xl">
                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-amber-400" />
                      Upload Schedule
                    </h4>

                    {/* Real-time video cards — previews show selected format (16:9 or 9:16) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {Array.from({ length: (showFullSchedule ? totalUploads : scheduleCount) }, (_, i) => {
                        const uploadDate = new Date(challengeStartDate.getTime() + i * selectedFrequency * 24 * 60 * 60 * 1000)
                        const isPast = uploadDate < new Date()
                        const isToday = uploadDate.toDateString() === new Date().toDateString()

                        const primaryClass = selectedVideoType === 'long' ? 'aspect-video' : 'aspect-9/16'
                        const previewWidthClass = selectedVideoType === 'long' ? 'w-full' : 'w-full max-w-[280px] mx-auto'

                        return (
                          <div
                            key={i}
                            className={`group rounded-xl border border-slate-600/50 bg-slate-700/40 backdrop-blur-sm p-4 sm:p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-slate-500 ${isToday ? 'ring-2 ring-amber-400/50 border-amber-400/30' : ''} ${isPast ? 'opacity-75' : ''}`}
                          >
                            <div className="flex flex-col h-full gap-4">
                              {/* Video Thumbnail Preview */}
                              <div>
                                <div className={`${previewWidthClass} overflow-hidden rounded-lg border border-slate-600/50 ${primaryClass}`}>
                                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                      <Youtube className="w-10 h-10" />
                                      <div className="text-xs font-medium">Thumbnail</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Card Content */}
                              <div className="flex-1 space-y-3">
                                {/* Day and Date */}
                                <div>
                                  <div className="text-sm font-semibold text-white">Day {i * selectedFrequency + 1} of {selectedDuration * 30}</div>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{uploadDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-2">
                                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1 ${isPast ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : isToday ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-600/40 text-slate-300 border border-slate-600/50'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isPast ? 'bg-emerald-400' : isToday ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
                                    {isPast ? 'Uploaded' : isToday ? 'Today' : 'Upcoming'}
                                  </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-slate-600/30 rounded-lg px-2.5 py-2 text-center border border-slate-600/50 hover:border-slate-500/70 transition-colors">
                                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Views</div>
                                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">--</div>
                                  </div>
                                  <div className="bg-slate-600/30 rounded-lg px-2.5 py-2 text-center border border-slate-600/50 hover:border-slate-500/70 transition-colors">
                                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Likes</div>
                                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">--</div>
                                  </div>
                                  <div className="bg-slate-600/30 rounded-lg px-2.5 py-2 text-center border border-slate-600/50 hover:border-slate-500/70 transition-colors">
                                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Comments</div>
                                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">--</div>
                                  </div>
                                </div>

                                {/* Video Title */}
                                <div className="pt-2 border-t border-slate-600/50">
                                  <div className="text-xs sm:text-sm font-semibold text-white truncate">{scheduledMeta[i]?.title || `Video ${i + 1}`}</div>
                                  {scheduledMeta[i]?.notes ? (
                                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">{scheduledMeta[i]?.notes}</div>
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
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setShowFullSchedule((s) => !s)}
                          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-slate-600/50 bg-slate-700/40 hover:bg-slate-700/60 text-white font-medium transition-all duration-300 hover:shadow-lg hover:border-slate-500"
                        >
                          {showFullSchedule ? '← Show less' : `View more (${totalUploads - scheduleCount} more) →`}
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

      {/* Challenge Videos Modal */}
      <ChallengeVideosModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        videoSchedule={challengeVideoSchedule}
        totalVideos={challengeData?.config?.videosPerCadence ? 
          Math.ceil((challengeData.config.durationMonths || 6) * 30 / (challengeData.config.cadenceEveryDays || 2)) * (challengeData.config.videosPerCadence || 1)
          : 0}
        uploadedCount={challengeVideoSchedule.filter((v: any) => v.uploaded).length}
        nextUploadDate={challengeVideoSchedule.find((v: any) => !v.uploaded)?.date}
        challengeStartDate={challengeData?.started_at}
        challengeEndDate={challengeData?.started_at ? 
          new Date(new Date(challengeData.started_at).getTime() + (challengeData.config?.durationMonths || 6) * 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined}
      />
    </div>
  )
}
