import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('id')
    const accessToken = searchParams.get('access_token')

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
    }

    // Use API key for public data, access token for authenticated requests
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey && !accessToken) {
      return NextResponse.json({ 
        error: 'YouTube API key or access token required' 
      }, { status: 401 })
    }

    let finalChannelId = channelId
    
    // Handle different channel URL formats
    if (channelId.startsWith('@') || channelId.startsWith('c/') || channelId.startsWith('user/')) {
      // Search for channel by username/handle
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelId)}&maxResults=1&${
        accessToken ? `access_token=${accessToken}` : `key=${apiKey}`
      }`
      
      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()
      
      if (!searchResponse.ok) {
        throw new Error(searchData.error?.message || 'Failed to search for channel')
      }
      
      if (!searchData.items || searchData.items.length === 0) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
      }
      
      finalChannelId = searchData.items[0].snippet.channelId
    }

    // Get channel details
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings,contentDetails,status&id=${finalChannelId}&${
      accessToken ? `access_token=${accessToken}` : `key=${apiKey}`
    }`
    
    const channelResponse = await fetch(channelUrl)
    const channelData = await channelResponse.json()
    
    if (!channelResponse.ok) {
      throw new Error(channelData.error?.message || 'Failed to fetch channel data')
    }
    
    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    const channel = channelData.items[0]

    // Get recent videos for analysis (by date)
    const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${finalChannelId}&order=date&type=video&maxResults=50&${
      accessToken ? `access_token=${accessToken}` : `key=${apiKey}`
    }`
    
    const videosResponse = await fetch(videosUrl)
    const videosData = await videosResponse.json()

    // Get top performing videos (by view count)
    const topVideosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${finalChannelId}&order=viewCount&type=video&maxResults=25&${
      accessToken ? `access_token=${accessToken}` : `key=${apiKey}`
    }`
    
    const topVideosResponse = await fetch(topVideosUrl)
    const topVideosData = await topVideosResponse.json()
    
    let recentVideos = []
    let topVideos = []
    interface UploadTime {
        hour: number;
        count: number;
    }

    interface UploadDay {
        day: number;
        count: number;
    }

    let uploadTimes: UploadTime[] = []
    let uploadDays: UploadDay[] = []
    let averageViews = 0
    let engagementRate = 0
    let bestPerformingCategories: string[] = []

    // Process recent videos for upload time analysis
    if (videosResponse.ok && videosData.items) {
      // Get detailed video statistics for recent videos
      const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',')
      
      if (videoIds) {
        const videoStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&${
          accessToken ? `access_token=${accessToken}` : `key=${apiKey}`
        }`
        
        const videoStatsResponse = await fetch(videoStatsUrl)
        const videoStatsData = await videoStatsResponse.json()
        
        if (videoStatsResponse.ok && videoStatsData.items) {
          recentVideos = videoStatsData.items.map((video: any) => ({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
            publishedAt: video.snippet.publishedAt,
            viewCount: video.statistics.viewCount || '0',
            likeCount: video.statistics.likeCount || '0',
            commentCount: video.statistics.commentCount || '0',
            favoriteCount: video.statistics.favoriteCount || '0',
            channelTitle: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            duration: video.contentDetails.duration,
            tags: video.snippet.tags || [],
            categoryId: video.snippet.categoryId
          }))
        }
      }
    }

    // Process top performing videos separately
    if (topVideosResponse.ok && topVideosData.items) {
      // Get detailed video statistics for top videos
      const topVideoIds = topVideosData.items.map((item: any) => item.id.videoId).join(',')
      
      if (topVideoIds) {
        const topVideoStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${topVideoIds}&${
          accessToken ? `access_token=${accessToken}` : `key=${apiKey}`
        }`
        
        const topVideoStatsResponse = await fetch(topVideoStatsUrl)
        const topVideoStatsData = await topVideoStatsResponse.json()
        
        if (topVideoStatsResponse.ok && topVideoStatsData.items) {
          topVideos = topVideoStatsData.items.map((video: any) => ({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
            publishedAt: video.snippet.publishedAt,
            viewCount: video.statistics.viewCount || '0',
            likeCount: video.statistics.likeCount || '0',
            commentCount: video.statistics.commentCount || '0',
            favoriteCount: video.statistics.favoriteCount || '0',
            channelTitle: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            duration: video.contentDetails.duration,
            tags: video.snippet.tags || [],
            categoryId: video.snippet.categoryId
          }))

          // Sort by view count to ensure proper ordering
        interface Video {
            id: string;
            title: string;
            description: string;
            thumbnail: string;
            publishedAt: string;
            viewCount: string;
            likeCount: string;
            commentCount: string;
            favoriteCount: string;
            channelTitle: string;
            channelId: string;
            duration: string;
            tags: string[];
            categoryId: string;
        }

        topVideos = topVideos.sort((a: Video, b: Video) => parseInt(b.viewCount) - parseInt(a.viewCount))
        }
      }
    }

    // Use recent videos for time analysis if available
    if (recentVideos.length > 0) {

          // Calculate upload time patterns
          const timeData: { [key: number]: number } = {}
          const dayData: { [key: number]: number } = {}
          const categoryData: { [key: string]: number } = {}
          
          let totalViews = 0
          let totalLikes = 0
          let totalComments = 0
          
          recentVideos.forEach((video: any) => {
            const publishDate = new Date(video.publishedAt)
            const hour = publishDate.getHours()
            const day = publishDate.getDay()
            
            timeData[hour] = (timeData[hour] || 0) + 1
            dayData[day] = (dayData[day] || 0) + 1
            categoryData[video.categoryId] = (categoryData[video.categoryId] || 0) + 1
            
            totalViews += parseInt(video.viewCount)
            totalLikes += parseInt(video.likeCount)
            totalComments += parseInt(video.commentCount)
          })

          // Convert to arrays for response
          uploadTimes = Object.entries(timeData).map(([hour, count]) => ({
            hour: parseInt(hour),
            count
          }))
          
          uploadDays = Object.entries(dayData).map(([day, count]) => ({
            day: parseInt(day),
            count
          }))

      // Calculate averages
      if (recentVideos.length > 0) {
        averageViews = Math.round(totalViews / recentVideos.length)
        engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0
      }

      // Get best performing categories
      bestPerformingCategories = Object.entries(categoryData)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([categoryId]) => categoryId)
    }

    // Calculate growth rate and channel metrics
    const channelAge = Date.now() - new Date(channel.snippet.publishedAt).getTime()
    const yearsActive = Math.max(1, channelAge / (1000 * 60 * 60 * 24 * 365))
    const monthsActive = Math.max(1, channelAge / (1000 * 60 * 60 * 24 * 30))
    const subscribersPerMonth = parseInt(channel.statistics.subscriberCount) / monthsActive
    const growthRate = (subscribersPerMonth / Math.max(1, parseInt(channel.statistics.subscriberCount))) * 100

    // Calculate comprehensive health score
    let healthScore = 0
    const subs = parseInt(channel.statistics.subscriberCount || '0')
    const videoCount = parseInt(channel.statistics.videoCount || '0')
    const totalViews = parseInt(channel.statistics.viewCount || '0')

    // Subscriber count scoring (25 points max)
    if (subs >= 1000000) healthScore += 25
    else if (subs >= 100000) healthScore += 20
    else if (subs >= 10000) healthScore += 15
    else if (subs >= 1000) healthScore += 10
    else if (subs >= 100) healthScore += 5

    // Video count and consistency (20 points max)
    const videosPerYear = videoCount / yearsActive
    if (videosPerYear >= 52) healthScore += 20 // Weekly uploads
    else if (videosPerYear >= 24) healthScore += 15 // Bi-weekly
    else if (videosPerYear >= 12) healthScore += 10 // Monthly
    else if (videosPerYear >= 6) healthScore += 5 // Bi-monthly

    // Engagement rate (20 points max)
    if (engagementRate >= 5) healthScore += 20
    else if (engagementRate >= 3) healthScore += 15
    else if (engagementRate >= 2) healthScore += 10
    else if (engagementRate >= 1) healthScore += 5

    // Average views vs subscribers ratio (15 points max)
    const viewsToSubsRatio = subs > 0 ? (averageViews / subs) * 100 : 0
    if (viewsToSubsRatio >= 10) healthScore += 15
    else if (viewsToSubsRatio >= 5) healthScore += 12
    else if (viewsToSubsRatio >= 2) healthScore += 8
    else if (viewsToSubsRatio >= 1) healthScore += 4

    // Channel completeness (10 points max)
    let completeness = 0
    if (channel.snippet.description && channel.snippet.description.length > 100) completeness += 3
    if (channel.brandingSettings?.channel?.keywords) completeness += 2
    if (channel.snippet.customUrl) completeness += 2
    if (channel.snippet.country) completeness += 1
    if (channel.snippet.thumbnails?.medium) completeness += 2
    healthScore += completeness

    // Growth potential (10 points max)
    const viewsPerSub = subs > 0 ? totalViews / subs : 0
    if (viewsPerSub >= 100) healthScore += 10
    else if (viewsPerSub >= 50) healthScore += 7
    else if (viewsPerSub >= 20) healthScore += 5
    else if (viewsPerSub >= 10) healthScore += 3

    // Ensure score is between 0-100
    healthScore = Math.min(Math.max(healthScore, 0), 100)

    // Calculate consistency score
    const consistencyScore = Math.min(100, (videosPerYear / 52) * 100)

    // Calculate trends score based on recent performance
    let trendsScore = 50 // Default neutral score
    if (recentVideos.length > 5) {
      const recentAvgViews = recentVideos.slice(0, 5).reduce((acc: number, v: any) => acc + parseInt(v.viewCount), 0) / 5
      const olderAvgViews = recentVideos.slice(-5).reduce((acc: number, v: any) => acc + parseInt(v.viewCount), 0) / 5
      if (recentAvgViews > olderAvgViews * 1.2) trendsScore = 75
      else if (recentAvgViews > olderAvgViews) trendsScore = 65
      else if (recentAvgViews < olderAvgViews * 0.8) trendsScore = 25
      else trendsScore = 40
    }

    const result = {
      channel: {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
        publishedAt: channel.snippet.publishedAt,
        subscriberCount: channel.statistics.subscriberCount || '0',
        viewCount: channel.statistics.viewCount || '0',
        videoCount: channel.statistics.videoCount || '0',
        country: channel.snippet.country,
        customUrl: channel.snippet.customUrl,
        defaultLanguage: channel.snippet.defaultLanguage,
        keywords: channel.brandingSettings?.channel?.keywords,
        topVideos,
        recentVideos: recentVideos.slice(0, 10),
        uploadTimes,
        uploadDays,
        averageViews,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        growthRate: parseFloat(growthRate.toFixed(2)),
        bestPerformingCategories,
        channelAge: parseFloat(yearsActive.toFixed(1)),
        healthScore: Math.round(healthScore),
        consistencyScore: Math.round(consistencyScore),
        trendsScore: Math.round(trendsScore)
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Channel analysis error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to analyze channel'
    }, { status: 500 })
  }
}