import { NextResponse } from 'next/server'
import { google } from 'googleapis'

interface TagResult {
  tag: string
  score: number
  level: 'high' | 'medium' | 'low'
}

/**
 * YouTube SEO Tag Suggestion Engine (vidIQ-style)
 * POST /api/youtube/seo-tags
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, videoType = 'long', mode = 'suggest', existingTags = [] } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // STEP 1: TITLE NORMALIZATION
    const normalizedTitle = normalizeTitle(title)
    
    // STEP 2: INTENT EXTRACTION
    const intentKeywords = extractIntent(normalizedTitle)
    
    if (mode === 'missing') {
      // STEP 5: MISSING TAGS MODE
      const missingTags = generateMissingTags(normalizedTitle)
      return NextResponse.json({ tags: missingTags })
    }

    // STEP 3: CANDIDATE TAG GENERATION + STEP 4: TAG SCORING
    const candidateTags = await generateCandidateTags(intentKeywords, videoType, normalizedTitle)
    
    // Filter out existing tags
    const filteredTags = candidateTags.filter(tag => 
      !existingTags.some((existing: string) => 
        existing.toLowerCase() === tag.tag.toLowerCase()
      )
    )

    return NextResponse.json({ 
      tags: filteredTags.slice(0, 20),
      normalizedTitle,
      intentKeywords,
      totalCandidates: candidateTags.length
    })
  } catch (error) {
    console.error('[SEO Tags API Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate tags',
      tags: []
    }, { status: 500 })
  }
}

/**
 * STEP 1: TITLE NORMALIZATION
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/#/g, '') // Remove hashtags
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    // Fix common spelling mistakes
    .replace(/cresh/gi, 'crash')
    .replace(/rolsroys/gi, 'rolls royce')
    .replace(/virel/gi, 'viral')
    .replace(/fayl/gi, 'fail')
}

/**
 * STEP 2: INTENT EXTRACTION
 */
function extractIntent(normalizedTitle: string): string[] {
  const words = normalizedTitle.split(' ').filter(Boolean)
  const intent: string[] = []
  
  // Primary entities (brands, people, objects)
  const entities = [
    'g wagon', 'rolls royce', 'lamborghini', 'ferrari', 'bugatti', 'mclaren',
    'tesla', 'bmw', 'mercedes', 'audi', 'porsche', 'bentley', 'maserati',
    'hulk', 'spiderman', 'batman', 'superman', 'ironman', 'thor',
    'iphone', 'samsung', 'google', 'apple', 'microsoft', 'nvidia'
  ]
  
  // Action words
  const actions = [
    'crash', 'fight', 'save', 'rescue', 'funny', 'fail', 'epic', 'viral',
    'amazing', 'incredible', 'shocking', 'unbelievable', 'dangerous',
    'review', 'unboxing', 'tutorial', 'guide', 'tips', 'tricks',
    'reaction', 'challenge', 'vs', 'versus', 'comparison'
  ]
  
  // Context words
  const context = [
    'shorts', 'viral', 'clip', 'footage', 'news', 'breaking', 'live',
    'exclusive', 'behind scenes', 'documentary', 'compilation',
    'highlights', 'moments', 'best', 'top', 'worst', 'first', 'last'
  ]
  
  const allKeywords = [...entities, ...actions, ...context]
  
  // Extract matching keywords
  allKeywords.forEach(keyword => {
    if (normalizedTitle.includes(keyword)) {
      intent.push(keyword)
    }
  })
  
  // Add individual words that seem important
  words.forEach(word => {
    if (word.length >= 3 && !['the', 'and', 'with', 'for', 'are', 'you', 'all', 'not'].includes(word)) {
      if (!intent.some(i => i.includes(word))) {
        intent.push(word)
      }
    }
  })
  
  return intent
}

/**
 * STEP 3: CANDIDATE TAG GENERATION
 * Fetch REAL tags from actual YouTube videos
 */
async function generateCandidateTags(intentKeywords: string[], videoType: string, normalizedTitle: string): Promise<TagResult[]> {
  const candidates: TagResult[] = []
  
  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      console.warn('YouTube API key not found, using fallback tags')
      return generateFallbackTags(intentKeywords, videoType)
    }

    const youtube = google.youtube({ version: 'v3', auth: apiKey })
    
    // Search for real YouTube videos using the title
    console.log('🔍 Searching YouTube for real videos matching:', normalizedTitle)
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      q: normalizedTitle,
      type: ['video'],
      maxResults: 25,
      order: 'relevance'
    })

    const videoIds = searchResponse.data.items
      ?.map(item => item.id?.videoId)
      .filter(Boolean) as string[]

    if (videoIds.length === 0) {
      console.warn('No YouTube videos found, using fallback')
      return generateFallbackTags(intentKeywords, videoType)
    }

    // Fetch real video details to get their actual tags
    console.log('📊 Fetching tags from', videoIds.length, 'real YouTube videos')
    const realTags: string[] = []
    const tagFrequency: Record<string, number> = {}

    // Get video details in chunks
    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50)
      const videosResponse = await youtube.videos.list({
        part: ['snippet'],
        id: chunk
      })

      videosResponse.data.items?.forEach(video => {
        const tags = video.snippet?.tags || []
        const title = video.snippet?.title || ''
        
        // Add actual tags from the video
        tags.forEach(tag => {
          const cleanTag = tag.trim()
          if (cleanTag.length >= 2 && cleanTag.length <= 50) {
            realTags.push(cleanTag)
            tagFrequency[cleanTag.toLowerCase()] = (tagFrequency[cleanTag.toLowerCase()] || 0) + 1
          }
        })

        // Also extract keywords from successful video titles
        const titleWords = title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .split(/\s+/)
          .filter(word => word.length >= 3 && !['the', 'and', 'with', 'for', 'you', 'are', 'this', 'that'].includes(word))
        
        titleWords.forEach(word => {
          tagFrequency[word] = (tagFrequency[word] || 0) + 1
        })
      })
    }

    console.log('✅ Extracted', Object.keys(tagFrequency).length, 'unique real tags from YouTube videos')

    // Score real tags based on their frequency across successful videos
    const sortedRealTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .slice(0, 30) // Top 30 most common real tags

    sortedRealTags.forEach(([tag, frequency]) => {
      const score = scoreRealTag(tag, frequency, Object.keys(tagFrequency).length, normalizedTitle)
      const level = score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low'
      
      candidates.push({ tag, score, level })
    })

    // If we got real tags, return them
    if (candidates.length > 0) {
      return candidates.sort((a, b) => b.score - a.score)
    }

  } catch (error) {
    console.error('❌ Failed to fetch real YouTube tags:', error)
  }

  // Fallback only if YouTube API fails
  console.log('⚠️ Using fallback tags (YouTube API failed)')
  return generateFallbackTags(intentKeywords, videoType)
}

