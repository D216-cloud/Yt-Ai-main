"use client"

import Link from "next/link"
import Image from "next/image"
import SidebarButton from '@/components/ui/sidebar-button'
import { Button } from '@/components/ui/button'
import { Home, User, GitCompare, Video, Upload, Play, LogOut, Menu, X, Search, Settings, ChevronDown, Youtube, Eye, Heart, MessageSquare, Share2, MoreHorizontal, Filter, Copy, Check, ExternalLink, Edit, Trash2, Calendar, Clock, TrendingUp, BarChart3, Layers, Bell, Sparkles, Users, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

interface Video {
    id: string
    title: string
    description: string
    thumbnail: string
    views: number
    likes: number
    comments: number
    status: 'public' | 'unlisted' | 'private' | 'draft'
    category: string
    tags: string[]
    publishedAt: string
    duration: string
    videoUrl?: string
}

export default function ContentPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activePage, setActivePage] = useState('content')
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
    const [showVideoModal, setShowVideoModal] = useState(false)
    const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'unlisted' | 'private' | 'draft'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [youtubeChannel, setYoutubeChannel] = useState<any>(null)

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

    const navLinks = [
        { icon: Home, label: 'Dashboard', href: '/dashboard', id: 'dashboard', badge: null },
        { icon: FileText, label: 'Vid-Info', href: '/vid-info', id: 'vid-info', badge: null },
        { icon: Video, label: 'Content', href: '/content', id: 'content', badge: '12' },
        { icon: Upload, label: 'Bulk Upload', href: '/bulk-upload', id: 'bulk-upload', badge: null },
        { icon: GitCompare, label: 'Compare', href: '/compare', id: 'compare', badge: null },
        { icon: Layers, label: 'AI Tools', href: '/ai-tools', id: 'ai-tools', badge: 'New' },
    ]

    const handleSignOut = async () => {
        setIsLoading(true)
        await signOut({ redirect: false })
        router.push('/')
    }

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
        if (num >= 1000) return (num / 1000).toFixed(1) + "K"
        return num.toString()
    }

    // Mock video data
    const allVideos: Video[] = [
        {
            id: '1',
            title: 'How to Grow Your YouTube Channel Fast in 2024',
            description: 'Learn the best strategies to grow your YouTube channel quickly. This comprehensive guide covers everything from SEO optimization to content strategy. #YouTubeGrowth #ContentCreator',
            thumbnail: '🎥',
            views: 12500,
            likes: 1200,
            comments: 234,
            status: 'public',
            category: 'Tutorial',
            tags: ['youtube', 'growth', 'tutorial', 'seo', 'content'],
            publishedAt: '2024-11-20',
            duration: '12:34',
            videoUrl: 'https://youtube.com/watch?v=example1'
        },
        {
            id: '2',
            title: 'AI Tools for Content Creators - Complete Guide',
            description: 'Discover the best AI tools that will revolutionize your content creation workflow. From video editing to thumbnail generation. #AITools #ContentCreation',
            thumbnail: '🤖',
            views: 8300,
            likes: 890,
            comments: 156,
            status: 'public',
            category: 'Review',
            tags: ['ai', 'tools', 'content', 'automation'],
            publishedAt: '2024-11-18',
            duration: '15:22',
            videoUrl: 'https://youtube.com/watch?v=example2'
        },
        {
            id: '3',
            title: 'YouTube Algorithm Explained - Get More Views',
            description: 'Understanding the YouTube algorithm is crucial for success. This video breaks down exactly how it works and how to optimize for it. #Algorithm #YouTubeTips',
            thumbnail: '📊',
            views: 15700,
            likes: 1500,
            comments: 312,
            status: 'public',
            category: 'Education',
            tags: ['algorithm', 'youtube', 'views', 'optimization'],
            publishedAt: '2024-11-15',
            duration: '18:45',
            videoUrl: 'https://youtube.com/watch?v=example3'
        },
        {
            id: '4',
            title: 'Best Video Editing Software 2024 Review',
            description: 'Comprehensive review of the top video editing software for creators in 2024. Compare features, pricing, and performance. #VideoEditing #SoftwareReview',
            thumbnail: '✂️',
            views: 6200,
            likes: 645,
            comments: 89,
            status: 'unlisted',
            category: 'Review',
            tags: ['editing', 'software', 'review', 'tools'],
            publishedAt: '2024-11-12',
            duration: '22:10',
            videoUrl: 'https://youtube.com/watch?v=example4'
        },
        {
            id: '5',
            title: 'Monetization Strategies for Small Channels',
            description: 'How to start making money on YouTube even with a small channel. Multiple revenue streams explained. #Monetization #YouTubeMoney',
            thumbnail: '💰',
            views: 4500,
            likes: 520,
            comments: 67,
            status: 'private',
            category: 'Business',
            tags: ['monetization', 'money', 'revenue', 'business'],
            publishedAt: '2024-11-10',
            duration: '14:30',
            videoUrl: 'https://youtube.com/watch?v=example5'
        },
        {
            id: '6',
            title: 'Creating Viral Thumbnails - Design Tips',
            description: 'Master the art of creating click-worthy thumbnails that get views. Design principles and tools covered. #Thumbnails #Design',
            thumbnail: '🎨',
            views: 0,
            likes: 0,
            comments: 0,
            status: 'draft',
            category: 'Tutorial',
            tags: ['thumbnails', 'design', 'clickthrough', 'graphics'],
            publishedAt: '2024-11-25',
            duration: '10:15',
        },
    ]

    // Filter videos based on status and search
    const filteredVideos = allVideos.filter(video => {
        const matchesStatus = filterStatus === 'all' || video.status === filterStatus
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesStatus && matchesSearch
    })

    // Group videos by category
    const videosByCategory = filteredVideos.reduce((acc, video) => {
        if (!acc[video.category]) {
            acc[video.category] = []
        }
        acc[video.category].push(video)
        return acc
    }, {} as Record<string, Video[]>)

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'public': return 'bg-green-100 text-green-700 border-green-200'
            case 'unlisted': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'private': return 'bg-red-100 text-red-700 border-red-200'
            case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'public': return '🌍'
            case 'unlisted': return '🔗'
            case 'private': return '🔒'
            case 'draft': return '📝'
            default: return '📄'
        }
    }

    const notifications = [
        { id: 1, type: 'success', message: 'Video published successfully', time: '5m ago' },
        { id: 2, type: 'info', message: 'New subscriber milestone: 45K', time: '1h ago' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            {/* Enhanced Navbar */}
            <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-sm">
                <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {sidebarOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
                        </button>

                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Play className="w-5 h-5 text-white fill-white" />
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    TubeBoost AI
                                </span>
                                <p className="text-xs text-gray-500 font-medium">Creator Studio</p>
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center flex-1 max-w-xl ml-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search your videos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                                        }`}></div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-900">{notif.message}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/settings">
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <Settings className="w-5 h-5 text-gray-600" />
                            </button>
                        </Link>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {session?.user?.name || "Creator"}
                                    </p>
                                    <p className="text-xs text-gray-500">Premium Plan</p>
                                </div>
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <span className="text-white text-sm font-bold">
                                            {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                        <p className="font-bold text-gray-900">{session?.user?.name || "Creator"}</p>
                                        <p className="text-sm text-gray-600">{session?.user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <Link href="/profile">
                                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                                                <User className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-900">Profile Settings</span>
                                            </button>
                                        </Link>
                                        <Link href="/connect">
                                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                                                <Youtube className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-900">Manage Channels</span>
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="p-2 border-t border-gray-200">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-red-600" />
                                            <span className="text-sm font-medium text-red-600">Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 md:hidden z-30 top-16"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 transform transition-all duration-300 z-40 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } md:translate-x-0`}
                >
                    {youtubeChannel && (
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={youtubeChannel.thumbnail}
                                        alt={youtubeChannel.title}
                                        className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{youtubeChannel.title}</p>
                                    <p className="text-xs text-gray-600">{formatNumber(parseInt(youtubeChannel.subscriberCount))} subscribers</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav className="p-4 space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = activePage === link.id
                            return (
                                <Link key={link.id} href={link.href}>
                                    <button
                                        onClick={() => {
                                            setActivePage(link.id)
                                            setSidebarOpen(false)
                                        }}
                                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                            <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                                {link.label}
                                            </span>
                                        </div>
                                        {link.badge && (
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive
                                                ? 'bg-white/20 text-white'
                                                : link.badge === 'New'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {link.badge}
                                            </span>
                                        )}
                                    </button>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Quick Stats removed per request */}

                    {/* Upgrade Card */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5" />
                                <span className="font-bold text-sm">Upgrade to Pro</span>
                            </div>
                            <p className="text-xs text-white/80 mb-3">Unlock advanced AI features and unlimited uploads</p>
                            <button className="w-full bg-white text-purple-600 font-bold text-sm py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                                        Content Library 📹
                                    </h1>
                                    <p className="text-gray-600 text-lg">Manage all your videos in one place</p>
                                </div>
                                <Link href="/upload">
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload New Video
                                    </Button>
                                </Link>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <Video className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900">{allVideos.length}</p>
                                            <p className="text-xs text-gray-600">Total Videos</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                            <span className="text-lg">🌍</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900">{allVideos.filter(v => v.status === 'public').length}</p>
                                            <p className="text-xs text-gray-600">Public</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
                                            <span className="text-lg">🔗</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900">{allVideos.filter(v => v.status === 'unlisted').length}</p>
                                            <p className="text-xs text-gray-600">Unlisted</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                                            <span className="text-lg">🔒</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900">{allVideos.filter(v => v.status === 'private').length}</p>
                                            <p className="text-xs text-gray-600">Private</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-semibold text-gray-700">Filter:</span>
                                </div>
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === 'all'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    All ({allVideos.length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('public')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === 'public'
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    🌍 Public ({allVideos.filter(v => v.status === 'public').length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('unlisted')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === 'unlisted'
                                        ? 'bg-yellow-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    🔗 Unlisted ({allVideos.filter(v => v.status === 'unlisted').length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('private')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === 'private'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    🔒 Private ({allVideos.filter(v => v.status === 'private').length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('draft')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === 'draft'
                                        ? 'bg-gray-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    📝 Draft ({allVideos.filter(v => v.status === 'draft').length})
                                </button>
                            </div>
                        </div>

                        {/* Videos by Category */}
                        {Object.keys(videosByCategory).length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No videos found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters or upload your first video</p>
                                <Link href="/upload">
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Video
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {Object.entries(videosByCategory).map(([category, videos]) => (
                                    <div key={category}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <h2 className="text-2xl font-black text-gray-900">{category}</h2>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                                {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {videos.map((video) => (
                                                <div
                                                    key={video.id}
                                                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedVideo(video)
                                                            setShowVideoModal(true)
                                                        }}
                                                    >
                                                        {video.thumbnail}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                                                                <Play className="w-8 h-8 text-blue-600 fill-blue-600 ml-1" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded">
                                                            {video.duration}
                                                        </div>
                                                        <div className={`absolute top-2 left-2 px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(video.status)}`}>
                                                            {getStatusIcon(video.status)} {video.status.toUpperCase()}
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4">
                                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedVideo(video)
                                                                setShowVideoModal(true)
                                                            }}
                                                        >
                                                            {video.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>

                                                        {/* Stats */}
                                                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="w-4 h-4" />
                                                                <span>{formatNumber(video.views)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="w-4 h-4" />
                                                                <span>{formatNumber(video.likes)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MessageSquare className="w-4 h-4" />
                                                                <span>{formatNumber(video.comments)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Tags */}
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {video.tags.slice(0, 3).map((tag, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                            {video.tags.length > 3 && (
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                                                                    +{video.tags.length - 3}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVideo(video)
                                                                    setShowVideoModal(true)
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                View Details
                                                            </button>
                                                            <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                                <MoreHorizontal className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Video Details Modal */}
            {showVideoModal && selectedVideo && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowVideoModal(false)}
                >
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                                    {selectedVideo.thumbnail}
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
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center gap-3">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold ${getStatusColor(selectedVideo.status)}`}>
                                    <span className="text-lg">{getStatusIcon(selectedVideo.status)}</span>
                                    <span>{selectedVideo.status.toUpperCase()}</span>
                                </div>
                                {selectedVideo.videoUrl && (
                                    <a href={selectedVideo.videoUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                                    >
                                        <Youtube className="w-4 h-4" />
                                        View on YouTube
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
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
                                <p className="text-gray-900 whitespace-pre-wrap">{selectedVideo.description}</p>
                            </div>

                            {/* Hashtags */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-bold text-gray-700">Hashtags ({selectedVideo.tags.length})</label>
                                    <button
                                        onClick={() => copyToClipboard(selectedVideo.tags.map(t => `#${t}`).join(' '), 'hashtags')}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                    >
                                        {copiedField === 'hashtags' ? (
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
                                        <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Eye className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-bold text-gray-700">Views</span>
                                    </div>
                                    <p className="text-2xl font-black text-blue-600">{formatNumber(selectedVideo.views)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Heart className="w-5 h-5 text-pink-600" />
                                        <span className="text-sm font-bold text-gray-700">Likes</span>
                                    </div>
                                    <p className="text-2xl font-black text-pink-600">{formatNumber(selectedVideo.likes)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm font-bold text-gray-700">Comments</span>
                                    </div>
                                    <p className="text-2xl font-black text-purple-600">{formatNumber(selectedVideo.comments)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-bold text-gray-700">Duration</span>
                                    </div>
                                    <p className="text-2xl font-black text-green-600">{selectedVideo.duration}</p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <label className="text-sm font-bold text-gray-700 mb-2 block">Category</label>
                                    <p className="text-gray-900 font-medium">{selectedVideo.category}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <label className="text-sm font-bold text-gray-700 mb-2 block">Published Date</label>
                                    <p className="text-gray-900 font-medium">{new Date(selectedVideo.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold">
                                    <Edit className="w-4 h-4" />
                                    Edit Video
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-semibold">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                                <button className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
