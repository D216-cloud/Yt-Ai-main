"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, ChevronRight, Lock, Loader2, Youtube, CheckCircle, User, LogOut, RefreshCw, AlertCircle, X, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import Image from "next/image"
import AnimationLoader from '@/components/animation-loader'

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

interface RecentActivity {
  id: string
  type: 'connect' | 'refresh' | 'disconnect' | 'oauth'
  channelName: string
  channelId: string
  timestamp: number
  details?: string
}

export default function ConnectPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // New states for the updated flow
  const [isStartingAuth, setIsStartingAuth] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisDone, setAnalysisDone] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const analysisInterval = useRef<number | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showRedirectLoader, setShowRedirectLoader] = useState(false)
  const ANIMATIONS = ['/animation/running.gif','/animation/loading2.gif','/animation/loading1.gif','/animation/screening.gif','/animation/process.mp4','/animation/calander.mp4']
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [additionalChannels, setAdditionalChannels] = useState<YouTubeChannel[]>([])

  // Load all data from localStorage on mount
  useEffect(() => {
    loadMainChannel()
    loadRecentActivities()
    loadAdditionalChannels()
    cleanupTempData()
  }, [])

  // Auto-redirect to dashboard if already connected
  useEffect(() => {
    // Redirect only when explicitly requested (isRedirecting becomes true)
    if (status === 'authenticated' && youtubeChannel && isRedirecting) {
      router.push('/dashboard')
    }
  }, [status, youtubeChannel, isRedirecting, router])

  const loadMainChannel = async () => {
    try {
      // Fetch from database instead of localStorage
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
            console.log('Loaded main channel from database:', main.title)
          }
        }
      }

      // Also load the token (keep in localStorage for security)
      const token = localStorage.getItem('youtube_access_token')
      if (token) {
        setYoutubeToken(token)
      }
    } catch (error) {
      console.error('Failed to load main channel:', error)
    }
  }

  const cleanupTempData = () => {
    // Debug: Check what's in localStorage (only tokens and activities)
    console.log('=== localStorage Debug ===')
    console.log('Access token:', localStorage.getItem('youtube_access_token') ? 'EXISTS' : 'MISSING')
    console.log('Temp token:', localStorage.getItem('temp_youtube_access_token') ? 'EXISTS (SHOULD BE CLEANED)' : 'NONE')
    console.log('Recent activities:', localStorage.getItem('youtube_recent_activities') ? 'EXISTS' : 'NONE')
    console.log('========================')

    // Clean up any orphaned temp tokens (older than 10 minutes)
    const tempTokenTime = localStorage.getItem('temp_token_timestamp')
    if (tempTokenTime) {
      const age = Date.now() - parseInt(tempTokenTime)
      if (age > 10 * 60 * 1000) { // 10 minutes
        localStorage.removeItem('temp_youtube_access_token')
        localStorage.removeItem('temp_youtube_refresh_token')
        localStorage.removeItem('temp_token_timestamp')
        console.log('✅ Cleaned up expired temp tokens')
      } else {
        console.log('⚠️ Temp tokens exist but are still valid (less than 10 minutes old)')
      }
    }

    // Force cleanup of temp data if no timestamp exists but temp tokens do
    if (!tempTokenTime && localStorage.getItem('temp_youtube_access_token')) {
      console.log('⚠️ Found temp tokens without timestamp - cleaning up')
      localStorage.removeItem('temp_youtube_access_token')
      localStorage.removeItem('temp_youtube_refresh_token')
    }
  }

  const loadRecentActivities = () => {
    try {
      const stored = localStorage.getItem('youtube_recent_activities')
      if (stored) {
        const activities = JSON.parse(stored)
        // Sort by timestamp descending (newest first) and take last 5
        setRecentActivities(activities.sort((a: RecentActivity, b: RecentActivity) => b.timestamp - a.timestamp).slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to load recent activities:', error)
    }
  }

  const loadAdditionalChannels = async () => {
    try {
      // Fetch from server
      try {
        const res = await fetch('/api/channels')
        if (res.ok) {
          const data = await res.json()
          if (data?.channels && Array.isArray(data.channels)) {
            // Map to expected structure (no localStorage storage)
            const channels = data.channels.map((c: any) => ({
              id: c.channel_id,
              title: c.title,
              description: c.description,
              thumbnail: c.thumbnail,
              subscriberCount: c.subscriber_count?.toString() || '0',
              videoCount: c.video_count?.toString() || '0',
              viewCount: c.view_count?.toString() || '0',
            }))
            setAdditionalChannels(channels)

            // If there is a primary channel returned by server, make sure main is set
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
            }

            return
          }
        }
      } catch (err) {
        console.warn('Could not fetch channels from server', err)
      }

      // No localStorage fallback - only use database
    } catch (error) {
      console.error('Failed to load additional channels:', error)
    }
  }

  const addActivity = (type: RecentActivity['type'], channelName: string, channelId: string, details?: string) => {
    try {
      const stored = localStorage.getItem('youtube_recent_activities')
      const activities: RecentActivity[] = stored ? JSON.parse(stored) : []

      const newActivity: RecentActivity = {
        id: Date.now().toString(),
        type,
        channelName,
        channelId,
        timestamp: Date.now(),
        details
      }

      activities.unshift(newActivity) // Add to beginning

      // Keep only last 20 activities
      const trimmed = activities.slice(0, 20)

      localStorage.setItem('youtube_recent_activities', JSON.stringify(trimmed))
      loadRecentActivities()
    } catch (error) {
      console.error('Failed to save activity:', error)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/signup"
    }

    // Check for error parameter
    const errorParam = searchParams.get("error")
    if (errorParam) {
      let errorMessage = "Failed to connect to YouTube. Please try again."

      switch (errorParam) {
        case "access_denied":
          errorMessage = "Access denied. Please grant permission to connect your YouTube channel."
          break
        case "invalid_client":
          errorMessage = "Invalid client configuration. Please contact support."
          break
        case "missing_client_id":
          errorMessage = "Missing client ID. Please contact support."
          break
        case "missing_credentials":
          errorMessage = "Missing credentials. Please contact support."
          break
        case "token_failed":
          errorMessage = "Failed to obtain access token. Please try again."
          break
        case "auth_failed":
          errorMessage = "Authentication failed. Please try again."
          break
        default:
          errorMessage = errorParam || errorMessage
      }

      setError(errorMessage)
    }

    // Check if YouTube token is in URL
    const token = searchParams.get("youtube_token")
    const refreshToken = searchParams.get("refresh_token")

    if (token) {
      console.log("Received YouTube token from OAuth flow")
      setYoutubeToken(token)

      // Store token in Supabase instead of localStorage (will be stored after channel fetch)
      if (refreshToken) {
        sessionStorage.setItem("temp_refresh_token", refreshToken)
      }
      sessionStorage.setItem("temp_access_token", token)

      // Fetch channel data
      fetchYouTubeChannel(token)
    } else {
      // Try to load from localStorage
      const storedToken = localStorage.getItem("youtube_access_token")
      if (storedToken) {
        console.log("Using stored YouTube token")
        setYoutubeToken(storedToken)
        fetchYouTubeChannel(storedToken)
      }
    }
  }, [status, searchParams])

  // Auto-start analysis the first time a channel is detected in this session
  useEffect(() => {
    try {
      if (youtubeChannel && !analysisDone && !isAnalyzing && !sessionStorage.getItem('analysis_started')) {
        // Give a beat for the UI to settle then start
        setTimeout(() => startAnalysis(3000), 450)
      }
    } catch (e) { /* ignore */ }
  }, [youtubeChannel, analysisDone, isAnalyzing])

  // When analysis completes, briefly show success then start redirect countdown
  useEffect(() => {
    if (analysisDone) {
      // Give the user a moment to see the success state before redirecting
      setTimeout(() => {
        setIsRedirecting(true)
      }, 1400)
    }
  }, [analysisDone])

  const fetchYouTubeChannel = async (accessToken: string) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Fetching YouTube channel with token:", accessToken.substring(0, 10) + "...")

      const response = await fetch(`/api/youtube/channel?access_token=${accessToken}`)
      const data = await response.json()
      console.log("Channel API response:", data)

      if (data.success && data.channel) {
        const newChannel = data.channel

        // Check where the OAuth was initiated from
        const returnPage = localStorage.getItem("oauth_return_page")

        if (returnPage === "content" || returnPage === "sidebar" || returnPage === "dashboard") {
          // Content/sidebar/dashboard page - add to additional channels array (don't replace main)
          const existingMainChannel = localStorage.getItem("youtube_channel")

          if (existingMainChannel) {
            const mainChannel = JSON.parse(existingMainChannel)

            // Get existing additional channels
            const additionalChannelsStr = localStorage.getItem("additional_youtube_channels")
            const additionalChannels = additionalChannelsStr ? JSON.parse(additionalChannelsStr) : []

            // Check if this is the same as main channel
            const isMainChannel = mainChannel.id === newChannel.id
            // Check if already in additional channels
            const alreadyAdded = additionalChannels.find((ch: YouTubeChannel) => ch.id === newChannel.id)

            if (!isMainChannel && !alreadyAdded) {
              // Add new channel to additional channels
              additionalChannels.push(newChannel)

              console.log("Added new channel with its own token:", newChannel.title)
              addActivity('connect', newChannel.title, newChannel.id, 'Additional channel connected via OAuth')
              
              // Get temp tokens from sessionStorage
              const tempToken = sessionStorage.getItem("temp_access_token")
              const tempRefreshToken = sessionStorage.getItem("temp_refresh_token")
              
              // Store token in Supabase for additional channel
              if (tempToken) {
                try {
                  const tokenRes = await fetch('/api/tokens', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      channelId: newChannel.id,
                      accessToken: tempToken,
                      refreshToken: tempRefreshToken || null,
                      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
                    })
                  })
                  const tokenData = await tokenRes.json()
                  console.log('✅ Token stored in Supabase for additional channel:', tokenData)

                    // Trigger on-demand sync so videos appear immediately
                    try {
                      const syncRes = await fetch(`/api/videos?channelId=${encodeURIComponent(newChannel.id)}`, { method: 'POST' })
                      const syncData = await syncRes.json()
                      console.log('🔄 On-demand sync for additional channel:', syncData)
                    } catch (syncErr) {
                      console.warn('⚠️ On-demand sync failed for additional channel:', syncErr)
                    }

                  // Persist channel to DB for this user as an additional channel
                  try {
                    const storeRes = await fetch('/api/channels', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        channelId: newChannel.id,
                        title: newChannel.title,
                        description: newChannel.description,
                        thumbnail: newChannel.thumbnail,
                        subscriberCount: newChannel.subscriberCount,
                        videoCount: newChannel.videoCount,
                        viewCount: newChannel.viewCount,
                        isPrimary: false
                      })
                    });
                    const storeData = await storeRes.json();
                    console.log('✅ DB store additional channel response:', storeData);

                    // Store analytics immediately for additional channel
                    try {
                      const analyticsRes = await fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          channelId: newChannel.id,
                          totalViews: parseInt(newChannel.viewCount) || 0,
                          totalSubscribers: parseInt(newChannel.subscriberCount) || 0,
                          totalWatchTimeHours: 0
                        })
                      });
                      const analyticsData = await analyticsRes.json();
                      console.log('✅ Analytics stored for additional channel:', analyticsData);
                    } catch (analyticsErr) {
                      console.error('⚠️ Failed to store analytics for additional channel:', analyticsErr);
                    }
                  } catch (dbErr) {
                    console.error('❌ Failed to store additional channel in DB:', dbErr);
                  }
                } catch (tokenErr) {
                  console.error('❌ Failed to store token for additional channel:', tokenErr);
                }
                
                // Clean up temp tokens
                sessionStorage.removeItem("temp_access_token");
                sessionStorage.removeItem("temp_refresh_token");
              }

            } else if (isMainChannel) {
              console.log("Channel is already the main channel:", newChannel.title);
              // Clean up temp tokens
              sessionStorage.removeItem("temp_access_token");
              sessionStorage.removeItem("temp_refresh_token");
            } else {
              console.log("Channel already added:", newChannel.title);
              // Clean up temp tokens
              sessionStorage.removeItem("temp_access_token");
              sessionStorage.removeItem("temp_refresh_token");
            }
          } else {
            // No main channel yet, set this as main
            setYoutubeChannel(newChannel);
            
            // Get temp tokens from sessionStorage
            const tempToken = sessionStorage.getItem("temp_access_token");
            const tempRefreshToken = sessionStorage.getItem("temp_refresh_token");

            console.log("Set as main channel:", newChannel.title);

            // Store token in Supabase for primary channel
            if (tempToken) {
              try {
                const tokenRes = await fetch('/api/tokens', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    channelId: newChannel.id,
                    accessToken: tempToken,
                    refreshToken: tempRefreshToken || null,
                    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour expiry
                  })
                });
                const tokenData = await tokenRes.json();
                console.log('✅ Token stored in Supabase:', tokenData);

                // Trigger on-demand sync so videos appear immediately
                try {
                  const syncRes = await fetch(`/api/videos?channelId=${encodeURIComponent(newChannel.id)}`, { method: 'POST' });
                  const syncData = await syncRes.json();
                  console.log('🔄 On-demand sync for main channel:', syncData);
                } catch (syncErr) {
                  console.warn('⚠️ On-demand sync failed for main channel:', syncErr);
                }
              } catch (tokenErr) {
                console.error('❌ Failed to store token:', tokenErr);
              }

              // Clean up temp tokens
              sessionStorage.removeItem("temp_access_token");
              sessionStorage.removeItem("temp_refresh_token");
            }

            // Persist channel to DB as primary
            try {
              const storeRes = await fetch('/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  channelId: newChannel.id,
                  title: newChannel.title,
                  description: newChannel.description,
                  thumbnail: newChannel.thumbnail,
                  subscriberCount: newChannel.subscriberCount,
                  videoCount: newChannel.videoCount,
                  viewCount: newChannel.viewCount,
                  isPrimary: true
                })
              });
              const storeData = await storeRes.json();
              console.log('✅ DB store primary channel response:', storeData);
            } catch (dbErr) {
              console.error('❌ Failed to store primary channel in DB:', dbErr);
            }
          }
        } else {
          // Dashboard or first time - set as main channel
          setYoutubeChannel(newChannel);
          console.log("Successfully fetched main channel:", newChannel.title);
          addActivity('connect', newChannel.title, newChannel.id, 'Main channel connected successfully');

          // Get temp tokens from sessionStorage
          const tempToken = sessionStorage.getItem("temp_access_token");
          const tempRefreshToken = sessionStorage.getItem("temp_refresh_token");

          // Store token in Supabase for main channel
          if (tempToken) {
            try {
              const tokenRes = await fetch('/api/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  channelId: newChannel.id,
                  accessToken: tempToken,
                  refreshToken: tempRefreshToken || null,
                  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
                })
              });
              const tokenData = await tokenRes.json();
              console.log('✅ Token stored in Supabase for main channel:', tokenData);
            } catch (tokenErr) {
              console.error('❌ Failed to store token for main channel:', tokenErr);
            }

            // Clean up temp tokens
            sessionStorage.removeItem("temp_access_token");
            sessionStorage.removeItem("temp_refresh_token");
          }

          // Save to database as primary channel
          try {
            const storeRes = await fetch('/api/channels', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                channelId: newChannel.id,
                title: newChannel.title,
                description: newChannel.description,
                thumbnail: newChannel.thumbnail,
                subscriberCount: newChannel.subscriberCount,
                videoCount: newChannel.videoCount,
                viewCount: newChannel.viewCount,
                isPrimary: true
              })
            })
            const storeData = await storeRes.json()
            console.log('✅ DB store primary channel response:', storeData)

            // Store analytics immediately when channel is connected
            try {
              const analyticsRes = await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  channelId: newChannel.id,
                  totalViews: parseInt(newChannel.viewCount) || 0,
                  totalSubscribers: parseInt(newChannel.subscriberCount) || 0,
                  totalWatchTimeHours: 0
                })
              });
              const analyticsData = await analyticsRes.json();
              console.log('✅ Analytics stored for channel:', analyticsData);
            } catch (analyticsErr) {
              console.error('⚠️ Failed to store analytics:', analyticsErr);
            }
          } catch (dbErr) {
            console.error('❌ Failed to store primary channel in DB:', dbErr);
          }
        }

        // Load additional channels and activities after update
        loadAdditionalChannels();
        loadRecentActivities();

        // Clear oauth return page marker to avoid accidental additional-channel logic later
        try { localStorage.removeItem('oauth_return_page') } catch (e) { /* ignore */ }

        // New flow: save token + channel, then show analyzing screen instead of immediate redirect
        try {
          // Persist token and channel locally so UI survives reloads
          localStorage.setItem('youtube_access_token', accessToken)
          localStorage.setItem('youtube_channel', JSON.stringify(newChannel))
        } catch (e) {
          console.warn('Could not persist token/channel locally', e)
        }

        setIsAnalyzing(true);
        setAnalysisDone(false);

        // Simulate analysis work for 3 seconds, then mark done
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisDone(true);
        }, 3000);
      } else {
        console.error("Failed to fetch channel:", data.error);
        setError(data.error || "Failed to fetch channel data");
        // Clear stored tokens if they're invalid
        localStorage.removeItem("youtube_access_token");
        localStorage.removeItem("youtube_refresh_token");
        localStorage.removeItem("youtube_channel");
      }
    } catch (error) {
      console.error("Error fetching YouTube channel:", error);
      setError("Network error. Please try again.");
      // Clear stored tokens on error
      localStorage.removeItem("youtube_access_token");
      localStorage.removeItem("youtube_refresh_token");
      localStorage.removeItem("youtube_channel");
    } finally {
      setIsLoading(false);
    }
  }

  const handleConnectWithGoogle = () => {
    // Trigger the start animation to replace IQ logo with user's logo
    setIsStartingAuth(true);
    setIsAuthLoading(true);
    setError(null);
    console.log("Initiating Google OAuth flow - showing start animation");

    // Use same-tab redirect for the connect page (shows Google account selection in current tab)
    setTimeout(() => {
      setIsStartingAuth(false)
      setIsAuthLoading(true)
      // Mark return page so server knows this was from connect page (main flow)
      localStorage.setItem('oauth_return_page', 'connect')

      // Redirect current tab to OAuth (no popup) so Google account/email selection opens in same tab
      window.location.href = '/api/youtube/auth'
    }, 550)
  }
  // Start the analysis flow with a visual progress and proper cancellation support
  const startAnalysis = (duration = 3000) => {
    // Prevent multiple intervals
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current)
      analysisInterval.current = null
    }

    setIsAnalyzing(true)
    setAnalysisDone(false)
    setAnalysisProgress(0)

    const start = Date.now()
    analysisInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setAnalysisProgress(pct)

      if (pct >= 100) {
        if (analysisInterval.current) { clearInterval(analysisInterval.current); analysisInterval.current = null }
        setIsAnalyzing(false)
        setAnalysisDone(true)
        setAnalysisProgress(100)

        // Show a short animation loader before redirecting to Dashboard
        setTimeout(() => {
          setShowRedirectLoader(true)
        }, 450)
      }
    }, 150)

    // Mark analysis started for this session+channel so it doesn't auto-start repeatedly
    try { sessionStorage.setItem('analysis_started', '1') } catch (e) {}
  }

  // Skip analysis and move to completed state immediately
  const skipAnalysis = () => {
    if (analysisInterval.current) { clearInterval(analysisInterval.current); analysisInterval.current = null }
    setAnalysisProgress(100)
    setIsAnalyzing(false)
    setAnalysisDone(true)
    // Run redirect shortly after skipping
    setTimeout(() => {
      setIsRedirecting(true)
    }, 600)
  }

  // Cleanup interval on unmount (avoid leaking timers)
  useEffect(() => {
    return () => {
      if (analysisInterval.current) { clearInterval(analysisInterval.current); analysisInterval.current = null }
    }
  }, [])

  const handleRefreshChannel = async () => {
    if (!youtubeToken) {
      setError("No access token found. Please reconnect your YouTube channel.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log("Refreshing YouTube channel data")

      // Fetch channel data with current access token
      await fetchYouTubeChannel(youtubeToken)

      if (youtubeChannel) {
        addActivity('refresh', youtubeChannel.title, youtubeChannel.id, 'Channel data refreshed')
      }
    } catch (error) {
      console.error("Refresh error:", error)
      setError("Failed to refresh channel data. Please try reconnecting.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    console.log("Disconnecting YouTube channel")

    if (youtubeChannel) {
      addActivity('disconnect', youtubeChannel.title, youtubeChannel.id, 'Channel disconnected')
    }

    // Try to delete from DB as well
    try {
      if (youtubeChannel) {
        await fetch(`/api/channels?channelId=${encodeURIComponent(youtubeChannel.id)}`, { method: 'DELETE' })
        console.log('Requested channel deletion on server')
      }
    } catch (err) {
      console.warn('Failed to delete channel on server', err)
    }

    // Clear all YouTube related data
    localStorage.removeItem("youtube_access_token")
    localStorage.removeItem("youtube_refresh_token")
    localStorage.removeItem("youtube_channel")
    setYoutubeToken(null)
    setYoutubeChannel(null)
  }

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  return (
    <div>
      {/* Use shared Header component */}
      <Header />

      <div>
        <main className={`flex-1 pt-20 md:pt-20 pb-20 bg-slate-50 min-h-screen`}>
          <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
            <div className="relative w-full max-w-4xl">
              <div className="rounded-3xl bg-white p-8 shadow-[0_30px_60px_rgba(8,15,52,0.06)]">
                <h2 className="text-center text-xl font-semibold mb-1">Connect your YouTube channel</h2>
                <p className="text-center text-xs text-gray-400 mb-6">Follow the steps below to connect and analyze your channel.</p>

                <style>{`
                  @keyframes scan { 0% { transform: translateX(-120%);} 100% { transform: translateX(120%);} }
                  .scan-inner { animation: scan 1.6s linear infinite; background: linear-gradient(90deg, rgba(249,115,22,0) 0%, rgba(249,115,22,0.25) 50%, rgba(249,115,22,0) 100%); }
                  .pulse-scale { transform-origin: center; animation: pulse-scale 850ms cubic-bezier(.2,.9,.3,1) forwards; }
                  @keyframes pulse-scale { 0% { transform: scale(0.6); opacity: 0 } 60% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
                  .progress-glow { box-shadow: 0 8px 24px rgba(249,115,22,0.12); }
                `}</style>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Card 1 - Account */}
                  <div className="flex-1 p-4 rounded-xl border bg-white flex items-center gap-4 shadow-sm md:flex-col md:items-center md:text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-0 md:mb-3">
                      {youtubeChannel ? (
                        <img src={youtubeChannel.thumbnail} alt={youtubeChannel.title} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <Youtube className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 md:mt-1">
                      <div className="font-semibold text-sm md:text-base truncate">{youtubeChannel ? youtubeChannel.title : 'No account selected'}</div>
                      <div className="text-xs text-gray-400 mt-1">{youtubeChannel ? 'Account connected' : 'Choose a Google account using the Connect button below'}</div>
                    </div>
                  </div>

                  {/* Card 2 - Analyze */}
                  <div className={`flex-1 p-4 rounded-xl border bg-white flex flex-col items-center text-center shadow-sm ${isAnalyzing ? 'ring-2 ring-amber-100' : ''}`}>
                    <div className={`w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3 ${isAnalyzing ? 'animate-pulse' : analysisDone ? 'pulse-scale' : ''}`}>
                      {isAnalyzing && !analysisDone ? (
                        <div className="w-6 h-6 text-gray-600"><Loader2 className="w-6 h-6" /></div>
                      ) : analysisDone ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-amber-500" />
                      )}
                    </div>

                    <div className="font-semibold">{isAnalyzing ? 'Analyzing...' : analysisDone ? 'Analysis complete' : 'Analyze channel'}</div>
                    <div className="text-xs text-gray-400 mt-2">{isAnalyzing ? 'Scanning recent uploads and trends' : analysisDone ? 'Ready to go' : 'We’ll analyze your channel once connected'}</div>

                    {/* Progress bar & skip control */}
                    <div className="mt-4 w-full max-w-xs">
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full bg-amber-400 rounded-full transition-all ${isAnalyzing ? 'progress-glow' : ''}`}
                          style={{ width: `${analysisProgress}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-amber-700">{analysisProgress}%</div>
                      </div>

                      <div className="flex items-center justify-center gap-3 mt-3">
                        {isAnalyzing ? (
                          <button onClick={skipAnalysis} className="text-xs text-red-500 hover:underline">Skip here</button>
                        ) : (
                          <button onClick={() => startAnalysis(2500)} className="text-xs text-gray-500 hover:underline">Run analysis</button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 3 - Success / Redirect */}
                  <div className={`flex-1 p-4 rounded-xl border bg-white flex flex-col items-center text-center shadow-sm ${analysisDone ? 'ring-2 ring-green-100' : ''}`}>
                    <div className={`w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3 ${analysisDone ? 'pulse-scale' : ''}`}>
                      {analysisDone ? <CheckCircle className="w-6 h-6 text-green-600" /> : <Play className="w-6 h-6 text-gray-600" />}
                    </div>
                    <div className="font-semibold">{analysisDone ? 'All set' : 'Complete'}</div>
                    <div className="text-xs text-gray-400 mt-2">{analysisDone ? 'Redirecting to Dashboard...' : 'You will see recommendations after analysis'}</div>
                  </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-400">Tip: You can connect multiple channels later from Settings.</div>
              </div>
            </div>
          </div>

          {/* Desktop floating bar (hidden on mobile) */}
          <div className="hidden md:flex fixed bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-white rounded-full shadow-lg px-4 py-3 flex items-center gap-4">
              {!youtubeChannel ? (
                <button onClick={handleConnectWithGoogle} className="px-5 py-2 rounded-full font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600">
                  Connect YouTube Channel
                </button>
              ) : !analysisDone && !isAnalyzing ? (
                <button onClick={() => { setIsAnalyzing(true); setAnalysisDone(false); setTimeout(() => { setIsAnalyzing(false); setAnalysisDone(true); }, 2500) }} className="px-5 py-2 rounded-full font-semibold text-white bg-linear-to-r from-amber-600 to-yellow-500">Start Analysis</button>
              ) : analysisDone ? (
                <button onClick={() => { setShowRedirectLoader(true) }} className="px-5 py-2 rounded-full font-semibold text-white bg-linear-to-r from-green-600 to-emerald-500">Go to Dashboard</button>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">Analyzing...</div>
              )}
              <button onClick={handleRefreshChannel} className="px-3 py-2 text-sm rounded-full border border-gray-200">Refresh</button>
              {isAnalyzing ? (
                <button onClick={skipAnalysis} className="px-3 py-2 text-sm rounded-full border border-gray-200 text-red-600">Skip</button>
              ) : null}
            </div>
          </div>

          {/* Mobile bottom bar */}
          <div className="md:hidden fixed inset-x-0 bottom-4 px-4">
            <div className="bg-white rounded-xl shadow-lg px-3 py-3 flex items-center gap-3">
              {!youtubeChannel ? (
                <button onClick={handleConnectWithGoogle} className="flex-1 px-4 py-3 rounded-md font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600">Connect</button>
              ) : !analysisDone && !isAnalyzing ? (
                <button onClick={() => { setIsAnalyzing(true); setAnalysisDone(false); setTimeout(() => { setIsAnalyzing(false); setAnalysisDone(true); }, 2500) }} className="flex-1 px-4 py-3 rounded-md font-semibold text-white bg-linear-to-r from-amber-600 to-yellow-500">Analyze</button>
              ) : analysisDone ? (
                <button onClick={() => { setShowRedirectLoader(true) }} className="flex-1 px-4 py-3 rounded-md font-semibold text-white bg-linear-to-r from-green-600 to-emerald-500">Dashboard</button>
              ) : (
                <div className="flex-1 px-4 py-3 text-sm text-gray-500">Analyzing...</div>
              )}

              <button onClick={handleRefreshChannel} className="px-3 py-2 text-sm rounded-md border border-gray-200">Refresh</button>
              {isAnalyzing ? (
                <button onClick={skipAnalysis} className="px-3 py-2 text-sm rounded-md border border-gray-200 text-red-600">Skip</button>
              ) : null}
            </div>
          </div>

          {/* Redirect loader shown after analysis completes */}
          <AnimationLoader open={showRedirectLoader} items={ANIMATIONS} perItemDuration={5000} useAll={true} sizeClass="w-48 h-48" onFinish={() => { setShowRedirectLoader(false); router.push('/dashboard') }} />

        </main>
      </div>
    </div>
  )
}