/**
 * Score REAL tags from YouTube videos
 */
function scoreRealTag(tag: string, frequency: number, totalTags: number, normalizedTitle: string): number {
  let score = 0
  
  // Base score from frequency (how often this tag appears on successful videos)
  const frequencyRatio = frequency / Math.max(totalTags / 100, 1)
  score += Math.min(frequencyRatio * 60, 60) // Up to 60 points for being commonly used
  
  // Relevance to the current title
  const titleRelevance = calculateTitleRelevance(tag, normalizedTitle)
  score += titleRelevance * 30 // Up to 30 points for title relevance
  
  // Tag length bonus (2-4 words is optimal)
  const wordCount = tag.split(' ').length
  if (wordCount >= 2 && wordCount <= 4) {
    score += 10
  } else if (wordCount === 1) {
    score += 5
  }
  
  return Math.min(Math.max(Math.round(score), 0), 100)
}

function calculateTitleRelevance(tag: string, normalizedTitle: string): number {
  const tagLower = tag.toLowerCase()
  const titleLower = normalizedTitle.toLowerCase()
  
  // Exact substring match
  if (titleLower.includes(tagLower) || tagLower.includes(titleLower)) {
    return 100
  }
  
  // Word overlap
  const tagWords = tagLower.split(' ')
  const titleWords = titleLower.split(' ')
  
  let matches = 0
  tagWords.forEach(word => {
    if (titleWords.includes(word)) {
      matches++
    }
  })
  
  return (matches / tagWords.length) * 100
}

/**
 * Fallback tags when YouTube API fails (minimal, focused)
 */
function generateFallbackTags(intentKeywords: string[], videoType: string): TagResult[] {
  const candidates: TagResult[] = []
  
  // Only use the core intent keywords as fallback
  intentKeywords.slice(0, 10).forEach(keyword => {
    candidates.push({
      tag: keyword,
      score: Math.floor(Math.random() * 20 + 40), // 40-60 range for fallback
      level: 'medium'
    })
  })
  
  // Add video type
  if (videoType === 'shorts') {
    candidates.push({ tag: 'shorts', score: 65, level: 'high' })
  }
  
  return candidates
}

/**
 * STEP 4: TAG SCORING (0-100)
 * Now using real frequency data from YouTube videos
 */
function scoreTag(tag: string, intentKeywords: string[], videoType: string, normalizedTitle: string): number {
  let score = 0
  
  // Base relevance score
  const relevance = calculateRelevance(tag, intentKeywords, normalizedTitle)
  score += relevance * 70 // Higher weight for relevance since these are real tags
  
  // Shorts compatibility
  if (videoType === 'shorts') {
    const shortsBonus = getShortsBonus(tag)
    score += shortsBonus * 30
  }
  
  return Math.min(Math.max(Math.round(score), 0), 100)
}

function calculateRelevance(tag: string, intentKeywords: string[], normalizedTitle: string): number {
  const tagLower = tag.toLowerCase()
  let relevance = 0
  
  // Direct keyword match
  intentKeywords.forEach(keyword => {
    if (tagLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(tagLower)) {
      relevance += 25
    }
  })
  
  // Title similarity
  const titleWords = normalizedTitle.split(' ')
  const tagWords = tagLower.split(' ')
  
  let matches = 0
  tagWords.forEach(word => {
    if (titleWords.includes(word)) {
      matches++
    }
  })
  
  relevance += (matches / tagWords.length) * 50
  
  return Math.min(relevance, 100)
}

function getShortsBonus(tag: string): number {
  const shortsKeywords = ['shorts', 'short', 'viral', 'quick', 'fast', 'instant']
  const tagLower = tag.toLowerCase()
  
  return shortsKeywords.some(keyword => tagLower.includes(keyword)) ? 100 : 0
}

/**
 * STEP 5: MISSING TAGS MODE
 */
function generateMissingTags(normalizedTitle: string): TagResult[] {
  const tags: TagResult[] = []
  const words = normalizedTitle.split(' ').filter(word => word.length >= 2)
  
  // Single words
  words.forEach(word => {
    if (word.length >= 3) {
      tags.push({ tag: word, score: 99, level: 'high' })
    }
  })
  
  // Bigrams
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`
    tags.push({ tag: bigram, score: 99, level: 'high' })
  }
  
  // Trigrams
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
    if (trigram.length <= 30) {
      tags.push({ tag: trigram, score: 99, level: 'high' })
    }
  }
  
  return tags.slice(0, 15) // Limit to 15 missing tags
}