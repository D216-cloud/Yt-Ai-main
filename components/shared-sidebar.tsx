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

            {/* Enhanced Sidebar */}
            <aside
                className={`fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 transform transition-all duration-300 z-40 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0`}
            >
                {/* Channel Selector */}
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
                                <p className="text-xs text-gray-600">{formatNumber(analyticsData.subscribers)} subscribers</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="p-4 space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Main Menu</p>
                    {navLinks.map((link) => {
                        const Icon = link.icon
                        const isActive = activePage === link.id
                        return (
                            <Link key={link.id} href={link.href}>
                                <button
                                    onClick={() => setSidebarOpen(false)}
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
        </>
    )
}
