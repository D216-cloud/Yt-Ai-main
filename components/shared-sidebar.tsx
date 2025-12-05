"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
    Home,
    FileText,
    Video,
    Upload,
    GitCompare,
    Layers,
    Sparkles,
    ChevronDown
} from "lucide-react"

interface SharedSidebarProps {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    activePage?: string
}

export default function SharedSidebar({ sidebarOpen, setSidebarOpen, activePage: activePageProp }: SharedSidebarProps) {
    const pathname = usePathname()
    const [youtubeChannel, setYoutubeChannel] = useState<any>(null)
    const [showChannelDropdown, setShowChannelDropdown] = useState(false)
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [additionalChannels, setAdditionalChannels] = useState<any[]>([])
    const [isConnecting, setIsConnecting] = useState(false)
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
    const [showSaveButton, setShowSaveButton] = useState(false)
    const [analyticsData, setAnalyticsData] = useState({
        views: 127500,
        subscribers: 45200,
        growth: 18
    })

    // Load YouTube channel data
    useEffect(() => {
        try {
            const stored = localStorage.getItem('youtube_channel')
            if (stored) {
                const channel = JSON.parse(stored)
                setYoutubeChannel(channel)
                setAnalyticsData({
                    views: parseInt(channel.viewCount) || 127500,
                    subscribers: parseInt(channel.subscriberCount) || 45200,
                    growth: 18
                })
            }
            // Load additional channels
            const additionalStored = localStorage.getItem('additional_youtube_channels')
            if (additionalStored) {
                setAdditionalChannels(JSON.parse(additionalStored))
            }
            
            // Set active channel (default to primary)
            const activeId = localStorage.getItem('active_youtube_channel_id')
            if (activeId) {
                setActiveChannelId(activeId)
            } else if (stored) {
                const channel = JSON.parse(stored)
                setActiveChannelId(channel.id)
                localStorage.setItem('active_youtube_channel_id', channel.id)
            }
            
            // Auto-close modal if it was open and channels are loaded
            if (showConnectModal && (stored || additionalStored)) {
                setShowConnectModal(false)
            }
        } catch (error) {
            console.error('Failed to load channel data:', error)
        }
    }, [])

    const disconnectChannel = () => {
        localStorage.removeItem('youtube_channel')
        localStorage.removeItem('youtube_access_token')
        localStorage.removeItem('youtube_refresh_token')
        setYoutubeChannel(null)
        setShowChannelDropdown(false)
        // Redirect to connect page or show success message
        window.location.href = '/connect'
    }

    const connectMoreChannels = () => {
        setShowChannelDropdown(false)
        if (youtubeChannel) {
            // Open modal for additional channel connection
            setShowConnectModal(true)
        } else {
            // First channel connection - go to connect page
            window.location.href = '/connect'
        }
    }

    const startYouTubeAuth = () => {
        setIsConnecting(true)
        // Set return page to indicate this is for additional channels
        localStorage.setItem('oauth_return_page', 'sidebar')
        // Create a popup window for YouTube authentication
        const popup = window.open(
            '/api/youtube/auth?popup=true',
            'youtube-auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        )
        
        // Listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return
            
            if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
                const { channel, token } = event.data
                
                // Check if this channel is already connected (primary or additional)
                const existingChannels = JSON.parse(localStorage.getItem('additional_youtube_channels') || '[]')
                const isPrimaryChannel = youtubeChannel && youtubeChannel.id === channel.id
                const isAlreadyAdditional = existingChannels.some((ch: any) => ch.id === channel.id)
                
                if (isPrimaryChannel || isAlreadyAdditional) {
                    alert(`Channel "${channel.title}" is already connected!`)
                    setIsConnecting(false)
                    popup?.close()
                    return
                }
                
                // Save additional channel (don't replace primary)
                const updatedChannels = [...existingChannels, channel]
                localStorage.setItem('additional_youtube_channels', JSON.stringify(updatedChannels))
                localStorage.setItem(`youtube_token_${channel.id}`, token)
                
                // Clear the oauth return page to prevent connect page processing
                localStorage.removeItem('oauth_return_page')
                
                // Update state
                setAdditionalChannels(updatedChannels)
                setIsConnecting(false)
                setShowConnectModal(false)
                popup?.close()
                
                // Show success message
                alert(`Successfully connected ${channel.title} as additional channel!`)
                console.log('Additional channels updated:', updatedChannels)
            } else if (event.data.type === 'YOUTUBE_AUTH_ERROR') {
                setIsConnecting(false)
                alert('Failed to connect channel. Please try again.')
                popup?.close()
            }
        }

        window.addEventListener('message', messageListener)
        
        // Check if popup is closed manually
        const checkClosed = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkClosed)
                setIsConnecting(false)
                window.removeEventListener('message', messageListener)
            }
        }, 1000)

        // Cleanup after 5 minutes
        setTimeout(() => {
            clearInterval(checkClosed)
            setIsConnecting(false)
            window.removeEventListener('message', messageListener)
            if (popup && !popup.closed) {
                popup.close()
            }
        }, 300000)
    }

    const navLinks = [
        { icon: Home, label: 'Dashboard', href: '/dashboard', id: 'dashboard', badge: null },
        { icon: FileText, label: 'Vid-Info', href: '/vid-info', id: 'vid-info', badge: null },
        { icon: Video, label: 'Content', href: '/content', id: 'content', badge: '12' },
        { icon: Upload, label: 'Bulk Upload', href: '/bulk-upload', id: 'bulk-upload', badge: null },
        { icon: GitCompare, label: 'Compare', href: '/compare', id: 'compare', badge: null },
        { icon: Layers, label: 'AI Tools', href: '/ai-tools', id: 'ai-tools', badge: 'New' },
    ]

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
        if (num >= 1000) return (num / 1000).toFixed(1) + "K"
        return num.toString()
    }

    // Determine active page from pathname if not provided
    const activePage = activePageProp || pathname.split('/')[1] || 'dashboard'

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 md:hidden z-30 top-16"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
            
            {/* Dropdown Overlay */}
            {showChannelDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowChannelDropdown(false)}
                ></div>
            )}
            
            {/* Modal Overlay */}
            {showConnectModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isConnecting) {
                            setShowConnectModal(false)
                        }
                    }}
                ></div>
            )}

            {/* Enhanced Sidebar */}
            <aside
                className={`fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 transform transition-all duration-300 z-40 overflow-y-auto ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}
            >
                {/* Channel Selector */}
                <div className="p-4 border-b border-gray-200 relative">
                    {youtubeChannel ? (
                        <div 
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
                            onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                        >
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
                                <p className="text-xs text-gray-600">{formatNumber(analyticsData.subscribers)} subscribers</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
                        </div>
                    ) : (
                        <div 
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-colors"
                            onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                        >
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a2.999 2.999 0 0 0-2.109-2.109C19.647 3.5 12 3.5 12 3.5s-7.647 0-9.389.577A2.999 2.999 0 0 0 .502 6.186C.002 7.929.002 12.002.002 12.002s0 4.073.5 5.816a2.999 2.999 0 0 0 2.109 2.109C4.353 20.5 12 20.5 12 20.5s7.647 0 9.389-.573a2.999 2.999 0 0 0 2.109-2.109c.5-1.743.5-5.816.5-5.816s0-4.073-.5-5.816z"/>
                                    <path fill="white" d="M9.748 15.348L15.5 12l-5.752-3.348v6.696z"/>
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm">Connect Channel</p>
                                <p className="text-xs text-gray-600">No channel connected</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
                        </div>
                    )}
                    
                    {/* Basic dropdown menu for now */}
                    {showChannelDropdown && (
                        <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                            <div className="py-2">
                                {youtubeChannel ? (
                                    <>
                                        <button
                                            onClick={connectMoreChannels}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
                                        >
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-lg">+</span>
                                            </div>
                                            Connect More Channels
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={disconnectChannel}
                                            className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600"
                                        >
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                <span className="text-red-600 font-bold text-sm">×</span>
                                            </div>
                                            Disconnect Channel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={connectMoreChannels}
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 text-sm font-medium text-blue-700"
                                        >
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a2.999 2.999 0 0 0-2.109-2.109C19.647 3.5 12 3.5 12 3.5s-7.647 0-9.389.577A2.999 2.999 0 0 0 .502 6.186C.002 7.929.002 12.002.002 12.002s0 4.073.5 5.816a2.999 2.999 0 0 0 2.109 2.109C4.353 20.5 12 20.5 12 20.5s7.647 0 9.389-.573a2.999 2.999 0 0 0 2.109-2.109c.5-1.743.5-5.816.5-5.816s0-4.073-.5-5.816z"/>
                                                    <path fill="white" d="M9.748 15.348L15.5 12l-5.752-3.348v6.696z"/>
                                                </svg>
                                            </div>
                                            Connect YouTube Channel
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => { setShowChannelDropdown(false); window.location.href = '/settings'; }}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700"
                                        >
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            Settings
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.href}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                activePage === link.id
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <link.icon className="w-5 h-5" />
                            <span className="flex-1">{link.label}</span>
                            {link.badge && (
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                    activePage === link.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Channel Analytics */}
                {youtubeChannel && (
                    <div className="p-4 border-t border-gray-200">
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-white">
                            <h3 className="font-bold text-sm mb-3">Channel Analytics</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs opacity-90">Total Views</span>
                                    <span className="font-bold text-sm">{formatNumber(analyticsData.views)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs opacity-90">Subscribers</span>
                                    <span className="font-bold text-sm">{formatNumber(analyticsData.subscribers)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs opacity-90">Growth</span>
                                    <span className="font-bold text-sm text-green-300">+{analyticsData.growth}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Connect Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Channel Management</h2>
                                    <p className="text-sm text-gray-600 mt-1">Switch channels or connect new ones</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowConnectModal(false)
                                        setSelectedChannelId(null)
                                        setShowSaveButton(false)
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={isConnecting}
                                >
                                    <span className="text-gray-500 text-xl">&times;</span>
                                </button>
                            </div>

                            {/* Active Channel Status */}
                            <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="flex items-center gap-3">
                                        {(activeChannelId === youtubeChannel?.id ? youtubeChannel : additionalChannels.find(ch => ch.id === activeChannelId))?.thumbnail && (
                                            <img
                                                src={(activeChannelId === youtubeChannel?.id ? youtubeChannel : additionalChannels.find(ch => ch.id === activeChannelId))?.thumbnail}
                                                alt={(activeChannelId === youtubeChannel?.id ? youtubeChannel : additionalChannels.find(ch => ch.id === activeChannelId))?.title}
                                                className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                Currently Active: <span className="text-green-600">
                                                    {(activeChannelId === youtubeChannel?.id ? youtubeChannel?.title : additionalChannels.find(ch => ch.id === activeChannelId)?.title) || 'None'}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {activeChannelId === youtubeChannel?.id ? 'Primary' : 'Additional'} • All actions are performed on this channel
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Connected Channels List */}
                            {(youtubeChannel || additionalChannels.length > 0) && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Switch Channel</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {/* Primary Channel */}
                                        {youtubeChannel && (
                                            <button
                                                onClick={() => {
                                                    setSelectedChannelId(youtubeChannel.id)
                                                    setShowSaveButton(youtubeChannel.id !== activeChannelId)
                                                }}
                                                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                                    selectedChannelId === youtubeChannel.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : activeChannelId === youtubeChannel.id
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={youtubeChannel.thumbnail}
                                                        alt={youtubeChannel.title}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{youtubeChannel.title}</p>
                                                        <p className={`text-xs font-medium ${
                                                            activeChannelId === youtubeChannel.id
                                                                ? 'text-green-600'
                                                                : selectedChannelId === youtubeChannel.id
                                                                ? 'text-blue-600'
                                                                : 'text-gray-600'
                                                        }`}>
                                                            🔵 Primary Channel {activeChannelId === youtubeChannel.id ? '• Active' : selectedChannelId === youtubeChannel.id ? '• Selected' : ''}
                                                        </p>
                                                    </div>
                                                    {selectedChannelId === youtubeChannel.id && (
                                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    {activeChannelId === youtubeChannel.id && selectedChannelId !== youtubeChannel.id && (
                                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        )}

                                        {/* Additional Channels */}
                                        {additionalChannels.map((channel) => (
                                            <button
                                                key={channel.id}
                                                onClick={() => {
                                                    setSelectedChannelId(channel.id)
                                                    setShowSaveButton(channel.id !== activeChannelId)
                                                }}
                                                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                                    selectedChannelId === channel.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : activeChannelId === channel.id
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={channel.thumbnail}
                                                        alt={channel.title}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{channel.title}</p>
                                                        <p className={`text-xs font-medium ${
                                                            activeChannelId === channel.id
                                                                ? 'text-green-600'
                                                                : selectedChannelId === channel.id
                                                                ? 'text-blue-600'
                                                                : 'text-gray-600'
                                                        }`}>
                                                            ⚪ Additional Channel {activeChannelId === channel.id ? '• Active' : selectedChannelId === channel.id ? '• Selected' : ''}
                                                        </p>
                                                    </div>
                                                    {selectedChannelId === channel.id && (
                                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    {activeChannelId === channel.id && selectedChannelId !== channel.id && (
                                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Save Button (shown only when switching channels) */}
                            {showSaveButton && selectedChannelId && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-sm">
                                    <div className="text-center">
                                        <div className="mb-3">
                                            <p className="font-bold text-blue-900 text-sm mb-1">Ready to switch channels?</p>
                                            <p className="text-xs text-blue-700">
                                                Switch to: <span className="font-semibold">
                                                    {selectedChannelId === youtubeChannel?.id 
                                                        ? `${youtubeChannel?.title} (Primary)` 
                                                        : `${additionalChannels.find(ch => ch.id === selectedChannelId)?.title} (Additional)`
                                                    }
                                                </span>
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                ⚡ This will change the active channel across all pages instantly
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedChannelId(null)
                                                    setShowSaveButton(false)
                                                }}
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedChannelId) {
                                                        // Update active channel (this maintains primary/additional structure)
                                                        setActiveChannelId(selectedChannelId)
                                                        localStorage.setItem('active_youtube_channel_id', selectedChannelId)
                                                        
                                                        // Dispatch real-time event for other components
                                                        window.dispatchEvent(new CustomEvent('channelSwitched', {
                                                            detail: { 
                                                                channelId: selectedChannelId, 
                                                                timestamp: Date.now(),
                                                                isPrimary: selectedChannelId === youtubeChannel?.id
                                                            }
                                                        }))
                                                        
                                                        // Reset states
                                                        setSelectedChannelId(null)
                                                        setShowSaveButton(false)
                                                        setShowConnectModal(false)
                                                        
                                                        // Show success message with clear indication
                                                        const channelName = selectedChannelId === youtubeChannel?.id 
                                                            ? youtubeChannel?.title 
                                                            : additionalChannels.find(ch => ch.id === selectedChannelId)?.title
                                                        const channelType = selectedChannelId === youtubeChannel?.id ? 'Primary' : 'Additional'
                                                        alert(`✅ Successfully switched to ${channelName} (${channelType} Channel)!\n\nThis channel is now active across all pages.`)
                                                    }
                                                }}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-3 rounded-lg transition-all duration-200 text-sm transform hover:scale-105 shadow-lg"
                                            >
                                                ✨ Save & Switch
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Connect New Channel Section */}
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Connect New Channel</h3>
                                <div className="space-y-4">
                                <button
                                    onClick={startYouTubeAuth}
                                    disabled={isConnecting}
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isConnecting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.498 6.186a2.999 2.999 0 0 0-2.109-2.109C19.647 3.5 12 3.5 12 3.5s-7.647 0-9.389.577A2.999 2.999 0 0 0 .502 6.186C.002 7.929.002 12.002.002 12.002s0 4.073.5 5.816a2.999 2.999 0 0 0 2.109 2.109C4.353 20.5 12 20.5 12 20.5s7.647 0 9.389-.573a2.999 2.999 0 0 0 2.109-2.109c.5-1.743.5-5.816.5-5.816s0-4.073-.5-5.816z"/>
                                                <path fill="white" d="M9.748 15.348L15.5 12l-5.752-3.348v6.696z"/>
                                            </svg>
                                            <span>Connect YouTube Channel</span>
                                        </>
                                    )}
                                </button>
                                
                                    <button
                                        onClick={() => {
                                            setShowConnectModal(false)
                                            setSelectedChannelId(null)
                                            setShowSaveButton(false)
                                        }}
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                                        disabled={isConnecting}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex gap-2">
                                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-xs text-blue-800">
                                        <p className="font-medium mb-1">Multiple Channel Benefits:</p>
                                        <ul className="space-y-1 text-blue-700">
                                            <li>• Manage multiple channels from one dashboard</li>
                                            <li>• Switch between channels easily</li>
                                            <li>• Upload content to any connected channel</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}