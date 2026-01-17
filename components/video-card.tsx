"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Loader2, Zap } from "lucide-react"

interface VideoCardProps {
  video: {
    id: string
    title: string
    description: string
    thumbnail: string
    publishedAt: string
    views: string
    likes: string
    comments: string
    duration: string
    privacyStatus?: 'public' | 'unlisted' | 'private'
  }
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const formatViews = (views: string) => {
    const num = parseInt(views)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const formatDuration = (duration: string) => {
    return duration.replace('PT', '').replace('M', ':').replace('S', '')
  }

  // Detect if this is a short (duration under 3 minutes / 180 seconds)
  const isShort = () => {
    if (!video.duration) return false
    try {
      // Handle ISO 8601 duration format: PT1H2M30S, PT1M30S, PT45S, etc.
      const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (!match) return false
      
      const h = parseInt(match[1] || '0')
      const m = parseInt(match[2] || '0')
      const s = parseInt(match[3] || '0')
      const totalSeconds = h * 3600 + m * 60 + s
      
      // Shorts are videos under 3 minutes (180 seconds)
      return totalSeconds < 180
    } catch (e) {
      console.error('Duration parsing error in VideoCard:', e)
      return false
    }
  }

  const isShortVideo = isShort()

  // Open analysis modal and dispatch event
  const handleScoreWithBoost = () => {
    setIsAnalyzing(true)
    // Functionality removed - no modal opening
    setTimeout(() => setIsAnalyzing(false), 600)
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // noop
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <>
      {isShortVideo ? (
        // SHORTS CARD - Portrait/Vertical Layout
        <div ref={containerRef} className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer">
          {/* Thumbnail Container - Tall Aspect */}
          <div className="relative w-full aspect-[9/16] bg-gray-200 overflow-hidden">
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={200}
              height={356}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Privacy Status Badge */}
            {video.privacyStatus && video.privacyStatus !== 'public' && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold text-white bg-red-600/80 backdrop-blur-sm">
                {video.privacyStatus === 'private' ? '🔒 Private' : '🔗 Unlisted'}
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="p-3 bg-white">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
              {video.title}
            </h3>

            {/* Views & Date */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatDate(video.publishedAt)}</span>
            </div>

            {/* Action Button */}
            <button
              onClick={handleScoreWithBoost}
              disabled={isAnalyzing}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-all text-sm disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scoring...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Score with Boost</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // VIDEOS CARD - Landscape/Horizontal Layout
        <div ref={containerRef} className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer">
          {/* Thumbnail Container */}
          <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={320}
              height={180}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Privacy Status Badge */}
            {video.privacyStatus && video.privacyStatus !== 'public' && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold text-white bg-red-600/80 backdrop-blur-sm">
                {video.privacyStatus === 'private' ? '🔒 Private' : '🔗 Unlisted'}
              </div>
            )}
            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>

          {/* Video Info */}
          <div className="p-3 bg-white">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
              {video.title}
            </h3>

            {/* Views & Date */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatDate(video.publishedAt)}</span>
            </div>

            {/* Action Button */}
            <button
              onClick={handleScoreWithBoost}
              disabled={isAnalyzing}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-all text-sm disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scoring...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Score with Boost</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
