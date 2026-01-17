"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Search,
  Sparkles,
  TrendingUp,
  Eye,
  ArrowUpRight,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TitleSuggestion {
  title: string
  searchScore: number
  keywordMatchPercentage: number
  contentType: string
  estimatedCTR: number
}

interface TrendInsights {
  topKeywords: string[]
  avgViewsPerVideo: number
  trendingPatterns: string[]
}

interface SearchResponse {
  success: boolean
  userInput: string
  searchScore: number
  optimizedUserTitle: string
  top20Titles: TitleSuggestion[]
  relatedKeywords: string[]
  trendInsights: TrendInsights
}

export default function TitleSearchScoreComponent() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) {
      setError('Please enter a keyword or title')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/title-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      const data = await response.json()
      setResults(data)

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-blue-50 border-blue-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-orange-50 border-orange-200'
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  return (
    <div className="w-full">
      {/* Search Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
        <div className="px-6 py-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter a keyword or title idea... (e.g., 'cartoon video', 'how to make...')"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value)
                    setError('')
                  }}
                  className="pl-10 h-12 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-8 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div ref={resultsRef} className="space-y-8">
          {/* Search Score Card */}
          <Card className={cn(
            'border-2 p-6 rounded-xl',
            getScoreBgColor(results.searchScore)
          )}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Search Score</p>
                  <p className="text-gray-900 mt-1">
                    <span className="text-lg font-semibold">{results.userInput}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className={cn('text-5xl font-bold', getScoreColor(results.searchScore))}>
                    {results.searchScore}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">/ 100</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-300/50">
                <p className="text-sm font-semibold text-gray-700 mb-3">Your Optimized Title</p>
                <div className="flex items-center justify-between bg-white/60 p-4 rounded-lg border border-gray-200/50">
                  <p className="text-gray-900 font-medium">{results.optimizedUserTitle}</p>
                  <button
                    onClick={() => copyToClipboard(results.optimizedUserTitle, -1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copiedIndex === -1 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Trend Insights */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Top Keywords</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.trendInsights.topKeywords.slice(0, 5).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Avg Views</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatViews(results.trendInsights.avgViewsPerVideo)}
              </p>
              <p className="text-xs text-gray-500 mt-2">per video</p>
            </Card>

            <Card className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Trends</p>
              </div>
              <div className="space-y-1">
                {results.trendInsights.trendingPatterns.map((pattern, idx) => (
                  <p key={idx} className="text-xs text-gray-600">
                    • {pattern}
                  </p>
                ))}
              </div>
            </Card>
          </div>

          {/* Related Keywords */}
          <Card className="p-6 border border-gray-200 rounded-xl bg-white">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">People Also Search For</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {results.relatedKeywords.map((keyword, idx) => (
                <button
                  key={idx}
                  onClick={() => setKeyword(keyword)}
                  className="px-4 py-2 text-left text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors group"
                >
                  <p className="text-gray-700 group-hover:text-blue-700 font-medium truncate">{keyword}</p>
                  <p className="text-xs text-gray-500 group-hover:text-blue-600 mt-1">Click to search</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Top 20 Title Suggestions */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Top 20 Optimized Titles
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                SEO-friendly titles likely to appear in YouTube search suggestions
              </p>
            </div>

            <div className="grid gap-3">
              {results.top20Titles.map((suggestion, index) => (
                <Card
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Title and Copy Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {suggestion.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {suggestion.title.length} characters
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.title, index)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                      <div className="text-center">
                        <p className={cn('text-lg font-bold', getScoreColor(suggestion.searchScore))}>
                          {suggestion.searchScore}
                        </p>
                        <p className="text-xs text-gray-600">Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round(suggestion.keywordMatchPercentage)}%
                        </p>
                        <p className="text-xs text-gray-600">Match</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {suggestion.estimatedCTR.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600">Est. CTR</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                          {suggestion.contentType}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Score:</strong> SEO ranking potential | <strong>Match:</strong> Keyword relevance |{' '}
                <strong>Est. CTR:</strong> Estimated click-through rate | <strong>Type:</strong> Content format
              </p>
            </div>
          </div>

          {/* Search Preview */}
          <Card className="p-6 border border-gray-200 rounded-xl bg-white">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              How Your Title Appears in Search
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Search Result Preview</p>
                <p className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer">
                  {results.optimizedUserTitle}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  youtube.com › results › {results.userInput}
                </p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  Discover the best {results.userInput} content with our optimized suggestions...
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!results && !loading && (
        <div className="text-center py-12">
          <div className="space-y-4">
            <Sparkles className="h-16 w-16 text-blue-300 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">YouTube Title Intelligence</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a keyword or title idea to get SEO-optimized suggestions, search scores, and real YouTube trends
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
