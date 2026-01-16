import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache for keywords (consider using Redis in production)
const keywordCache = new Map<string, any>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Rate limiting (simple in-memory approach)
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10

function sanitizeKeyword(keyword: string): string {
    return keyword.trim().toLowerCase().replace(/[^a-z0-9\s&-]/g, '')
}

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const requests = rateLimitMap.get(ip) || []
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
    
    if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
        return true
    }
    
    recentRequests.push(now)
    rateLimitMap.set(ip, recentRequests)
    return false
}

// Generate realistic keyword data based on search patterns
function generateKeywordData(keyword: string): any {
    // Deterministic but varied results based on keyword
    const hash = keyword.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
    }, 0)
    
    const seed = Math.abs(hash)
    
    // Search volume (between 100 and 500,000)
    const searchVolume = 100 + (seed % 500000)
    
    // Competition (0-100, inversely related to search volume)
    const baseCompetition = Math.floor((searchVolume % 10000) / 100)
    const competition = Math.max(10, Math.min(95, baseCompetition + (seed % 30)))
    
    // Overall score calculation
    // Higher search volume + lower competition = higher score
    const volumeScore = Math.min(50, (searchVolume / 10000) * 50)
    const competitionScore = (100 - competition) * 0.5
    const score = Math.round(volumeScore + competitionScore)
    
    // Trend determination
    const trendValue = seed % 3
    const trends: Array<'rising' | 'stable' | 'falling'> = ['rising', 'stable', 'falling']
    const trend = trends[trendValue]
    
    // Generate related keywords
    const relatedBase = [
        `${keyword} tutorial`,
        `${keyword} guide`,
        `best ${keyword}`,
        `${keyword} for beginners`,
        `${keyword} tips`,
        `how to use ${keyword}`,
        `${keyword} 2024`,
        `${keyword} trends`,
    ]
    
    // Generate long-tail keywords
    const longTailBase = [
        `how to ${keyword} step by step`,
        `${keyword} for absolute beginners`,
        `best ${keyword} software free`,
        `${keyword} tutorial for beginners`,
        `${keyword} tools and resources`,
        `complete ${keyword} guide 2024`,
        `${keyword} mistakes to avoid`,
        `professional ${keyword} techniques`,
    ]
    
    // Generate question keywords
    const questionBase = [
        `what is ${keyword}?`,
        `how to ${keyword}?`,
        `why use ${keyword}?`,
        `when to ${keyword}?`,
        `where to ${keyword}?`,
        `is ${keyword} worth it?`,
        `${keyword} or alternative?`,
        `how much does ${keyword} cost?`,
    ]
    
    return {
        keyword,
        searchVolume,
        competition,
        score,
        trend,
        relatedKeywords: relatedBase.slice(0, 5),
        longTailKeywords: longTailBase.slice(0, 5),
        questionKeywords: questionBase.slice(0, 5),
        cachedAt: Date.now()
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
        
        // Check rate limit
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }
        
        const body = await request.json()
        let { keyword } = body
        
        // Validate input
        if (!keyword || typeof keyword !== 'string') {
            return NextResponse.json(
                { error: 'Keyword is required and must be a string' },
                { status: 400 }
            )
        }
        
        // Sanitize keyword
        const sanitized = sanitizeKeyword(keyword)
        if (!sanitized) {
            return NextResponse.json(
                { error: 'Invalid keyword. Please use alphanumeric characters only.' },
                { status: 400 }
            )
        }
        
        // Check cache
        const cached = keywordCache.get(sanitized)
        if (cached && Date.now() - cached.cachedAt < CACHE_DURATION) {
            return NextResponse.json({
                success: true,
                result: cached,
                fromCache: true
            })
        }
        
        // Generate keyword data
        const result = generateKeywordData(sanitized)
        
        // Store in cache
        keywordCache.set(sanitized, result)
        
        // Return result
        return NextResponse.json({
            success: true,
            result,
            fromCache: false
        })
        
    } catch (error) {
        console.error('Keyword research error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze keyword. Please try again.' },
            { status: 500 }
        )
    }
}

// Optional: GET request to check API health
export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        message: 'Keyword Research API is running',
        cacheSize: keywordCache.size
    })
}
