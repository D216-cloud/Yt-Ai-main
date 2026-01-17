"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import SharedSidebar from '@/components/shared-sidebar'
import DashboardHeader from '@/components/dashboard-header'
import TitleSearchScoreComponent from '@/components/title-search-score'
import { Sparkles, ChevronDown } from 'lucide-react'

interface YouTubeChannel {
  id: string
  title: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
  viewCount: string
}

export default function TitleSearchPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Creator'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [additionalChannelsList, setAdditionalChannelsList] = useState<YouTubeChannel[]>([])
  const channelMenuRef = useRef<HTMLDivElement | null>(null)

  const visibleAdditionalChannels = additionalChannelsList.filter(ch => ch && ch.id && ch.id !== youtubeChannel?.id)
  const uniqueChannelCount = React.useMemo(() => {
    const map: Record<string, boolean> = {}
    if (youtubeChannel?.id) map[youtubeChannel.id] = true
    for (const ch of (additionalChannelsList || [])) {
      if (ch && ch.id) map[String(ch.id)] = true
    }
    return Object.keys(map).length
  }, [youtubeChannel, additionalChannelsList])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        const channel = JSON.parse(stored)
        setYoutubeChannel(channel)
      }

      const additionalStored = localStorage.getItem('additional_youtube_channels')
      if (additionalStored) {
        setAdditionalChannelsList(JSON.parse(additionalStored))
      }
    } catch (error) {
      console.error('Failed to load channel data:', error)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (channelMenuRef.current && !channelMenuRef.current.contains(e.target as Node)) {
        setShowChannelMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatNumber = (num: number | string): string => {
    const n = typeof num === 'string' ? parseInt(num, 10) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* Shared Sidebar */}
        <SharedSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          activePage="title-search"
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Main Content */}
        <main className={`flex-1 pt-14 md:pt-16 p-4 md:p-8 pb-20 md:pb-8 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Channel Selector & Upgrade Banner Section */}
            <div className="mb-8 mt-8 md:mt-10">
              {/* Channel Selector */}
              {youtubeChannel && (
                <div className="flex justify-center mb-3 px-3 relative" ref={channelMenuRef}>
                  <div className="inline-flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full shadow-sm max-w-full truncate">
                    <img 
                      src={youtubeChannel.thumbnail} 
                      alt={youtubeChannel.title} 
                      className="w-6 h-6 rounded-full object-cover" 
                    />
                    <span className="text-sm font-medium truncate max-w-[160px]">{youtubeChannel.title}</span>
                    <span className="ml-2 inline-flex items-center text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      <span className="font-semibold mr-1">{uniqueChannelCount}</span>
                      <span className="text-xs">{uniqueChannelCount === 1 ? 'channel' : 'channels'}</span>
                    </span>
                    <button
                      onClick={() => setShowChannelMenu((s: boolean) => !s)}
                      className="ml-2 flex items-center justify-center w-7 h-7 rounded-full bg-black/30 hover:bg-white/10 transition"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upgrade Banner */}
              <div className="flex justify-center mb-6 px-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-100 px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm text-yellow-800 shadow-sm max-w-full overflow-hidden">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium truncate">You're on Free Plan</span>
                  <span className="text-gray-700 hidden md:inline">Unlock unlimited access to all features and get paid.</span>
                  <Link href="/pricing" className="text-blue-600 font-semibold underline ml-2">Upgrade now</Link>
                </div>
              </div>

              {/* Page Title */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 mb-2">✨ YouTube Title Intelligence</h1>
                  <p className="text-gray-600 text-sm sm:text-lg">Generate SEO-optimized titles that rank higher and get more clicks.</p>
                </div>
              </div>
            </div>

            {/* Title Search Component */}
            <div className="w-full">
              <TitleSearchScoreComponent />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
