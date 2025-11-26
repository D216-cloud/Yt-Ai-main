"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Video, Calendar, Eye, ThumbsUp, MessageSquare, User, Hash, Clock,
  TrendingUp, BarChart3, Award, ExternalLink, FileText, Activity,
  TrendingDown, Target, Zap, CheckCircle, AlertCircle
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

export default function VideoInfoPage() {
  const [videoUrl, setVideoUrl] = useState("")
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const fetchVideoData = async () => {
    try {
      setLoading(true)
      setError(null)
      const videoId = extractVideoId(videoUrl)
      if (!videoId) throw new Error("Invalid YouTube URL. Supports videos & Shorts")

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

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Video Intelligence Dashboard
          </h1>
          <p className="text-gray-600">Analyze YouTube videos & Shorts performance</p>
        </div>

        <Card className="mb-8 border-2 border-blue-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Enter YouTube Video or Shorts URL
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="https://www.youtube.com/watch?v=... or /shorts/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && fetchVideoData()}
              />
              <Button
                onClick={fetchVideoData}
                disabled={loading || !videoUrl.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Analyze Video
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
          <Card>
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
            <TabsList className="grid w-full grid-cols-3 gap-2 bg-white p-1 rounded-lg shadow-md">
              <TabsTrigger value="overview">
                <BarChart3 className="w-4 h-4 mr-2" />Overview
              </TabsTrigger>
              <TabsTrigger value="metadata">
                <FileText className="w-4 h-4 mr-2" />Metadata
              </TabsTrigger>
              <TabsTrigger value="insights">
                <TrendingUp className="w-4 h-4 mr-2" />Performance Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-2 border-blue-100 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-2/5 bg-black">
                      <img
                        src={videoData.snippet?.thumbnails?.maxres?.url || videoData.thumbnail}
                        alt={videoData.title}
                        className="w-full h-full object-contain"
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
            </TabsContent>

            <TabsContent value="metadata" className="space-y-6">
              <Card className="border-2 border-blue-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Video Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {videoData.description || "No description available"}
                    </p>
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
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {(() => {
                const insights = getPerformanceInsights()
                return (
                  <>
                    {/* Viral Score Header */}
                    <Card className="border-4 border-purple-200 shadow-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
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
                                  {item.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" /> :
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

        {!videoData && !loading && (
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardContent className="p-12 text-center">
              <Video className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Enter a YouTube video URL or Shorts link above to see performance insights.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
