import { NextRequest, NextResponse } from "next/server"

// This route reads runtime request details (e.g. `req.url`) so it must run dynamically.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    console.log('[YouTube Videos] Route executed at runtime:', new Date().toISOString())
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get("channelId")
    const maxResults = searchParams.get("maxResults") || "10"

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    // Fetch videos from YouTube API with snippet and statistics
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`
    )

    if (!videosResponse.ok) {
      const error = await videosResponse.json()
      return NextResponse.json(
        { error: "Failed to fetch videos", details: error },
        { status: videosResponse.status }
      )
    }

    const videosData = await videosResponse.json()

    // Fetch detailed statistics and content details for each video
    const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',')
    
    if (videoIds) {
      // Fetch statistics and content details
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${apiKey}`
      )
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        
        // Merge video data with statistics
        const videosWithStats = videosData.items.map((video: any) => {
          const stats = statsData.items.find((stat: any) => stat.id === video.id.videoId)
          return {
            id: video.id.videoId,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
            viewCount: stats?.statistics?.viewCount || 0,
            likeCount: stats?.statistics?.likeCount || 0,
            commentCount: stats?.statistics?.commentCount || 0,
            publishedAt: video.snippet.publishedAt,
            tags: stats?.snippet?.tags || [],
            description: stats?.snippet?.description || "",
          }
        })
        
        return NextResponse.json({
          success: true,
          videos: videosWithStats
        })
      }
    }

    // Return videos without detailed statistics if stats fetch failed
    const videos = videosData.items.map((video: any) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      publishedAt: video.snippet.publishedAt,
      tags: [],
      description: "",
    }))

    return NextResponse.json({
      success: true,
      videos
    })
  } catch (error: any) {
    console.error("YouTube API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}