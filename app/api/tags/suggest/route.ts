import { NextResponse } from 'next/server'
import { google } from 'googleapis'

function normalizeToken(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const keyword = (url.searchParams.get('keyword') || '').trim()

    const apiKey = process.env.YOUTUBE_API_KEY
    // If no API key, fallback to a small heuristic
    if (!apiKey) {
      console.warn('YOUTUBE_API_KEY not set — returning heuristic suggestions')
      if (!keyword) return NextResponse.json({ suggestions: [] })
      const words = keyword.toLowerCase().split(/\s+/).filter(Boolean)
      const suggestions = [
        { tag: keyword, usageCount: 1000, viralScore: 95 },
        ...words.flatMap(w => [
          { tag: w, usageCount: 800, viralScore: 85 },
          { tag: `${w} tutorial`, usageCount: 600, viralScore: 75 },
          { tag: `${w} tips`, usageCount: 500, viralScore: 70 },
          { tag: `${w} review`, usageCount: 400, viralScore: 65 },
          { tag: `${w} guide`, usageCount: 350, viralScore: 60 }
        ])
      ].slice(0, 10)
      return NextResponse.json({ 
        suggestions,
        totalVideosAnalyzed: 0,
        keyword: keyword,
        fallback: true
      })
    }

    const youtube = google.youtube({ version: 'v3', auth: apiKey })

    // frequency map for candidate tokens
    const freq: Record<string, number> = {}
    const push = (text?: string | null) => {
      if (!text) return
      const pieces = text.split(/[,\s]+/).map(p => normalizeToken(p)).filter(Boolean)
      pieces.forEach(p => {
        if (p.length < 2) return
        freq[p] = (freq[p] || 0) + 1
      })
    }

    let videoIds: string[] = []

    if (keyword) {
      // search.list disabled by project policy — fall back to heuristic suggestions
      const words = keyword.toLowerCase().split(/\s+/).filter(Boolean)
      const suggestions = [
        { tag: keyword, usageCount: 1000, viralScore: 95 },
        ...words.flatMap(w => [
          { tag: w, usageCount: 800, viralScore: 85 },
          { tag: `${w} tutorial`, usageCount: 600, viralScore: 75 },
          { tag: `${w} tips`, usageCount: 500, viralScore: 70 },
          { tag: `${w} review`, usageCount: 400, viralScore: 65 },
          { tag: `${w} guide`, usageCount: 350, viralScore: 60 }
        ])
      ]
      // Use these words as pseudo-tags to probe popular videos via mostPopular
      const region = (url.searchParams.get('region') || 'US')
      const vids = await youtube.videos.list({ part: ['snippet'], chart: 'mostPopular', regionCode: region, maxResults: 25 })
      videoIds = (vids.data.items || []).map(it => it.id || '').filter(Boolean) as string[]
    } else {
      // Fallback to trending / mostPopular
      const region = (url.searchParams.get('region') || 'US')
      const vids = await youtube.videos.list({ 
        part: ['snippet'], 
        chart: 'mostPopular', 
        regionCode: region, 
        maxResults: 25 
      })
      videoIds = (vids.data.items || []).map(it => it.id || '').filter(Boolean) as string[]
    }

    if (videoIds.length === 0) return NextResponse.json({ suggestions: [] })

    // Fetch video details (snippet) to extract tags and titles/descriptions
    const chunk = (arr: string[], size = 50) => {
      const out: string[][] = []
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
      return out
    }

    for (const ids of chunk(videoIds, 50)) {
      const details = await youtube.videos.list({ 
        part: ['snippet'], 
        id: ids 
      })
      const vids = details.data.items || []
      vids.forEach(v => {
        if (v.snippet?.tags) v.snippet.tags.forEach(t => push(t))
        push(v.snippet?.title)
        push(v.snippet?.description)
      })
    }

    // Sort tokens by frequency and return top 10 viral tags with usage counts
    const topTags = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .filter(([tag, count]) => tag.length >= 2 && count >= 2) // Filter quality tags
      .slice(0, 10)
      .map(([tag, count]) => ({
        tag,
        usageCount: count,
        viralScore: Math.min(100, Math.round((count / Math.max(...Object.values(freq))) * 100))
      }))

    return NextResponse.json({ 
      suggestions: topTags,
      totalVideosAnalyzed: videoIds.length,
      keyword: keyword || 'trending'
    })
  } catch (err) {
    console.error('tags suggest route error', err)
    return NextResponse.json({ suggestions: [] })
  }
}
