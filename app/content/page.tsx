"use client"

import Link from "next/link"
import DashboardHeader from "@/components/dashboard-header"
import SharedSidebar from "@/components/shared-sidebar"
import { Button } from '@/components/ui/button'
import { Video, Upload, Eye, Heart, MessageSquare, Filter, Copy, Check, ExternalLink, Calendar, Youtube, RefreshCw, Loader2, AlertCircle, Play, ChevronDown, CheckCircle, XCircle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

interface Video {
    id: string
    title: string
    description: string
    thumbnail: string
    viewCount: number
    likeCount: number
    commentCount: number
    privacyStatus: 'public' | 'unlisted' | 'private' | null
    tags: string[]
    publishedAt: string
    duration: string | null
}

type FilterKey = 'all' | 'public' | 'unlisted' | 'private'
interface FilterOption {
    key: FilterKey
    label: string
    icon: JSX.Element | string
    count: number
}

export default function ContentPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
    const [showVideoModal, setShowVideoModal] = useState(false)
    const [filterStatus, setFilterStatus] = useState<FilterKey>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [youtubeChannel, setYoutubeChannel] = useState<any>(null)
    const [additionalChannels, setAdditionalChannels] = useState<any[]>([])
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
    const [videos, setVideos] = useState<Video[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [nextPageToken, setNextPageToken] = useState<string | null>(null)
    const [totalResults, setTotalResults] = useState<number>(0)
    const [editingVideo, setEditingVideo] = useState<Video | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        privacyStatus: 'public' as 'public' | 'unlisted' | 'private'
    })
    const [syncStatus, setSyncStatus] = useState<string | null>(null)

    // Load YouTube channel data with real-time sync
    useEffect(() => {
        const loadAllChannels = () => {
            try {
                // Load primary channel
                const stored = localStorage.getItem('youtube_channel')
                if (stored) {
                    setYoutubeChannel(JSON.parse(stored))
                }
                
                // Load additional channels
                const additionalStored = localStorage.getItem('additional_youtube_channels')
                if (additionalStored) {
                    setAdditionalChannels(JSON.parse(additionalStored))
                }
                
                // Load active channel
                const activeId = localStorage.getItem('active_youtube_channel_id')
                if (activeId) {
                    setActiveChannelId(activeId)
                } else if (stored) {
                    const channel = JSON.parse(stored)
                    setActiveChannelId(channel.id)
                    localStorage.setItem('active_youtube_channel_id', channel.id)
                }
            } catch (error) {
                console.error('Failed to load channel data:', error)
            }
        }
        
        loadAllChannels()
        
        // Listen for storage changes (real-time sync)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'youtube_channel' || e.key === 'additional_youtube_channels' || e.key === 'active_youtube_channel_id') {
                console.log('Storage change detected:', e.key)
                loadAllChannels()
            }
        }
        
        // Listen for custom channel switch events
        const handleChannelSwitch = () => {
            console.log('Channel switch event detected')
            loadAllChannels()
        }
        
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('channelSwitched', handleChannelSwitch)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('channelSwitched', handleChannelSwitch)
        }
    }, [])

    // Fetch videos when active channel changes
    useEffect(() => {
        if (activeChannelId && (youtubeChannel || additionalChannels.length > 0)) {
            console.log('Active channel changed, fetching videos for:', activeChannelId)
            fetchVideos(true)
        }
    }, [activeChannelId, youtubeChannel, additionalChannels])



    // Helper functions for active channel
    const getCurrentActiveChannel = () => {
        if (activeChannelId === youtubeChannel?.id) {
            return youtubeChannel
        }
        return additionalChannels.find(ch => ch.id === activeChannelId) || youtubeChannel
    }

    const getCurrentActiveToken = () => {
        if (activeChannelId === youtubeChannel?.id) {
            return localStorage.getItem('youtube_access_token')
        }
        return localStorage.getItem(`youtube_token_${activeChannelId}`) || localStorage.getItem('youtube_access_token')
    }

    const fetchVideos = async (resetVideos = false, pageToken?: string) => {
        if (resetVideos) {
            setIsLoading(true)
            setVideos([])
            setSyncStatus('Syncing with YouTube...')
        } else {
            setIsLoadingMore(true)
        }
        setError(null)

        try {
            const accessToken = getCurrentActiveToken()
            const activeChannel = getCurrentActiveChannel()
            console.log('Access token available:', !!accessToken)
            console.log('Active channel:', activeChannel?.title || 'None')
            console.log('Active channel ID:', activeChannelId)
            
            if (!accessToken) {
                setError('Please connect your YouTube channel first. Go to Settings > Connect YouTube to authorize access.')
                setIsLoading(false)
                setIsLoadingMore(false)
                return
            }

            // Fetch ALL videos with increased page cap (up to 5000 videos)
            let url = `/api/youtube/videos?mine=true&fetchAll=true&pageCap=100&maxResults=50&access_token=${accessToken}`
            if (pageToken) {
                url += `&pageToken=${pageToken}`
            }

            console.log('Fetching videos from:', url)
            const response = await fetch(url)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('API Error Response:', response.status, errorText)
                throw new Error(`Failed to fetch videos: ${response.status} - ${errorText}`)
            }

            const data = await response.json()
            console.log('API Response Data:', data)

            if (data.success && data.videos) {
                if (resetVideos) {
                    setVideos(data.videos)
                    setSyncStatus('Sync complete!')
                } else {
                    setVideos(prev => [...prev, ...data.videos])
                }
                setNextPageToken(data.nextPageToken || null)
                setTotalResults(data.totalResults || data.videos.length)

                console.log(`✅ Successfully loaded ${data.videos.length} videos. Total available: ${data.totalResults || data.videos.length}`)
                
                if (data.videos.length === 0) {
                    console.warn('⚠️ API returned success but 0 videos - check channel has public videos')
                    if (resetVideos) setSyncStatus('No videos found')
                }
            } else {
                console.error('❌ Invalid API response:', data)
                if (resetVideos) setSyncStatus('Sync failed')
                throw new Error(data.error || 'Invalid response from server')
            }
        } catch (err) {
            console.error('Error fetching videos:', err)
            setError(err instanceof Error ? err.message : 'Failed to load videos')
            if (resetVideos) setSyncStatus('Sync failed')
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
            // Clear sync status after 3 seconds
            if (resetVideos) {
                setTimeout(() => setSyncStatus(null), 3000)
            }
        }
    }

    const loadMoreVideos = () => {
        if (nextPageToken && !isLoadingMore) {
            fetchVideos(false, nextPageToken)
        }
    }

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
        if (num >= 1000) return (num / 1000).toFixed(1) + "K"
        return num.toString()
    }

    const formatDuration = (duration: string | null): string => {
        if (!duration) return '0:00'
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
        if (!match) return duration
        const h = parseInt(match[1] || '0')
        const m = parseInt(match[2] || '0')
        const s = parseInt(match[3] || '0')
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    // Card base style (match Dashboard)
    const cardBase = 'group relative bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-sm'

    // filterOptions will be computed after counts are available (see below)
    // Filter videos based on status and search
    const filteredVideos = videos.filter(video => {
        const matchesStatus = filterStatus === 'all' || video.privacyStatus === filterStatus
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesStatus && matchesSearch
    })

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'public': return 'bg-green-100 text-green-700 border-green-200'
            case 'unlisted': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'private': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case 'public': return '🌍'
            case 'unlisted': return '🔗'
            case 'private': return '🔒'
            default: return '📄'
        }
    }

    const openEditModal = (video: Video) => {
        setEditingVideo(video)
        // Create a fresh copy of the video data to avoid reference issues
        setEditForm({
            title: video.title || '',
            description: video.description || '',
            privacyStatus: (video.privacyStatus as 'public' | 'unlisted' | 'private') || 'public'
        })
        setShowEditModal(true)
    }

    const closeEditModal = () => {
        setShowEditModal(false)
        setEditingVideo(null)
        // Reset form completely
        setEditForm({ 
            title: '', 
            description: '', 
            privacyStatus: 'public' 
        })
        setIsSaving(false)
    }

    const saveVideoChanges = async () => {
        if (!editingVideo || !editForm.title.trim()) {
            alert('Video title is required')
            return
        }

        setIsSaving(true)
        console.log('Saving video changes for:', editingVideo.id)
        console.log('Form data:', editForm)

        try {
            const accessToken = getCurrentActiveToken()
            if (!accessToken) {
                throw new Error('YouTube access token not found for active channel. Please reconnect.')
            }

            const updateData = {
                id: editingVideo.id,
                snippet: {
                    title: editForm.title.trim(),
                    description: editForm.description.trim(),
                    categoryId: "22" // People & Blogs category
                },
                status: {
                    privacyStatus: editForm.privacyStatus
                }
            }

            console.log('Sending update request:', updateData)

            const response = await fetch(`/api/youtube/update-video`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoData: updateData,
                    accessToken: accessToken
                })
            })

            const result = await response.json()
            console.log('API Response:', result)

            if (!response.ok) {
                throw new Error(result.error || `API Error: ${response.status}`)
            }

            if (result.success) {
                // Update the video in local state with exact form values
                setVideos(prevVideos => {
                    const updatedVideos = prevVideos.map(video => {
                        if (video.id === editingVideo.id) {
                            return { 
                                ...video, 
                                title: editForm.title.trim(),
                                description: editForm.description.trim(),
                                privacyStatus: editForm.privacyStatus
                            }
                        }
                        return video
                    })
                    console.log('Updated videos state')
                    return updatedVideos
                })
                
                closeEditModal()
                
                // Refresh videos from YouTube to ensure sync
                setTimeout(() => {
                    fetchVideos(true)
                }, 1000)
                
                // Show success message
                const message = `Video "${editForm.title}" updated successfully and synced with YouTube!`
                alert(message)
                console.log(message)
            } else {
                throw new Error(result.error || 'Update failed - no success flag')
            }
        } catch (error) {
            console.error('Error updating video:', error)
            let errorMessage = error instanceof Error ? error.message : 'Failed to update video'
            
            // Provide more user-friendly messages for common privacy status errors
            if (errorMessage.includes('privacy') || errorMessage.includes('Privacy')) {
                errorMessage += '\n\nTip: Some videos cannot change privacy status due to:\n• Content ID claims\n• Monetization settings\n• Community guidelines restrictions\n• Age restrictions\n\nTry changing the privacy status directly in YouTube Studio.'
            } else if (errorMessage.includes('Permission denied') || errorMessage.includes('403')) {
                errorMessage += '\n\nPlease make sure:\n• You own this video\n• Your YouTube channel is properly connected\n• You have the necessary permissions'
            } else if (errorMessage.includes('Invalid or expired')) {
                errorMessage += '\n\nPlease go to Settings and reconnect your YouTube channel.'
            }
            
            alert(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    const publicCount = videos.filter(v => v.privacyStatus === 'public').length
    const unlistedCount = videos.filter(v => v.privacyStatus === 'unlisted').length
    const privateCount = videos.filter(v => v.privacyStatus === 'private').length

    const filterOptions: FilterOption[] = [
        { key: 'all', label: 'All', icon: <Filter className="w-3 h-3" />, count: videos.length },
        { key: 'public', label: 'Public', icon: '🌍', count: publicCount },
        { key: 'unlisted', label: 'Unlisted', icon: '🔗', count: unlistedCount },
        { key: 'private', label: 'Private', icon: '🔒', count: privateCount }
    ]

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex">
                <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="content" />

                {/* Main Content */}
                <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    {/* Centered Free plan banner (match Dashboard appearance) */}
                                    <div className="flex justify-center mb-6 px-3">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-100 px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm text-yellow-800 shadow-sm max-w-full overflow-hidden">
                                            <Sparkles className="w-4 h-4 text-yellow-600" />
                                            <span className="font-medium truncate">You're on Free Plan</span>
                                            <span className="text-gray-700 hidden md:inline">Upgrade for unlimited analytics & faster insights.</span>
                                            <a href="/pricing" className="text-blue-600 font-semibold underline ml-2">Upgrade</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Upload and Sync removed as requested */}
                                </div>

                                {/* Sync Status Notification (kept in case sync runs) */}
                                {syncStatus && (
                                    <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
                                        syncStatus.includes('complete') || syncStatus.includes('Sync complete')
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : syncStatus.includes('failed') || syncStatus.includes('Sync failed')
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {syncStatus.includes('Syncing') && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {syncStatus.includes('complete') && <CheckCircle className="w-4 h-4" />}
                                            {syncStatus.includes('failed') && <XCircle className="w-4 h-4" />}
                                            {syncStatus}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Channel Connection Alert */}
                            {!youtubeChannel && (
                                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Channel Connected</h3>
                                            <p className="text-gray-700 mb-4">Connect your YouTube channel to view and manage your videos in real-time.</p>
                                            <Link href="/connect">
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500">
                                                    <Youtube className="w-4 h-4 mr-2" />
                                                    Connect YouTube Channel
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Debug Info for Connected Channel with No Videos */}
                            {youtubeChannel && videos.length === 0 && !isLoading && !error && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">No videos found</h3>
                                        <p className="text-sm text-gray-600">Looks like this channel has no visible videos yet.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => fetchVideos(true)} className="bg-white border border-gray-300 text-gray-700">Retry</Button>
                                        <Link href="/connect"><Button variant="outline">Reconnect</Button></Link>
                                    </div>
                                </div>
                            )}

                            {/* Stats Cards (Dashboard style) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className={`${cardBase}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center rounded-lg w-12 h-12 bg-blue-50">
                                            <Video className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{videos.length}</p>
                                            <p className="text-sm text-gray-500">Loaded</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${cardBase}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center rounded-lg w-12 h-12 bg-green-50">
                                            <span className="text-lg">🌍</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{publicCount}</p>
                                            <p className="text-sm text-gray-500">Public</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${cardBase}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center rounded-lg w-12 h-12 bg-yellow-50">
                                            <span className="text-lg">🔗</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{unlistedCount}</p>
                                            <p className="text-sm text-gray-500">Unlisted</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${cardBase}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center rounded-lg w-12 h-12 bg-red-50">
                                            <span className="text-lg">🔒</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{privateCount}</p>
                                            <p className="text-sm text-gray-500">Private</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-center gap-3 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                                    <Filter className="w-4 h-4" />
                                    Filter:
                                </div>
                                <div className="flex flex-wrap gap-2 flex-1">
                                    {(filterOptions ?? []).map(({ key, label, icon, count }) => (
                                        <button
                                            key={key}
                                            onClick={() => setFilterStatus(key as typeof filterStatus)}
                                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                filterStatus === key
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {typeof icon === 'string' ? (
                                                <span className="text-base">{icon}</span>
                                            ) : (
                                                icon
                                            )}
                                            {label} ({count})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Loading ALL your videos...</h3>
                                <p className="text-gray-600">Fetching up to 5000 videos from your channel</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load videos</h3>
                                <p className="text-gray-600 mb-6">{error}</p>
                                    <Button onClick={() => fetchVideos(true)} className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {/* Videos Grid */}
                        {!isLoading && !error && filteredVideos.length === 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No videos found</h3>
                                <p className="text-gray-600 mb-6">
                                    {videos.length === 0
                                        ? 'Upload your first video to get started'
                                        : 'Try adjusting your filters or search'}
                                </p>
                                <Link href="/upload">
                                    <Button className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Video
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {!isLoading && !error && filteredVideos.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredVideos.map((video) => (
                                        <div key={video.id} className={`${cardBase} flex flex-col gap-4`}>
                                            <div
                                                className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video cursor-pointer"
                                                onClick={() => {
                                                    setSelectedVideo(video)
                                                    setShowVideoModal(true)
                                                }}
                                            >
                                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                                                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-bold">
                                                    {formatDuration(video.duration)}
                                                </div>
                                                <div
                                                    className={`absolute top-3 left-3 px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(video.privacyStatus)}`}
                                                >
                                                    {getStatusIcon(video.privacyStatus)} {(video.privacyStatus || 'UNKNOWN').toUpperCase()}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <h3
                                                        className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                                                        onClick={() => {
                                                            setSelectedVideo(video)
                                                            setShowVideoModal(true)
                                                        }}
                                                    >
                                                        {video.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2">{video.description}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{formatNumber(video.viewCount)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="w-4 h-4" />
                                                        <span>{formatNumber(video.likeCount)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span>{formatNumber(video.commentCount)}</span>
                                                    </div>
                                                </div>

                                                {video.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                        {video.tags.slice(0, 3).map((tag, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {video.tags.length > 3 && (
                                                            <span className="px-2 py-1 bg-gray-100 rounded-full">
                                                                +{video.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedVideo(video)
                                                            setShowVideoModal(true)
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(video)}
                                                        className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition"
                                                        title="Edit Video"
                                                    >
                                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <a
                                                        href={`https://www.youtube.com/watch?v=${video.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-full border border-gray-200 hover:border-gray-300 transition"
                                                        title="Open on YouTube"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-gray-600" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {nextPageToken && (
                                    <div className="mt-8 text-center">
                                        <Button
                                            onClick={loadMoreVideos}
                                            disabled={isLoadingMore}
                                            className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-3"
                                        >
                                            {isLoadingMore ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Loading More...
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-5 h-5 mr-2" />
                                                    Load More Videos
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-sm text-gray-600 mt-3">
                                            Showing {videos.length} of {totalResults} videos
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Edit Video Modal */}
            {showEditModal && editingVideo && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => closeEditModal()}
                >
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Edit Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden">
                                    <img src={editingVideo.thumbnail} alt={editingVideo.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Edit Video</h2>
                                    <p className="text-sm text-gray-600">Modify video details and privacy settings</p>
                                </div>
                            </div>
                            <button
                                onClick={() => closeEditModal()}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-2xl text-gray-600">×</span>
                            </button>
                        </div>

                        {/* Edit Form */}
                        <div className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Video Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter video title..."
                                    maxLength={100}
                                />
                                <p className="text-xs text-gray-500 mt-1">{editForm.title.length}/100 characters</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Enter video description..."
                                    rows={6}
                                    maxLength={5000}
                                />
                                <p className="text-xs text-gray-500 mt-1">{editForm.description.length}/5000 characters</p>
                            </div>

                            {/* Privacy Status */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Privacy Setting
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setEditForm(prev => ({ ...prev, privacyStatus: 'public' }))}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            editForm.privacyStatus === 'public'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-2xl">🌍</span>
                                            <span className="font-semibold text-sm">Public</span>
                                            <span className="text-xs text-gray-500 text-center">Anyone can search and view</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setEditForm(prev => ({ ...prev, privacyStatus: 'unlisted' }))}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            editForm.privacyStatus === 'unlisted'
                                                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-2xl">🔗</span>
                                            <span className="font-semibold text-sm">Unlisted</span>
                                            <span className="text-xs text-gray-500 text-center">Only people with link can view</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setEditForm(prev => ({ ...prev, privacyStatus: 'private' }))}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            editForm.privacyStatus === 'private'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-2xl">🔒</span>
                                            <span className="font-semibold text-sm">Private</span>
                                            <span className="text-xs text-gray-500 text-center">Only you can view</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    onClick={saveVideoChanges}
                                    className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (editingVideo) {
                                            setEditForm({
                                                title: editingVideo.title || '',
                                                description: editingVideo.description || '',
                                                privacyStatus: (editingVideo.privacyStatus as 'public' | 'unlisted' | 'private') || 'public'
                                            })
                                        }
                                    }}
                                    variant="outline"
                                    disabled={isSaving}
                                    className="px-4"
                                >
                                    Reset
                                </Button>
                                <Button
                                    onClick={closeEditModal}
                                    variant="outline"
                                    disabled={isSaving}
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Details Modal */}
            {showVideoModal && selectedVideo && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowVideoModal(false)}
                >
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden">
                                    <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Video Details</h2>
                                    <p className="text-sm text-gray-600">Complete information and copy options</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-2xl text-gray-600">×</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold ${getStatusColor(selectedVideo.privacyStatus)}`}>
                                    <span className="text-lg">{getStatusIcon(selectedVideo.privacyStatus)}</span>
                                    <span>{(selectedVideo.privacyStatus || 'UNKNOWN').toUpperCase()}</span>
                                </div>
                                <a href={`https://www.youtube.com/watch?v=${selectedVideo.id}`} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                                >
                                    <Youtube className="w-4 h-4" />
                                    View on YouTube
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Title */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700">Title</label>
                                    <button
                                        onClick={() => copyToClipboard(selectedVideo.title, 'title')}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                    >
                                        {copiedField === 'title' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-gray-900 font-medium">{selectedVideo.title}</p>
                            </div>

                            {/* Description */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700">Description</label>
                                    <button
                                        onClick={() => copyToClipboard(selectedVideo.description, 'description')}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                    >
                                        {copiedField === 'description' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-gray-900 whitespace-pre-wrap max-h-48 overflow-y-auto">{selectedVideo.description || 'No description'}</p>
                            </div>

                            {/* Tags */}
                            {selectedVideo.tags.length > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-bold text-gray-700">Tags ({selectedVideo.tags.length})</label>
                                        <button
                                            onClick={() => copyToClipboard(selectedVideo.tags.map(t => `#${t}`).join(' '), 'tags')}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                        >
                                            {copiedField === 'tags' ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy All
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVideo.tags.map((tag, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                                    <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-gray-900">{formatNumber(selectedVideo.viewCount)}</p>
                                    <p className="text-xs text-gray-600">Views</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                                    <Heart className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-gray-900">{formatNumber(selectedVideo.likeCount)}</p>
                                    <p className="text-xs text-gray-600">Likes</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
                                    <MessageSquare className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                    <p className="text-2xl font-black text-gray-900">{formatNumber(selectedVideo.commentCount)}</p>
                                    <p className="text-xs text-gray-600">Comments</p>
                                </div>
                            </div>

                            {/* Published Date */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="text-sm font-bold text-gray-700 mb-2 block">Published</label>
                                <p className="text-gray-900">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    {new Date(selectedVideo.publishedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
