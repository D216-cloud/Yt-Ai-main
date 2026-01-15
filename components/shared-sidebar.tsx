"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Home,
    FileText,
    Video,
    Upload,
    GitCompare,
    Layers,
    Sparkles,
    ChevronDown,
    Youtube,
    Play,
    Plus,
    Settings,
    X
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
                const { channel, token, refreshToken } = event.data
                
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
                if (token) localStorage.setItem(`youtube_access_token_${channel.id}`, token)
                if (refreshToken) localStorage.setItem(`youtube_refresh_token_${channel.id}`, refreshToken)
                
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
                className={`fixed left-0 top-16 bottom-0 w-64 md:w-64 lg:w-64 flex flex-col shrink-0 bg-white border-r border-gray-200 transform transition-all duration-300 z-40 h-[calc(100vh-4rem)] ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}
            >


                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
                    {navLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.href}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                                activePage === link.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <link.icon className={`w-5 h-5 ${activePage === link.id ? 'text-white' : 'text-gray-600'}`} />
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

                {/* Upgrade Box */}
                <div className="p-4 border-t border-gray-200 mt-auto">
                    <div className="bg-blue-600 rounded-xl p-4 text-white shadow-md">
                        <h3 className="font-bold text-sm mb-2">Upgrade to Vidiomex Pro</h3>
                        <p className="text-xs mb-4 text-white/90">Unlock advanced analytics, priority support, and unlimited uploads.</p>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold">Pro</div>
                                <div className="text-xs">From $9/mo</div>
                            </div>
                            <a href="/pricing" className="inline-flex items-center px-3 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300">Upgrade</a>
                        </div>
                    </div>
                </div>

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
                                    <X className="text-gray-500" />
                                </button>
                            </div>

                            {/* Active Channel Status */}
                            <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
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
                                                        <p className="font-bold text-gray-900 truncate">{youtubeChannel.title}</p>
                                                        <p className={`text-xs font-bold ${
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
                                                        <p className="font-bold text-gray-900 truncate">{channel.title}</p>
                                                        <p className={`text-xs font-bold ${
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
                                <div className="mb-6 p-4 bg-white/50 border-2 border-blue-300 rounded-xl shadow-sm">
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
                                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 rounded-lg transition-colors text-sm"
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
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
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
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400"
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
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
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