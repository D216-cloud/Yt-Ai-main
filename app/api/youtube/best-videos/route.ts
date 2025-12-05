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

    // Get ALL channel's videos using pagination
    let allVideos: any[] = []
    let nextPageToken: string | undefined = undefined
    let pageCount = 0
    const maxPages = 10 // Fetch up to 10 pages (500 videos max) to avoid timeout

    do {
      const searchResponse = await youtube.search.list({
        part: ['snippet'],
        channelId: channelId,
        order: 'date', // Order by upload date (most recent first)
        type: ['video'],
        maxResults: 50, // Maximum allowed by YouTube API
        pageToken: nextPageToken
      })

      if (searchResponse.data?.items && searchResponse.data.items.length > 0) {
        allVideos.push(...searchResponse.data.items)
      }

      nextPageToken = searchResponse.data?.nextPageToken as string | undefined
      pageCount++

      // Break if no more pages or reached max pages
      if (!nextPageToken || pageCount >= maxPages) {
        break
      }
    } while (nextPageToken)

    if (allVideos.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    // Get detailed video statistics
    interface SearchItem {
      id?: {
        videoId?: string;
      };
    }

    const videoIds: string[] = allVideos
      .map((item: SearchItem) => item.id?.videoId)
      .filter((id): id is string => Boolean(id))

    if (videoIds.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    // YouTube API allows max 50 IDs per request, so we need to batch
    const batchSize = 50
    let allVideoDetails: any[] = []

    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize)
      
      const videosResponse = await youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: batch
      })

      if (videosResponse.data.items) {
        allVideoDetails.push(...videosResponse.data.items)
      }
    }

    const videos = allVideoDetails.map(video => ({
      id: video.id,
      title: video.snippet?.title,
      description: video.snippet?.description,
      publishedAt: video.snippet?.publishedAt,
      thumbnail: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || video.snippet?.thumbnails?.high?.url,
      viewCount: parseInt(video.statistics?.viewCount || '0'),
      likeCount: parseInt(video.statistics?.likeCount || '0'),
      commentCount: parseInt(video.statistics?.commentCount || '0'),
      tags: video.snippet?.tags || []
    }))

    console.log(`Found ${videos.length} videos for channel ${channelId}`)
    if (videos.length > 0) {
      console.log('Latest video:', videos[0].title, videos[0].publishedAt)
    }

    // Already sorted by date (most recent first) from the search query

    return NextResponse.json({ 
      videos: videos, // Return all videos
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