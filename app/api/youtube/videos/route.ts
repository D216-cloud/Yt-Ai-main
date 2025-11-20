import { NextRequest, NextResponse } from "next/server"

// This route reads runtime request details (e.g. `req.url`) so it must run dynamically.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    console.log('[YouTube Videos] Route executed at runtime:', new Date().toISOString())
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get("channelId")
    // Default to 20 results, allow 1..50 per YouTube API
    const maxResultsRaw = searchParams.get("maxResults") || "20"
    let maxResults = parseInt(maxResultsRaw, 10)
    if (isNaN(maxResults) || maxResults < 1) maxResults = 20
    // YouTube API limits playlistItems and search maxResults to 50
    if (maxResults > 50) maxResults = 50
    const fetchAll = String(searchParams.get('fetchAll') || 'false').toLowerCase() === 'true'
    // Optional pageToken to fetch a specific page for 'load more' UX
    const pageToken = String(searchParams.get('pageToken') || '') || undefined
    // Page cap for fetchAll to prevent unbounded loops; configurable via query param
    const pageCapRaw = parseInt(String(searchParams.get('pageCap') || '10'), 10)
    const pageCap = isNaN(pageCapRaw) ? 10 : pageCapRaw
    console.log('[YouTube Videos] params:', { channelId, maxResults, fetchAll, pageToken, pageCap })
    const initialMax = fetchAll ? 50 : maxResults

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    // Determine uploads playlist for the given channel and fetch up to maxResults
    // First, retrieve the channel's contentDetails to find the uploads playlist
    const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`)
    if (!channelRes.ok) {
      const err = await channelRes.json().catch(() => ({}))
      return NextResponse.json({ error: 'Failed to fetch channel details', details: err }, { status: channelRes.status })
    }
    const channelData = await channelRes.json()
    const uploadsPlaylistId = channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    console.log('[YouTube Videos] uploadsPlaylistId:', uploadsPlaylistId)

    let videosResponse
    if (uploadsPlaylistId) {
      // If fetchAll requested, we'll handle pagination below; otherwise, request the requested maxResults
      const pageParam = pageToken ? `&pageToken=${pageToken}` : ''
      videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${initialMax}${pageParam}&key=${apiKey}`
      )
    } else {
      // fallback: use search endpoint on the channel if uploads playlist can't be derived
      const pageParam = pageToken ? `&pageToken=${pageToken}` : ''
      videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${initialMax}${pageParam}&order=date&type=video&key=${apiKey}`
      )
    }

    if (!videosResponse.ok) {
      const error = await videosResponse.json()
      return NextResponse.json(
        { error: "Failed to fetch videos", details: error },
        { status: videosResponse.status }
      )
    }

    let videosData = await videosResponse.json()
    // Determine pages fetched for logging and pagination metadata
    let pagesFetched = 0
    // If the caller requested fetchAll, and the API supports pagination, fetch all pages up to a reasonable cap
    if (fetchAll) {
      const items: any[] = []
      // If initial request succeeded, include items
      if (Array.isArray(videosData.items)) items.push(...videosData.items)
      // Determine nextPageToken from playlist/search response
      let nextPageToken = videosData.nextPageToken
      // Cap to avoid unbounded fetches; maximum permitted pages default-> 10 (50 * 10 = 500 videos)
      const pageCap = 10
      while (nextPageToken && pagesFetched < pageCap) {
        let pagedUrl: string
        if (uploadsPlaylistId) {
          pagedUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`
        } else {
          pagedUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&pageToken=${nextPageToken}&order=date&type=video&key=${apiKey}`
        }
        const pagedRes = await fetch(pagedUrl)
        if (!pagedRes.ok) break
        const pagedData = await pagedRes.json()
        if (Array.isArray(pagedData.items)) items.push(...pagedData.items)
        nextPageToken = pagedData.nextPageToken
        pagesFetched += 1
      }
      // Replace videosData with aggregated items; preserve totalResults if we can
      const totalResultsFromPageInfo = videosData.pageInfo?.totalResults || items.length
      videosData = { items, nextPageToken: null, pageInfo: { totalResults: totalResultsFromPageInfo } }
      console.log('[YouTube Videos] fetchAll aggregated items length:', items.length, 'pagesFetched:', pagesFetched)
    }
    // pagesFetched variable will be 0 outside fetchAll or number of pages fetched if fetchAll

    // Fetch detailed statistics and content details for each video
    // playlistItems return snippet.resourceId.videoId; search returns id.videoId
    // Filter out items that don't have a resolvable video ID (e.g., deleted/private entries)
    const itemsWithId = (videosData.items || []).filter((item: any) => {
      const vid = item.id?.videoId || item.snippet?.resourceId?.videoId
      return !!vid
    })
    const videoIds = itemsWithId.map((item: any) => (item.id?.videoId || item.snippet?.resourceId?.videoId)).filter(Boolean)
    const uniqueIds = Array.from(new Set(videoIds))
    
    if (uniqueIds.length) {
      // Fetch statistics and content details
      // videos API supports up to 50 ids per request — batch as needed
      const statsResponses: any[] = []
      for (let i = 0; i < uniqueIds.length; i += 50) {
        const batch = uniqueIds.slice(i, i + 50).join(',')
        const statsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${batch}&key=${apiKey}`
        )
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          statsResponses.push(...(statsData.items || []))
        }
      }
      
      if (statsResponses.length > 0) {
        const statsData = { items: statsResponses }
        // Merge video data with statistics
        const videosWithStats = itemsWithId.map((video: any) => {
          const vid = video.id?.videoId || video.snippet?.resourceId?.videoId
          const stats = statsData.items.find((stat: any) => stat.id === vid)
          const snippet = video.snippet || stats?.snippet || {}
          return {
            id: vid,
            title: snippet.title || '',
            thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
            viewCount: stats?.statistics?.viewCount || 0,
            likeCount: stats?.statistics?.likeCount || 0,
            commentCount: stats?.statistics?.commentCount || 0,
            publishedAt: snippet.publishedAt || '',
            tags: stats?.snippet?.tags || [],
            description: stats?.snippet?.description || snippet.description || '',
          }
        })
        
        // include nextPageToken if present in original videosData so the frontend can continue pagination
        const totalResults = videosData.pageInfo?.totalResults || videosWithStats.length
        console.log('[YouTube Videos] returning', videosWithStats.length, 'of', totalResults, 'videos (maxResults:', maxResults, 'fetchAll:', fetchAll, 'pagesFetched:', pagesFetched || 0, ')')
        return NextResponse.json({
          success: true,
          videos: videosWithStats,
          totalResults,
          nextPageToken: videosData.nextPageToken || null,
          maxResults: maxResults,
          fetchAll: fetchAll
        })
      }
    }

    // Return videos without detailed statistics if stats fetch failed
    const videos = itemsWithId.map((video: any) => {
      const vid = video.id?.videoId || video.snippet?.resourceId?.videoId
      const snippet = video.snippet || {}
      return {
        id: vid,
        title: snippet.title || '',
        thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        publishedAt: snippet.publishedAt || '',
        tags: [],
        description: snippet.description || '',
      }
    })

    const count = Array.isArray(videos) ? videos.length : 0
    console.log('[YouTube Videos] Returning videos count:', count)
    const totalResults = videosData.pageInfo?.totalResults || videos.length
    console.log('[YouTube Videos] returning', videos.length, 'of', totalResults, 'videos (maxResults:', maxResults, 'fetchAll:', fetchAll, 'pagesFetched:', pagesFetched || 0, ')')
    return NextResponse.json({
      success: true,
      videos,
      totalResults,
      nextPageToken: videosData.nextPageToken || null,
      maxResults: maxResults,
      fetchAll: fetchAll
    })
  } catch (error: any) {
    console.error("YouTube API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}