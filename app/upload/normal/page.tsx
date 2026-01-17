"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  Video, 
  FileText, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Play,
  Menu,
  LogOut,
  Home,
  User,
  GitCompare,
  BarChart3,
  Sparkles,
  Settings,
  ChevronRight,
  Youtube,
  Eye,
  MessageSquare,
  Hash,
  Globe,
  Lock,
  Clock,
  Tag,
  Type,
  AlignLeft,
  Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"

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

interface VideoFile {
  file: File
  name: string
  size: number
  thumbnail?: string
  title?: string
  description?: string
  tags?: string[]
  privacyStatus?: 'public' | 'unlisted' | 'private'
  scheduledTime?: string
}

export default function NormalUploadPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [channels, setChannels] = useState<YouTubeChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null)
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'unlisted' | 'private'>('public')
  const [scheduledTime, setScheduledTime] = useState("")
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [category, setCategory] = useState<string>('22')
  const [madeForKids, setMadeForKids] = useState<boolean>(false)
  const [language, setLanguage] = useState<string>('en')
  const [license, setLicense] = useState<string>('standard')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const { data: session } = useSession()
  const router = useRouter()

  // Load channels from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const storedChannels = localStorage.getItem("additional_youtube_channels")
    const mainChannel = localStorage.getItem("youtube_channel")
    
    const allChannels: YouTubeChannel[] = []
    
    if (mainChannel) {
      try {
        const channel = JSON.parse(mainChannel)
        allChannels.push(channel)
      } catch (e) {
        console.error("Failed to parse main channel", e)
      }
    }
    
    if (storedChannels) {
      try {
        const additionalChannels = JSON.parse(storedChannels)
        additionalChannels.forEach((ch: YouTubeChannel) => {
          if (!allChannels.find(c => c.id === ch.id)) {
            allChannels.push(ch)
          }
        })
      } catch (e) {
        console.error("Failed to parse additional channels", e)
      }
    }
    
    setChannels(allChannels)
    if (allChannels.length > 0) {
      setSelectedChannel(allChannels[0])
    }
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push("/")
  }

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  const navLinks = [
    { icon: Home, label: "Dashboard", href: "/dashboard", id: "dashboard" },
    { icon: User, label: "Profile", href: "/dashboard?page=profile", id: "profile" },
    { icon: GitCompare, label: "Compare", href: "/compare", id: "compare" },
    { icon: Video, label: "Content", href: "/content", id: "content" },
    { icon: BarChart3, label: "Analytics", href: "/analytics", id: "analytics" },
    { icon: Upload, label: "Bulk Upload", href: "/upload/normal", id: "bulk-upload" },
    { icon: Settings, label: "Settings", href: "/settings", id: "settings" },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setVideoFile({
        file,
        name: file.name,
        size: file.size,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: "",
        tags: [],
        privacyStatus: 'public'
      })
      setTitle(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setThumbnail(files[0])
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleUpload = async () => {
    if (!videoFile || !selectedChannel) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', videoFile.file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('tags', JSON.stringify(tags))
      formData.append('privacy', privacyStatus)
      formData.append('madeForKids', String(madeForKids))
      formData.append('category', category)
      formData.append('language', language)
      formData.append('license', license)
      // selectedChannel id
      formData.append('channelIds', JSON.stringify([selectedChannel.id]))

      await new Promise<void>((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/youtube/upload')
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setUploadProgress(pct)
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText)
                if (data.success) {
                  setUploadProgress(100)
                  alert('Upload successful!')
                  resolve()
                } else {
                  reject(new Error(data.error || 'Upload failed'))
                }
              } catch (err) { reject(err) }
            } else {
              reject(new Error('Upload failed with status ' + xhr.status))
            }
          }
          xhr.onerror = () => reject(new Error('Network error during upload'))
          xhr.send(formData)
        } catch (err) { reject(err) }
      })
      // reset after successful upload
      setVideoFile(null)
      setTitle('')
      setDescription('')
      setTags([])
      setThumbnail(null)
    } catch (err: any) {
      console.error(err)
      alert('Upload failed: ' + (err?.message || 'Please try again'))
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const saveDraftNormal = async () => {
    if (!videoFile) { alert('No video selected to save as draft'); return }
    if (typeof window === 'undefined') return
    
    try {
      // store metadata and a preview reference in localStorage (note: file contents are not persisted)
      const draft = {
        title: title || videoFile.name.replace(/\.[^/.]+$/, ''),
        description,
        tags,
        fileName: videoFile.name,
        size: videoFile.size,
        category,
        madeForKids,
        language,
        license,
        savedAt: Date.now()
      }
      localStorage.setItem('normal_upload_draft', JSON.stringify(draft))
      // clear selection to avoid giving impression file persisted
      setVideoFile(null)
      setPreviewSrc(null)
      alert('Draft saved (metadata only). File contents are not stored — keep the original file to upload later.')
    } catch (err) {
      console.error('Failed to save draft', err)
      alert('Failed to save draft')
    }
  }

  useEffect(() => {
    if (!videoFile || !videoFile.file) { setPreviewSrc(null); return }
    try {
      const url = URL.createObjectURL(videoFile.file)
      setPreviewSrc(url)
      return () => { try { URL.revokeObjectURL(url) } catch (e) {} }
    } catch (e) { setPreviewSrc(null) }
  }, [videoFile])

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 pt-2 pb-2 px-4">
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
                <Play className="h-4 w-4 text-white fill-white" />
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
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white h-16">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
              <Play className="h-5 w-5 text-white fill-white" />
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
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-sm ${
                    link.id === "bulk-upload"
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-700 border border-blue-300/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg bg-transparent border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
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
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-sm ${
                    link.id === "bulk-upload"
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-700 border border-blue-300/50 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-20 md:pt-20 md:ml-64 pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-4 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Upload className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Normal Upload</h1>
              </div>
              <p className="text-sm md:text-base text-gray-700">
                Upload a single video with custom settings
              </p>
              <Breadcrumb items={[{ label: 'Bulk Upload', href: '/upload/normal' }, { label: 'Normal Upload' }]} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Video Upload */}
              <div className="lg:col-span-2 space-y-6">
                {/* Video File Selection */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    Video File
                  </h2>
                  
                  {!videoFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Select Video</h3>
                      <p className="text-gray-600 mb-4">Choose a video file to upload</p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                          <Plus className="w-4 h-4 mr-2" />
                          Select Video
                        </Button>
                      </label>
                      <p className="text-gray-500 text-sm mt-3">
                        Supported formats: MP4, MOV, AVI, WMV
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Video className="w-8 h-8 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{videoFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setVideoFile(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ""
                            }
                          }}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Thumbnail Upload */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Custom Thumbnail (Optional)
                        </h3>
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailSelect}
                            className="hidden"
                            ref={thumbnailInputRef}
                          />
                          <Button 
                            variant="outline" 
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Thumbnail
                          </Button>
                        </label>
                        {thumbnail && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm text-gray-600">{thumbnail.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setThumbnail(null)
                                if (thumbnailInputRef.current) {
                                  thumbnailInputRef.current.value = ""
                                }
                              }}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Details */}
                {videoFile && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Type className="w-5 h-5 text-blue-600" />Video Details</h2>
                      <div className="flex items-center gap-3">
                        <button onClick={saveDraftNormal} className="px-3 py-1 border rounded-md text-sm">Save draft</button>
                        <button onClick={handleUpload} disabled={isUploading} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">{isUploading ? 'Uploading...' : 'Upload to YouTube'}</button>
                      </div>
                    </div>

                    <div className="mb-4 rounded-lg overflow-hidden bg-black">
                      {previewSrc ? (
                        <video src={previewSrc} controls className="w-full h-56 object-cover" />
                      ) : (
                        <div className="w-full h-56 flex items-center justify-center text-gray-400">No preview</div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter video title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <AlignLeft className="w-4 h-4" />
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter video description"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Tags
                        </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Add a tag"
                            />
                            <Button 
                              onClick={addTag}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {tag}
                                <button 
                                  onClick={() => removeTag(tag)}
                                  className="hover:text-blue-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="22">People & Blogs</option>
                                <option value="1">Film & Animation</option>
                                <option value="2">Autos & Vehicles</option>
                                <option value="10">Music</option>
                                <option value="15">Pets & Animals</option>
                                <option value="17">Sports</option>
                                <option value="20">Gaming</option>
                                <option value="24">Entertainment</option>
                                <option value="25">News & Politics</option>
                                <option value="26">Howto & Style</option>
                                <option value="27">Education</option>
                                <option value="28">Science & Technology</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Made for kids</label>
                              <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-2">
                                  <input type="radio" name="nfk" checked={madeForKids === true} onChange={() => setMadeForKids(true)} />
                                  <span className="text-sm">Yes</span>
                                </label>
                                <label className="inline-flex items-center gap-2">
                                  <input type="radio" name="nfk" checked={madeForKids === false} onChange={() => setMadeForKids(false)} />
                                  <span className="text-sm">No</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="hi">Hindi</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">License</label>
                              <select value={license} onChange={(e) => setLicense(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="standard">Standard YouTube License</option>
                                <option value="creative">Creative Commons</option>
                              </select>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy and Schedule */}
                {videoFile && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-600" />
                      Privacy & Schedule
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Privacy Status
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => setPrivacyStatus('public')}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              privacyStatus === 'public'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Globe className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <span className="text-sm font-medium">Public</span>
                          </button>
                          <button
                            onClick={() => setPrivacyStatus('unlisted')}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              privacyStatus === 'unlisted'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Hash className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <span className="text-sm font-medium">Unlisted</span>
                          </button>
                          <button
                            onClick={() => setPrivacyStatus('private')}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              privacyStatus === 'private'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Lock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <span className="text-sm font-medium">Private</span>
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Schedule Upload (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Leave blank to upload immediately
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Channel Selection and Upload */}
              <div className="space-y-6">
                {/* Channel Selection */}
                {channels.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-600" />
                      Select Channel
                    </h2>
                    <div className="space-y-3">
                      {channels.map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            selectedChannel?.id === channel.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={channel.thumbnail}
                            alt={channel.title}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="text-left flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm truncate">{channel.title}</h3>
                            <p className="text-xs text-gray-600 truncate">
                              {formatNumber(channel.subscriberCount)} subscribers
                            </p>
                          </div>
                          {selectedChannel?.id === channel.id && (
                            <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {videoFile && selectedChannel && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upload</h2>

                    <div className="flex gap-3 mb-3">
                      <button onClick={saveDraftNormal} className="flex-1 px-4 py-3 border rounded-lg">Save draft</button>
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg"
                      >
                        {isUploading ? (
                          <>
                            <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Uploading... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload to YouTube
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {isUploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Tips</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        Videos should be in MP4 format with H.264 codec for best compatibility
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        Recommended resolution: 1920x1080 (1080p) or higher
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        File size limit: 128GB for long videos, 2GB for Shorts
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        Add engaging titles and descriptions to improve discoverability
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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