"use client"

import { useState } from "react"
import Link from "next/link"
import SharedSidebar from "@/components/shared-sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Video, Calendar, Eye, ThumbsUp, MessageSquare, User, Hash, Clock,
  TrendingUp, BarChart3, Award, ExternalLink, FileText, Activity,
  TrendingDown, Target, Zap, CheckCircle, AlertCircle, Users, Globe,
  PlayCircle, Settings, Star, Bookmark, TrendingUp as Growth, Sparkles,
  PieChart, Upload, Sun, Moon, MapPin, Link2, Heart
} from "lucide-react"

interface VideoData {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  viewCount: string
  likeCount: string
  commentCount: string
  favoriteCount: string
  channelTitle: string
  channelId: string
  duration: string
  tags: string[]
  categoryId: string
  contentDetails?: any
  status?: any
  snippet?: any
}

interface DetailedVideoData extends VideoData {
  engagementRate: number
  viewsPerDay: number
  category: string
  uploadHour: number
  uploadDay: string
  daysOld: number
  performance: 'excellent' | 'good' | 'average' | 'poor'
}

interface ChannelData {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  subscriberCount: string
  viewCount: string
  videoCount: string
  country?: string
  customUrl?: string
  defaultLanguage?: string
  keywords?: string
  topVideos?: DetailedVideoData[]
  recentVideos?: DetailedVideoData[]
  uploadSchedule?: any
  averageViews?: number
  engagementRate?: number
  growthRate?: number
  bestPerformingCategories?: string[]
  uploadTimes?: { hour: number; count: number }[]
  uploadDays?: { day: number; count: number }[]
  channelAge: number
  healthScore: number
  consistencyScore: number
  trendsScore: number
}

