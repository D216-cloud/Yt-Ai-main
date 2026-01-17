import { NextResponse } from 'next/server'
import { google } from 'googleapis'

/**
 * GET /api/youtube/keywords
 * Fetch related keywords from YouTube by searching for similar videos
 * Returns titles from top 25 competing videos
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const query = (url.searchParams.get('query') || '').trim()
    const type = url.searchParams.get('type') || 'video' // video, channel, playlist
    const maxResults = parseInt(url.searchParams.get('maxResults') || '25')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'YOUTUBE_API_KEY not configured',
        titles: [],
        keywords: [],
        fallback: true
      }, { status: 500 })
    }

    const youtube = google.youtube({ version: 'v3', auth: apiKey })

    // Search YouTube for videos matching the query
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: [type],
      maxResults: Math.min(maxResults, 50), // YouTube max is 50 per request
      order: 'relevance',
      safeSearch: 'none'
    })

    const items = searchResponse.data.items || []
    const videoIds = items
      .map(item => item.id?.videoId)
      .filter(Boolean) as string[]

    if (videoIds.length === 0) {
      return NextResponse.json({
        titles: [],
        keywords: [],
        query,
        count: 0,
        message: 'No results found'
      })
    }

    // Fetch full video snippets (including titles, descriptions, tags)
    const titles: string[] = []
    const allTags: string[] = []

    // Fetch in chunks (YouTube API max 50 per request)
    const chunkSize = 50
    for (let i = 0; i < videoIds.length; i += chunkSize) {
      const chunk = videoIds.slice(i, i + chunkSize)
      
      const videosResponse = await youtube.videos.list({
        part: ['snippet'],
        id: chunk
      })

      const videos = videosResponse.data.items || []
      videos.forEach(video => {
        if (video.snippet?.title) {
          titles.push(video.snippet.title)
        }
        if (video.snippet?.tags) {
          allTags.push(...video.snippet.tags)
        }
      })
    }

    // Extract keywords from titles and tags
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
      'have', 'has', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'shorts', 'video', 'youtube', 'viral'
    ])

    const keywordFreq: Record<string, number> = {}

    // Process titles
    titles.forEach(title => {
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .forEach(word => {
          if (word.length >= 2 && !stopWords.has(word)) {
            keywordFreq[word] = (keywordFreq[word] || 0) + 1
          }
        })
    })

    // Process tags
    allTags.forEach(tag => {
      const word = tag.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      if (word.length >= 2 && !stopWords.has(word)) {
        keywordFreq[word] = (keywordFreq[word] || 0) + 1
      }
    })

    // Sort by frequency
    const keywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword, freq]) => ({ keyword, frequency: freq }))

    return NextResponse.json({
      titles,
      keywords,
      allTags: [...new Set(allTags)], // Unique tags
      query,
      count: titles.length,
      keywordCount: keywords.length,
      success: true
    })
  } catch (error) {
    console.error('[API] /youtube/keywords error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch keywords',
      titles: [],
      keywords: [],
      fallback: true
    }, { status: 500 })
  }
}
