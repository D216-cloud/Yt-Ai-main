import { NextRequest, NextResponse } from "next/server"

// This route reads runtime request details (e.g. `req.url`) so it must run dynamically.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    console.log('[YouTube Trending] Route executed at runtime:', new Date().toISOString())
    const { searchParams } = new URL(req.url)
    const regionCode = searchParams.get("regionCode") || "US"
    const maxResults = searchParams.get("maxResults") || "10"

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    // Fetch trending videos from YouTube API
    const trendingResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}&key=${apiKey}`
    )

    if (!trendingResponse.ok) {
      const error = await trendingResponse.json()
      return NextResponse.json(
        { error: "Failed to fetch trending videos", details: error },
        { status: trendingResponse.status }
      )
    }

    const trendingData = await trendingResponse.json()

    // Extract keywords/tags from trending videos
    const keywordMap: { [key: string]: number } = {}
    
    trendingData.items.forEach((video: any) => {
      // Extract tags from video
      if (video.snippet.tags && Array.isArray(video.snippet.tags)) {
        video.snippet.tags.forEach((tag: string) => {
          const cleanTag = tag.toLowerCase().trim()
          keywordMap[cleanTag] = (keywordMap[cleanTag] || 0) + 1
        })
      }
      
      // Extract words from title
      const titleWords = video.snippet.title.toLowerCase().match(/\b(\w+)\b/g) || []
      titleWords.forEach((word: string) => {
        if (word.length > 3) { // Only consider words longer than 3 characters
          keywordMap[word] = (keywordMap[word] || 0) + 1
        }
      })
      
      // Extract words from description
      const descriptionWords = video.snippet.description.toLowerCase().match(/\b(\w+)\b/g) || []
      descriptionWords.forEach((word: string) => {
        if (word.length > 3) { // Only consider words longer than 3 characters
          keywordMap[word] = (keywordMap[word] || 0) + 1
        }
      })
    })

    // Convert to array and sort by frequency
    const trendingKeywords = Object.entries(keywordMap)
      .map(([keyword, frequency]) => ({ keyword, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20) // Top 20 keywords

    // Process videos for frontend display
    const trendingVideos = trendingData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
      viewCount: video.statistics?.viewCount || 0,
      likeCount: video.statistics?.likeCount || 0,
      publishedAt: video.snippet.publishedAt,
    }))

    return NextResponse.json({
      success: true,
      keywords: trendingKeywords,
      videos: trendingVideos,
      region: regionCode
    })
  } catch (error: any) {
    console.error("YouTube API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}