import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ids = searchParams.get('ids')
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!ids) return NextResponse.json({ error: 'ids query param required' }, { status: 400 })
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${encodeURIComponent(ids)}&key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: 'Failed to fetch video details', details: err }, { status: res.status })
    }
    const data = await res.json()
    const videos = (data.items || []).map((it: any) => ({
      id: it.id,
      title: it.snippet?.title || '',
      thumbnail: it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url || '',
      viewCount: Number(it.statistics?.viewCount || 0),
      likeCount: Number(it.statistics?.likeCount || 0),
      commentCount: Number(it.statistics?.commentCount || 0),
      duration: it.contentDetails?.duration || null,
    }))
    return NextResponse.json({ success: true, videos })
  } catch (error: any) {
    console.error('videosByIds error', error)
    return NextResponse.json({ error: 'Internal server error', details: error?.message || String(error) }, { status: 500 })
  }
}
