"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Users, 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Video,
  Star,
  Trophy,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb
} from "lucide-react"
import Link from "next/link"
import SharedSidebar from "@/components/shared-sidebar"
import DashboardHeader from "@/components/dashboard-header"

interface ChannelData {
  id: string
  title: string
  description: string
  customUrl?: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
  viewCount: string
  publishedAt: string
}

interface ChannelScore {
  channelId: string
  channelTitle: string
  overallScore: number
  scores: {
    engagement: number
    growth: number
    consistency: number
    seo: number
    content: number
  }
  metrics: {
    avgViews: number
    engagementRate: number
    uploadFrequency: number
    subscriberGrowth: number
    viewsGrowth: number
  }
  recommendations: string[]
  strengths: string[]
  weaknesses: string[]
}

export default function ChannelScorePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [scores, setScores] = useState<ChannelScore[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load channels on component mount
  useEffect(() => {
    loadChannels()
  }, [])

  const loadChannels = () => {
    try {
      const allChannels: ChannelData[] = []
      
      // Load primary channel
      const primaryChannel = localStorage.getItem('youtube_channel')
      if (primaryChannel) {
        const channel = JSON.parse(primaryChannel)
        allChannels.push(channel)
      }
      
      // Load additional channels
      const additionalChannels = localStorage.getItem('additional_youtube_channels')
      if (additionalChannels) {
        const channels = JSON.parse(additionalChannels)
        channels.forEach((ch: ChannelData) => {
          if (!allChannels.find(c => c.id === ch.id)) {
            allChannels.push(ch)
          }
        })
      }
      
      setChannels(allChannels)
      
      // Auto-score if channels exist
      if (allChannels.length > 0) {
        scoreAllChannels(allChannels)
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
      setError('Failed to load channels')
    }
  }

  const scoreAllChannels = async (channelsToScore: ChannelData[]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const scorePromises = channelsToScore.map(async (channel) => {
        // Get access token for this channel
        const token = getChannelToken(channel.id)
        if (!token) {
          throw new Error(`No access token found for channel: ${channel.title}`)
        }
        
        const response = await fetch(`/api/youtube/score-channel?channelId=${channel.id}&accessToken=${token}`)
        if (!response.ok) {
          throw new Error(`Failed to score channel: ${channel.title}`)
        }
        
        const data = await response.json()
        return {
          channelId: channel.id,
          channelTitle: channel.title,
          ...data
        }
      })
      
      const channelScores = await Promise.all(scorePromises)
      setScores(channelScores)
    } catch (error: any) {
      console.error('Error scoring channels:', error)
      setError(error.message || 'Failed to score channels')
    } finally {
      setIsLoading(false)
    }
  }

  const getChannelToken = (channelId: string): string | null => {
    try {
      // Try to get from active channel token first
      const activeToken = localStorage.getItem('youtube_access_token')
      const activeChannelId = localStorage.getItem('active_channel_id')
      
      if (activeChannelId === channelId && activeToken) {
        return activeToken
      }
      
      // Try to get from stored tokens
      const storedTokens = localStorage.getItem('channel_tokens')
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens)
        return tokens[channelId] || null
      }
      
      return activeToken // Fallback to active token
    } catch (error) {
      console.error('Error getting channel token:', error)
      return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B+'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C+'
    if (score >= 40) return 'C'
    return 'D'
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="ai-tools" />
        
        {/* Main Content */}
        <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg animate-pulse">
                    <BarChart3 className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Channel Score 📊
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg">
                      AI-powered analysis of your YouTube channels
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => scoreAllChannels(channels)}
                  disabled={isLoading || channels.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="text-sm md:text-base">{isLoading ? 'Analyzing...' : 'Refresh Scores'}</span>
                </Button>
              </div>
              
              {/* Quick Tips Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">💡 How Channel Scoring Works</h3>
                    <p className="text-gray-700 text-xs md:text-sm leading-relaxed mb-3">
                      Our AI analyzes your channel's engagement, growth, consistency, SEO, and content quality to provide actionable insights for improvement.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
                        <MessageSquare className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <span className="text-xs font-medium text-gray-700">Engagement</span>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
                        <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <span className="text-xs font-medium text-gray-700">Growth</span>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
                        <Calendar className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                        <span className="text-xs font-medium text-gray-700">Consistency</span>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
                        <Target className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                        <span className="text-xs font-medium text-gray-700">SEO</span>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
                        <Video className="w-4 h-4 text-red-600 mx-auto mb-1" />
                        <span className="text-xs font-medium text-gray-700">Content</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Summary */}
              {scores.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl md:text-2xl font-bold text-gray-900">
                          {Math.round(scores.reduce((acc, score) => acc + score.overallScore, 0) / scores.length)}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">Avg Score</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {scores.filter(s => s.overallScore >= 80).length}
                        </p>
                        <p className="text-sm text-gray-600">High Scores</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{channels.length}</p>
                        <p className="text-sm text-gray-600">Channels</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {scores.reduce((acc, score) => acc + score.recommendations.length, 0)}
                        </p>
                        <p className="text-sm text-gray-600">Tips</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Enhanced No Channels State */}
            {channels.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No Channels Connected</h2>
                  <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
                    Connect your YouTube channels to get AI-powered scoring and personalized insights for growth.
                  </p>
                  <div className="space-y-3">
                    <Link href="/connect">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Connect Channel
                      </Button>
                    </Link>
                    <p className="text-xs text-gray-500">Analyze engagement, growth, SEO and more</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Loading State */}
            {isLoading && (
              <div className="text-center py-8 md:py-12">
                <div className="max-w-sm mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 rounded-full mx-auto mb-4"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">🤖 AI Analysis in Progress</h3>
                  <p className="text-gray-600 text-sm md:text-base mb-4">Analyzing your channels...</p>
                  <div className="text-xs text-gray-500">
                    <p>• Calculating engagement scores</p>
                    <p>• Analyzing growth patterns</p>
                    <p>• Generating recommendations</p>
                  </div>
                </div>
              </div>
            )}

            {/* Channel Scores */}
            {scores.length > 0 && (
              <div className="space-y-6">
                {scores.map((channelScore, index) => (
                  <div 
                    key={channelScore.channelId} 
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Enhanced Channel Header */}
                    <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm md:text-lg font-bold">
                              {channelScore.channelTitle.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{channelScore.channelTitle}</h3>
                            <p className="text-gray-600 text-sm md:text-base">Channel Analysis</p>
                          </div>
                        </div>
                        
                        <div className="text-center md:text-right">
                          <div className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full font-bold text-sm md:text-lg ${getScoreColor(channelScore.overallScore)} shadow-lg`}>
                            <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                            {channelScore.overallScore}/100 ({getScoreGrade(channelScore.overallScore)})
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 md:p-6">
                      {/* Enhanced Score Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
                        <div className="text-center p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-300">
                          <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{channelScore.scores.engagement}</div>
                          <div className="text-xs md:text-sm text-gray-600 font-medium">Engagement</div>
                        </div>
                        <div className="text-center p-3 md:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-shadow duration-300">
                          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{channelScore.scores.growth}</div>
                          <div className="text-xs md:text-sm text-gray-600 font-medium">Growth</div>
                        </div>
                        <div className="text-center p-3 md:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow duration-300 col-span-2 md:col-span-1">
                          <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{channelScore.scores.consistency}</div>
                          <div className="text-xs md:text-sm text-gray-600 font-medium">Consistency</div>
                        </div>
                        <div className="text-center p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow duration-300">
                          <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{channelScore.scores.seo}</div>
                          <div className="text-xs md:text-sm text-gray-600 font-medium">SEO</div>
                        </div>
                        <div className="text-center p-3 md:p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-lg transition-shadow duration-300">
                          <Video className="w-6 h-6 text-red-600 mx-auto mb-2" />
                          <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{channelScore.scores.content}</div>
                          <div className="text-xs md:text-sm text-gray-600 font-medium">Content</div>
                        </div>
                      </div>

                      {/* Enhanced Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                            <Eye className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                            Key Metrics
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center bg-white rounded-lg p-2">
                              <span className="text-gray-600 text-xs md:text-sm">Avg Views:</span>
                              <span className="font-bold text-gray-900 text-sm md:text-base">{formatNumber(channelScore.metrics.avgViews)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white rounded-lg p-2">
                              <span className="text-gray-600 text-xs md:text-sm">Engagement Rate:</span>
                              <span className="font-bold text-gray-900 text-sm md:text-base">{channelScore.metrics.engagementRate.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center bg-white rounded-lg p-2">
                              <span className="text-gray-600 text-xs md:text-sm">Upload Frequency:</span>
                              <span className="font-bold text-gray-900 text-sm md:text-base">{channelScore.metrics.uploadFrequency}/month</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                            Strengths
                          </h4>
                          <ul className="space-y-2">
                            {channelScore.strengths.slice(0, 3).map((strength, index) => (
                              <li key={index} className="bg-white rounded-lg p-2 flex items-start gap-2">
                                <ArrowUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-xs md:text-sm text-gray-700 font-medium">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                            <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                            Improvements
                          </h4>
                          <ul className="space-y-2">
                            {channelScore.weaknesses.slice(0, 3).map((weakness, index) => (
                              <li key={index} className="bg-white rounded-lg p-2 flex items-start gap-2">
                                <ArrowDown className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                <span className="text-xs md:text-sm text-gray-700 font-medium">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Enhanced Recommendations */}
                      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm md:text-base">
                          <Zap className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                          🤖 AI Recommendations
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {channelScore.recommendations.map((rec, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 md:p-4 text-xs md:text-sm text-gray-700 border border-purple-200 shadow-sm hover:shadow-lg transition-shadow duration-300 relative">
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                                </div>
                                <span className="leading-relaxed">{rec}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Quick Action Tip */}
                        <div className="mt-4 bg-white rounded-lg p-3 border-2 border-dashed border-purple-300">
                          <div className="flex items-center gap-2 text-purple-700">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs md:text-sm font-medium">💡 Pro Tip: Implement 1-2 recommendations each week for steady improvement!</span>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link 
                            href={`https://youtube.com/channel/${channelScore.channelId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto hover:bg-blue-50 border-blue-300 text-blue-600">
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-sm md:text-base">View Channel</span>
                            </Button>
                          </Link>
                          
                          <Button 
                            onClick={() => scoreAllChannels([channels.find(c => c.id === channelScore.channelId)!])}
                            variant="outline" 
                            className="flex items-center gap-2 w-full sm:w-auto hover:bg-purple-50 border-purple-300 text-purple-600"
                            disabled={isLoading}
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="text-sm md:text-base">Re-analyze</span>
                          </Button>
                        </div>
                        
                        <div className="text-xs md:text-sm text-gray-500 text-center sm:text-right">
                          Last updated: {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}