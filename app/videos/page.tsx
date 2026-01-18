"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import SharedSidebar from "@/components/shared-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Youtube, Search, Upload, Rocket, Chrome, X, Sparkles, Tag, Lock } from "lucide-react"

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

interface Video {
  id: string
  title: string
  description?: string
  thumbnail: string
  publishedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  tags: string[]
}

export default function VideosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [displayCount, setDisplayCount] = useState(12) // Show 12 videos initially
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showOptimizeModal, setShowOptimizeModal] = useState(false)
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [recommendedTags, setRecommendedTags] = useState([
    { text: "nature sounds", score: 78 },
    { text: "nature photography", score: 69 },
    { text: "backyard nature", score: 64 },
  ])

  // Load YouTube channel data
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        setYoutubeChannel(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load channel data:', error)
    }
  }, [])

  // Fetch videos when channel is loaded
  useEffect(() => {
    const fetchVideos = async () => {
      if (!youtubeChannel) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        if (typeof window === 'undefined') return
        
        const accessToken = localStorage.getItem('youtube_access_token')
        if (!accessToken) {
          setLoading(false)
          return
        }

        const refreshTokenParam = localStorage.getItem(`youtube_refresh_token_${youtubeChannel.id}`) || localStorage.getItem('youtube_refresh_token') || ''
        let response = await fetch(`/api/youtube/best-videos?channelId=${youtubeChannel.id}&accessToken=${accessToken}${refreshTokenParam ? `&refresh_token=${encodeURIComponent(refreshTokenParam)}` : ''}`)
        if (!response.ok) {
          // Try client-side refresh
          const clientRefreshToken = localStorage.getItem(`youtube_refresh_token_${youtubeChannel.id}`) || localStorage.getItem('youtube_refresh_token')
          if (clientRefreshToken) {
            const refreshRes = await fetch('/api/youtube/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: clientRefreshToken }) })
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              if (refreshData?.access_token) {
                localStorage.setItem(`youtube_access_token_${youtubeChannel.id}`, refreshData.access_token)
                localStorage.setItem('youtube_access_token', refreshData.access_token)
                response = await fetch(`/api/youtube/best-videos?channelId=${youtubeChannel.id}&accessToken=${refreshData.access_token}`)
              }
            }
          }
        }

        if (!response.ok) {
          throw new Error('Failed to fetch videos')
        }
        
        const data = await response.json()
        // persist new token returned by server if any
        if (data?.newAccessToken) {
          localStorage.setItem(`youtube_access_token_${youtubeChannel.id}`, data.newAccessToken)
          localStorage.setItem('youtube_access_token', data.newAccessToken)
        }
        
        if (data.videos && Array.isArray(data.videos)) {
          setVideos(data.videos)
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [youtubeChannel])

  // Check if there's a videoId in URL params and auto-open modal
  useEffect(() => {
    const videoId = searchParams.get('videoId')
    if (videoId && videos.length > 0) {
      const video = videos.find(v => v.id === videoId)
      if (video) {
        openOptimizeModal(video)
      }
    }
  }, [searchParams, videos])

  const openOptimizeModal = (video: Video) => {
    setSelectedVideo(video)
    setDescription(video.description || "")
    setTags(video.tags.join(", "))
    setShowOptimizeModal(true)
  }

  const closeOptimizeModal = () => {
    setShowOptimizeModal(false)
    setSelectedVideo(null)
  }

  const addRecommendedTag = (tag: string) => {
    const currentTags = tags.split(',').map(t => t.trim()).filter(Boolean)
    if (!currentTags.includes(tag)) {
      setTags(tags ? `${tags}, ${tag}` : tag)
    }
  }

  // Filter videos based on search
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get videos to display based on displayCount
  const videosToShow = filteredVideos.slice(0, displayCount)
  const hasMoreVideos = filteredVideos.length > displayCount

  const loadMoreVideos = () => {
    setDisplayCount(prev => prev + 12) // Load 12 more videos
  }

  const loadAllVideos = () => {
    setDisplayCount(filteredVideos.length) // Load all remaining videos
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 30) return `${diffInDays} days ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="videos" />

        <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-bold uppercase">
                        Must Have
                      </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                      See optimize scores while you upload!
                    </h1>
                    <p className="text-gray-300 text-lg">Boost your video performance with AI-powered optimization</p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg whitespace-nowrap">
                    <Chrome className="w-5 h-5" />
                    Add to Chrome
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search videos"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 pl-12 pr-4 py-6 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Header with Videos title and Upload button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Youtube className="w-6 h-6 text-gray-800" />
                  <h2 className="text-2xl font-bold text-gray-900">Videos</h2>
                  <span className="text-gray-500 text-sm">({videosToShow.length} of {filteredVideos.length})</span>
                </div>
                <Link href="/upload/normal">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Video
                  </Button>
                </Link>
              </div>
            </div>

            {/* Videos Grid */}
            {!youtubeChannel ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Youtube className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Channel Connected</h3>
                <p className="text-gray-400 mb-6">Connect your YouTube channel to see your videos</p>
                <Link href="/connect">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Connect Channel
                  </Button>
                </Link>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-white text-lg">Loading videos...</div>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Youtube className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Videos Found</h3>
                <p className="text-gray-400 mb-6">Upload your first video to see it here</p>
                <Link href="/upload/normal">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Upload Video
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {videosToShow.map((video) => (
                    <div
                      key={video.id}
                      className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative w-full aspect-video bg-gray-200">
                        {video.thumbnail ? (
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <Youtube className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h3 className="text-gray-900 font-semibold text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>{video.viewCount.toLocaleString()} views</span>
                          <span>•</span>
                          <span>{formatTimeAgo(video.publishedAt)}</span>
                        </div>

                        {/* Score with Boost Button */}
                        <Button 
                          onClick={() => openOptimizeModal(video)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                        >
                          <Rocket className="w-4 h-4" />
                          Score with Boost
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More / Load All Buttons */}
                {hasMoreVideos && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      onClick={loadMoreVideos}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-3 rounded-xl"
                    >
                      Load More ({Math.min(12, filteredVideos.length - displayCount)} more)
                    </Button>
                    <Button
                      onClick={loadAllVideos}
                      variant="outline"
                      className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-semibold px-8 py-3 rounded-xl"
                    >
                      Load All Videos ({filteredVideos.length - displayCount} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Optimize Modal */}
      {showOptimizeModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-800">
                  {selectedVideo.thumbnail && (
                    <Image
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg line-clamp-1">{selectedVideo.title}</h3>
                  <p className="text-gray-400 text-sm">Published</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={closeOptimizeModal}
                  variant="ghost" 
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                  Save
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700 px-6">
              <div className="flex gap-8">
                <button className="text-white font-semibold pb-4 border-b-2 border-white">
                  Details
                </button>
                <button className="text-gray-400 font-semibold pb-4 hover:text-white">
                  Title
                </button>
                <button className="text-gray-400 font-semibold pb-4 hover:text-white">
                  Preview
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-semibold text-lg">Description</label>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-400 hover:text-white flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Refine
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-400 hover:text-white flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description"
                  className="w-full bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl min-h-[120px] focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-400 text-xs mt-2">0 of 5000</p>
              </div>

              {/* Tags Section */}
              <div>
                <label className="text-white font-semibold text-lg mb-3 block">Tags</label>
                <Textarea
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Add Tags"
                  className="w-full bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl min-h-[100px] focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-400 text-xs mt-2">0 of 500</p>
              </div>

              {/* Recommended Tags */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-semibold">Recommended</label>
                  <Button 
                    variant="link" 
                    className="text-white text-sm"
                  >
                    Add All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {recommendedTags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => addRecommendedTag(tag.text)}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <span className={`text-sm font-bold ${
                        tag.score >= 70 ? 'text-green-400' : 
                        tag.score >= 60 ? 'text-yellow-400' : 
                        'text-orange-400'
                      }`}>
                        {tag.score}
                      </span>
                      <span className="text-sm">{tag.text}</span>
                      <span className="text-gray-400">+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Unlock With Boost */}
              <div className="flex items-center justify-center py-8">
                <Button className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-3 rounded-xl flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Unlock With Boost
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
