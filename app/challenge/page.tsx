"use client"

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Sparkles, Youtube, Monitor, Smartphone, Calendar, Clock } from 'lucide-react'
import SharedSidebar from '@/components/shared-sidebar'
import DashboardHeader from '@/components/dashboard-header'

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

  // New states for the step-by-step flow
  const [step, setStep] = useState<'start' | 'setup' | 'videoType' | 'progress'>('start')
  const [selectedDuration, setSelectedDuration] = useState(6) // months
  const [selectedFrequency, setSelectedFrequency] = useState(2) // days
  const [selectedVideoType, setSelectedVideoType] = useState<'long' | 'shorts' | null>(null)
  const [challengeStartDate, setChallengeStartDate] = useState<Date | null>(null)

  // Custom / flexible setup states
  const [customDurationEnabled, setCustomDurationEnabled] = useState(false)
  const [customMonths, setCustomMonths] = useState<number>(3)
  const [frequencyMode, setFrequencyMode] = useState<'preset' | 'everyNDays' | 'videosPerDay'>('preset')
  const [frequencyDaysCustom, setFrequencyDaysCustom] = useState<number>(2)
  const [videosPerDayCustom, setVideosPerDayCustom] = useState<number>(1)

  // Schedule count: show fewer items on small screens for clarity
  const scheduleCount = useMemo(() => {
    const months = customDurationEnabled ? customMonths : selectedDuration
    const daysBetween = frequencyMode === 'everyNDays' ? frequencyDaysCustom : selectedFrequency || 1
    const totalUploads = Math.max(1, Math.floor((months * 30) / daysBetween))
    if (typeof window === 'undefined') return Math.min(10, totalUploads)
    return window.innerWidth < 640 ? Math.min(5, totalUploads) : Math.min(10, totalUploads)
  }, [customDurationEnabled, customMonths, selectedDuration, frequencyMode, frequencyDaysCustom, selectedFrequency])

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

  const startChallenge = () => {
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
  }

  const handleSaveAndHide = () => {
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
  }

  const handleEditPlan = () => {
    setSetupHidden(false)
    setShowMore(false)
    try {
      localStorage.setItem('creator_challenge_setup_hidden', '0')
    } catch {}
  }

  const handleResetPlan = () => {
    if (!confirm('Clear your challenge plan?')) return
    try {
      localStorage.removeItem('creator_challenge_plan')
      localStorage.removeItem('creator_challenge_setup_hidden')
      localStorage.removeItem('creator_challenge_started_at')
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

            {/* Challenge Flow Cards */}
            <div className="space-y-6">
              {step === 'start' && (
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Youtube className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">Start your challenge today</h3>
                    <p className="text-gray-600 mb-6">Create a focused upload routine and measure progress with a clean, professional challenge flow.</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setStep('setup')}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow-sm transition-all duration-150"
                      >
                        Start Challenge
                      </button>
                      <button
                        onClick={() => setStep('setup')}
                        className="inline-flex items-center justify-center gap-2 border border-gray-200 bg-white px-5 py-2 rounded-full text-gray-700 font-semibold hover:bg-gray-50 transition"
                      >
                        Customize
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
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Challenge duration <span className="ml-2 text-xs text-gray-400 inline-flex items-center"><Calendar className="w-3 h-3 mr-1" />Flexible</span></label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[6, 12, 24].map((months) => (
                            <button
                              key={months}
                              onClick={() => { setSelectedDuration(months); setCustomDurationEnabled(false) }}
                              className={`w-full p-4 rounded-xl border-2 transition-all ${
                                selectedDuration === months && !customDurationEnabled
                                  ? 'border-gray-900 bg-white text-gray-900'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-semibold">{months} Months</div>
                              <div className="text-xs text-gray-500 mt-1">~{Math.round(months * 30)} days</div>
                            </button>
                          ))}

                          <button
                            onClick={() => setCustomDurationEnabled((s) => !s)}
                            className={`col-span-1 sm:col-span-3 w-full p-4 rounded-xl border-2 transition-all ${customDurationEnabled ? 'border-gray-900 bg-white text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                            <div className="font-semibold">Custom Duration</div>
                            <div className="text-xs text-gray-500 mt-1">Choose any length (months)</div>
                          </button>

                          {customDurationEnabled && (
                            <div className="col-span-1 sm:col-span-3 mt-2 flex flex-col sm:flex-row items-center gap-3">
                              <input
                                type="number"
                                min={1}
                                max={120}
                                value={customMonths}
                                onChange={(e) => setCustomMonths(Number(e.target.value))}
                                className="w-full sm:w-48 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                aria-label="Custom months"
                              />
                              <div className="text-sm text-gray-600">months (~{Math.round(customMonths * 30)} days)</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Upload frequency <span className="ml-2 text-xs text-gray-400 inline-flex items-center"><Clock className="w-3 h-3 mr-1" />Flexible</span></label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => { setFrequencyMode('preset'); setSelectedFrequency(1); setVideosPerCadence(1) }}
                            className={`w-full p-4 rounded-xl border-2 transition-all ${
                              frequencyMode === 'preset' && selectedFrequency === 1
                                ? 'border-gray-900 bg-white text-gray-900'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-semibold">Daily</div>
                            <div className="text-xs text-gray-500 mt-1">1 video per day</div>
                          </button>
                          <button
                            onClick={() => { setFrequencyMode('preset'); setSelectedFrequency(2); setVideosPerCadence(1) }}
                            className={`w-full p-4 rounded-xl border-2 transition-all ${
                              frequencyMode === 'preset' && selectedFrequency === 2
                                ? 'border-gray-900 bg-white text-gray-900'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-semibold">Every 2 days</div>
                            <div className="text-xs text-gray-500 mt-1">~15 videos per month</div>
                          </button>

                          <button
                            onClick={() => { setFrequencyMode('everyNDays'); setSelectedFrequency(frequencyDaysCustom); setVideosPerCadence(1) }}
                            className={`w-full p-4 rounded-xl border-2 transition-all ${frequencyMode === 'everyNDays' ? 'border-gray-900 bg-white text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                            <div className="font-semibold">Custom (Every N days)</div>
                            <div className="text-xs text-gray-500 mt-1">Choose a number of days between uploads</div>
                          </button>

                          <button
                            onClick={() => { setFrequencyMode('videosPerDay'); setSelectedFrequency(1) }}
                            className={`w-full p-4 rounded-xl border-2 transition-all ${frequencyMode === 'videosPerDay' ? 'border-gray-900 bg-white text-gray-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                            <div className="font-semibold">Custom (Videos per day)</div>
                            <div className="text-xs text-gray-500 mt-1">Upload multiple videos on a day</div>
                          </button>

                          {frequencyMode === 'everyNDays' && (
                            <div className="col-span-1 sm:col-span-2 mt-2 flex flex-col sm:flex-row items-center gap-3">
                              <input
                                type="number"
                                min={1}
                                max={30}
                                value={frequencyDaysCustom}
                                onChange={(e) => { setFrequencyDaysCustom(Number(e.target.value)); setSelectedFrequency(Number(e.target.value)) }}
                                className="w-full sm:w-48 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                aria-label="Every N days"
                              />
                              <div className="text-sm text-gray-600">days between uploads</div>
                            </div>
                          )}

                          {frequencyMode === 'videosPerDay' && (
                            <div className="col-span-1 sm:col-span-2 mt-2 flex flex-col sm:flex-row items-center gap-3">
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={videosPerDayCustom}
                                onChange={(e) => { setVideosPerDayCustom(Number(e.target.value)); setVideosPerCadence(Number(e.target.value)) }}
                                className="w-full sm:w-48 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                aria-label="Videos per day"
                              />
                              <div className="text-sm text-gray-600">videos per upload day</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setStep('start')}
                          className="px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => {
                            // derive values from custom inputs if enabled
                            const months = customDurationEnabled ? customMonths : selectedDuration
                            let daysBetween = selectedFrequency
                            let videosPerDay = 1

                            if (frequencyMode === 'everyNDays') {
                              daysBetween = frequencyDaysCustom
                              videosPerDay = 1
                            } else if (frequencyMode === 'videosPerDay') {
                              daysBetween = 1
                              videosPerDay = videosPerDayCustom
                            }

                            // persist a preliminary plan
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

                            setChallengeStartDate(new Date())
                            setStep('videoType')
                          }}
                          className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all"
                        >
                          Start Challenge
                        </button>
                      </div>
                    </div>
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
                        onClick={() => {
                          setSelectedVideoType('long')
                          setStep('progress')
                        }}
                        className="w-full p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-sm transition-all group text-left flex items-start gap-4"
                        aria-label="Choose long video"
                      >
                        <div className="w-14 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Monitor className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">Long Video</h4>
                          <p className="text-sm text-gray-600 mb-2">16:9 — Standard YouTube videos (horizontal)</p>
                          <div className="text-sm text-gray-500">Recommended for full-length content and detailed tutorials.</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedVideoType('shorts')
                          setStep('progress')
                        }}
                        className="w-full p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-sm transition-all group text-left flex items-start gap-4"
                        aria-label="Choose shorts"
                      >
                        <div className="w-10 h-14 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Smartphone className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">Shorts</h4>
                          <p className="text-sm text-gray-600 mb-2">9:16 — Vertical short-form videos</p>
                          <div className="text-sm text-gray-500">Great for audience reach and quick engagement.</div>
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => setStep('setup')}
                      className="mt-8 px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {step === 'progress' && selectedVideoType && challengeStartDate && (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_30px_60px_rgba(8,15,52,0.06)] p-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Your Challenge Progress</h3>
                        <p className="text-gray-600">Track your upload consistency and growth metrics</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-500">Format & Progress</div>
                        <div className="text-lg font-bold text-gray-900">{selectedVideoType === 'long' ? '16:9 Long Video' : '9:16 Shorts'}</div>
                        <div className="mt-1 text-sm text-gray-600">Day {Math.max(0, Math.floor((new Date().getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24))) + 1} of {selectedDuration * 30}</div>
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Active</div>
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

                    {/* Video Aspect Ratio Display */}
                    <div className="mb-6">
                      <div className={`mx-auto max-w-sm rounded-xl overflow-hidden border-4 border-gray-200 ${selectedVideoType === 'long' ? 'aspect-video' : 'aspect-[9/16]'}`}>
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-700 mb-1">{selectedVideoType === 'long' ? '16:9' : '9:16'}</div>
                            <div className="text-sm text-gray-600">Video Format</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Placeholders */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="text-sm font-semibold text-gray-700">Views</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <div className="text-xs text-gray-500 mt-1">Total views this challenge</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="text-sm font-semibold text-gray-700">Likes</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <div className="text-xs text-gray-500 mt-1">Total likes this challenge</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="text-sm font-semibold text-gray-700">Comments</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">--</div>
                        <div className="text-xs text-gray-500 mt-1">Total comments this challenge</div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Schedule */}
                  <div className="rounded-3xl bg-white border border-gray-100 shadow-[0_30px_60px_rgba(8,15,52,0.06)] p-8">
                    <h4 className="text-xl font-extrabold text-gray-900 mb-4">Upload Schedule</h4>
                    <div className="space-y-3">
                      {Array.from({ length: scheduleCount }, (_, i) => {
                        const uploadDate = new Date(challengeStartDate.getTime() + i * selectedFrequency * 24 * 60 * 60 * 1000)
                        const isPast = uploadDate < new Date()
                        const isToday = uploadDate.toDateString() === new Date().toDateString()
                        return (
                          <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${isPast ? 'bg-green-500' : isToday ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                              <div>
                                <div className="font-semibold text-gray-900">Day {i * selectedFrequency + 1} of {selectedDuration * 30}</div>
                                <div className="text-sm text-gray-600">{uploadDate.toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isPast ? 'bg-green-100 text-green-700' : 
                              isToday ? 'bg-blue-100 text-blue-700' : 
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {isPast ? 'Uploaded' : isToday ? 'Today' : 'Upcoming'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
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
