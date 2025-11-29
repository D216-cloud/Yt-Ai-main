"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  Users, 
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
  Hash
} from "lucide-react"
import Link from "next/link"
import SharedSidebar from "@/components/shared-sidebar"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { NavMenu } from "@/components/nav-menu"

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

export default function BulkUploadPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [channels, setChannels] = useState<YouTubeChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  // Mock channels data - in a real app, this would come from your API
  useEffect(() => {
    // Load channels from localStorage or API
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
    { icon: Upload, label: "Bulk Upload", href: "/ai-tools", id: "ai-tools" },
    { icon: Settings, label: "Settings", href: "/settings", id: "settings" },
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
      <header className="hidden md:block sticky top-0 z-40 border-b border-gray-200 bg-white h-16">
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
        {/* Shared Sidebar */}
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="ai-tools" />

        {/* Main Content */}
        <main className="flex-1 md:ml-72 pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-4 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Upload className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bulk Upload</h1>
              </div>
              <p className="text-sm md:text-base text-gray-700">
                Upload videos to your YouTube channels efficiently
              </p>
              <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Bulk Upload' }]} />
            </div>

            {/* Upload Type Selection */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Upload Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/upload/normal" 
                  className="block p-6 rounded-xl border-2 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Normal Upload</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload individual videos with custom settings for each
                  </p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                    Start Upload
                  </Button>
                </Link>
                
                {/* Bulk Upload has been removed — we keep a disabled card for context */}
                <div className="block p-6 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 opacity-80 cursor-not-allowed">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Bulk Upload</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload multiple videos simultaneously to one or more channels
                  </p>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold">
                    Start Bulk Upload
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">Bulk upload has been removed — use AI Tools for similar functionality.</p>
                </div>
              </div>
            </div>

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