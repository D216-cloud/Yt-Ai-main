import { NextRequest, NextResponse } from "next/server"

// Uses req.url for query params - must run dynamically
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    console.log('[YouTube ChannelById] Route executed at runtime:', new Date().toISOString())
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get("channelId")

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    // Fetch channel data from YouTube API. Include brandingSettings to get channel keywords.
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&id=${channelId}&key=${apiKey}`
    )

    if (!channelResponse.ok) {
      const error = await channelResponse.json()
      return NextResponse.json(
        { error: "Failed to fetch channel data", details: error },
        { status: channelResponse.status }
      )
    }

    const channelData = await channelResponse.json()

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: "No channel found" }, { status: 404 })
    }

    const channel = channelData.items[0]

    // Extract additional fields safely
    const defaultLanguage = channel.snippet?.defaultLanguage || null
    const localized = channel.snippet?.localized || null
    const country = channel.snippet?.country || null
    const branding = channel.brandingSettings?.channel || {}
    const channelKeywords = branding.keywords || null

    return NextResponse.json({
      success: true,
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        thumbnail: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        viewCount: channel.statistics.viewCount,
        publishedAt: channel.snippet.publishedAt,
        // New fields
        defaultLanguage,
        localized,
        country,
        channelKeywords,
      },
    })
  } catch (error: any) {
    console.error("YouTube API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}