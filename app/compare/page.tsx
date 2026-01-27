"use client"

export const dynamic = 'force-dynamic'

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import SharedSidebar from "@/components/shared-sidebar"
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
  GitCompare
} from 'lucide-react'

interface YouTubeChannel {
  id: string
  title: string
  customUrl?: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
  viewCount: string
  publishedAt: string
  defaultLanguage?: string | null
  localized?: any
  country?: string | null
  channelKeywords?: string | null
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
  duration?: string | null
  localizations?: any
  privacyStatus?: string
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
        {channel.country && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10v6a2 2 0 0 1-2 2H7" /><path d="M3 6h18" /></svg>
            <span>Country: {channel.country}</span>
          </div>
        )}
        {channel.defaultLanguage && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">Default language:</span>
            <span>{channel.defaultLanguage}</span>
          </div>
        )}
        {channel.channelKeywords && (
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <span className="font-medium">Channel Keywords:</span>
            <span className="truncate">{channel.channelKeywords}</span>
          </div>
        )}
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
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [channel1Id, setChannel1Id] = useState("")
  const [channel2Id, setChannel2Id] = useState("")
  const [channel1, setChannel1] = useState<YouTubeChannel | null>(null)
  const [channel2, setChannel2] = useState<YouTubeChannel | null>(null)
  const [channel1Videos, setChannel1Videos] = useState<YouTubeVideo[]>([])
  const [channel2Videos, setChannel2Videos] = useState<YouTubeVideo[]>([])
  const [channel1Countries, setChannel1Countries] = useState<{ country: string, views: number }[]>([])
  const [channel2Countries, setChannel2Countries] = useState<{ country: string, views: number }[]>([])
  const [channel1Analytics, setChannel1Analytics] = useState<any>(null)
  const [channel2Analytics, setChannel2Analytics] = useState<any>(null)
  const [channel1TopVideosResolved, setChannel1TopVideosResolved] = useState<any[]>([])
  const [channel2TopVideosResolved, setChannel2TopVideosResolved] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVideos, setShowVideos] = useState<"channel1" | "channel2" | "comparison" | null>(null)
  const [videosLoading, setVideosLoading] = useState(false)
  const [channel1Loading, setChannel1Loading] = useState(false)
  const [channel2Loading, setChannel2Loading] = useState(false)

  const navLinks = [
    { icon: Home, label: "Dashboard", href: "/dashboard", id: "dashboard" },
    { icon: GitCompare, label: "Compare", href: "/compare", id: "compare" },
    { icon: Video, label: "Videos", href: "/videos", id: "videos" },
    { icon: Upload, label: "Bulk Upload", href: "/bulk-upload", id: "bulk-upload" },
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

  // Compute high-level difference summary
  const computeDiffSummary = (c1: YouTubeChannel, c2: YouTubeChannel) => {
    try {
      const s1 = parseInt(c1.subscriberCount)
      const s2 = parseInt(c2.subscriberCount)
      const v1 = parseInt(c1.viewCount)
      const v2 = parseInt(c2.viewCount)
      const e1 = parseFloat(calculateEngagementRate(c1))
      const e2 = parseFloat(calculateEngagementRate(c2))

      return {
        subscribersDiff: Math.abs(s1 - s2),
        viewsDiff: Math.abs(v1 - v2),
        engagementDiff: Math.abs(e1 - e2).toFixed(1),
        winnerIsChannel1: parseInt(getChannelRank(c1)) < parseInt(getChannelRank(c2))
      }
    } catch (e) {
      return { subscribersDiff: 0, viewsDiff: 0, engagementDiff: '0.0', winnerIsChannel1: true }
    }
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

  const fetchTopCountries = async (channelId: string, setter: (c: { country: string, views: number }[]) => void) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('youtube_access_token') : null
      if (!token) return setter([])
      const res = await fetch(`/api/youtube/analytics/topCountries?channelId=${encodeURIComponent(channelId)}&access_token=${encodeURIComponent(token)}`)
      const data = await res.json()
      if (data?.success && Array.isArray(data.countries)) {
        setter(data.countries)
      } else {
        console.warn('topCountries: no data', data)
        setter([])
      }
    } catch (e) {
      console.error('fetchTopCountries error', e)
      setter([])
    }
  }

  const fetchChannelAnalytics = async (channelId: string, setter: (a: any) => void) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('youtube_access_token') : null
      if (!token) return setter(null)
      const res = await fetch(`/api/youtube/analytics/summary?channelId=${encodeURIComponent(channelId)}&access_token=${encodeURIComponent(token)}`)
      const data = await res.json()
      if (data?.success) {
        setter(data)
      } else {
        console.warn('fetchChannelAnalytics: no data', data)
        setter(null)
      }
    } catch (e) {
      console.error('fetchChannelAnalytics error', e)
      setter(null)
    }
  }

  const fetchVideoDetails = async (ids: string[]) => {
    if (!ids || !ids.length) return []
    try {
      const res = await fetch(`/api/youtube/videosByIds?ids=${encodeURIComponent(ids.join(','))}`)
      const data = await res.json()
      if (data?.success) return data.videos
    } catch (e) {
      console.error('fetchVideoDetails error', e)
    }
    return []
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

      // also fetch a small set of recent videos for each channel to populate keywords/analytics
      setVideosLoading(true)
      const [c1Videos, c2Videos] = await Promise.all([
        fetchChannelVideos(channel1Id),
        fetchChannelVideos(channel2Id)
      ])

      setChannel1(channel1Data)
      setChannel2(channel2Data)
      setChannel1Videos(c1Videos || [])
      setChannel2Videos(c2Videos || [])
      // attempt to fetch top countries if owner token available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('youtube_access_token')
        if (token) {
          fetchTopCountries(channel1Id, setChannel1Countries)
          fetchTopCountries(channel2Id, setChannel2Countries)
          fetchChannelAnalytics(channel1Id, setChannel1Analytics)
          fetchChannelAnalytics(channel2Id, setChannel2Analytics)
            // resolve top video IDs to titles+thumbnails for better UX
            ; (async () => {
              try {
                const c1vids = (c1Videos || []).slice(0, 5).map((v: any) => v.id)
                const c2vids = (c2Videos || []).slice(0, 5).map((v: any) => v.id)
                const [r1, r2] = await Promise.all([fetchVideoDetails(c1vids), fetchVideoDetails(c2vids)])
                setChannel1TopVideosResolved(r1)
                setChannel2TopVideosResolved(r2)
              } catch (e) {
                console.warn('resolve top videos failed', e)
              }
            })()
        }
      }
      setShowVideos(null)
    } catch (err: any) {
      setError(err.message || "Error comparing channels")
    } finally {
      setLoading(false)
      setVideosLoading(false)
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

  // Top keywords derived from recent videos
  const channel1TopKeywords = React.useMemo(() => computeTopKeywords(channel1Videos), [channel1Videos])
  const channel2TopKeywords = React.useMemo(() => computeTopKeywords(channel2Videos), [channel2Videos])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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

      <div className="flex flex-1">
        {/* Shared Sidebar */}
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="compare" isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
        {/* Main Content */}
        <main className="flex-1 pt-20 md:pt-20 md:ml-72 pb-16 md:pb-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

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
                      onClick={async () => {
                        if (!channel1Id?.trim()) return
                        setError(null)
                        try {
                          setChannel1Loading(true)
                          const ch = await fetchChannelData(channel1Id.trim())
                          setChannel1(ch)
                          setShowVideos(null)
                        } catch (err: any) {
                          setError(err.message || 'Error fetching channel')
                        } finally {
                          setChannel1Loading(false)
                        }
                      }}
                      disabled={!channel1Id || channel1Loading}
                    >
                      {channel1Loading ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
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
                      onClick={async () => {
                        if (!channel2Id?.trim()) return
                        setError(null)
                        try {
                          setChannel2Loading(true)
                          const ch = await fetchChannelData(channel2Id.trim())
                          setChannel2(ch)
                          setShowVideos(null)
                        } catch (err: any) {
                          setError(err.message || 'Error fetching channel')
                        } finally {
                          setChannel2Loading(false)
                        }
                      }}
                      disabled={!channel2Id || channel2Loading}
                    >
                      {channel2Loading ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
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
                {/* Quick Summary Cards */}
                {
                  (() => {
                    const diff = computeDiffSummary(channel1, channel2)
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg bg-white border ${diff.winnerIsChannel1 ? 'border-green-100' : 'border-gray-100'}`}>
                          <div className="text-xs text-gray-500">Subscribers gap</div>
                          <div className="mt-2 text-2xl font-bold text-gray-900">{formatNumber(diff.subscribersDiff)}</div>
                          <div className="text-xs text-gray-500 mt-1">{diff.winnerIsChannel1 ? channel1.title + ' leads' : channel2.title + ' leads'}</div>
                        </div>

                        <div className={`p-4 rounded-lg bg-white border ${diff.winnerIsChannel1 ? 'border-gray-100' : 'border-green-100'}`}>
                          <div className="text-xs text-gray-500">Views gap</div>
                          <div className="mt-2 text-2xl font-bold text-gray-900">{formatNumber(diff.viewsDiff)}</div>
                          <div className="text-xs text-gray-500 mt-1">{diff.winnerIsChannel1 ? channel1.title + ' leads' : channel2.title + ' leads'}</div>
                        </div>

                        <div className="p-4 rounded-lg bg-white border border-gray-100">
                          <div className="text-xs text-gray-500">Engagement difference</div>
                          <div className="mt-2 text-2xl font-bold text-gray-900">{diff.engagementDiff}%</div>
                          <div className="text-xs text-gray-500 mt-1">Higher = better</div>
                        </div>
                      </div>
                    )
                  })()
                }
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

                {/* Top Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Top Keywords — {channel1.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {channel1TopKeywords.length ? channel1TopKeywords.map(k => (
                        <span key={k} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{k}</span>
                      )) : <span className="text-sm text-gray-500">No keywords found</span>}
                    </div>
                    <div className="mt-3">
                      <h5 className="font-medium text-sm mb-2">Top Countries (last 365 days)</h5>
                      {channel1Countries.length ? (
                        <ol className="text-xs text-gray-700 space-y-1">
                          {channel1Countries.map(c => (
                            <li key={c.country} className="flex justify-between">
                              <span>{c.country}</span>
                              <span className="font-semibold">{formatNumber(c.views)}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-xs text-gray-500">No country data. Connect owner access token to fetch analytics.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Top Keywords — {channel2.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      {channel2TopKeywords.length ? channel2TopKeywords.map(k => (
                        <span key={k} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">{k}</span>
                      )) : <span className="text-sm text-gray-500">No keywords found</span>}
                    </div>
                    <div className="mt-3">
                      <h5 className="font-medium text-sm mb-2">Top Countries (last 365 days)</h5>
                      {channel2Countries.length ? (
                        <ol className="text-xs text-gray-700 space-y-1">
                          {channel2Countries.map(c => (
                            <li key={c.country} className="flex justify-between">
                              <span>{c.country}</span>
                              <span className="font-semibold">{formatNumber(c.views)}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-xs text-gray-500">No country data. Connect owner access token to fetch analytics.</p>
                      )}
                    </div>
                  </div>
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
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <span>{channel1.title}</span>
                              {parseInt(getChannelRank(channel1)) < parseInt(getChannelRank(channel2)) && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Winner</span>
                              )}
                            </div>
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            <div className="flex items-center gap-2">
                              <span>{channel2.title}</span>
                              {parseInt(getChannelRank(channel2)) < parseInt(getChannelRank(channel1)) && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Winner</span>
                              )}
                            </div>
                          </th>
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
                                      <div className="mt-3 text-xs text-gray-600 space-y-1">
                                        <div><strong>Duration:</strong> {formatDuration(video.duration ?? null)}</div>
                                        <div><strong>Status:</strong> {video.privacyStatus || 'N/A'}</div>
                                        {video.localizations && typeof video.localizations === 'object' && (
                                          <div><strong>Localizations:</strong> {Object.keys(video.localizations).join(', ')}</div>
                                        )}
                                        {video.tags && video.tags.length > 0 && (
                                          <div><strong>Tags:</strong> {video.tags.slice(0, 5).join(', ')}</div>
                                        )}
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
                                      <div className="mt-3 text-xs text-gray-600 space-y-1">
                                        <div><strong>Duration:</strong> {formatDuration(video.duration ?? null)}</div>
                                        <div><strong>Status:</strong> {video.privacyStatus || 'N/A'}</div>
                                        {video.localizations && typeof video.localizations === 'object' && (
                                          <div><strong>Localizations:</strong> {Object.keys(video.localizations).join(', ')}</div>
                                        )}
                                        {video.tags && video.tags.length > 0 && (
                                          <div><strong>Tags:</strong> {video.tags.slice(0, 5).join(', ')}</div>
                                        )}
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
                                <div className="mt-3 text-xs text-gray-600 space-y-1">
                                  <div><strong>Duration:</strong> {formatDuration(video.duration ?? null)}</div>
                                  <div><strong>Status:</strong> {video.privacyStatus || 'N/A'}</div>
                                  {video.localizations && typeof video.localizations === 'object' && (
                                    <div><strong>Localizations:</strong> {Object.keys(video.localizations).join(', ')}</div>
                                  )}
                                  {video.tags && video.tags.length > 0 && (
                                    <div><strong>Tags:</strong> {video.tags.slice(0, 5).join(', ')}</div>
                                  )}
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

                {/* Expanded Analytics & Recommendations */}
                <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 mt-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Why They Went Viral & Recommendations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">{channel1.title} — Summary</h3>
                      {channel1Analytics ? (
                        <div className="text-sm text-gray-700 space-y-2">
                          <div><strong>Total views (period):</strong> {formatNumber(channel1Analytics.summary?.totalViews || 0)}</div>
                          <div><strong>Total watch minutes (period):</strong> {formatNumber(channel1Analytics.summary?.totalWatchMinutes || 0)}</div>
                          <div><strong>Top videos:</strong></div>
                          <ol className="text-xs list-decimal ml-5 space-y-1 mt-1">
                            {channel1TopVideosResolved.length ? (
                              channel1TopVideosResolved.map((vv: any) => (
                                <li key={vv.id} className="flex items-center gap-3">
                                  <img src={vv.thumbnail} alt={vv.title} className="w-16 h-10 object-cover rounded" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{vv.title}</div>
                                    <div className="text-xs text-gray-500">Views: {formatNumber(vv.viewCount)}</div>
                                  </div>
                                </li>
                              ))
                            ) : (
                              (channel1Analytics.topVideos || []).map((v: any) => (
                                <li key={v.videoId} className="flex justify-between">
                                  <span>{v.videoId}</span>
                                  <span className="font-semibold">{formatNumber(v.views)}</span>
                                </li>
                              ))
                            )}
                          </ol>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Connect owner access token to fetch analytics summary.</p>
                      )}
                      <div className="mt-3">
                        <h4 className="font-medium">Recommendations</h4>
                        <ul className="text-sm text-gray-700 list-disc ml-5 mt-2 space-y-1">
                          <li>Improve first 10 seconds hook if average view duration is low.</li>
                          <li>Optimize thumbnails: use high-contrast faces/text and A/B test thumbnails.</li>
                          <li>Include top keywords in title and first 3 tags.</li>
                          <li>Post at the channel's best day/hour shown above to maximize initial velocity.</li>
                          <li>Consider localizing titles/descriptions for top countries ({channel1Countries.map(c => c.country).slice(0, 3).join(', ') || 'N/A'}).</li>
                          {channel1TopKeywords && channel1TopKeywords.length > 0 && (
                            <li>Example improved title: "{channel1TopKeywords[0].slice(0, 40)} — {channel1.title.split(' ')[0]} Review"</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">{channel2.title} — Summary</h3>
                      {channel2Analytics ? (
                        <div className="text-sm text-gray-700 space-y-2">
                          <div><strong>Total views (period):</strong> {formatNumber(channel2Analytics.summary?.totalViews || 0)}</div>
                          <div><strong>Total watch minutes (period):</strong> {formatNumber(channel2Analytics.summary?.totalWatchMinutes || 0)}</div>
                          <div><strong>Top videos:</strong></div>
                          <ol className="text-xs list-decimal ml-5 space-y-1 mt-1">
                            {channel2TopVideosResolved.length ? (
                              channel2TopVideosResolved.map((vv: any) => (
                                <li key={vv.id} className="flex items-center gap-3">
                                  <img src={vv.thumbnail} alt={vv.title} className="w-16 h-10 object-cover rounded" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{vv.title}</div>
                                    <div className="text-xs text-gray-500">Views: {formatNumber(vv.viewCount)}</div>
                                  </div>
                                </li>
                              ))
                            ) : (
                              (channel2Analytics.topVideos || []).map((v: any) => (
                                <li key={v.videoId} className="flex justify-between">
                                  <span>{v.videoId}</span>
                                  <span className="font-semibold">{formatNumber(v.views)}</span>
                                </li>
                              ))
                            )}
                          </ol>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Connect owner access token to fetch analytics summary.</p>
                      )}
                      <div className="mt-3">
                        <h4 className="font-medium">Recommendations</h4>
                        <ul className="text-sm text-gray-700 list-disc ml-5 mt-2 space-y-1">
                          <li>Focus on video formats that produce the highest watch time (see top videos).</li>
                          <li>Use keywords found above and in tags to improve discoverability.</li>
                          <li>Encourage engagement (likes/comments) early in the video to boost ranking.</li>
                          <li>Try short, attention-grabbing intros to improve average view duration.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
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

// Helper to compute top keywords from video titles and tags
function computeTopKeywords(videos: YouTubeVideo[], topN = 8) {
  const counts: Record<string, number> = {}
  videos.forEach((v) => {
    try {
      // Normalize title to string
      const rawTitle = typeof v.title === 'string' ? v.title : (v.title ? String(v.title) : '')
      const titleWords = rawTitle
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w && w.length > 3)
      if (Array.isArray(titleWords)) {
        titleWords.forEach((w) => (counts[w] = (counts[w] || 0) + 1))
      }

      // Normalize tags to array
      let tagsArr: string[] = []
      if (Array.isArray(v.tags)) {
        tagsArr = v.tags as string[]
      }

      tagsArr.forEach((t: string) => {
        const tag = (t || '').toLowerCase().trim()
        if (tag.length > 2) counts[tag] = (counts[tag] || 0) + 2
      })
    } catch (e) {
      // Defensive: skip problematic video entry
      console.warn('computeTopKeywords: skipping video due to error', e, v)
    }
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, topN).map(e => e[0])
}

function formatDuration(iso: string | null) {
  if (!iso) return 'N/A'
  try {
    // Simple ISO 8601 PT#H#M#S parser
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return iso
    const h = parseInt(match[1] || '0', 10)
    const m = parseInt(match[2] || '0', 10)
    const s = parseInt(match[3] || '0', 10)
    if (h) return `${h}h ${m}m ${s}s`
    if (m) return `${m}m ${s}s`
    return `${s}s`
  } catch (e) {
    return iso
  }
}