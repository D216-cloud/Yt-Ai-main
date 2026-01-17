"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Loader2, TrendingUp, Target, Copy, Check } from "lucide-react"

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
  }
}

interface AnalysisData {
  titleScore: number
  status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR'
  breakdown: {
    lengthScore: number
    keywordScore: number
    powerWordsScore: number
    freshnessScore: number
    clarityScore: number
    competitionScore: number
  }
  recommendations: string[]
  searchQueries: string[]
  totalSearchQueries: number
  searchDemand: 'LOW' | 'MEDIUM' | 'HIGH'
  competition: 'LOW' | 'MEDIUM' | 'HIGH'
  trend: 'RISING' | 'STABLE' | 'DECLINING'
  suggestedTitles: string[]
  keywords: string[]
  disclaimer: string
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  // click outside handling
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

  // Open analysis modal (global) and let the modal handle loading and fetching
  const handleAnalyze = () => {
    setIsAnalyzing(true)
    try {
      window.dispatchEvent(new CustomEvent('open-analysis', { detail: { title: video.title, videoId: video.id } }))
    } catch (e) {
      console.error('Failed to open analysis modal', e)
    } finally {
      // small visual feedback on button, modal will show actual loading
      setTimeout(() => setIsAnalyzing(false), 600)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const copyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-blue-500 to-cyan-600'
    if (score >= 40) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      EXCELLENT: 'bg-green-100 text-green-800',
      GOOD: 'bg-blue-100 text-blue-800',
      AVERAGE: 'bg-yellow-100 text-yellow-800',
      POOR: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.AVERAGE
  }

  const getLevelBadge = (level: string) => {
    const colors = {
      HIGH: 'bg-red-100 text-red-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      LOW: 'bg-green-100 text-green-700',
      RISING: 'bg-emerald-100 text-emerald-700',
      STABLE: 'bg-blue-100 text-blue-700',
      DECLINING: 'bg-gray-100 text-gray-700',
    }
    return colors[level as keyof typeof colors] || colors.MEDIUM
  }

  return (
    <div ref={containerRef} className="relative bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 overflow-visible border border-gray-100">
      {/* Video Card Header */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Thumbnail */}
          <div className="relative shrink-0 w-full sm:w-48">
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={240}
              height={135}
              className="rounded-2xl object-cover shadow-sm w-full h-auto"
            />
            <div className="absolute bottom-3 left-3 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
              {video.duration.replace('PT', '').replace('M', ':').replace('S', '')}
            </div>
          </div>

          {/* Video Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg leading-tight line-clamp-3">
              {video.title}
            </h3>

            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{video.description || ''}</p>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-gray-700">👁️ {formatViews(video.views)}</span>
              <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-gray-700">📅 {formatDate(video.publishedAt)}</span>
              <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-gray-700">👍 {formatViews(video.likes)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4 sm:mt-0 sm:flex-col sm:items-end w-full sm:w-auto">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-amber-600 border border-amber-200 py-2 px-4 rounded-xl hover:bg-amber-50 transition-all font-medium disabled:opacity-50 shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing</span>
                </>
              ) : (
                <>
                  <span className="font-medium">{analysisData ? 'Open Analysis' : 'Analyze'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(`https://youtu.be/${video.id}`)}
              className="w-full sm:w-auto inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Share
            </button>

            <a href={`https://youtu.be/${video.id}`} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:underline mt-1 sm:mt-0">Open on YouTube</a>
          </div>
        </div>
      </div>


    </div>
  )
}
