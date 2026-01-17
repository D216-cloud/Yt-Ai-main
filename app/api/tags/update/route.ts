import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  try {
    console.log('Update tags API called')
    const { videoId, tags, accessToken, channelId } = await req.json()

    if (!videoId || !tags || !accessToken) {
      return NextResponse.json(
        { error: 'Video ID, tags, and access token are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'Tags must be a non-empty array' },
        { status: 400 }
      )
    }

    console.log('Updating tags for video:', videoId)
    console.log('Tags to add:', tags)

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

    // Test token validity
    try {
      await youtube.channels.list({
        part: ['id'],
        mine: true
      })
    } catch (tokenError: any) {
      console.error('Token validation failed:', tokenError)
      return NextResponse.json(
        {
          error: 'Invalid or expired access token. Please reconnect your YouTube channel.',
          details: tokenError.message
        },
        { status: 401 }
      )
    }

    // Get current video details
    let currentVideoResponse
    try {
      currentVideoResponse = await youtube.videos.list({
        part: ['snippet', 'status'],
        id: [videoId]
      })
    } catch (error: any) {
      console.error('Failed to get current video details:', error)
      return NextResponse.json(
        {
          error: 'Failed to get current video details',
          details: error.message
        },
        { status: 403 }
      )
    }

    const currentVideo = currentVideoResponse.data.items?.[0]

    if (!currentVideo) {
      return NextResponse.json(
        { error: 'Video not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    if (!currentVideo.snippet) {
      return NextResponse.json(
        { error: 'Video snippet data is not available' },
        { status: 500 }
      )
    }

    // Prepare update payload with new tags
    const updatePayload = {
      id: videoId,
      snippet: {
        ...currentVideo.snippet,
        tags: tags // Update with new tags
      },
      status: {
        ...currentVideo.status
      }
    }

    // Remove undefined values
    Object.keys(updatePayload.snippet).forEach(key => {
      if ((updatePayload.snippet as any)[key] === undefined) {
        delete (updatePayload.snippet as any)[key]
      }
    })

    Object.keys(updatePayload.status).forEach(key => {
      if ((updatePayload.status as any)[key] === undefined) {
        delete (updatePayload.status as any)[key]
      }
    })

    console.log('Final update payload:', JSON.stringify(updatePayload, null, 2))

    // Update video with new tags
    let updateResponse
    try {
      updateResponse = await youtube.videos.update({
        part: ['snippet', 'status'],
        requestBody: updatePayload
      })
    } catch (error: any) {
      console.error('YouTube API Update Error:', error)

      if (error.code === 403) {
        return NextResponse.json(
          {
            error: 'Permission denied. Make sure you have permission to edit this video.',
            details: error.message
          },
          { status: 403 }
        )
      } else if (error.code === 404) {
        return NextResponse.json(
          {
            error: 'Video not found. The video may have been deleted.',
            details: error.message
          },
          { status: 404 }
        )
      } else if (error.code === 400) {
        return NextResponse.json(
          {
            error: 'Invalid request. Tags may exceed character limit or contain invalid characters.',
            details: error.message
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to update tags on YouTube',
          details: error.message,
          errorCode: error.code
        },
        { status: 500 }
      )
    }

    const updatedVideo = updateResponse.data
    console.log('YouTube API Response:', updatedVideo)

    if (!updatedVideo || !updatedVideo.id) {
      return NextResponse.json(
        {
          error: 'Tags update failed - invalid response from YouTube',
          details: updatedVideo
        },
        { status: 500 }
      )
    }

    console.log('Tags updated successfully for video:', updatedVideo.snippet?.title)

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: 'Tags updated successfully on YouTube',
      tags: updatedVideo.snippet?.tags || []
    })

  } catch (error: any) {
    console.error('Error updating tags:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}
