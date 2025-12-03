import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')
    const accessToken = searchParams.get('accessToken')

    if (!channelId || !accessToken) {
      return NextResponse.json({ 
        error: 'Channel ID and access token are required' 
      }, { status: 400 })
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    })

    // Get channel's videos
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      channelId: channelId,
      order: 'viewCount', // Order by view count
      type: 'video',
      maxResults: 10
    })

    if (!(searchResponse as any).data?.items) {
      return NextResponse.json({ videos: [] })
    }

    // Get detailed video statistics
    interface SearchItem {
      id?: {
        videoId?: string;
      };
    }

    const videoIds: string[] = (searchResponse as any).data.items
      .map((item: SearchItem) => item.id?.videoId)
      .filter(Boolean)

    if (videoIds.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: videoIds
    })

    const videos = videosResponse.data.items?.map(video => ({
      id: video.id,
      title: video.snippet?.title,
      description: video.snippet?.description,
      publishedAt: video.snippet?.publishedAt,
      thumbnail: video.snippet?.thumbnails?.medium?.url,
      viewCount: parseInt(video.statistics?.viewCount || '0'),
      likeCount: parseInt(video.statistics?.likeCount || '0'),
      commentCount: parseInt(video.statistics?.commentCount || '0'),
      tags: video.snippet?.tags || []
    })) || []

    // Sort by view count descending
    videos.sort((a, b) => b.viewCount - a.viewCount)

    return NextResponse.json({ 
      videos: videos.slice(0, 5), // Return top 5
      totalFound: videos.length
    })

  } catch (error: any) {
    console.error('Error fetching channel videos:', error)
    
    // Return fallback empty response instead of error to not block the feature
    return NextResponse.json({ 
      videos: [],
      error: 'Could not fetch channel videos',
      fallback: true
    })
  }
}