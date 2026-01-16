"use client"

import Link from "next/link"
import DashboardHeader from "@/components/dashboard-header"
import SharedSidebar from "@/components/shared-sidebar"
import { Button } from '@/components/ui/button'
import { Search, Loader2, AlertCircle, TrendingUp, TrendingDown, Minus, BarChart3, Zap, Target, Copy, Check } from "lucide-react"
import { useState } from "react"

interface KeywordResult {
    keyword: string
    searchVolume: number
    competition: number
    score: number
    trend: 'rising' | 'stable' | 'falling'
    relatedKeywords: string[]
    longTailKeywords: string[]
    questionKeywords: string[]
}

export default function KeywordResearchPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [keyword, setKeyword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<KeywordResult | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const handleAnalyze = async () => {
        if (!keyword.trim()) {
            setError('Please enter a keyword to analyze')
            return
        }

        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const response = await fetch('/api/keyword-research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword: keyword.trim() })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to analyze keyword')
            }

            const data = await response.json()
            setResult(data.result)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to analyze keyword. Please try again.'
            setError(message)
            console.error('Error analyzing keyword:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    const getCompetitionColor = (competition: number) => {
        if (competition < 30) return { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', label: 'Low' }
        if (competition < 70) return { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', label: 'Medium' }
        return { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', label: 'High' }
    }

    const getScoreColor = (score: number) => {
        if (score >= 75) return { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', icon: '🟢' }
        if (score >= 50) return { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', icon: '🟡' }
        return { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', icon: '🔴' }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'rising': return <TrendingUp className="w-4 h-4 text-green-600" />
            case 'falling': return <TrendingDown className="w-4 h-4 text-red-600" />
            default: return <Minus className="w-4 h-4 text-yellow-600" />
        }
    }

    const getTrendLabel = (trend: string) => {
        switch (trend) {
            case 'rising': return { label: 'Rising', color: 'text-green-600' }
            case 'falling': return { label: 'Falling', color: 'text-red-600' }
            default: return { label: 'Stable', color: 'text-yellow-600' }
        }
    }

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
    }

    const cardBase = 'group relative bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-sm'

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex">
                <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="keyword-research" />

                {/* Main Content */}
                <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="mb-6">
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                                    Keyword Research Tool
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Analyze keywords for YouTube SEO. Get search volume, competition level, and trending insights.
                                </p>
                            </div>

                            {/* Free Plan Banner */}
                            <div className="flex justify-center mb-6 px-3">
                                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-100 px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm text-yellow-800 shadow-sm max-w-full overflow-hidden">
                                    <Zap className="w-4 h-4 text-yellow-600" />
                                    <span className="font-medium truncate">You're on Free Plan</span>
                                    <span className="text-gray-700 hidden md:inline">Upgrade for unlimited research.</span>
                                    <a href="/pricing" className="text-blue-600 font-semibold underline ml-2">Upgrade</a>
                                </div>
                            </div>

                            {/* Search Section */}
                            <div className={`${cardBase}`}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            <Search className="w-4 h-4 inline mr-2" />
                                            Enter a Keyword
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={keyword}
                                                onChange={(e) => setKeyword(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                                                placeholder="e.g. fitness, AI tools, video editing"
                                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                            <Button
                                                onClick={handleAnalyze}
                                                disabled={isLoading || !keyword.trim()}
                                                className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-3"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search className="w-4 h-4 mr-2" />
                                                        Analyze
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Analysis Failed</h3>
                                    <p className="text-gray-600">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className={`${cardBase} text-center p-12`}>
                                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Keyword...</h3>
                                <p className="text-gray-600">Fetching search volume, competition, and trend data</p>
                            </div>
                        )}

                        {/* Results */}
                        {result && !isLoading && (
                            <div className="space-y-6">
                                {/* Main Metrics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Score Card */}
                                    <div className={`${cardBase}`}>
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-20 h-20 rounded-full ${getScoreColor(result.score).bg} border-4 ${getScoreColor(result.score).border} flex items-center justify-center mb-3`}>
                                                <div className="text-center">
                                                    <div className="text-2xl font-black text-gray-900">{result.score}</div>
                                                    <div className="text-xs text-gray-600">/100</div>
                                                </div>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-700 mb-1">Overall Score</h3>
                                            <p className={`text-xs font-semibold ${getScoreColor(result.score).text}`}>
                                                {result.score >= 75 ? '🟢 Excellent' : result.score >= 50 ? '🟡 Good' : '🔴 Challenging'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Search Volume Card */}
                                    <div className={`${cardBase}`}>
                                        <div className="flex flex-col">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-bold text-gray-700">Search Volume</h3>
                                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="text-3xl font-black text-gray-900 mb-1">
                                                {formatNumber(result.searchVolume)}
                                            </div>
                                            <p className="text-xs text-gray-500">monthly searches</p>
                                        </div>
                                    </div>

                                    {/* Competition Card */}
                                    <div className={`${cardBase}`}>
                                        <div className="flex flex-col">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-bold text-gray-700">Competition</h3>
                                                <Target className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex items-end gap-2 mb-2">
                                                <div className="text-3xl font-black text-gray-900">{result.competition}</div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCompetitionColor(result.competition).bg} ${getCompetitionColor(result.competition).border} border ${getCompetitionColor(result.competition).text}`}>
                                                    {getCompetitionColor(result.competition).label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">difficulty level</p>
                                        </div>
                                    </div>

                                    {/* Trend Card */}
                                    <div className={`${cardBase}`}>
                                        <div className="flex flex-col">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-bold text-gray-700">Trend</h3>
                                                {getTrendIcon(result.trend)}
                                            </div>
                                            <div className={`text-xl font-black mb-1 ${getTrendLabel(result.trend).color}`}>
                                                {getTrendLabel(result.trend).label}
                                            </div>
                                            <p className="text-xs text-gray-500">30-day movement</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Keyword Suggestions */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Related Keywords */}
                                    <div className={`${cardBase}`}>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="text-lg">🔗</span>
                                            Related Keywords
                                        </h3>
                                        <div className="space-y-2">
                                            {result.relatedKeywords.slice(0, 5).map((kw, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group/item">
                                                    <span className="text-sm text-gray-700 font-medium">{kw}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(kw, `related-${idx}`)}
                                                        className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                    >
                                                        {copiedField === `related-${idx}` ? (
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Long-tail Keywords */}
                                    <div className={`${cardBase}`}>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="text-lg">📝</span>
                                            Long-Tail Keywords
                                        </h3>
                                        <div className="space-y-2">
                                            {result.longTailKeywords.slice(0, 5).map((kw, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group/item">
                                                    <span className="text-sm text-gray-700 font-medium line-clamp-2">{kw}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(kw, `longtail-${idx}`)}
                                                        className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-2"
                                                    >
                                                        {copiedField === `longtail-${idx}` ? (
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question Keywords */}
                                    <div className={`${cardBase}`}>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="text-lg">❓</span>
                                            Question Keywords
                                        </h3>
                                        <div className="space-y-2">
                                            {result.questionKeywords.slice(0, 5).map((kw, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group/item">
                                                    <span className="text-sm text-gray-700 font-medium line-clamp-2">{kw}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(kw, `question-${idx}`)}
                                                        className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-2"
                                                    >
                                                        {copiedField === `question-${idx}` ? (
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">💡 SEO Tip</h4>
                                    <p className="text-sm text-gray-700">
                                        {result.score >= 75
                                            ? 'This keyword has great potential! Low competition and good search volume make it ideal for content.'
                                            : result.score >= 50
                                            ? 'This keyword is moderately competitive. Use long-tail variations for better ranking chances.'
                                            : 'This keyword is highly competitive. Consider using long-tail variations instead.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!result && !isLoading && !error && (
                            <div className={`${cardBase} text-center p-12`}>
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Start Analyzing Keywords</h3>
                                <p className="text-gray-600">Enter a keyword above to get SEO insights and suggestions</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
