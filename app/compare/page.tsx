"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Play, 
  Users, 
  Eye, 
  Video, 
  TrendingUp, 
  Search, 
  BarChart3, 
  Upload,
  Clock,
  Trophy,
  Lightbulb,
  AlertCircle,
  ArrowLeft,
  ListVideo,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Menu,
  X,
  LogOut,
  Home,
  GitCompare,
  Sparkles,
  Settings,
  BarChart3Icon,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

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

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string
  tags?: string[]
  description?: string
}

function ChannelCard({ channel, rank, isWinner }: { channel: YouTubeChannel; rank: string; isWinner: boolean }) {
  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  // Calculate engagement rate
  const calculateEngagementRate = () => {
    const subscribers = parseInt(channel.subscriberCount)
    const views = parseInt(channel.viewCount)
    if (subscribers === 0) return 0
    return ((views / subscribers) * 100).toFixed(1)
  }

  // Calculate avg views per video
  const calculateAvgViews = () => {
    const views = parseInt(channel.viewCount)
    const videos = parseInt(channel.videoCount)
    if (videos === 0) return 0
    return Math.floor(views / videos)
  }

  return (
    <div className={`bg-white border rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md ${isWinner ? "border-green-300 ring-2 ring-green-100" : "border-gray-200"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={channel.thumbnail} 
            alt={channel.title} 
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
          />
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1 text-base md:text-lg">{channel.title}</h3>
            <p className="text-xs text-gray-500">{channel.customUrl || channel.id}</p>
          </div>
        </div>
        {isWinner && (
          <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Trophy className="w-3 h-3" />
            Winner
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 mb-1">Subscribers</p>
          <p className="font-bold text-gray-900 text-lg">{formatNumber(channel.subscriberCount)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 mb-1">Views</p>
          <p className="font-bold text-gray-900 text-lg">{formatNumber(channel.viewCount)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 mb-1">Videos</p>
          <p className="font-bold text-gray-900 text-lg">{formatNumber(channel.videoCount)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 mb-1">Engagement</p>
          <p className="font-bold text-gray-900 text-lg">{calculateEngagementRate()}%</p>
        </div>
      </div>
      
      <div className="space-y-2 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Rank: {rank}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Video className="w-4 h-4" />
            <span>Avg: {formatNumber(calculateAvgViews())}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Created: {new Date(channel.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

function InsightCard({ channel, isWinner, comparisonData }: { 
  channel: YouTubeChannel; 
  isWinner: boolean;
  comparisonData: {
    channel1Subscribers: number;
    channel2Subscribers: number;
    channel1Views: number;
    channel2Views: number;
  }
}) {
  const getInsights = () => {
    const insights = []
    const subscribers = parseInt(channel.subscriberCount)
    const views = parseInt(channel.viewCount)
    const videos = parseInt(channel.videoCount)
    
    // Calculate engagement rate
    const engagementRate = subscribers > 0 ? (views / subscribers) * 100 : 0
    
    // Determine which channel has better metrics
    const hasMoreSubscribers = isWinner || subscribers > (channel.id === comparisonData.channel1Subscribers.toString() ? comparisonData.channel2Subscribers : comparisonData.channel1Subscribers)
    const hasMoreViews = isWinner || views > (channel.id === comparisonData.channel1Views.toString() ? comparisonData.channel2Views : comparisonData.channel1Views)
    
    if (hasMoreSubscribers) {
      insights.push("Stronger subscriber base creates a loyal audience")
    } else {
      insights.push("Needs to focus on subscriber growth strategies")
    }
    
    if (hasMoreViews) {
      insights.push("Higher engagement indicates compelling content")
    } else {
      insights.push("Could improve content to increase viewer engagement")
    }
    
    if (videos > 100) {
      insights.push("Consistent content creation builds audience retention")
    } else {
      insights.push("Increase posting frequency to build momentum")
    }
    
    if (engagementRate > 50) {
      insights.push("High engagement rate shows strong audience connection")
    } else if (engagementRate > 20) {
      insights.push("Moderate engagement rate - room for improvement")
    } else {
      insights.push("Low engagement rate - focus on audience interaction")
    }
    
    return insights
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        Why {channel.title} {isWinner ? "Performs Better" : "Needs Improvement"}
      </h3>
      
      <ul className="space-y-2">
        {getInsights().map((insight, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isWinner ? "bg-green-100" : "bg-yellow-100"}`}>
              <div className={`w-2 h-2 rounded-full ${isWinner ? "bg-green-500" : "bg-yellow-500"}`}></div>
            </div>
            <p className="text-sm text-gray-700">{insight}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ViralTipsCard({ channel, tips }: { channel: YouTubeChannel; tips: string[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Tips for {channel.title}
      </h3>
      
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <p className="text-sm text-gray-700">{tip}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EnhancedAnalyticsCard({ 
  channel, 
  videos,
  isWinner 
}: { 
  channel: YouTubeChannel; 
  videos: YouTubeVideo[];
  isWinner: boolean;
}) {
  // Enhanced formatNumber function with better formatting
  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }



  // Define keyword type
  interface KeywordData {
    word: string;
    count: number;
    percentage: string;
    viralPotential: string;
  }

  // Extract keywords from video titles with frequency and percentage
  const extractKeywords = (vids: YouTubeVideo[]): KeywordData[] => {
    const allTitles = vids.map(video => video.title).join(' ')
    const words = allTitles.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    const wordCount: { [key: string]: number } = {}
    const totalWords = words.length
    
    words.forEach(word => {
      if (word.length > 3) { // Only consider words longer than 3 characters
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word, 
        count, 
        percentage: ((count / totalWords) * 100).toFixed(1),
        viralPotential: calculateViralPotential(word, vids)
      }))
  }

  // Calculate viral potential of a keyword based on video performance
  const calculateViralPotential = (keyword: string, vids: YouTubeVideo[]): string => {
    const matchingVideos = vids.filter(video => 
      video.title.toLowerCase().includes(keyword.toLowerCase())
    )
    
    if (matchingVideos.length === 0) return "0.00"
    
    // Calculate average engagement rate for videos with this keyword
    const totalEngagement = matchingVideos.reduce((sum, video) => {
      return sum + (video.likeCount + video.commentCount)
    }, 0)
    
    const totalViews = matchingVideos.reduce((sum, video) => {
      return sum + video.viewCount
    }, 0)
    
    if (totalViews === 0) return "0.00"
    
    return ((totalEngagement / totalViews) * 100).toFixed(2)
  }

  // Get best posting times
  const getBestPostingTimes = (vids: YouTubeVideo[]) => {
    const hours: { [key: number]: number } = {}
    const days: { [key: string]: number } = {}
    
    vids.forEach((video: YouTubeVideo) => {
      const date = new Date(video.publishedAt)
      const hour = date.getHours()
      const day = date.toLocaleDateString('en-US', { weekday: 'long' })
      
      hours[hour] = (hours[hour] || 0) + 1
      days[day] = (days[day] || 0) + 1
    })
    
    // Find most popular hour
    const bestHourEntries = Object.entries(hours)
      .sort((a, b) => b[1] - a[1])
    const bestHour = bestHourEntries[0]
    
    // Find most popular day
    const bestDayEntries = Object.entries(days)
      .sort((a, b) => b[1] - a[1])
    const bestDay = bestDayEntries[0]
    
    return {
      bestHour: bestHour ? `${bestHour[0]}:00` : 'N/A',
      bestDay: bestDay ? bestDay[0] : 'N/A'
    }
  }

  // Get top performing videos
  const getTopPerformingVideos = (vids: YouTubeVideo[], metric: 'views' | 'likes' | 'comments' = 'views') => {
    return [...vids]
      .sort((a, b) => {
        if (metric === 'views') return b.viewCount - a.viewCount
        if (metric === 'likes') return b.likeCount - a.likeCount
        return b.commentCount - a.commentCount
      })
      .slice(0, 3)
  }

  // Calculate engagement rate for individual videos
  const calculateVideoEngagementRate = (video: YouTubeVideo) => {
    if (video.viewCount === 0) return "0.00"
    return ((video.likeCount + video.commentCount) / video.viewCount * 100).toFixed(2)
  }

  // Use the helper functions
  const keywords = extractKeywords(videos)
  const postingTimes = getBestPostingTimes(videos)
  const topVideos = getTopPerformingVideos(videos, 'views')

  return (
    <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        Enhanced Analytics for {channel.title}
      </h3>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Keywords Analysis - Mobile Friendly */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" />
            Popular Keywords
          </h4>
          <div className="space-y-3">
            {keywords.map((keyword: KeywordData, index: number) => (
              <div key={index} className="flex flex-col p-3 bg-white rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{keyword.word}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-center text-xs">
                    <div className="font-medium">{keyword.count}</div>
                    <div className="text-blue-600">uses</div>
                  </div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-center text-xs">
                    <div className="font-medium">{keyword.percentage}%</div>
                    <div className="text-green-600">reach</div>
                  </div>
                  <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-center text-xs">
                    <div className="font-medium">{keyword.viralPotential}%</div>
                    <div className="text-purple-600">viral</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Best Posting Times - Mobile Friendly */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500" />
            Best Posting Times
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-600">Best Day</span>
              <span className="font-medium">{postingTimes.bestDay}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-600">Best Hour</span>
              <span className="font-medium">{postingTimes.bestHour}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Posting at these times increases your content's visibility by up to 40%
              </p>
            </div>
          </div>
        </div>
        
        {/* Top Performing Videos - Mobile Friendly */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            Top Performing Videos
          </h4>
          <div className="space-y-3">
            {topVideos.map((video: YouTubeVideo, index: number) => (
              <div key={video.id} className="flex flex-col p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-shrink-0">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-16 h-10 object-cover rounded"
                    />
                  </div>
                  <h5 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{video.title}</h5>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-center text-xs">
                    <div className="font-medium">{formatNumber(video.viewCount)}</div>
                    <div className="text-blue-600">views</div>
                  </div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-center text-xs">
                    <div className="font-medium">{formatNumber(video.likeCount)}</div>
                    <div className="text-green-600">likes</div>
                  </div>
                  <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-center text-xs">
                    <div className="font-medium">{calculateVideoEngagementRate(video)}%</div>
                    <div className="text-purple-600">engagement</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          Recommendations
        </h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isWinner ? "bg-green-100" : "bg-yellow-100"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isWinner ? "bg-green-500" : "bg-yellow-500"}`}></div>
            </div>
            <p className="text-sm text-gray-700">
              {isWinner 
                ? "Continue using your successful keywords and posting schedule" 
                : "Consider adopting similar keywords and posting times as your competitor"}
            </p>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            </div>
            <p className="text-sm text-gray-700">
              Focus on creating content similar to your top performing videos
            </p>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            </div>
            <p className="text-sm text-gray-700">
              Keywords with high viral potential (above 5%) should be prioritized in future content
            </p>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default function ComparePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [channel1Id, setChannel1Id] = useState("")
  const [channel2Id, setChannel2Id] = useState("")
  const [channel1, setChannel1] = useState<YouTubeChannel | null>(null)
  const [channel2, setChannel2] = useState<YouTubeChannel | null>(null)
  const [channel1Videos, setChannel1Videos] = useState<YouTubeVideo[]>([])
  const [channel2Videos, setChannel2Videos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVideos, setShowVideos] = useState<"channel1" | "channel2" | "comparison" | null>(null)
  const [videosLoading, setVideosLoading] = useState(false)

  const navLinks = [
    { icon: Home, label: "Dashboard", href: "/dashboard", id: "dashboard" },
    { icon: GitCompare, label: "Compare", href: "/compare", id: "compare" },
    { icon: Video, label: "Content", href: "#", id: "content" },
    { icon: BarChart3Icon, label: "Analytics", href: "#", id: "analytics" },
    { icon: Upload, label: "Bulk Upload", href: "/ai-tools", id: "ai-tools" },
    { icon: Settings, label: "Settings", href: "#", id: "settings" },
  ]

  const handleNavClick = (href: string, id: string) => {
    if (id === "compare") {
      setSidebarOpen(false)
      return
    }
    router.push(href)
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  // Enhanced formatNumber function with better formatting
  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

// Calculate engagement rate for a channel
  const calculateEngagementRate = (channel: YouTubeChannel) => {
    const subscribers = parseInt(channel.subscriberCount)
    const views = parseInt(channel.viewCount)
    if (subscribers === 0) return "0.0"
    return ((views / subscribers) * 100).toFixed(1)
  }

  // Calculate avg views per video
  const calculateAvgViews = (channel: YouTubeChannel) => {
    const views = parseInt(channel.viewCount)
    const videos = parseInt(channel.videoCount)
    if (videos === 0) return 0
    return Math.floor(views / videos)
  }

  // Calculate avg likes per video
  const calculateAvgLikes = (channel: YouTubeChannel) => {
    // This is a simplified calculation - in a real app, we'd need actual like data per video
    const views = parseInt(channel.viewCount)
    const videos = parseInt(channel.videoCount)
    if (videos === 0) return 0
    // Assuming 5% likes per view as a rough estimate
    return Math.floor((views * 0.05) / videos)
  }

  // Extract keywords from video titles
  const extractKeywords = (videos: YouTubeVideo[]) => {
    const allTitles = videos.map(video => video.title).join(' ')
    const words = allTitles.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    const wordCount: { [key: string]: number } = {}
    
    words.forEach(word => {
      if (word.length > 3) { // Only consider words longer than 3 characters
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))
  }

  // Get best posting times
  const getBestPostingTimes = (videos: YouTubeVideo[]) => {
    const hours: { [key: number]: number } = {}
    const days: { [key: string]: number } = {}
    
    videos.forEach(video => {
      const date = new Date(video.publishedAt)
      const hour = date.getHours()
      const day = date.toLocaleDateString('en-US', { weekday: 'long' })
      
      hours[hour] = (hours[hour] || 0) + 1
      days[day] = (days[day] || 0) + 1
    })
    
    // Find most popular hour
    const bestHour = Object.entries(hours)
      .sort((a, b) => b[1] - a[1])[0]
    
    // Find most popular day
    const bestDay = Object.entries(days)
      .sort((a, b) => b[1] - a[1])[0]
    
    return {
      bestHour: bestHour ? `${bestHour[0]}:00` : 'N/A',
      bestDay: bestDay ? bestDay[0] : 'N/A'
    }
  }

  // Get top performing videos
  const getTopPerformingVideos = (videos: YouTubeVideo[], metric: 'views' | 'likes' | 'comments' = 'views') => {
    return [...videos]
      .sort((a, b) => {
        if (metric === 'views') return b.viewCount - a.viewCount
        if (metric === 'likes') return b.likeCount - a.likeCount
        return b.commentCount - a.commentCount
      })
      .slice(0, 3)
  }

  // Calculate engagement rate for individual videos
  const calculateVideoEngagementRate = (video: YouTubeVideo) => {
    if (video.viewCount === 0) return "0.00"
    return ((video.likeCount + video.commentCount) / video.viewCount * 100).toFixed(2)
  }

  const fetchChannelData = async (channelId: string) => {
    try {
      const response = await fetch(`/api/youtube/channelById?channelId=${channelId}`)
      const data = await response.json()
      
      if (data.success && data.channel) {
        return data.channel
      } else {
        throw new Error(data.error || "Failed to fetch channel data")
      }
    } catch (error: any) {
      throw new Error(error.message || "Error fetching channel data")
    }
  }

  const fetchChannelVideos = async (channelId: string) => {
    try {
      const response = await fetch(`/api/youtube/videos?channelId=${channelId}&maxResults=10`)
      const data = await response.json()
      
      if (data.success && data.videos) {
        return data.videos
      } else {
        throw new Error(data.error || "Failed to fetch channel videos")
      }
    } catch (error: any) {
      throw new Error(error.message || "Error fetching channel videos")
    }
  }

  const handleCompareVideos = async () => {
    if (!channel1 || !channel2) {
      setError("Please compare channels first")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const [channel1Videos, channel2Videos] = await Promise.all([
        fetchChannelVideos(channel1.id),
        fetchChannelVideos(channel2.id)
      ])
      
      setChannel1Videos(channel1Videos)
      setChannel2Videos(channel2Videos)
      
      // Show a comparison view by setting a specific state
      // We'll create a new state to indicate we're in video comparison mode
      setShowVideos("comparison")
    } catch (err: any) {
      setError(err.message || "Error comparing videos")
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = async () => {
    if (!channel1Id.trim() || !channel2Id.trim()) {
      setError("Please enter both channel IDs")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const [channel1Data, channel2Data] = await Promise.all([
        fetchChannelData(channel1Id),
        fetchChannelData(channel2Id)
      ])
      
      setChannel1(channel1Data)
      setChannel2(channel2Data)
      setShowVideos(null)
    } catch (err: any) {
      setError(err.message || "Error comparing channels")
    } finally {
      setLoading(false)
    }
  }

  const handleShowVideos = async (channelId: string, channelNumber: "channel1" | "channel2") => {
    try {
      setVideosLoading(true)
      setShowVideos(channelNumber)
      
      const videos = await fetchChannelVideos(channelId)
      
      if (channelNumber === "channel1") {
        setChannel1Videos(videos)
      } else {
        setChannel2Videos(videos)
      }
    } catch (err: any) {
      setError(err.message || "Error fetching videos")
    } finally {
      setVideosLoading(false)
    }
  }

  const getChannelRank = (channel: YouTubeChannel) => {
    // Simple ranking based on subscribers, views, and video count
    const subscribers = parseInt(channel.subscriberCount)
    const views = parseInt(channel.viewCount)
    const videos = parseInt(channel.videoCount)
    
    // Normalize values (these are example weights)
    const subscriberScore = subscribers / 10000
    const viewScore = views / 100000
    const videoScore = videos / 10
    
    const totalScore = subscriberScore + viewScore + videoScore
    
    // Simple ranking - lower score = higher rank
    return totalScore > 100 ? "100+" : Math.max(1, Math.floor(totalScore)).toString()
  }

  const getViralTips = (channel: YouTubeChannel) => {
    const subscribers = parseInt(channel.subscriberCount)
    const views = parseInt(channel.viewCount)
    const videos = parseInt(channel.videoCount)
    
    const tips = []
    
    if (subscribers < 1000) {
      tips.push("Focus on consistent content creation to build your subscriber base")
    }
    
    if (views / videos < 1000) {
      tips.push("Improve your thumbnails and titles to increase click-through rates")
    }
    
    tips.push("Post consistently and engage with your audience in comments")
    tips.push("Use relevant keywords in your titles and descriptions")
    tips.push("Collaborate with other creators in your niche")
    
    return tips
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
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

      <div className="flex flex-1">
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
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.href, link.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-sm ${
                    link.id === "compare"
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-700 border border-blue-300/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg bg-transparent border border-red-200 text-sm"
            >
              <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r border-gray-200 bg-white fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.href, link.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-sm ${
                    link.id === "compare"
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-700 border border-blue-300/50 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg bg-transparent border border-red-200 text-sm"
            >
              <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-16 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header with Back Button - Only show on desktop */}
            <div className="hidden md:flex items-center justify-between mb-6">
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Channel Comparison</h1>
              <div></div> {/* Spacer for alignment */}
            </div>

            <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-4 md:p-8">
              <p className="text-sm md:text-base text-gray-700">
                Compare two YouTube channels to see which one performs better and get tips to improve your content
              </p>
            </div>

            {/* Channel ID Input Section */}
            <div className="mb-8 bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Enter Channel IDs to Compare</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Channel 1 ID</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={channel1Id}
                      onChange={(e) => setChannel1Id(e.target.value)}
                      placeholder="UC_x5XG1OV2P6uZZ5FSM9Ttw"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setChannel1Id("")}
                      disabled={!channel1Id}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Channel 2 ID</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={channel2Id}
                      onChange={(e) => setChannel2Id(e.target.value)}
                      placeholder="UC3XTzVzaHQEd30rQbuvCtTQ"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setChannel2Id("")}
                      disabled={!channel2Id}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <Button
                onClick={handleCompare}
                disabled={loading || !channel1Id.trim() || !channel2Id.trim()}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Comparing Channels...
                  </>
                ) : (
                  "Compare Channels"
                )}
              </Button>
            </div>

            {/* Comparison Results */}
            {channel1 && channel2 && (
              <div className="space-y-6">
                {/* Channel Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <ChannelCard 
                    channel={channel1} 
                    rank={getChannelRank(channel1)} 
                    isWinner={getChannelRank(channel1) < getChannelRank(channel2)} 
                  />
                  <ChannelCard 
                    channel={channel2} 
                    rank={getChannelRank(channel2)} 
                    isWinner={getChannelRank(channel2) < getChannelRank(channel1)} 
                  />
                </div>

                {/* Enhanced Performance Metrics - Mobile Friendly Version */}
                <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Performance Comparison
                  </h2>
                  
                  {/* Mobile-friendly metric cards */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {/* Channel 1 Metrics */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3 text-center">{channel1.title}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Subscribers</span>
                          <span className="font-medium">{formatNumber(channel1.subscriberCount)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Total Views</span>
                          <span className="font-medium">{formatNumber(channel1.viewCount)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Video Count</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatNumber(channel1.videoCount)}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleShowVideos(channel1.id, "channel1")}
                              className="h-6 px-2 text-xs"
                            >
                              <ListVideo className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Avg. Views/Video</span>
                          <span className="font-medium">{formatNumber(calculateAvgViews(channel1))}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Engagement Rate</span>
                          <span className="font-medium">{calculateEngagementRate(channel1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Channel Rank</span>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{getChannelRank(channel1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Channel 2 Metrics */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3 text-center">{channel2.title}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                          <span className="text-sm text-gray-600">Subscribers</span>
                          <span className="font-medium">{formatNumber(channel2.subscriberCount)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                          <span className="text-sm text-gray-600">Total Views</span>
                          <span className="font-medium">{formatNumber(channel2.viewCount)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                          <span className="text-sm text-gray-600">Video Count</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatNumber(channel2.videoCount)}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleShowVideos(channel2.id, "channel2")}
                              className="h-6 px-2 text-xs"
                            >
                              <ListVideo className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                          <span className="text-sm text-gray-600">Avg. Views/Video</span>
                          <span className="font-medium">{formatNumber(calculateAvgViews(channel2))}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                          <span className="text-sm text-gray-600">Engagement Rate</span>
                          <span className="font-medium">{calculateEngagementRate(channel2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Channel Rank</span>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{getChannelRank(channel2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Difference Metrics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3 text-center">Differences</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Subscribers</span>
                          <span className={`font-medium ${parseInt(channel1.subscriberCount) > parseInt(channel2.subscriberCount) ? "text-green-600" : "text-red-600"}`}>
                            {formatNumber(Math.abs(parseInt(channel1.subscriberCount) - parseInt(channel2.subscriberCount)))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Total Views</span>
                          <span className={`font-medium ${parseInt(channel1.viewCount) > parseInt(channel2.viewCount) ? "text-green-600" : "text-red-600"}`}>
                            {formatNumber(Math.abs(parseInt(channel1.viewCount) - parseInt(channel2.viewCount)))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Video Count</span>
                          <span className={`font-medium ${parseInt(channel1.videoCount) > parseInt(channel2.videoCount) ? "text-green-600" : "text-red-600"}`}>
                            {formatNumber(Math.abs(parseInt(channel1.videoCount) - parseInt(channel2.videoCount)))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Avg. Views/Video</span>
                          <span className={`font-medium ${calculateAvgViews(channel1) > calculateAvgViews(channel2) ? "text-green-600" : "text-red-600"}`}>
                            {formatNumber(Math.abs(calculateAvgViews(channel1) - calculateAvgViews(channel2)))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Engagement Rate</span>
                          <span className={`font-medium ${parseFloat(calculateEngagementRate(channel1)) > parseFloat(calculateEngagementRate(channel2)) ? "text-green-600" : "text-red-600"}`}>
                            {Math.abs(parseFloat(calculateEngagementRate(channel1)) - parseFloat(calculateEngagementRate(channel2))).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Channel Rank</span>
                          <span className={`font-medium ${getChannelRank(channel1) < getChannelRank(channel2) ? "text-green-600" : "text-red-600"}`}>
                            {Math.abs(parseInt(getChannelRank(channel1)) - parseInt(getChannelRank(channel2)))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop table view - hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">{channel1.title}</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">{channel2.title}</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-medium">Subscribers</td>
                          <td className="py-3 px-4 font-medium">{formatNumber(channel1.subscriberCount)}</td>
                          <td className="py-3 px-4 font-medium">{formatNumber(channel2.subscriberCount)}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${parseInt(channel1.subscriberCount) > parseInt(channel2.subscriberCount) ? "text-green-600" : "text-red-600"}`}>
                              {formatNumber(Math.abs(parseInt(channel1.subscriberCount) - parseInt(channel2.subscriberCount)))}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-medium">Total Views</td>
                          <td className="py-3 px-4 font-medium">{formatNumber(channel1.viewCount)}</td>
                          <td className="py-3 px-4 font-medium">{formatNumber(channel2.viewCount)}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${parseInt(channel1.viewCount) > parseInt(channel2.viewCount) ? "text-green-600" : "text-red-600"}`}>
                              {formatNumber(Math.abs(parseInt(channel1.viewCount) - parseInt(channel2.viewCount)))}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-medium">Video Count</td>
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              {formatNumber(channel1.videoCount)}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleShowVideos(channel1.id, "channel1")}
                                className="h-6 px-2 text-xs"
                              >
                                <ListVideo className="w-3 h-3 mr-1" />
                                View Videos
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              {formatNumber(channel2.videoCount)}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleShowVideos(channel2.id, "channel2")}
                                className="h-6 px-2 text-xs"
                              >
                                <ListVideo className="w-3 h-3 mr-1" />
                                View Videos
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${parseInt(channel1.videoCount) > parseInt(channel2.videoCount) ? "text-green-600" : "text-red-600"}`}>
                              {formatNumber(Math.abs(parseInt(channel1.videoCount) - parseInt(channel2.videoCount)))}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-medium">Avg. Views per Video</td>
                          <td className="py-3 px-4 font-medium">
                            {formatNumber(calculateAvgViews(channel1))}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatNumber(calculateAvgViews(channel2))}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${calculateAvgViews(channel1) > calculateAvgViews(channel2) ? "text-green-600" : "text-red-600"}`}>
                              {formatNumber(Math.abs(calculateAvgViews(channel1) - calculateAvgViews(channel2)))}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-medium">Engagement Rate</td>
                          <td className="py-3 px-4 font-medium">
                            {calculateEngagementRate(channel1)}%
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {calculateEngagementRate(channel2)}%
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${parseFloat(calculateEngagementRate(channel1)) > parseFloat(calculateEngagementRate(channel2)) ? "text-green-600" : "text-red-600"}`}>
                              {Math.abs(parseFloat(calculateEngagementRate(channel1)) - parseFloat(calculateEngagementRate(channel2))).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700 font-medium">Channel Rank</td>
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              {getChannelRank(channel1)}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              {getChannelRank(channel2)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getChannelRank(channel1) < getChannelRank(channel2) ? "text-green-600" : "text-red-600"}`}>
                              {Math.abs(parseInt(getChannelRank(channel1)) - parseInt(getChannelRank(channel2)))}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Add Compare Videos Button */}
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={handleCompareVideos}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6"
                    >
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare Videos
                    </Button>
                  </div>
                </div>

                {/* Video Listings */}
                {(showVideos === "channel1" || showVideos === "channel2" || showVideos === "comparison") && (
                  <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        {showVideos === "channel1" 
                          ? `${channel1?.title} - Videos` 
                          : showVideos === "channel2" 
                          ? `${channel2?.title} - Videos` 
                          : `Video Comparison: ${channel1?.title} vs ${channel2?.title}`}
                      </h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowVideos(null)}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Comparison
                      </Button>
                    </div>
                    
                    {videosLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : showVideos === "comparison" ? (
                      // Video comparison view
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-center">{channel1?.title}</h3>
                            <div className="space-y-3">
                              {channel1Videos.map((video) => (
                                <div key={video.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                                  <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                      <img 
                                        src={video.thumbnail} 
                                        alt={video.title} 
                                        className="w-24 h-16 object-cover rounded"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{video.title}</h4>
                                      <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Eye className="w-3 h-3" />
                                          {formatNumber(video.viewCount)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <ThumbsUp className="w-3 h-3" />
                                          {formatNumber(video.likeCount)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MessageCircle className="w-3 h-3" />
                                          {formatNumber(video.commentCount)}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(video.publishedAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-center">{channel2?.title}</h3>
                            <div className="space-y-3">
                              {channel2Videos.map((video) => (
                                <div key={video.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                                  <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                      <img 
                                        src={video.thumbnail} 
                                        alt={video.title} 
                                        className="w-24 h-16 object-cover rounded"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{video.title}</h4>
                                      <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Eye className="w-3 h-3" />
                                          {formatNumber(video.viewCount)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <ThumbsUp className="w-3 h-3" />
                                          {formatNumber(video.likeCount)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MessageCircle className="w-3 h-3" />
                                          {formatNumber(video.commentCount)}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(video.publishedAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Video comparison summary */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <h3 className="font-bold text-gray-900 mb-3">Video Comparison Summary</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded-lg text-center">
                              <p className="text-sm text-gray-600">Avg. Views</p>
                              <p className="font-bold text-lg">
                                {channel1 && channel1Videos.length > 0 
                                  ? formatNumber(channel1Videos.reduce((sum, video) => sum + video.viewCount, 0) / channel1Videos.length) 
                                  : "N/A"}
                                <span className="text-sm font-normal text-gray-500"> vs </span>
                                {channel2 && channel2Videos.length > 0 
                                  ? formatNumber(channel2Videos.reduce((sum, video) => sum + video.viewCount, 0) / channel2Videos.length) 
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg text-center">
                              <p className="text-sm text-gray-600">Avg. Likes</p>
                              <p className="font-bold text-lg">
                                {channel1 && channel1Videos.length > 0 
                                  ? formatNumber(channel1Videos.reduce((sum, video) => sum + video.likeCount, 0) / channel1Videos.length) 
                                  : "N/A"}
                                <span className="text-sm font-normal text-gray-500"> vs </span>
                                {channel2 && channel2Videos.length > 0 
                                  ? formatNumber(channel2Videos.reduce((sum, video) => sum + video.likeCount, 0) / channel2Videos.length) 
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg text-center">
                              <p className="text-sm text-gray-600">Avg. Comments</p>
                              <p className="font-bold text-lg">
                                {channel1 && channel1Videos.length > 0 
                                  ? formatNumber(channel1Videos.reduce((sum, video) => sum + video.commentCount, 0) / channel1Videos.length) 
                                  : "N/A"}
                                <span className="text-sm font-normal text-gray-500"> vs </span>
                                {channel2 && channel2Videos.length > 0 
                                  ? formatNumber(channel2Videos.reduce((sum, video) => sum + video.commentCount, 0) / channel2Videos.length) 
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(showVideos === "channel1" ? channel1Videos : channel2Videos).map((video) => (
                          <div key={video.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="w-24 h-16 object-cover rounded"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{video.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {formatNumber(video.viewCount)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />
                                    {formatNumber(video.likeCount)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    {formatNumber(video.commentCount)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(video.publishedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Why This Channel is Better */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <InsightCard 
                    channel={channel1} 
                    isWinner={getChannelRank(channel1) < getChannelRank(channel2)}
                    comparisonData={{
                      channel1Subscribers: parseInt(channel1.subscriberCount),
                      channel2Subscribers: parseInt(channel2.subscriberCount),
                      channel1Views: parseInt(channel1.viewCount),
                      channel2Views: parseInt(channel2.viewCount)
                    }}
                  />
                  <InsightCard 
                    channel={channel2} 
                    isWinner={getChannelRank(channel2) < getChannelRank(channel1)}
                    comparisonData={{
                      channel1Subscribers: parseInt(channel1.subscriberCount),
                      channel2Subscribers: parseInt(channel2.subscriberCount),
                      channel1Views: parseInt(channel1.viewCount),
                      channel2Views: parseInt(channel2.viewCount)
                    }}
                  />
                </div>

                {/* Tips to Go Viral */}
                <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Tips to Go Viral</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <ViralTipsCard channel={channel1} tips={getViralTips(channel1)} />
                    <ViralTipsCard channel={channel2} tips={getViralTips(channel2)} />
                  </div>
                </div>

                {/* Enhanced Analytics */}
                <div className="space-y-6">
                  <EnhancedAnalyticsCard 
                    channel={channel1} 
                    videos={channel1Videos} 
                    isWinner={getChannelRank(channel1) < getChannelRank(channel2)} 
                  />
                  <EnhancedAnalyticsCard 
                    channel={channel2} 
                    videos={channel2Videos} 
                    isWinner={getChannelRank(channel2) < getChannelRank(channel1)} 
                  />
                </div>
              </div>
            )}
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