import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Get the channel's uploads playlist
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    );

    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel details');
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 2: Get videos from uploads playlist
    const maxResults = searchParams.get('maxResults') || '50';
    const pageToken = searchParams.get('pageToken') || '';

    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&pageToken=${pageToken}&key=${apiKey}`
    );

    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch playlist items');
    }

    const playlistData = await playlistResponse.json();

    // Step 3: Get video statistics
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
    
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`
    );

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch video statistics');
    }

    const videosData = await videosResponse.json();

    // Step 4: Combine data
    const videos = playlistData.items.map((item: any) => {
      const videoStats = videosData.items.find((v: any) => v.id === item.contentDetails.videoId);
      
      return {
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
        views: videoStats?.statistics?.viewCount || '0',
        likes: videoStats?.statistics?.likeCount || '0',
        comments: videoStats?.statistics?.commentCount || '0',
        duration: videoStats?.contentDetails?.duration || 'PT0S',
      };
    });

    return NextResponse.json({
      videos,
      nextPageToken: playlistData.nextPageToken || null,
      totalResults: playlistData.pageInfo.totalResults,
    });

  } catch (error: any) {
    console.error('Error fetching channel videos:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