export default function VideoInfoPage() {
  const [inputUrl, setInputUrl] = useState("")
  const [analysisType, setAnalysisType] = useState<'video' | 'channel'>('video')
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [channelData, setChannelData] = useState<ChannelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const [showFullDesc, setShowFullDesc] = useState(false)

  const extractVideoId = (url: string): string | null => {
    try {
      url = url.trim()
      let match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
      if (match) return match[1]
      match = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/)
      if (match) return match[1]
      match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
      if (match) return match[1]
      match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
      if (match) return match[1]
      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
      return null
    } catch (e) {
      return null
    }
  }

  const extractChannelId = (url: string): string | null => {
    try {
      url = url.trim()
      // Channel ID format: UCxxxxxxxxxxxxxxxxxx (24 characters)
      let match = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]{24})/)
      if (match) return match[1]
      // Custom URL format: @username or /c/username or /user/username
      match = url.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/)
      if (match) return `@${match[1]}`
      match = url.match(/youtube\.com\/c\/([a-zA-Z0-9_.-]+)/)
      if (match) return `c/${match[1]}`
      match = url.match(/youtube\.com\/user\/([a-zA-Z0-9_.-]+)/)
      if (match) return `user/${match[1]}`
      // Direct channel ID
      if (/^UC[a-zA-Z0-9_-]{22}$/.test(url)) return url
      // @username format
      if (/^@[a-zA-Z0-9_.-]+$/.test(url)) return url
      return null
    } catch (e) {
      return null
    }
  }

  const fetchVideoData = async () => {
    try {
      setLoading(true)
      setError(null)
      setChannelData(null)
      const videoId = extractVideoId(inputUrl)
      if (!videoId) throw new Error("Invalid YouTube video URL. Supports videos & Shorts")

      if (typeof window === 'undefined') return
      
      const accessToken = localStorage.getItem('youtube_access_token')
      const response = await fetch(`/api/youtube/videosByIds?ids=${videoId}${accessToken ? `&access_token=${accessToken}` : ''}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to fetch video')
      if (!data.videos || data.videos.length === 0) throw new Error("Video not found")

      setVideoData(data.videos[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch video")
    } finally {
      setLoading(false)
    }
  }

  const fetchChannelData = async () => {
    try {
      setLoading(true)
      setError(null)
      setVideoData(null)
      const channelId = extractChannelId(inputUrl)
      if (!channelId) throw new Error("Invalid YouTube channel URL. Supports /channel/, /@username, /c/, /user/ formats")

      if (typeof window === 'undefined') return
      
      const accessToken = localStorage.getItem('youtube_access_token')
      const response = await fetch(`/api/youtube/channel-analysis?id=${encodeURIComponent(channelId)}${accessToken ? `&access_token=${accessToken}` : ''}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to fetch channel data')
      if (!data.channel) throw new Error("Channel not found")

      setChannelData(data.channel)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch channel data")
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = () => {
    setInputError(null)
    setError(null)

    if (!inputUrl.trim()) {
      setInputError('Please enter a YouTube URL')
      return
    }

    if (analysisType === 'video') {
      if (!extractVideoId(inputUrl)) {
        setInputError('Please enter a valid YouTube video or Shorts URL')
        return
      }
      fetchVideoData()
    } else {
      if (!extractChannelId(inputUrl)) {
        setInputError('Please enter a valid YouTube channel URL (e.g., /channel/ or @username)')
        return
      }
      fetchChannelData()
    }
  }

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  // Reusable card base to match Dashboard style
  const cardBase = 'group relative bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-sm'

  const formatDuration = (duration: string) => { 
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return duration
    const h = parseInt(match[1] || '0'), m = parseInt(match[2] || '0'), s = parseInt(match[3] || '0')
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const calculateEngagementRate = () => {
    if (!videoData) return 0
    const views = parseInt(videoData.viewCount)
    const likes = parseInt(videoData.likeCount)
    const comments = parseInt(videoData.commentCount)
    return views > 0 ? (((likes + comments) / views) * 100).toFixed(2) : 0
  }

  const calculateLikeRatio = () => {
    if (!videoData) return 0
    const views = parseInt(videoData.viewCount)
    const likes = parseInt(videoData.likeCount)
    return views > 0 ? ((likes / views) * 100).toFixed(2) : 0
  }

  const calculateAvgViewsPerDay = () => {
    if (!videoData) return 0
    const views = parseInt(videoData.viewCount)
    const publishedDate = new Date(videoData.publishedAt)
    const daysSincePublished = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysSincePublished > 0 ? Math.round(views / daysSincePublished) : views
  }

  const getPerformanceInsights = () => {
    if (!videoData) return { sections: [], viralScore: 0 }

    const engagementRate = parseFloat(String(calculateEngagementRate()))
    const likeRatio = parseFloat(String(calculateLikeRatio()))
    const views = parseInt(videoData.viewCount)
    const likes = parseInt(videoData.likeCount)
    const comments = parseInt(videoData.commentCount)
    const avgViewsPerDay = calculateAvgViewsPerDay()
    const publishedDate = new Date(videoData.publishedAt)
    const daysSincePublished = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate viral score (0-100)
    let viralScore = 0
    if (views > 1000000) viralScore += 30
    else if (views > 100000) viralScore += 20
    else if (views > 10000) viralScore += 10

    if (engagementRate > 5) viralScore += 25
    else if (engagementRate > 2) viralScore += 15
    else if (engagementRate > 1) viralScore += 5

    if (likeRatio > 4) viralScore += 20
    else if (likeRatio > 2) viralScore += 10

    if (avgViewsPerDay > 10000) viralScore += 15
    else if (avgViewsPerDay > 1000) viralScore += 10
    else if (avgViewsPerDay > 100) viralScore += 5

    if (comments > 1000) viralScore += 10
    else if (comments > 100) viralScore += 5

    // Calculate content quality rankings (out of 100)

    // Thumbnail Rank (based on view count and engagement)
    let thumbnailRank = 0
    if (views > 1000000) thumbnailRank += 40 // High views suggest good thumbnail
    else if (views > 100000) thumbnailRank += 30
    else if (views > 10000) thumbnailRank += 20
    else if (views > 1000) thumbnailRank += 10

    if (engagementRate > 5) thumbnailRank += 30 // High engagement = compelling thumbnail
    else if (engagementRate > 3) thumbnailRank += 20
    else if (engagementRate > 1) thumbnailRank += 10

    if (likeRatio > 4) thumbnailRank += 30 // Positive sentiment = thumbnail matched expectations
    else if (likeRatio > 2) thumbnailRank += 20
    else if (likeRatio > 1) thumbnailRank += 10

    // Title Rank (based on length, views, and engagement)
    let titleRank = 0
    if (videoData.title.length >= 40 && videoData.title.length <= 60) titleRank += 30 // Optimal length
    else if (videoData.title.length >= 30 && videoData.title.length <= 70) titleRank += 20
    else titleRank += 10

    if (views > 100000) titleRank += 35 // High views = effective title
    else if (views > 10000) titleRank += 25
    else if (views > 1000) titleRank += 15

    const hasNumbers = /\d/.test(videoData.title)
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(videoData.title)
    const hasCapitals = /[A-Z]/.test(videoData.title)
    if (hasNumbers) titleRank += 10 // Numbers attract clicks
    if (hasEmoji) titleRank += 10 // Emojis stand out
    if (hasCapitals) titleRank += 5 // Proper capitalization

    if (engagementRate > 3) titleRank += 10 // Title delivered on promise

    // Description Rank (based on length, keywords, and SEO)
    let descriptionRank = 0
    if (videoData.description.length > 1000) descriptionRank += 40 // Comprehensive
    else if (videoData.description.length > 500) descriptionRank += 30
    else if (videoData.description.length > 200) descriptionRank += 20
    else if (videoData.description.length > 50) descriptionRank += 10

    const hasLinks = /https?:\/\//.test(videoData.description)
    const hasHashtags = /#\w+/.test(videoData.description)
    const hasTimestamps = /\d{1,2}:\d{2}/.test(videoData.description)
    if (hasLinks) descriptionRank += 15 // Good for engagement
    if (hasHashtags) descriptionRank += 15 // Good for discovery
    if (hasTimestamps) descriptionRank += 15 // Great for user experience

    if (videoData.tags && videoData.tags.length > 10) descriptionRank += 15 // Well optimized
    else if (videoData.tags && videoData.tags.length > 5) descriptionRank += 10

    // Detect if it's a Short
    const isShort = videoData.categoryId === "42" ||
      videoData.contentDetails?.duration?.match(/PT(\d+)S/) &&
      parseInt(videoData.contentDetails.duration.match(/PT(\d+)S/)?.[1] || "0") <= 60

    // Upload time analysis
    const uploadHour = publishedDate.getHours()
    const uploadDay = publishedDate.getDay() // 0 = Sunday, 6 = Saturday
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // Best upload times based on research (EST timezone typical)
    const bestUploadHours = [14, 15, 16, 17, 18, 19, 20] // 2 PM - 8 PM
    const bestUploadDays = [4, 5, 6, 0] // Thursday, Friday, Saturday, Sunday

    const uploadedAtGoodTime = bestUploadHours.includes(uploadHour)
    const uploadedOnGoodDay = bestUploadDays.includes(uploadDay)

    const sections = [
      {
        title: "🎯 Viral Potential Score",
        items: [
          {
            label: "Overall Viral Score",
            value: `${viralScore}/100`,
            description: viralScore > 70 ? "Exceptional viral performance! This video has all the markers of viral content." :
              viralScore > 50 ? "Strong performance with good viral potential. Room for optimization." :
                viralScore > 30 ? "Moderate performance. Several areas need improvement for viral growth." :
                  "Low viral indicators. Significant optimization needed.",
            type: viralScore > 70 ? 'success' : viralScore > 50 ? 'info' : 'warning'
          }
        ]
      },
      {
        title: "📊 Why This Video Got Views - Deep Analysis",
        items: [
          {
            label: "View Velocity",
            value: `${formatNumber(avgViewsPerDay)} views/day`,
            description: avgViewsPerDay > 10000 ? "Exceptional view velocity! The algorithm is heavily promoting this content. This indicates strong click-through rates and watch time." :
              avgViewsPerDay > 1000 ? "Strong daily view growth. The video is being recommended consistently, suggesting good audience retention." :
                avgViewsPerDay > 100 ? "Moderate growth rate. The video is getting some algorithmic push but could benefit from better optimization." :
                  "Slow growth. The video may not be triggering YouTube's recommendation algorithm effectively. Focus on improving thumbnails, titles, and first 30 seconds.",
            type: avgViewsPerDay > 1000 ? 'success' : avgViewsPerDay > 100 ? 'info' : 'warning'
          },
          {
            label: "Engagement Quality",
            value: `${engagementRate}% engagement rate`,
            description: engagementRate > 5 ? "Outstanding engagement! Viewers are highly invested. This signals to YouTube that your content is valuable, triggering more recommendations. The audience is not just watching but actively participating." :
              engagementRate > 2 ? "Good engagement levels. Viewers are interacting with your content, which helps with algorithmic promotion. Consider adding more calls-to-action to boost this further." :
                engagementRate > 1 ? "Below average engagement. Viewers are watching but not interacting. Add clear CTAs, ask questions, create controversy (tastefully), or add interactive elements." :
                  "Very low engagement. This is a red flag for the algorithm. Your content may be passive consumption. Add hooks, questions, polls, and strong CTAs to encourage interaction.",
            type: engagementRate > 5 ? 'success' : engagementRate > 2 ? 'info' : 'warning'
          },
          {
            label: "Audience Sentiment",
            value: `${likeRatio}% like ratio`,
            description: likeRatio > 4 ? "Exceptional like ratio! Your audience loves this content. This is a strong signal to YouTube that the content is high-quality and should be promoted more widely." :
              likeRatio > 2 ? "Positive audience reception. The content resonates well, though there's room to increase emotional impact and value delivery." :
                likeRatio > 1 ? "Mixed reception. Some viewers appreciate it, but many are neutral. Consider improving content quality, pacing, or value proposition." :
                  "Low like ratio suggests content isn't resonating. Review competitor videos in your niche to understand what audiences respond to positively.",
            type: likeRatio > 4 ? 'success' : likeRatio > 2 ? 'info' : 'warning'
          },
          {
            label: "Social Proof Factor",
            value: `${formatNumber(views)} total views`,
            description: views > 1000000 ? "Massive social proof! This view count creates a snowball effect - people click because others have watched. This is viral territory." :
              views > 100000 ? "Strong social proof. The high view count attracts more clicks. You've crossed the threshold where views beget more views." :
                views > 10000 ? "Building social proof. You're approaching the tipping point where view count starts attracting organic clicks." :
                  views > 1000 ? "Limited social proof. Focus on getting initial traction through promotion, communities, and optimization." :
                    "Very low views. Need aggressive promotion and optimization to build initial momentum.",
            type: views > 100000 ? 'success' : views > 10000 ? 'info' : 'warning'
          }
        ]
      },
      {
        title: "🎬 Content Quality Indicators",
        items: [
          {
            label: "Title Optimization",
            value: `${videoData.title.length} characters`,
            description: videoData.title.length >= 40 && videoData.title.length <= 60 ? "Perfect title length! Fully visible in search results and recommendations while being descriptive enough to attract clicks." :
              videoData.title.length > 60 ? `Title is too long (${videoData.title.length} chars). It will be truncated in search results, potentially hiding key information. Aim for 40-60 characters for maximum impact.` :
                videoData.title.length < 40 ? "Title is short. While this isn't always bad, you may be missing opportunities to include compelling keywords or emotional triggers. Consider expanding slightly." :
                  "Title length needs optimization.",
            type: videoData.title.length >= 40 && videoData.title.length <= 60 ? 'success' : 'warning'
          },
          {
            label: "Description Depth",
            value: `${videoData.description.length} characters`,
            description: videoData.description.length > 500 ? "Comprehensive description! This helps with SEO and provides context for viewers and the algorithm. Rich descriptions improve discoverability." :
              videoData.description.length > 200 ? "Decent description length. Consider expanding with timestamps, links, and more keywords to improve SEO." :
                videoData.description.length > 0 ? "Minimal description. You're missing a huge SEO opportunity. Add detailed descriptions, timestamps, relevant links, and keywords." :
                  "No description! This severely limits discoverability. Always add a detailed description with keywords.",
            type: videoData.description.length > 500 ? 'success' : videoData.description.length > 200 ? 'info' : 'warning'
          },
          {
            label: "Comment Activity",
            value: `${formatNumber(comments)} comments`,
            description: comments > 1000 ? "Exceptional comment activity! High comment counts signal active community engagement and boost algorithmic promotion significantly." :
              comments > 100 ? "Good comment engagement. The audience is participating in discussions, which YouTube rewards with better visibility." :
                comments > 10 ? "Moderate comment activity. Encourage more discussion by asking questions, creating debate, or responding to every comment." :
                  "Low comment count. Pin a comment asking a question, respond to all comments, and create content that sparks discussion.",
            type: comments > 1000 ? 'success' : comments > 100 ? 'info' : 'warning'
          }
        ]
      },
      {
        title: "🚀 Growth Trajectory Analysis",
        items: [
          {
            label: "Age vs Performance",
            value: `${daysSincePublished} days old`,
            description: daysSincePublished < 7 && views > 10000 ? "Explosive early growth! The video is performing exceptionally well in its first week. This often indicates viral potential." :
              daysSincePublished < 30 && views > 50000 ? "Strong first month performance. The video has momentum and is being pushed by the algorithm." :
                daysSincePublished > 365 && avgViewsPerDay > 100 ? "Evergreen content! Still getting consistent views after a year. This is the holy grail - sustainable, long-term traffic." :
                  daysSincePublished > 90 && avgViewsPerDay < 50 ? "Older video with declining views. Consider updating the title/thumbnail or creating a follow-up video." :
                    "Standard growth pattern for this age.",
            type: (daysSincePublished < 7 && views > 10000) || (daysSincePublished > 365 && avgViewsPerDay > 100) ? 'success' : 'info'
          },
          {
            label: "Momentum Indicator",
            value: avgViewsPerDay > 1000 ? "High Momentum" : avgViewsPerDay > 100 ? "Building Momentum" : "Low Momentum",
            description: avgViewsPerDay > 10000 ? "The video is in viral acceleration mode. Views are compounding rapidly. Capitalize on this by creating similar content immediately." :
              avgViewsPerDay > 1000 ? "Strong momentum. The algorithm is actively promoting this. Create follow-up content to ride this wave." :
                avgViewsPerDay > 100 ? "Moderate momentum. The video is growing steadily. Optimize and promote to increase velocity." :
                  "Momentum has stalled. Consider refreshing the thumbnail, updating the title, or promoting through other channels.",
            type: avgViewsPerDay > 1000 ? 'success' : avgViewsPerDay > 100 ? 'info' : 'warning'
          }
        ]
      },
      {
        title: "🎯 Optimization Recommendations",
        items: [
          {
            label: "Primary Action",
            value: viralScore > 70 ? "Scale & Replicate" : viralScore > 50 ? "Optimize & Promote" : "Rebuild & Relaunch",
            description: viralScore > 70 ? "This video is performing excellently. Create more content in this style immediately. Analyze what worked and replicate the formula. Consider creating a series or follow-up videos." :
              viralScore > 50 ? "Good foundation but needs optimization. Focus on improving CTR (thumbnail/title), watch time (hook/pacing), and engagement (CTAs). Promote through communities and social media." :
                viralScore > 30 ? "Significant improvements needed. Study top performers in your niche. Rebuild your content strategy focusing on hooks, value delivery, and audience retention." :
                  "Complete strategy overhaul required. Research your target audience deeply, study viral videos in your niche, and focus on creating genuinely valuable or entertaining content.",
            type: viralScore > 70 ? 'success' : viralScore > 50 ? 'info' : 'warning'
          },
          {
            label: "Engagement Boost Strategy",
            value: engagementRate > 3 ? "Maintain & Scale" : "Needs Improvement",
            description: engagementRate < 2 ? "Critical: Add strong CTAs every 2-3 minutes. Ask questions, create polls, pin engaging comments, respond to all comments within first hour, create controversy (tastefully), use pattern interrupts." :
              engagementRate < 4 ? "Add more interactive elements: timestamps, chapters, cards, end screens. Ask viewers to comment their opinions. Create debate-worthy content." :
                "Engagement is strong. Keep doing what you're doing and test new engagement tactics to push even higher.",
            type: engagementRate > 3 ? 'success' : 'warning'
          },
          {
            label: "SEO Enhancement",
            value: videoData.tags && videoData.tags.length > 10 ? "Well Optimized" : "Needs Work",
            description: !videoData.tags || videoData.tags.length === 0 ? "Critical: Add 10-15 relevant tags immediately. Use a mix of broad and specific keywords. Include your niche, topic, and related terms." :
              videoData.tags.length < 5 ? "Add more tags. Research what top videos in your niche use. Include variations of your main keywords." :
                videoData.tags.length < 10 ? "Good start but add 5-10 more tags. Use TubeBuddy or VidIQ to find high-performing keywords in your niche." :
                  "Tag optimization is solid. Ensure they're relevant and match search intent.",
            type: videoData.tags && videoData.tags.length > 10 ? 'success' : 'warning'
          }
        ]
      },
      {
        title: "💡 Advanced Insights",
        items: [
          {
            label: "Virality Factors Present",
            value: `${[
              views > 100000 ? "High views" : null,
              engagementRate > 3 ? "Strong engagement" : null,
              likeRatio > 3 ? "Positive sentiment" : null,
              avgViewsPerDay > 1000 ? "Fast growth" : null,
              comments > 500 ? "Active community" : null
            ].filter(Boolean).length}/5 factors`,
            description: "Viral videos typically have: (1) High view count creating social proof, (2) Strong engagement signaling quality, (3) Positive like ratio showing audience love, (4) Fast daily growth indicating algorithmic push, (5) Active comments showing community. " +
              (views > 100000 && engagementRate > 3 && likeRatio > 3 ? "You have the core viral factors! Focus on maintaining momentum." :
                "Missing key viral factors. Focus on the gaps to unlock viral potential."),
            type: [views > 100000, engagementRate > 3, likeRatio > 3, avgViewsPerDay > 1000, comments > 500].filter(Boolean).length >= 3 ? 'success' : 'warning'
          },
          {
            label: "Competitive Position",
            value: getCategoryName(videoData.categoryId),
            description: views > 100000 ? `In the ${getCategoryName(videoData.categoryId)} category, you're performing in the top tier. This view count puts you ahead of most creators in this space.` :
              views > 10000 ? `For ${getCategoryName(videoData.categoryId)}, you're in the middle pack. Study the top 10 videos in your niche to understand what separates good from great.` :
                `In ${getCategoryName(videoData.categoryId)}, you're still building traction. Research what's working for top creators and adapt their successful patterns.`,
            type: views > 100000 ? 'success' : views > 10000 ? 'info' : 'warning'
          },
          {
            label: "Audience Retention Signal",
            value: engagementRate > 4 ? "Excellent" : engagementRate > 2 ? "Good" : "Needs Work",
            description: "High engagement rate typically correlates with good watch time. " +
              (engagementRate > 4 ? "Your engagement suggests viewers are watching most of the video. The algorithm loves this and will promote your content more." :
                engagementRate > 2 ? "Decent retention implied. Focus on improving your hook (first 30 seconds) and pacing to keep viewers watching longer." :
                  "Low engagement often means viewers are leaving early. Analyze your audience retention graph in YouTube Studio and fix the drop-off points."),
            type: engagementRate > 4 ? 'success' : engagementRate > 2 ? 'info' : 'warning'
          }
        ]
      },
      {
        title: "📈 Next Steps for Maximum Growth",
        items: [
          {
            label: "Immediate Actions (Next 24 hours)",
            value: "Critical optimizations",
            description: [
              engagementRate < 2 ? "• Pin an engaging question in comments to boost engagement" : null,
              !videoData.tags || videoData.tags.length < 10 ? "• Add 10-15 relevant tags for better SEO" : null,
              videoData.description.length < 200 ? "• Expand description with keywords and timestamps" : null,
              "• Share in 3-5 relevant communities or social media platforms",
              "• Respond to all comments to boost engagement signals",
              likes < views * 0.02 ? "• Ask viewers to like if they found value (add CTA)" : null
            ].filter(Boolean).join("\n"),
            type: 'info'
          },
          {
            label: "This Week (7 days)",
            value: "Growth acceleration",
            description: [
              "• Create 2-3 follow-up videos on related topics to build momentum",
              "• Analyze which parts of the video have highest retention and replicate that style",
              avgViewsPerDay > 500 ? "• Ride the momentum - publish more frequently while algorithm is pushing you" : null,
              "• Collaborate with creators in your niche for cross-promotion",
              "• Create a compelling thumbnail A/B test (if views are declining)",
              "• Add cards and end screens to increase session time"
            ].filter(Boolean).join("\n"),
            type: 'info'
          },
          {
            label: "This Month (30 days)",
            value: "Sustainable growth strategy",
            description: [
              "• Analyze top 10 videos in your niche - what patterns do they share?",
              "• Build an email list or community to reduce algorithm dependency",
              "• Create a content calendar with proven video formats",
              "• Invest in better equipment/editing if views justify it",
              "• Study your YouTube Analytics deeply - which videos drive subscriptions?",
              "• Test different video lengths, formats, and styles to find your winning formula"
            ].join("\n"),
            type: 'success'
          }
        ]
      }
    ]

    return { sections, viralScore }
  }

  const getCategoryName = (categoryId: string) => {
    const categories: Record<string, string> = {
      "1": "Film & Animation", "10": "Music", "15": "Pets & Animals", "17": "Sports",
      "19": "Travel & Events", "20": "Gaming", "22": "People & Blogs", "23": "Comedy",
      "24": "Entertainment", "25": "News & Politics", "26": "Howto & Style",
      "27": "Education", "28": "Science & Technology", "42": "Shorts"
    }
    return categories[categoryId] || "Unknown"
  }

  const getBestUploadTimes = (channelData: ChannelData) => {
    if (!channelData.uploadTimes || !channelData.uploadDays) {
      return {
        bestHours: [14, 15, 16, 17, 18, 19, 20],
        bestDays: [4, 5, 6, 0],
        timeAnalysis: "Default recommendations based on general YouTube trends"
      }
    }

    const sortedHours = [...channelData.uploadTimes].sort((a, b) => b.count - a.count)
    const sortedDays = [...channelData.uploadDays].sort((a, b) => b.count - a.count)
    
    return {
      bestHours: sortedHours.slice(0, 5).map(h => h.hour),
      bestDays: sortedDays.slice(0, 4).map(d => d.day),
      timeAnalysis: `Based on ${channelData.videoCount} videos analysis`,
      topHour: sortedHours[0],
      topDay: sortedDays[0]
    }
  }

  const formatUploadTime = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00 ${ampm}`
  }

  const formatDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day]
  }

  const calculateChannelHealthScore = (channelData: ChannelData) => {
    let score = 0
    const maxScore = 100

    // Subscriber count scoring (25 points max)
    const subs = parseInt(channelData.subscriberCount || '0')
    if (subs >= 1000000) score += 25
    else if (subs >= 100000) score += 20
    else if (subs >= 10000) score += 15
    else if (subs >= 1000) score += 10
    else if (subs >= 100) score += 5

    // Video count and consistency (20 points max)
    const videoCount = parseInt(channelData.videoCount || '0')
    const channelAgeYears = channelData.channelAge || 1
    const videosPerYear = videoCount / channelAgeYears
    if (videosPerYear >= 52) score += 20 // Weekly uploads
    else if (videosPerYear >= 24) score += 15 // Bi-weekly
    else if (videosPerYear >= 12) score += 10 // Monthly
    else if (videosPerYear >= 6) score += 5 // Bi-monthly

    // Engagement rate (20 points max)
    const engagement = channelData.engagementRate || 0
    if (engagement >= 5) score += 20
    else if (engagement >= 3) score += 15
    else if (engagement >= 2) score += 10
    else if (engagement >= 1) score += 5

    // Average views vs subscribers ratio (15 points max)
    const avgViews = channelData.averageViews || 0
    const viewsToSubsRatio = subs > 0 ? (avgViews / subs) * 100 : 0
    if (viewsToSubsRatio >= 10) score += 15 // 10%+ of subscribers watch each video
    else if (viewsToSubsRatio >= 5) score += 12
    else if (viewsToSubsRatio >= 2) score += 8
    else if (viewsToSubsRatio >= 1) score += 4

    // Channel completeness (10 points max)
    let completeness = 0
    if (channelData.description && channelData.description.length > 100) completeness += 3
    if (channelData.keywords) completeness += 2
    if (channelData.customUrl) completeness += 2
    if (channelData.country) completeness += 1
    if (channelData.thumbnail) completeness += 2
    score += completeness

    // Growth potential (10 points max)
    const totalViews = parseInt(channelData.viewCount || '0')
    const viewsPerSub = subs > 0 ? totalViews / subs : 0
    if (viewsPerSub >= 100) score += 10
    else if (viewsPerSub >= 50) score += 7
    else if (viewsPerSub >= 20) score += 5
    else if (viewsPerSub >= 10) score += 3

    return Math.min(Math.max(score, 0), maxScore)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-blue-500 to-cyan-600'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-600'
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return '🚀 Excellent'
    if (score >= 60) return '⚡ Good'
    if (score >= 40) return '📈 Growing'
    return '🎯 Developing'
  }

  const toggleVideoDetails = (videoId: string) => {
    setExpandedVideo(expandedVideo === videoId ? null : videoId)
  }

  const getVideoPerformance = (video: DetailedVideoData, avgViews: number) => {
    const viewRatio = avgViews > 0 ? parseInt(video.viewCount) / avgViews : 1
    if (viewRatio >= 2) return 'excellent'
    if (viewRatio >= 1.2) return 'good'
    if (viewRatio >= 0.8) return 'average'
    return 'poor'
  }

  const formatVideoDetails = (video: DetailedVideoData) => {
    const publishDate = new Date(video.publishedAt)
    const now = new Date()
    const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24))
    const viewsPerDay = daysOld > 0 ? parseInt(video.viewCount) / daysOld : parseInt(video.viewCount)
    const engagement = (parseInt(video.likeCount) + parseInt(video.commentCount)) / parseInt(video.viewCount) * 100
    
    return {
      daysOld,
      viewsPerDay: Math.round(viewsPerDay),
      engagementRate: engagement.toFixed(2),
      uploadHour: publishDate.getHours(),
      uploadDay: formatDayName(publishDate.getDay())
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="flex">
        {/* Shared Sidebar */}
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="vid-info" isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />

        <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
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

          <div className="max-w-7xl mx-auto">
            <div className="mb-8 mt-6">
              <div className="flex justify-center mb-6 px-3">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/5 border border-gray-100 px-4 py-2 text-sm text-gray-700 shadow-sm max-w-full overflow-hidden">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Plan: Free</span>
                    <span className="text-gray-500 hidden md:inline">• Limited features</span>
                  </div>
                  <Link href="/settings" className="ml-3 hidden md:inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-800 text-sm font-semibold">Manage plan</Link>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">YouTube Intelligence</h1>
                  <p className="text-gray-600 text-sm sm:text-lg">Deep analytics for videos, shorts & channels — professional insights at a glance.</p>
                </div>
              </div>

              {/* Analysis Type Toggle - Accessible Segmented Control */}
              <div className="mt-6 flex items-center justify-center px-4">
                <div role="tablist" aria-label="Analysis Type" className="bg-white rounded-full p-1 shadow-lg border-2 border-blue-100 w-full max-w-md flex items-center">
                  <button
                    role="tab"
                    aria-selected={analysisType === 'video'}
                    aria-pressed={analysisType === 'video'}
                    onClick={() => {
                      setAnalysisType('video')
                      setChannelData(null)
                      setVideoData(null)
                      setError(null)
                      setExpandedVideo(null)
                      setInputError(null)
                    }}
                    className={`flex-1 px-4 py-2 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${analysisType === 'video' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md ring-2 ring-blue-200' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Video Analysis</span>
                    <span className="sm:hidden">Video</span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={analysisType === 'channel'}
                    aria-pressed={analysisType === 'channel'}
                    onClick={() => {
                      setAnalysisType('channel')
                      setChannelData(null)
                      setVideoData(null)
                      setError(null)
                      setExpandedVideo(null)
                      setInputError(null)
                    }}
                    className={`flex-1 px-4 py-2 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${analysisType === 'channel' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md ring-2 ring-blue-200' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Channel Analysis</span>
                    <span className="sm:hidden">Channel</span>
                  </button>
                </div>
              </div>
            </div>

            <Card className={`${cardBase} mb-8 border-black/10`}>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  {analysisType === 'video' ? (
                    <>
                      <Video className="w-5 h-5 text-blue-600" />
                      Enter YouTube Video or Shorts URL
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 text-blue-600" />
                      Enter YouTube Channel URL
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder={analysisType === 'video' 
                        ? "https://www.youtube.com/watch?v=... or /shorts/..."
                        : "https://www.youtube.com/@username or /channel/UCxxxx..."
                      }
                      value={inputUrl}
                      onChange={(e) => { setInputUrl(e.target.value); setInputError(null); setError(null) }}
                      className={`flex-1 border border-black/20 focus:border-black focus:ring-2 focus:ring-black/10 rounded-md px-3 py-2 ${inputError ? 'ring-1 ring-red-300' : ''}`}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />

                    <div className="mt-2 text-sm">
                      <p className="text-gray-500">Example: <code className="bg-gray-100 px-1 py-0.5 rounded">https://www.youtube.com/watch?v=abc123</code> or <code className="bg-gray-100 px-1 py-0.5 rounded">/channel/UC...</code></p>
                      {inputError && <p className="mt-1 text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{inputError}</p>}
                    </div>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || !inputUrl.trim()}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        Analyze {analysisType === 'video' ? 'Video' : 'Channel'}
                      </>
                    )}
                  </Button>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                    <TrendingDown className="w-4 h-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {loading && (
              <Card className={cardBase}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Skeleton className="w-full md:w-1/3 aspect-video rounded-xl" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {videoData && (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 gap-2 p-0 items-stretch">
                  <TabsTrigger value="overview" className="flex-1 w-full h-10 sm:h-11 bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:z-10 transition-all px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold flex items-center gap-2 justify-center text-center text-xs sm:text-base text-gray-700">
                    <BarChart3 className="hidden sm:inline w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Overview</span>
                    <span className="sm:hidden">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex-1 w-full h-10 sm:h-11 bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:z-10 transition-all px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold flex items-center gap-2 justify-center text-center text-xs sm:text-base text-gray-700">
                    <TrendingUp className="hidden sm:inline w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Performance Insights</span>
                    <span className="sm:hidden">Insights</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className={`${cardBase} border-blue-100 overflow-hidden`}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2/5 bg-black">
                          <img
                            src={videoData.snippet?.thumbnails?.maxres?.url || videoData.thumbnail}
                            alt={videoData.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                          <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex-1">{videoData.title}</h2>
                            <a href={`https://www.youtube.com/watch?v=${videoData.id}`} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-2 ml-4">
                                <ExternalLink className="w-4 h-4" />Watch
                              </Button>
                            </a>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium truncate">{videoData.channelTitle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{new Date(videoData.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{videoData.contentDetails ? formatDuration(videoData.contentDetails.duration) : videoData.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{getCategoryName(videoData.categoryId)}</span>
                            </div>
                            {videoData.status && (
                              <div className="flex items-center gap-2">
                                <Badge variant={videoData.status.privacyStatus === 'public' ? 'default' : 'secondary'}>
                                  {videoData.status.privacyStatus}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-600 rounded-lg">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Views</p>
                            <p className="text-2xl font-bold text-blue-900">{formatNumber(videoData.viewCount)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-green-600 rounded-lg">
                            <ThumbsUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Likes</p>
                            <p className="text-2xl font-bold text-green-900">{formatNumber(videoData.likeCount)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-purple-600 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Comments</p>
                            <p className="text-2xl font-bold text-purple-900">{formatNumber(videoData.commentCount)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-orange-600 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Engagement</p>
                            <p className="text-2xl font-bold text-orange-900">{calculateEngagementRate()}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Moved Metadata cards into Overview */}
                  <div className="mt-4 space-y-4">
                    <Card className="border-2 border-blue-100 shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Video Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                          {(() => {
                            const text = videoData.description || "No description available"

                            // Regexes
                            const combined = /(\b(?:\d{1,2}:){0,2}\d{1,2}:\d{2}\b)|(https?:\/\/[^\s]+)|(#\w+)/g

                            const parseTimestampToSeconds = (ts: string) => {
                              const parts = ts.split(':').map(p => parseInt(p, 10))
                              if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
                              if (parts.length === 2) return parts[0] * 60 + parts[1]
                              return parseInt(ts, 10) || 0
                            }

                            const renderLine = (line: string, idx: number) => {
                              const nodes: any[] = []
                              let lastIndex = 0
                              let match: RegExpExecArray | null
                              while ((match = combined.exec(line)) !== null) {
                                const matchIndex = match.index
                                if (matchIndex > lastIndex) {
                                  nodes.push(line.slice(lastIndex, matchIndex))
                                }

                                const [full] = match
                                if (/^https?:\/\//.test(full)) {
                                  nodes.push(
                                    <a key={idx + 'u' + matchIndex} href={full} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                      {full}
                                    </a>
                                  )
                                } else if (/^#/.test(full)) {
                                  const tag = full.slice(1)
                                  nodes.push(
                                    <a key={idx + 'h' + matchIndex} href={`https://www.youtube.com/hashtag/${tag}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs mr-1">
                                      {full}
                                    </a>
                                  )
                                } else if (/^\d/.test(full)) {
                                  const seconds = parseTimestampToSeconds(full)
                                  nodes.push(
                                    <a key={idx + 't' + matchIndex} href={`https://www.youtube.com/watch?v=${videoData.id}&t=${seconds}s`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono text-sm underline">
                                      {full}
                                    </a>
                                  )
                                } else {
                                  nodes.push(full)
                                }

                                lastIndex = matchIndex + full.length
                              }

                              if (lastIndex < line.length) {
                                nodes.push(line.slice(lastIndex))
                              }

                              return <p key={idx} className="text-gray-800 leading-relaxed">{nodes}</p>
                            }

                            const lines = text.split('\n')
                            const MAX_LINES = 8
                            const shouldTruncate = lines.length > MAX_LINES && !showFullDesc
                            const shownLines = shouldTruncate ? lines.slice(0, MAX_LINES) : lines

                            return (
                              <div>
                                <div className="space-y-2">
                                  {shownLines.map((l, i) => renderLine(l, i))}
                                </div>

                                {shouldTruncate && (
                                  <div className="mt-2">
                                    <button onClick={() => setShowFullDesc(true)} className="text-sm text-blue-600 underline">Show more</button>
                                  </div>
                                )}

                                {!shouldTruncate && lines.length > MAX_LINES && (
                                  <div className="mt-2">
                                    <button onClick={() => setShowFullDesc(false)} className="text-sm text-blue-600 underline">Show less</button>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    {videoData.tags && videoData.tags.length > 0 && (
                      <Card className="border-2 border-blue-100 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <CardTitle className="flex items-center gap-2">
                            <Hash className="w-5 h-5 text-blue-600" />
                            Tags & Keywords ({videoData.tags.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="flex flex-wrap gap-2">
                            {videoData.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900 border border-blue-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Card className={`${cardBase} border-blue-100 mt-6`}>
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-sm text-gray-500">Avg views / day</p>
                          <p className="text-2xl font-bold text-gray-900">{calculateAvgViewsPerDay()} / day</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-sm text-gray-500">Like Ratio</p>
                          <p className="text-2xl font-bold text-gray-900">{calculateLikeRatio()}%</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-sm text-gray-500">Days since publish</p>
                          <p className="text-2xl font-bold text-gray-900">{Math.floor((Date.now() - new Date(videoData.publishedAt).getTime()) / (1000*60*60*24))}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-sm text-gray-500">Views</p>
                          <p className="text-2xl font-bold text-gray-900">{formatNumber(videoData.viewCount)}</p>
                        </div>
                      </div>

                      <div className="w-full md:w-1/3 bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-2">Metric Comparison</p>
                        <div className="flex items-end gap-3 h-36">
                          {(() => {
                            const v = parseInt(videoData.viewCount || '0')
                            const l = parseInt(videoData.likeCount || '0')
                            const c = parseInt(videoData.commentCount || '0')
                            const max = Math.max(1, v, l, c)
                            const norm = (n: number) => Math.round((n / max) * 100)
                            return (
                              <>
                                <div className="flex-1 flex flex-col items-center">
                                  <div className="w-10 bg-blue-600 rounded-t-md" style={{height: `${norm(v)}%`}} />
                                  <p className="text-xs text-gray-600 mt-2">Views</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center">
                                  <div className="w-10 bg-green-600 rounded-t-md" style={{height: `${norm(l)}%`}} />
                                  <p className="text-xs text-gray-600 mt-2">Likes</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center">
                                  <div className="w-10 bg-purple-600 rounded-t-md" style={{height: `${norm(c)}%`}} />
                                  <p className="text-xs text-gray-600 mt-2">Comments</p>
                                </div>
                              </>
                            )
                          })()}
                        </div>

                        <div className="mt-4">
                          <p className="text-xs text-gray-500">Engagement</p>
                          <div className="w-full bg-gray-100 h-3 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-orange-500" style={{width: `${calculateEngagementRate()}%`}} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </TabsContent>


                <TabsContent value="insights" className="space-y-6">
                  {(() => {
                    const insights = getPerformanceInsights()
                    return (
                      <>
                        {/* Viral Score Header */}
                        <Card className={`${cardBase} border-purple-200 shadow-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50`}>
                          <CardContent className="p-8 text-center">
                            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
                              <Target className="w-16 h-16 text-purple-600" />
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">Viral Score: {insights.viralScore}/100</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                              {insights.viralScore > 70 ? "🔥 Exceptional Performance!" :
                                insights.viralScore > 50 ? "⚡ Strong Potential" :
                                  insights.viralScore > 30 ? "📊 Room for Growth" :
                                    "🎯 Optimization Needed"}
                            </p>
                            <div className="mt-6 bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${insights.viralScore > 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                  insights.viralScore > 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                                    insights.viralScore > 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                                      'bg-gradient-to-r from-red-500 to-pink-600'
                                  }`}
                                style={{ width: `${insights.viralScore}%` }}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* All Sections */}
                        {insights.sections.map((section, sectionIndex) => (
                          <Card key={sectionIndex} className="border-2 border-blue-100 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                              <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                {section.items.map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className={`p-5 rounded-lg border-2 ${item.type === 'success' ? 'bg-green-50 border-green-300' :
                                      item.type === 'warning' ? 'bg-yellow-50 border-yellow-300' :
                                        'bg-blue-50 border-blue-300'
                                      }`}
                                  >
                                    <div className="flex items-start gap-3 mb-3">
                                      {item.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" /> :
                                        item.type === 'warning' ? <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" /> :
                                          <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />}
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-bold text-gray-900 text-lg">{item.label}</h4>
                                          <Badge
                                            variant="secondary"
                                            className={`text-sm font-semibold ${item.type === 'success' ? 'bg-green-200 text-green-900' :
                                              item.type === 'warning' ? 'bg-yellow-200 text-yellow-900' :
                                                'bg-blue-200 text-blue-900'
                                              }`}
                                          >
                                            {item.value}
                                          </Badge>
                                        </div>
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">{item.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </>
                    )
                  })()}
                </TabsContent>
              </Tabs>
            )}

            {/* Channel Data Display */}
            {channelData && (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 p-0 items-center">
                  <TabsTrigger value="overview" className="w-full bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:z-10 data-[state=active]:ring-2 data-[state=active]:ring-blue-200 transition-all px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-semibold flex items-center gap-2 justify-center text-center text-xs sm:text-sm text-gray-700">
                    <BarChart3 className="hidden sm:inline w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Overview</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="w-full bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:z-10 data-[state=active]:ring-2 data-[state=active]:ring-blue-200 transition-all px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-semibold flex items-center gap-2 justify-center text-center text-xs sm:text-sm text-gray-700">
                    <PieChart className="hidden sm:inline w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Analytics</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="w-full bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:z-10 data-[state=active]:ring-2 data-[state=active]:ring-blue-200 transition-all px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-semibold flex items-center gap-2 justify-center text-center text-xs sm:text-sm text-gray-700">
                    <Clock className="hidden sm:inline w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Best Times</span>
                    <span className="sm:hidden">Times</span>
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="w-full bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:z-10 data-[state=active]:ring-2 data-[state=active]:ring-blue-200 transition-all px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-semibold flex items-center gap-2 justify-center text-center text-xs sm:text-sm text-gray-700">
                    <PlayCircle className="hidden sm:inline w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Top Videos</span>
                    <span className="sm:hidden">Videos</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Channel Header Card - Enhanced */}
                  <Card className="border-2 border-blue-100 shadow-2xl overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
                    <CardContent className="p-0">
                      <div className="flex flex-col">
                        {/* Hero Section */}
                        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4 sm:p-6 text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                            {/* Channel Avatar with Border */}
                            <div className="flex-shrink-0 relative">
                              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-1 shadow-2xl">
                                <img
                                  src={channelData.thumbnail}
                                  alt={channelData.title}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            
                            {/* Channel Info */}
                            <div className="flex-1 text-center sm:text-left min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                <div>
                                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white break-words mb-2">
                                    {channelData.title}
                                  </h2>
                                  <div className="flex items-center justify-center sm:justify-start gap-2 text-white/80">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Joined {new Date(channelData.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <a 
                                    href={`https://www.youtube.com/channel/${channelData.id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 gap-2 w-full font-semibold">
                                      <ExternalLink className="w-4 h-4" />
                                      Visit Channel
                                    </Button>
                                  </a>
                                  {channelData.customUrl && (
                                    <div className="text-xs text-white/70 text-center">
                                      {channelData.customUrl}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Key Stats in Hero */}
                              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                <div className="text-center">
                                  <div className="text-xl sm:text-2xl font-bold">{formatNumber(channelData.subscriberCount)}</div>
                                  <div className="text-xs sm:text-sm text-white/80">Subscribers</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xl sm:text-2xl font-bold">{formatNumber(channelData.viewCount)}</div>
                                  <div className="text-xs sm:text-sm text-white/80">Total Views</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xl sm:text-2xl font-bold">{formatNumber(channelData.videoCount)}</div>
                                  <div className="text-xs sm:text-sm text-white/80">Videos</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Channel Details Section */}
                        <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
                          {/* Additional Channel Info */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            {channelData.country && (
                              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-700">Country</span>
                                </div>
                                <div className="mt-1 font-semibold text-gray-900">{channelData.country}</div>
                              </div>
                            )}
                            {channelData.defaultLanguage && (
                              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-gray-700">Language</span>
                                </div>
                                <div className="mt-1 font-semibold text-gray-900">{channelData.defaultLanguage.toUpperCase()}</div>
                              </div>
                            )}
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Channel Age</span>
                              </div>
                              <div className="mt-1 font-semibold text-gray-900">{channelData.channelAge} years</div>
                            </div>
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                              <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-gray-700">Upload Rate</span>
                              </div>
                              <div className="mt-1 font-semibold text-gray-900">
                                {Math.round(parseInt(channelData.videoCount) / channelData.channelAge)}/year
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              About This Channel
                            </h3>
                            <div className="max-h-32 overflow-y-auto">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {channelData.description || "No channel description available. This creator hasn't added a description to their channel yet."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Channel Overview - Comprehensive Analytics */}
                  <div className="space-y-6">
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600 rounded-lg">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Subscribers</p>
                              <p className="text-2xl font-bold text-blue-900">{formatNumber(channelData.subscriberCount)}</p>
                              <p className="text-xs text-blue-700 mt-1">
                                {parseInt(channelData.subscriberCount) >= 1000000 ? 'Million+ Club!' : 
                                 parseInt(channelData.subscriberCount) >= 100000 ? 'Growing Fast' : 'Building Audience'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-600 rounded-lg">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Total Views</p>
                              <p className="text-2xl font-bold text-green-900">{formatNumber(channelData.viewCount)}</p>
                              <p className="text-xs text-green-700 mt-1">
                                {parseInt(channelData.viewCount) >= 10000000 ? 'Viral Content' : 
                                 parseInt(channelData.viewCount) >= 1000000 ? 'Strong Reach' : 'Growing Views'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-600 rounded-lg">
                              <PlayCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Total Videos</p>
                              <p className="text-2xl font-bold text-purple-900">{formatNumber(channelData.videoCount)}</p>
                              <p className="text-xs text-purple-700 mt-1">
                                {parseInt(channelData.videoCount) >= 1000 ? 'Content King' : 
                                 parseInt(channelData.videoCount) >= 100 ? 'Active Creator' : 'Starting Journey'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-600 rounded-lg">
                              <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Avg Views</p>
                              <p className="text-2xl font-bold text-orange-900">
                                {channelData.averageViews ? formatNumber(channelData.averageViews) : 'N/A'}
                              </p>
                              <p className="text-xs text-orange-700 mt-1">
                                {(channelData.averageViews || 0) >= 100000 ? 'High Engagement' : 
                                 (channelData.averageViews || 0) >= 10000 ? 'Good Performance' : 'Room to Grow'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Enhanced Performance Analytics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Channel Health Score Card */}
                      {(() => {
                        const healthScore = calculateChannelHealthScore(channelData)
                        const scoreColor = getHealthScoreColor(healthScore)
                        const scoreLabel = getHealthScoreLabel(healthScore)
                        return (
                          <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-indigo-600 rounded-lg">
                                  <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 font-medium">Health Score</p>
                                  <p className="text-2xl font-bold text-indigo-900">{healthScore}/100</p>
                                </div>
                              </div>
                              <div className="mb-3">
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${scoreColor} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${healthScore}%` }}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-indigo-700">{scoreLabel}</p>
                            </CardContent>
                          </Card>
                        )
                      })()}

                      {/* Engagement Rate Card */}
                      <Card className="border-2 border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-pink-600 rounded-lg">
                              <Heart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Engagement Rate</p>
                              <p className="text-2xl font-bold text-pink-900">
                                {channelData.engagementRate ? `${channelData.engagementRate.toFixed(2)}%` : 'Calculating...'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              (channelData.engagementRate || 0) >= 3 ? 'bg-green-500' :
                              (channelData.engagementRate || 0) >= 1.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <p className="text-xs text-pink-700">
                              {(channelData.engagementRate || 0) >= 3 ? 'Excellent audience connection' :
                               (channelData.engagementRate || 0) >= 1.5 ? 'Good community engagement' : 'Focus on audience interaction'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Upload Consistency Card */}
                      <Card className="border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-teal-600 rounded-lg">
                              <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Upload Rate</p>
                              <p className="text-2xl font-bold text-teal-900">
                                {channelData.videoCount ? 
                                  `${Math.round(parseInt(channelData.videoCount) / Math.max(1, Math.floor((Date.now() - new Date(channelData.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))))}` :
                                  '0'
                                }/mo
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-teal-700">
                            {channelData.videoCount ? 
                              (parseInt(channelData.videoCount) / Math.max(1, Math.floor((Date.now() - new Date(channelData.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))) >= 4 ?
                                'Very consistent creator' : 'Room for more consistency'
                              : 'Analyzing upload pattern...'
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Channel Insights Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Channel Age & Growth */}
                      <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 pb-3">
                          <CardTitle className="flex items-center gap-2 text-amber-900">
                            <Calendar className="w-5 h-5" />
                            Channel Journey
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-amber-900">
                                {channelData.publishedAt ? 
                                  Math.floor((Date.now() - new Date(channelData.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 365)) : '0'
                                } years
                              </p>
                              <p className="text-sm text-amber-700">Channel Age</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-amber-900">
                                {channelData.growthRate ? `+${channelData.growthRate.toFixed(1)}%` : 'N/A'}
                              </p>
                              <p className="text-sm text-amber-700">Growth Rate</p>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                            <p className="text-xs text-amber-800">
                              {channelData.publishedAt ? 
                                `Started ${new Date(channelData.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` :
                                'Channel creation date not available'
                              }
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Performance Summary */}
                      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-emerald-100 to-green-100 pb-3">
                          <CardTitle className="flex items-center gap-2 text-emerald-900">
                            <Award className="w-5 h-5" />
                            Performance Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-emerald-100 rounded-lg">
                              <span className="text-sm text-emerald-800">Subscriber Rate</span>
                              <span className="font-bold text-emerald-900">
                                {channelData.videoCount ? 
                                  Math.round(parseInt(channelData.subscriberCount) / parseInt(channelData.videoCount)) : '0'
                                } per video
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-emerald-100 rounded-lg">
                              <span className="text-sm text-emerald-800">View-to-Sub Ratio</span>
                              <span className="font-bold text-emerald-900">
                                {channelData.subscriberCount && channelData.viewCount ? 
                                  Math.round(parseInt(channelData.viewCount) / parseInt(channelData.subscriberCount)) : '0'
                                }:1
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-emerald-100 rounded-lg">
                              <span className="text-sm text-emerald-800">Content Quality</span>
                              <span className="font-bold text-emerald-900">
                                {(channelData.averageViews || 0) >= 50000 ? 'Premium' :
                                 (channelData.averageViews || 0) >= 10000 ? 'Good' : 'Growing'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  {/* Enhanced Analytics Layout */}
                  <div className="space-y-8">
                    {/* Top Row - Channel Health Score (Full Width) */}
                    <Card className="border-2 border-gradient-to-r from-indigo-200 to-purple-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl">
                      <CardHeader className="bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-100">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                              <Growth className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                              Channel Health Analytics
                            </span>
                          </div>
                          {(() => {
                            const healthScore = calculateChannelHealthScore(channelData)
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-indigo-900">{healthScore}</span>
                                <span className="text-lg text-indigo-600 font-semibold">/100</span>
                              </div>
                            )
                          })()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {(() => {
                          const healthScore = calculateChannelHealthScore(channelData)
                          const scoreColor = getHealthScoreColor(healthScore)
                          const scoreLabel = getHealthScoreLabel(healthScore)
                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Health Score Visual */}
                              <div className="lg:col-span-2">
                                <div className="p-6 bg-white border-2 border-indigo-100 rounded-2xl shadow-lg">
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-lg font-semibold text-indigo-900">{scoreLabel}</span>
                                      <span className="text-sm font-bold text-indigo-700">{healthScore}%</span>
                                    </div>
                                    <div className="relative">
                                      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                                        <div 
                                          className={`h-full bg-gradient-to-r ${scoreColor} rounded-full transition-all duration-2000 ease-out shadow-sm`}
                                          style={{ width: `${healthScore}%` }}
                                        />
                                      </div>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white drop-shadow">{healthScore}%</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-800">Subscriber Level</span>
                                        <span className="text-lg font-bold text-blue-900">
                                          {parseInt(channelData.subscriberCount) >= 1000000 ? '★★★' :
                                           parseInt(channelData.subscriberCount) >= 10000 ? '★★☆' : '★☆☆'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-blue-600 mt-1">
                                        {parseInt(channelData.subscriberCount) >= 1000000 ? 'Elite Creator' :
                                         parseInt(channelData.subscriberCount) >= 10000 ? 'Established' : 'Growing'}
                                      </p>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-green-800">Engagement</span>
                                        <span className="text-lg font-bold text-green-900">
                                          {(channelData.engagementRate || 0) >= 3 ? '★★★' :
                                           (channelData.engagementRate || 0) >= 1.5 ? '★★☆' : '★☆☆'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-green-600 mt-1">
                                        {(channelData.engagementRate || 0) >= 3 ? 'Excellent' :
                                         (channelData.engagementRate || 0) >= 1.5 ? 'Good' : 'Needs Work'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Key Metrics */}
                              <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Heart className="w-5 h-5 text-emerald-600" />
                                    <h4 className="font-bold text-emerald-900">Engagement Rate</h4>
                                  </div>
                                  <p className="text-2xl font-bold text-emerald-900">
                                    {channelData.engagementRate ? `${channelData.engagementRate.toFixed(2)}%` : 'Calculating...'}
                                  </p>
                                  <p className="text-xs text-emerald-700 mt-1">
                                    {(channelData.engagementRate || 0) > 3 ? 'Outstanding audience connection' : 
                                     (channelData.engagementRate || 0) > 1.5 ? 'Solid community engagement' : 'Focus on audience interaction'}
                                  </p>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-violet-600" />
                                    <h4 className="font-bold text-violet-900">Growth Rate</h4>
                                  </div>
                                  <p className="text-2xl font-bold text-violet-900">
                                    {channelData.growthRate ? `+${channelData.growthRate.toFixed(1)}%` : 'Analyzing...'}
                                  </p>
                                  <p className="text-xs text-violet-700 mt-1">
                                    Monthly subscriber growth trend
                                  </p>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                    <h4 className="font-bold text-amber-900">Consistency</h4>
                                  </div>
                                  <p className="text-lg font-bold text-amber-900">
                                    {parseInt(channelData.videoCount) / (channelData.channelAge || 1) >= 12 ? '★★★' :
                                     parseInt(channelData.videoCount) / (channelData.channelAge || 1) >= 6 ? '★★☆' : '★☆☆'}
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    {parseInt(channelData.videoCount) / (channelData.channelAge || 1) >= 12 ? 'Highly consistent' :
                                     parseInt(channelData.videoCount) / (channelData.channelAge || 1) >= 6 ? 'Moderately regular' : 'Irregular uploads'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>

                    {/* Second Row - Keywords & Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Channel Keywords */}
                      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                          <CardTitle className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                              <Hash className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-blue-900">Channel Keywords</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          {channelData.keywords ? (
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                  {channelData.keywords.split(',').slice(0, 15).map((keyword, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-900 border border-blue-200 hover:from-blue-200 hover:to-cyan-200 transition-colors"
                                    >
                                      {keyword.trim()}
                                    </Badge>
                                  ))}
                                </div>
                                {channelData.keywords.split(',').length > 15 && (
                                  <p className="text-xs text-blue-600 mt-2 text-center">
                                    +{channelData.keywords.split(',').length - 15} more keywords
                                  </p>
                                )}
                              </div>
                              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-3 rounded-lg">
                                <p className="text-xs text-blue-800">
                                  <strong>Total Keywords:</strong> {channelData.keywords.split(',').length}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Hash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No keywords found for this channel</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Categories & Language */}
                      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                          <CardTitle className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-purple-900">Categories & Info</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                          {channelData.bestPerformingCategories && channelData.bestPerformingCategories.length > 0 ? (
                            <div>
                              <h4 className="font-semibold text-purple-900 mb-3">Top Performing Categories</h4>
                              <div className="space-y-2">
                                {channelData.bestPerformingCategories.slice(0, 5).map((category, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-100 hover:bg-purple-50 transition-colors">
                                    <span className="font-medium text-purple-900">{getCategoryName(category)}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                        #{index + 1}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">Category data not available</p>
                            </div>
                          )}

                          {channelData.defaultLanguage && (
                            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200">
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-purple-600" />
                                <div>
                                  <p className="font-semibold text-purple-900">Primary Language</p>
                                  <p className="text-sm text-purple-700">{channelData.defaultLanguage}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl border border-indigo-200">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-lg font-bold text-indigo-900">
                                  {channelData.videoCount ? Math.round(parseInt(channelData.videoCount) / Math.max(1, Math.floor((Date.now() - new Date(channelData.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))) : '0'}
                                </p>
                                <p className="text-xs text-indigo-700">Videos/Month</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-indigo-900">
                                  {channelData.publishedAt ? Math.floor((Date.now() - new Date(channelData.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 365)) : '0'}
                                </p>
                                <p className="text-xs text-indigo-700">Years Active</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6">
                  {(() => {
                    const uploadAnalysis = getBestUploadTimes(channelData)
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Best Upload Times */}
                        <Card className="border-2 border-blue-100 shadow-xl">
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-blue-600" />
                              Optimal Upload Times
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {/* Best Hour */}
                              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                  <Sun className="w-6 h-6 text-green-600" />
                                  <h4 className="font-bold text-green-900">Prime Time</h4>
                                </div>
                                <p className="text-2xl font-bold text-green-900 mb-2">
                                  {uploadAnalysis.topHour ? formatUploadTime(uploadAnalysis.topHour.hour) : '6:00 PM'}
                                </p>
                                <p className="text-sm text-green-700">
                                  {uploadAnalysis.topHour 
                                    ? `${uploadAnalysis.topHour.count} videos uploaded at this time`
                                    : 'Recommended based on YouTube trends'
                                  }
                                </p>
                              </div>

                              {/* Best Hours List */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Top 5 Upload Hours</h4>
                                <div className="space-y-2">
                                  {uploadAnalysis.bestHours.slice(0, 5).map((hour, index) => (
                                    <div key={hour} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                      <span className="font-medium text-blue-900">{formatUploadTime(hour)}</span>
                                      <Badge variant="secondary" className="bg-blue-200 text-blue-900">
                                        #{index + 1}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600">{uploadAnalysis.timeAnalysis}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Best Upload Days */}
                        <Card className="border-2 border-blue-100 shadow-xl">
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              Best Upload Days
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {/* Best Day */}
                              <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                  <Star className="w-6 h-6 text-purple-600" />
                                  <h4 className="font-bold text-purple-900">Best Day</h4>
                                </div>
                                <p className="text-2xl font-bold text-purple-900 mb-2">
                                  {uploadAnalysis.topDay ? formatDayName(uploadAnalysis.topDay.day) : 'Friday'}
                                </p>
                                <p className="text-sm text-purple-700">
                                  {uploadAnalysis.topDay 
                                    ? `${uploadAnalysis.topDay.count} videos uploaded on this day`
                                    : 'Recommended based on audience engagement'
                                  }
                                </p>
                              </div>

                              {/* Best Days List */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Weekly Upload Pattern</h4>
                                <div className="space-y-2">
                                  {uploadAnalysis.bestDays.slice(0, 4).map((day, index) => (
                                    <div key={day} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                      <span className="font-medium text-purple-900">{formatDayName(day)}</span>
                                      <Badge variant="secondary" className="bg-purple-200 text-purple-900">
                                        #{index + 1}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Upload Frequency */}
                              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg">
                                <h4 className="font-bold text-orange-900 mb-2">Upload Frequency</h4>
                                <p className="text-lg font-semibold text-orange-900">
                                  {channelData.videoCount ? 
                                    `${Math.round(parseInt(channelData.videoCount) / Math.max(1, Math.floor((Date.now() - new Date(channelData.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))))} videos/month` :
                                    'Calculating...'
                                  }
                                </p>
                                <p className="text-sm text-orange-700 mt-1">
                                  Average based on channel history
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })()}
                </TabsContent>

                <TabsContent value="videos" className="space-y-6">
                  {channelData.topVideos && channelData.topVideos.length > 0 ? (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <Card className="border-2 border-blue-100 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-blue-600" />
                            Video Performance Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-green-50 p-4 rounded-xl text-center">
                              <h4 className="text-2xl font-bold text-green-900">
                                {channelData.topVideos.filter(v => getVideoPerformance(v as DetailedVideoData, channelData.averageViews || 0) === 'excellent').length}
                              </h4>
                              <p className="text-sm text-green-700 font-medium">Viral Videos</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl text-center">
                              <h4 className="text-2xl font-bold text-blue-900">
                                {Math.round(channelData.topVideos.reduce((acc, v) => acc + parseInt(v.viewCount), 0) / channelData.topVideos.length / 1000)}K
                              </h4>
                              <p className="text-sm text-blue-700 font-medium">Avg Views</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl text-center">
                              <h4 className="text-2xl font-bold text-purple-900">
                                {Math.round(channelData.topVideos.reduce((acc, v) => {
                                  const engagement = (parseInt(v.likeCount) + parseInt(v.commentCount)) / parseInt(v.viewCount) * 100
                                  return acc + engagement
                                }, 0) / channelData.topVideos.length * 10) / 10}%
                              </h4>
                              <p className="text-sm text-purple-700 font-medium">Avg Engagement</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-xl text-center">
                              <h4 className="text-2xl font-bold text-orange-900">
                                {Math.round((channelData.topVideos.reduce((acc, v) => acc + parseInt(v.likeCount), 0) / 
                                  channelData.topVideos.reduce((acc, v) => acc + parseInt(v.viewCount), 0)) * 100 * 10) / 10}%
                              </h4>
                              <p className="text-sm text-orange-700 font-medium">Like Rate</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Top Videos with Expandable Details */}
                      <Card className="border-2 border-blue-100 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <CardTitle className="flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-blue-600" />
                            Top Performing Videos (Click for Details)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            {channelData.topVideos.slice(0, 10).map((video, index) => {
                              const videoDetails = formatVideoDetails(video as DetailedVideoData)
                              const performance = getVideoPerformance(video as DetailedVideoData, channelData.averageViews || 0)
                              const isExpanded = expandedVideo === video.id
                              
                              return (
                                <div key={video.id} className="bg-gradient-to-r from-white via-blue-50 to-purple-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                  {/* Main Video Row */}
                                  <div 
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 cursor-pointer hover:bg-blue-50/50 transition-colors"
                                    onClick={() => toggleVideoDetails(video.id)}
                                  >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                      <div className="flex-shrink-0">
                                        <Badge 
                                          variant="secondary" 
                                          className={`font-bold text-white ${
                                            performance === 'excellent' ? 'bg-green-600' :
                                            performance === 'good' ? 'bg-blue-600' :
                                            performance === 'average' ? 'bg-orange-500' : 'bg-gray-500'
                                          }`}
                                        >
                                          #{index + 1}
                                        </Badge>
                                      </div>
                                      <img 
                                        src={video.thumbnail} 
                                        alt={video.title}
                                        className="w-20 sm:w-24 h-12 sm:h-16 object-cover rounded-lg shadow-sm"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">
                                          {video.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-gray-600">
                                          <div className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            <span className="font-medium">{formatNumber(video.viewCount)}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" />
                                            <span>{formatNumber(video.likeCount)}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            <span>{formatNumber(video.commentCount)}</span>
                                          </div>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                              performance === 'excellent' ? 'border-green-500 text-green-700 bg-green-50' :
                                              performance === 'good' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                                              performance === 'average' ? 'border-orange-500 text-orange-700 bg-orange-50' :
                                              'border-gray-500 text-gray-700 bg-gray-50'
                                            }`}
                                          >
                                            {performance === 'excellent' ? '🔥 Viral' :
                                             performance === 'good' ? '⚡ Strong' :
                                             performance === 'average' ? '📈 Average' : '🎯 Slow'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <a 
                                        href={`https://www.youtube.com/watch?v=${video.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-xs"
                                      >
                                        {isExpanded ? 'Hide' : 'Details'}
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Expanded Details */}
                                  {isExpanded && (
                                    <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 space-y-4">
                                      {/* Performance Metrics */}
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-white p-3 rounded-lg text-center">
                                          <p className="text-xs text-gray-500 mb-1">Views/Day</p>
                                          <p className="font-bold text-blue-900">{formatNumber(videoDetails.viewsPerDay)}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg text-center">
                                          <p className="text-xs text-gray-500 mb-1">Engagement</p>
                                          <p className="font-bold text-green-900">{videoDetails.engagementRate}%</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg text-center">
                                          <p className="text-xs text-gray-500 mb-1">Upload Time</p>
                                          <p className="font-bold text-purple-900">{formatUploadTime(videoDetails.uploadHour)}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg text-center">
                                          <p className="text-xs text-gray-500 mb-1">Upload Day</p>
                                          <p className="font-bold text-orange-900">{videoDetails.uploadDay}</p>
                                        </div>
                                      </div>

                                      {/* Additional Details */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-lg">
                                          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Timeline
                                          </h5>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Published:</span>
                                              <span className="font-medium">{new Date(video.publishedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Days Old:</span>
                                              <span className="font-medium">{videoDetails.daysOld} days</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Category:</span>
                                              <span className="font-medium">{getCategoryName(video.categoryId)}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg">
                                          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4" />
                                            Performance
                                          </h5>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Like Ratio:</span>
                                              <span className="font-medium">
                                                {((parseInt(video.likeCount) / parseInt(video.viewCount)) * 100).toFixed(2)}%
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Comments/Views:</span>
                                              <span className="font-medium">
                                                {((parseInt(video.commentCount) / parseInt(video.viewCount)) * 100).toFixed(3)}%
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">vs Avg Views:</span>
                                              <span className={`font-medium ${
                                                parseInt(video.viewCount) > (channelData.averageViews || 0) ? 'text-green-600' : 'text-orange-600'
                                              }`}>
                                                {channelData.averageViews ? 
                                                  `${((parseInt(video.viewCount) / channelData.averageViews) * 100).toFixed(0)}%` : 
                                                  'N/A'
                                                }
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tags */}
                                      {video.tags && video.tags.length > 0 && (
                                        <div className="bg-white p-4 rounded-lg">
                                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Hash className="w-4 h-4" />
                                            Tags ({video.tags.length})
                                          </h5>
                                          <div className="flex flex-wrap gap-2">
                                            {video.tags.slice(0, 10).map((tag, idx) => (
                                              <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                                                {tag}
                                              </Badge>
                                            ))}
                                            {video.tags.length > 10 && (
                                              <Badge variant="outline" className="text-xs bg-gray-100">
                                                +{video.tags.length - 10} more
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="border-2 border-blue-100 shadow-xl">
                      <CardContent className="p-12 text-center">
                        <PlayCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Video Data Available</h3>
                        <p className="text-gray-600">Top videos will be displayed when data is available.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {!videoData && !channelData && !loading && (
              <Card className="border-2 border-blue-100 shadow-xl">
                <CardContent className="p-12 text-center">
                  {analysisType === 'video' ? (
                    <Video className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  ) : (
                    <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  )}
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Ready to Analyze {analysisType === 'video' ? 'Video' : 'Channel'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {analysisType === 'video' 
                      ? 'Enter a YouTube video URL or Shorts link above to see performance insights.'
                      : 'Enter a YouTube channel URL above to see comprehensive channel analytics, best upload times, top videos, and growth insights.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
