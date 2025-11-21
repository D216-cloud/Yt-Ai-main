"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  Users, 
  Video, 
  Zap, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  Eye, 
  MessageSquare, 
  Home, 
  Sparkles, 
  Mail, 
  ChevronRight, 
  Youtube, 
  User, 
  GitCompare, 
  Calendar, 
  Globe, 
  CheckCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Hash,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import SidebarButton from '@/components/ui/sidebar-button'
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { NavMenu } from "@/components/nav-menu"
import AiToolsSection from '@/components/ai-tools-section'

export const dynamic = 'force-dynamic'

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

export default function ContentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showBulkChannelModal, setShowBulkChannelModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [allChannels, setAllChannels] = useState<YouTubeChannel[]>([])
  const [uploadType, setUploadType] = useState<'short' | 'long'>('long')
  const [selectedUploadChannel, setSelectedUploadChannel] = useState<YouTubeChannel | null>(null)
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '22', // People & Blogs
    privacy: 'public',
    madeForKids: false
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Add useEffect to check if user is authenticated
  useEffect(() => {
    if (!session) {
      router.push('/signup')
    }
  }, [session, router])

  // Load all connected channels from localStorage
  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  // Load all connected channels from localStorage
  useEffect(() => {
    const loadAllChannels = () => {
      const channels: YouTubeChannel[] = []
      
      // Try to get main channel from localStorage
      const storedMainChannel = localStorage.getItem("youtube_channel")
      if (storedMainChannel) {
        try {
          const mainChannel = JSON.parse(storedMainChannel)
          channels.push(mainChannel)
        } catch (e) {
          console.error("Failed to parse main channel", e)
        }
      }
      
      // Load additional channels from localStorage
      const storedChannels = localStorage.getItem("additional_youtube_channels")
      if (storedChannels) {
        try {
          const additionalChannels = JSON.parse(storedChannels)
          // Filter out duplicates
          additionalChannels.forEach((ch: YouTubeChannel) => {
            if (!channels.find(c => c.id === ch.id)) {
              channels.push(ch)
            }
          })
        } catch (e) {
          console.error("Failed to parse additional channels", e)
        }
      }
      
      setAllChannels(channels)
      
      // Set default upload channel to the first available channel
      if (channels.length > 0) {
        setSelectedUploadChannel(channels[0])
      }
    }
    
    loadAllChannels()
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push("/")
  }

  const handleConnectNewChannel = () => {
    // Store current page context before OAuth redirect
    localStorage.setItem("oauth_return_page", "content")
    
    // Open OAuth in a popup window instead of redirect (for better UX)
    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const popup = window.open(
      "/api/youtube/auth",
      "YouTube OAuth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    )
    
    // Listen for popup close and refresh channels
    const checkPopupClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopupClosed)
        // Reload channels after OAuth completes
        setTimeout(() => {
          const loadAllChannels = () => {
            const channels: YouTubeChannel[] = []
            
            // Try to get main channel from localStorage
            const storedMainChannel = localStorage.getItem("youtube_channel")
            if (storedMainChannel) {
              try {
                const mainChannel = JSON.parse(storedMainChannel)
                channels.push(mainChannel)
              } catch (e) {
                console.error("Failed to parse main channel", e)
              }
            }
            
            const storedChannels = localStorage.getItem("additional_youtube_channels")
            if (storedChannels) {
              try {
                const additionalChannels = JSON.parse(storedChannels)
                additionalChannels.forEach((ch: YouTubeChannel) => {
                  if (!channels.find(c => c.id === ch.id)) {
                    channels.push(ch)
                  }
                })
              } catch (e) {
                console.error("Failed to parse additional channels", e)
              }
            }
            
            setAllChannels(channels)
          }
          
          loadAllChannels()
          // Set default upload channel after loading
          if (allChannels.length > 0) {
            setSelectedUploadChannel(allChannels[0])
          }
        }, 1000)
      }
    }, 500)
  }

  const handleRemoveChannel = (channelId: string) => {
    // Remove specific channel
    const updatedChannels = allChannels.filter(ch => ch.id !== channelId)
    
    // If it's the main channel
    const storedMainChannel = localStorage.getItem("youtube_channel")
    if (storedMainChannel) {
      try {
        const mainChannel = JSON.parse(storedMainChannel)
        if (mainChannel.id === channelId) {
          localStorage.removeItem("youtube_access_token")
          localStorage.removeItem("youtube_refresh_token")
          localStorage.removeItem("youtube_channel")
        }
      } catch (e) {
        console.error("Failed to parse main channel", e)
      }
    }
    
    // Update additional channels
    const additionalChannels = updatedChannels.filter(ch => {
      const storedMainChannel = localStorage.getItem("youtube_channel")
      if (storedMainChannel) {
        try {
          const mainChannel = JSON.parse(storedMainChannel)
          return ch.id !== mainChannel.id
        } catch (e) {
          return true
        }
      }
      return true
    })
    localStorage.setItem("additional_youtube_channels", JSON.stringify(additionalChannels))
    
    setAllChannels(updatedChannels)
  }

  const formatNumber = (num: string): string => {
    const number = parseInt(num)
    if (number >= 1000000) return (number / 1000000).toFixed(1) + "M"
    if (number >= 1000) return (number / 1000).toFixed(1) + "K"
    return number.toString()
  }

  const totalSubscribers = allChannels.reduce((sum, channel) => {
    return sum + parseInt(channel.subscriberCount)
  }, 0)

  const totalVideos = allChannels.reduce((sum, channel) => {
    return sum + parseInt(channel.videoCount)
  }, 0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, WebM, MOV, AVI)')
        return
      }
      
      // Check file size (max 2GB for Shorts, 128GB for long videos)
      const maxSize = uploadType === 'short' ? 2 * 1024 * 1024 * 1024 : 128 * 1024 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`File size exceeds ${uploadType === 'short' ? '2GB' : '128GB'} limit`)
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a video file')
      return
    }

    if (!uploadData.title.trim()) {
      alert('Please enter a video title')
      return
    }

    if (!selectedUploadChannel) {
      alert('Please select a channel to upload to')
      return
    }

    const accessToken = localStorage.getItem('youtube_access_token')
    if (!accessToken) {
      alert('YouTube access token not found. Please reconnect your channel.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('title', uploadData.title)
      formData.append('description', uploadData.description)
      formData.append('tags', uploadData.tags)
      formData.append('privacy', uploadData.privacy)
      formData.append('madeForKids', uploadData.madeForKids.toString())
      formData.append('category', uploadData.category)
      formData.append('access_token', accessToken)

      // Simulate progress for large files
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 1000)

      // Upload to YouTube API
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        body: formData,
      })
      
      clearInterval(progressInterval)
      const data = await response.json()
      
      if (data.success) {
        setUploadProgress(100)
        
        setTimeout(() => {
          alert(`${uploadType === 'short' ? 'Short' : 'Video'} "${uploadData.title}" uploaded successfully to ${selectedUploadChannel?.title}!\n\nVideo URL: ${data.video.url}`)
          setShowUploadModal(false)
          resetUploadForm()
          
          // Optionally redirect to the video
          if (confirm('Do you want to view the video on YouTube?')) {
            window.open(data.video.url, '_blank')
          }
        }, 500)
      } else if (data.expired) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('youtube_refresh_token')
        if (refreshToken) {
          const refreshResponse = await fetch('/api/youtube/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })
          
          const refreshData = await refreshResponse.json()
          
          if (refreshData.success && refreshData.access_token) {
            localStorage.setItem('youtube_access_token', refreshData.access_token)
            alert('Session refreshed. Please try uploading again.')
          } else {
            alert('Your session has expired. Please reconnect your YouTube channel.')
          }
        } else {
          alert('Your session has expired. Please reconnect your YouTube channel.')
        }
        setIsUploading(false)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message || 'Please try again.'}`)
      setIsUploading(false)
    }
  }

  const resetUploadForm = () => {
    setUploadData({
      title: '',
      description: '',
      tags: '',
      category: '22',
      privacy: 'public',
      madeForKids: false
    })
    setSelectedFile(null)
    setUploadProgress(0)
    setUploadType('long')
    // Reset to first channel
    if (allChannels.length > 0) {
      setSelectedUploadChannel(allChannels[0])
    }
  }

  const navLinks = [
    { icon: Home, label: "Dashboard", href: "/dashboard", id: "dashboard" },
    { icon: GitCompare, label: "Compare", href: "/compare", id: "compare" },
    { icon: Video, label: "Content", href: "/content", id: "content" },
    { icon: Upload, label: "Bulk Upload", href: "/bulk-upload", id: "bulk-upload" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 pt-2 pb-2 px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
                <Video className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">YouTubeAI Pro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {session && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-md">
                <span className="text-white text-sm font-bold uppercase">
                  {session.user?.email?.substring(0, 2) || "U"}
                </span>
              </div>
            )}
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
              title="Sign Out"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 border-b border-gray-200 bg-white h-16">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
              <Video className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">YouTubeAI Pro</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "Creator Studio"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email || "Premium Plan"}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-200 shadow-md flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 md:hidden z-30 top-16" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:hidden z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
              return (
                <SidebarButton
                  key={link.id}
                  id={link.id}
                  href={link.href}
                  label={link.label}
                  Icon={Icon}
                  isActive={isActive}
                  onClick={() => setSidebarOpen(false)}
                />
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start h-12 text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r border-gray-200 bg-white fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
              return (
                <SidebarButton
                  key={link.id}
                  id={link.id}
                  href={link.href}
                  label={link.label}
                  Icon={Icon}
                  isActive={isActive}
                />
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start h-12 text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">
            <NavMenu activePage="content" />
            {/* Upload Video Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !isUploading && setShowUploadModal(false)}>
                <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Upload Video</h2>
                          <p className="text-white/80 text-sm">Upload Shorts or Long videos to your channel</p>
                        </div>
                      </div>
                      {!isUploading && (
                        <button
                          onClick={() => setShowUploadModal(false)}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <X className="w-6 h-6 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Video Type Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-900 mb-3">Video Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setUploadType('short')}
                          disabled={isUploading}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            uploadType === 'short'
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-red-300'
                          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Zap className={`w-6 h-6 ${uploadType === 'short' ? 'text-red-600' : 'text-gray-600'}`} />
                            <h3 className={`font-bold ${uploadType === 'short' ? 'text-red-900' : 'text-gray-900'}`}>
                              YouTube Shorts
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600">Vertical video, up to 60 seconds</p>
                        </button>

                        <button
                          onClick={() => setUploadType('long')}
                          disabled={isUploading}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            uploadType === 'long'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Video className={`w-6 h-6 ${uploadType === 'long' ? 'text-blue-600' : 'text-gray-600'}`} />
                            <h3 className={`font-bold ${uploadType === 'long' ? 'text-blue-900' : 'text-gray-900'}`}>
                              Long Video
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600">Standard video, any duration</p>
                        </button>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-900 mb-3">Video File</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          disabled={isUploading}
                          className="hidden"
                          id="video-upload"
                        />
                        <label htmlFor="video-upload" className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {selectedFile ? (
                            <div className="flex items-center justify-center gap-3">
                              <Video className="w-8 h-8 text-green-600" />
                              <div className="text-left">
                                <p className="font-bold text-gray-900">{selectedFile.name}</p>
                                <p className="text-sm text-gray-600">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              {!isUploading && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setSelectedFile(null)
                                  }}
                                  className="ml-4 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="font-semibold text-gray-900 mb-1">Click to upload video</p>
                              <p className="text-sm text-gray-600">
                                {uploadType === 'short' ? 'Max 2GB, up to 60 seconds' : 'Max 128GB'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV, AVI</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Video Details */}
                    <div className="space-y-4">
                      {/* Channel Selector */}
                      {allChannels.length > 1 && (
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-3">
                            Upload to Channel <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {allChannels.map((channel) => (
                              <button
                                key={channel.id}
                                type="button"
                                onClick={() => setSelectedUploadChannel(channel)}
                                disabled={isUploading}
                                className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl transition-all ${
                                  selectedUploadChannel?.id === channel.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <img
                                  src={channel.thumbnail}
                                  alt={channel.title}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div className="flex-1 text-left min-w-0">
                                  <p className={`font-bold text-sm truncate ${
                                    selectedUploadChannel?.id === channel.id ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                    {channel.title}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate">
                                    {formatNumber(channel.subscriberCount)} subscribers • {formatNumber(channel.videoCount)} videos
                                  </p>
                                </div>
                                {selectedUploadChannel?.id === channel.id && (
                                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            You have {allChannels.length} connected channels. Select which channel to upload this video to.
                          </p>
                        </div>
                      )}

                      {/* Show selected channel if only one channel */}
                      {allChannels.length === 1 && selectedUploadChannel && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                          <label className="block text-sm font-bold text-blue-900 mb-2">Uploading to</label>
                          <div className="flex items-center gap-3">
                            <img
                              src={selectedUploadChannel.thumbnail}
                              alt={selectedUploadChannel.title}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-blue-900 text-sm truncate">{selectedUploadChannel.title}</p>
                              <p className="text-xs text-blue-700 truncate">
                                {formatNumber(selectedUploadChannel.subscriberCount)} subscribers
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Title {uploadType === 'short' && <span className="text-xs text-gray-600">(Add #Shorts for better reach)</span>}
                        </label>
                        <input
                          type="text"
                          value={uploadData.title}
                          onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                          disabled={isUploading}
                          placeholder={uploadType === 'short' ? 'Amazing moment! #Shorts' : 'Enter video title'}
                          maxLength={100}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">{uploadData.title.length}/100 characters</p>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                        <textarea
                          value={uploadData.description}
                          onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                          disabled={isUploading}
                          placeholder="Describe your video..."
                          rows={4}
                          maxLength={5000}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">{uploadData.description.length}/5000 characters</p>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={uploadData.tags}
                          onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                          disabled={isUploading}
                          placeholder="gaming, tutorial, funny"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
                        />
                      </div>

                      {/* Privacy */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Privacy</label>
                        <select
                          value={uploadData.privacy}
                          onChange={(e) => setUploadData({ ...uploadData, privacy: e.target.value })}
                          disabled={isUploading}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="public">Public</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      {/* Made for Kids */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="madeForKids"
                          checked={uploadData.madeForKids}
                          onChange={(e) => setUploadData({ ...uploadData, madeForKids: e.target.checked })}
                          disabled={isUploading}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="madeForKids" className="text-sm font-medium text-gray-900">
                          Made for kids
                        </label>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-blue-900">Uploading...</span>
                          <span className="text-sm font-bold text-blue-900">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-blue-700 mt-2">Please don't close this window...</p>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => setShowUploadModal(false)}
                        disabled={isUploading}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading || !selectedFile || !uploadData.title.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Upload {uploadType === 'short' ? 'Short' : 'Video'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Channel Modal */}
            {showBulkChannelModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulkChannelModal(false)}>
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Bulk Channel Manager</h2>
                          <p className="text-white/80 text-sm">Manage all your YouTube channels in one place</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowBulkChannelModal(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Stats Overview */}
                    {allChannels.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-blue-900 text-sm">Connected Channels</h4>
                            <Youtube className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-3xl font-bold text-blue-900">{allChannels.length}</p>
                          <p className="text-xs text-blue-700 mt-1">Active {allChannels.length === 1 ? 'channel' : 'channels'}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-purple-900 text-sm">Total Subscribers</h4>
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <p className="text-3xl font-bold text-purple-900">{formatNumber(totalSubscribers.toString())}</p>
                          <p className="text-xs text-purple-700 mt-1">Across all channels</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-green-900 text-sm">Total Videos</h4>
                            <Video className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="text-3xl font-bold text-green-900">{formatNumber(totalVideos.toString())}</p>
                          <p className="text-xs text-green-700 mt-1">Combined content</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <Youtube className="w-6 h-6 text-yellow-600" />
                          <h4 className="font-bold text-yellow-900">No Channel Connected</h4>
                        </div>
                        <p className="text-sm text-yellow-800">Connect your YouTube channel to manage it here.</p>
                      </div>
                    )}

                    {/* Channel List */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Your Channels</h3>
                      
                      {allChannels.length > 0 ? (
                        <div className="space-y-3">
                          {allChannels.map((channel) => (
                            <div key={channel.id} className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all group">
                              <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                <img
                                  src={channel.thumbnail}
                                  alt={channel.title}
                                  className="relative w-14 h-14 rounded-full shadow-lg object-cover border-2 border-white"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors truncate">
                                    {channel.title}
                                  </h4>
                                  <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    Active
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="font-semibold">{formatNumber(channel.subscriberCount)} subscribers</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Video className="w-3.5 h-3.5" />
                                    <span className="font-semibold">{formatNumber(channel.videoCount)} videos</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors" title="Manage Channel">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="View Analytics">
                                  <BarChart3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleRemoveChannel(channel.id)}
                                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors" 
                                  title="Disconnect Channel"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                          <Youtube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-4">No channels connected yet</p>
                          <Button
                            onClick={handleConnectNewChannel}
                            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold"
                          >
                            <Youtube className="w-4 h-4 mr-2" />
                            Connect Your First Channel
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Add New Channel Button - Always show */}
                    <button
                      onClick={handleConnectNewChannel}
                      className="w-full mt-6 p-4 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-2 bg-indigo-100 group-hover:bg-indigo-200 rounded-full transition-colors">
                          <Plus className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {allChannels.length > 0 ? 'Connect Another Channel' : 'Connect Your First Channel'}
                          </p>
                          <p className="text-sm text-gray-600">Add {allChannels.length > 0 ? 'more' : ''} YouTube channels to manage</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Modal Footer */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {allChannels.length > 0
                          ? `Managing ${allChannels.length} ${allChannels.length === 1 ? 'channel' : 'channels'} • All channels appear in Profile and Dashboard` 
                          : "Connect channels to manage them here"}
                      </p>
                      <Button
                        onClick={() => setShowBulkChannelModal(false)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Header with Gradient Border */}
            <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 border border-orange-300 p-[2px] shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-full blur-md opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-orange-600 to-red-600 rounded-full p-2.5 shadow-lg">
                      <Video className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                    Content Studio
                  </h1>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Manage, edit, and organize your video content all in one place with powerful AI tools
                </p>
                <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Content Studio' }]} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-white/90">Total Videos</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                  245
                </p>
                <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12 this month</span>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-white/90">Draft Videos</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                  8
                </p>
                <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
                  <ChevronRight className="w-3 h-3" />
                  <span>In progress</span>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-white/90">Playlists</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                  18
                </p>
                <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Organized</span>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-white/90">Scheduled</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                  5
                </p>
                <div className="mt-2 flex items-center gap-1 text-white/80 text-xs">
                  <Globe className="w-3 h-3" />
                  <span>Ready to publish</span>
                </div>
              </div>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div 
                onClick={() => setShowUploadModal(true)}
                className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Video className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700`}>
                    Quick Start
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Upload New Video
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Create and upload new video content with AI-powered optimization
                </p>
                <button className="w-full mt-auto py-2 px-4 bg-gray-100 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white text-gray-700 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:scale-105 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700`}>
                    Pro Tools
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Edit Videos
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Trim, edit, and enhance your videos with advanced editing tools
                </p>
                <button className="w-full mt-auto py-2 px-4 bg-gray-100 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white text-gray-700 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:scale-105 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform`}>
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700`}>
                    Organize
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Manage Playlists
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Organize videos into playlists and optimize viewer retention
                </p>
                <button className="w-full mt-auto py-2 px-4 bg-gray-100 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white text-gray-700 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:scale-105 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700`}>
                    Auto Publish
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Schedule Posts
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Plan content for future publishing with smart scheduling
                </p>
                <button className="w-full mt-auto py-2 px-4 bg-gray-100 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white text-gray-700 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:scale-105 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-pink-100 text-pink-700`}>
                    AI Powered
                  </span>
                </div>
                <h3 id="ai-thumbnails" className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  AI Thumbnails
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Generate eye-catching thumbnails using AI technology
                </p>
                <button className="w-full mt-auto py-2 px-4 bg-gray-100 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white text-gray-700 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div 
                onClick={() => setShowBulkChannelModal(true)}
                className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700`}>
                    Multi-Channel
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Bulk Channel Manager
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Manage multiple YouTube channels in one place with bulk actions
                </p>
                <button className="w-full mt-auto py-2 px-4 bg-gray-100 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white text-gray-700 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                    <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Recent Activity</h3>
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1 group">
                  View All
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md`}>
                      <Video className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        New video uploaded
                      </h4>
                      <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">2h ago</span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">'How to grow your YouTube channel' - Published 2 hours ago</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md`}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        Thumbnail generated
                      </h4>
                      <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">5h ago</span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">AI created 5 thumbnail options for your latest video</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-2.5 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md`}>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        Video trending
                      </h4>
                      <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">1d ago</span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">'Best YouTube Tips' is gaining 2.5K views/hour</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative p-2.5 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md`}>
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        Scheduled post ready
                      </h4>
                      <span className="text-xs text-gray-500 font-medium flex-shrink-0 ml-2">2d ago</span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">'Weekly Vlog #45' scheduled for tomorrow at 2 PM</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Bulk Upload Section */}
            <AiToolsSection />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only show sidebar button */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-center py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-3 rounded-full"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>
    </div>
  )
}

