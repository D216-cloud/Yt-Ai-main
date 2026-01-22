"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SharedSidebar from '@/components/shared-sidebar'
import { Upload, ArrowLeft, Video, FileText, Tag, Lock, Globe, Users, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function VideoConfigurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Video data from previous page
  const [videoData, setVideoData] = useState<any>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '22',
    privacy: 'public',
    madeForKids: false,
    language: 'en',
    license: 'standard',
    keywords: ''
  })

  const [uploadType, setUploadType] = useState<'short' | 'long'>('long')

  // AI Content Generation states
  const [aiKeyword, setAiKeyword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiGeneratedContent, setAiGeneratedContent] = useState<{
    title: string
    description: string
    tags: string[]
    reasoning: string
  } | null>(null)

  // Tag management states
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<Array<{tag: string, usageCount: number, viralScore: number}>>([])
  const [suggestionStats, setSuggestionStats] = useState<{totalVideosAnalyzed: number, keyword: string, fallback?: boolean} | null>(null)
  const [suggestKeyword, setSuggestKeyword] = useState('')
  const [suggestLoading, setSuggestLoading] = useState(false)

  // Load video data from sessionStorage or URL params
  useEffect(() => {
    const stored = sessionStorage.getItem('uploadVideoData')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setVideoData(data)
        setVideoFile(data.file || null)
        setPreviewSrc(data.previewSrc || null)
        setUploadType(data.uploadType || 'long')
        setFormData(prev => ({
          ...prev,
          ...data.formData
        }))
        // Clean up
        sessionStorage.removeItem('uploadVideoData')
      } catch (e) {
        console.error('Failed to load video data:', e)
      }
    }
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const addTag = (suggestion?: any) => {
    const tagToAdd = suggestion?.tag || tagInput.trim()
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  // Generate AI content based on keyword
  const generateAIContent = async () => {
    if (!aiKeyword.trim()) {
      alert('Please enter a keyword')
      return
    }
    
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: aiKeyword,
          channelData: null,
          videoType: uploadType,
          bestVideos: []
        })
      })
      
      const data = await response.json()
      
      if (data.error) {
        alert('Generation Failed: ' + data.error)
        return
      }
      
      setAiGeneratedContent({
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        reasoning: data.reasoning || ''
      })
      
      // Auto-fill the form
      setFormData(prev => ({
        ...prev,
        title: data.title,
        description: data.description
      }))
      
      // Add generated tags
      if (data.tags && data.tags.length > 0) {
        const newTags = [...tags, ...data.tags.filter((tag: string) => !tags.includes(tag))]
        setTags(newTags)
      }
      
      alert('AI content generated successfully! 🎉')
      
    } catch (error: any) {
      console.error('AI generation failed:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Fetch tag suggestions from AI API
  const fetchSuggestions = async () => {
    if (!suggestKeyword.trim()) {
      alert('Please enter a keyword')
      return
    }
    
    setSuggestLoading(true)
    
    try {
      const response = await fetch('/api/tags/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: suggestKeyword,
          limit: 10
        })
      })
      
      const data = await response.json()
      
      if (data.suggestions && data.suggestions.length > 0) {
        setTagSuggestions(data.suggestions)
        setSuggestionStats({
          totalVideosAnalyzed: data.totalVideosAnalyzed || 1000,
          keyword: suggestKeyword,
          fallback: data.fallback || false
        })
      } else {
        alert('No tag suggestions found')
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      alert('Failed to fetch tag suggestions')
    } finally {
      setSuggestLoading(false)
    }
  }

  return (
    <div className="flex">
      <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="bulk-upload" isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
      <main className={`flex-1 pt-20 md:pt-24 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'} pb-12 bg-slate-50 min-h-screen transition-all overflow-x-hidden`}>
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">

          {/* Back Button & Title */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Configure Video Details</h1>
              <p className="text-sm text-gray-500 mt-1">Set up your video metadata before uploading</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Preview Card */}
              <div className="rounded-3xl bg-white p-6 md:p-8 shadow-[0_40px_80px_rgba(8,15,52,0.06)] border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Preview
                </h2>
                
                {previewSrc ? (
                  <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-video w-full mb-4">
                    <video
                      src={previewSrc}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-video w-full mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Video preview not available</p>
                    </div>
                  </div>
                )}

                {videoFile && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">File Name</p>
                        <p className="font-medium text-gray-900 truncate">{videoFile.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">File Size</p>
                        <p className="font-medium text-gray-900">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Video Type</p>
                        <p className="font-medium text-gray-900 capitalize">{uploadType} Form</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className="font-medium text-emerald-600">Ready to Configure</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Information Form */}
              <div className="rounded-3xl bg-white p-6 md:p-8 shadow-[0_40px_80px_rgba(8,15,52,0.06)] border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Video Information
                </h2>

                <div className="space-y-6">
                  {/* AI Content Generator */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 md:p-6 border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🤖</span>
                      <h3 className="font-bold text-gray-900">AI Content Generator</h3>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">NEW</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3">
                      <input 
                        type="text" 
                        value={aiKeyword} 
                        onChange={(e) => setAiKeyword(e.target.value)} 
                        placeholder="Enter main topic/keyword (e.g., 'cooking tips', 'react tutorial')" 
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && generateAIContent()}
                      />
                      <button 
                        onClick={generateAIContent}
                        disabled={isGenerating || !aiKeyword.trim()}
                        className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                          isGenerating ? 
                            'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                            'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Generating...
                          </span>
                        ) : (
                          '✨ Generate'
                        )}
                      </button>
                    </div>
                    
                    {aiGeneratedContent && (
                      <div className="mt-3 text-xs text-purple-700 bg-purple-100 rounded-lg p-3">
                        💡 <strong>AI Strategy:</strong> {aiGeneratedContent.reasoning}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Video Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter an engaging title (recommended: 50-60 characters)"
                      maxLength={100}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{formData.title.length}/100 characters</p>
                      {aiGeneratedContent && formData.title === aiGeneratedContent.title && (
                        <span className="text-xs text-green-600 flex items-center gap-1">✨ AI Generated</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your video content. Include keywords naturally (recommended: 150-300 words)"
                      maxLength={5000}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{formData.description.length}/5000 characters</p>
                      {aiGeneratedContent && formData.description === aiGeneratedContent.description && (
                        <span className="text-xs text-green-600 flex items-center gap-1">✨ AI Generated</span>
                      )}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      placeholder="Important keywords for discovery (comma-separated)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Tags & Keywords Section */}
              <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 shadow-[0_40px_80px_rgba(8,15,52,0.06)] border border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags & Keywords (AI Powered)
                </h2>

                <div className="space-y-6">
                  {/* Manual Tag Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Add Tags Manually</label>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input 
                        value={tagInput} 
                        onChange={(e) => setTagInput(e.target.value)} 
                        placeholder="Enter a tag..." 
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <button 
                        onClick={() => addTag()} 
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                      >
                        ➕ Add
                      </button>
                    </div>
                  </div>

                  {/* Current Tags Display */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Current Tags ({tags.length})</span>
                      {tags.length > 0 && (
                        <button 
                          onClick={() => setTags([])} 
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {tags.length === 0 ? (
                        <div className="text-sm text-gray-500 italic p-4 border-2 border-dashed border-gray-300 rounded-xl w-full text-center">
                          No tags added yet. Add or get AI suggestions!
                        </div>
                      ) : (
                        tags.map(t => (
                          <span 
                            key={t} 
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm font-medium text-blue-700 shadow-sm hover:shadow-md transition-all"
                          >
                            #{t}
                            <button 
                              onClick={() => removeTag(t)} 
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Tag Suggestions */}
                  <div className="border-t border-blue-200 pt-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                      <Sparkles className="w-4 h-4" />
                      Get AI Tag Suggestions
                    </label>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input 
                        value={suggestKeyword} 
                        onChange={(e) => setSuggestKeyword(e.target.value)} 
                        placeholder="Enter keyword for viral tag suggestions" 
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && fetchSuggestions()}
                      />
                      <button 
                        onClick={() => fetchSuggestions()} 
                        disabled={!suggestKeyword.trim() || suggestLoading} 
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        {suggestLoading ? '🔄 Loading...' : '🔥 Get Viral Tags'}
                      </button>
                    </div>

                    {tagSuggestions.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-blue-100 mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            🏆 Top Viral Tags
                            {suggestionStats?.fallback && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Suggested</span>}
                          </h4>
                          {suggestionStats && !suggestionStats.fallback && (
                            <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full border">
                              📊 {suggestionStats.totalVideosAnalyzed} videos analyzed
                            </span>
                          )}
                        </div>
                        
                        <div className="grid gap-2 mb-4 max-h-64 overflow-y-auto">
                          {tagSuggestions.map((suggestion, index) => {
                            const isSelected = tags.includes(suggestion.tag)
                            return (
                              <div
                                key={index}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                                  isSelected 
                                    ? 'border-green-300 bg-green-50' 
                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                }`}
                                onClick={() => !isSelected && addTag(suggestion)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full flex-shrink-0">
                                    #{index + 1}
                                  </span>
                                  <span className={`font-medium truncate ${isSelected ? 'text-green-700' : 'text-gray-800'}`}>
                                    #{suggestion.tag}
                                  </span>
                                  {isSelected && <span className="text-green-600 text-sm flex-shrink-0">✓</span>}
                                </div>
                                
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    suggestion.viralScore >= 80 ? 'bg-red-100 text-red-700' :
                                    suggestion.viralScore >= 60 ? 'bg-orange-100 text-orange-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    🔥 {suggestion.viralScore}%
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    👥 {(suggestion.usageCount / 1000).toFixed(1)}k
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              tagSuggestions.slice(0, 5).forEach(s => addTag(s))
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            ⚡ Add Top 5
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              tagSuggestions.forEach(s => addTag(s))
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            ➕ Add All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Settings */}
              <div className="rounded-3xl bg-white p-6 md:p-8 shadow-[0_40px_80px_rgba(8,15,52,0.06)] border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Video Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="22">People & Blogs</option>
                      <option value="23">Short Movies</option>
                      <option value="24">Shows</option>
                      <option value="25">Trailers</option>
                      <option value="26">Music</option>
                      <option value="27">Film & Entertainment</option>
                      <option value="28">Gaming</option>
                      <option value="29">Videoblogging</option>
                      <option value="30">Shorts</option>
                    </select>
                  </div>

                  {/* Privacy */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Lock className="w-4 h-4" />
                      Privacy
                    </label>
                    <select
                      name="privacy"
                      value={formData.privacy}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>

                  {/* License */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">License</label>
                    <select
                      name="license"
                      value={formData.license}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="standard">Standard YouTube License</option>
                      <option value="creative">Creative Commons</option>
                    </select>
                  </div>

                  {/* Made for Kids */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        name="madeForKids"
                        checked={formData.madeForKids}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Made for Kids</p>
                        <p className="text-xs text-gray-500">This video is made for children (COPPA compliance)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upload Status Card */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Upload Status</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-gray-700">Video selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-gray-700">Ready to configure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-gray-500">Uploading...</span>
                  </div>
                </div>
              </div>

              {/* Help Tips */}
              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Tips for Better Views
                </h3>
                <ul className="space-y-2 text-xs text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Use keywords naturally in title and description</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Keep title under 60 characters</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Add 3-5 relevant tags</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Write descriptive content (150+ words)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Choose the correct category</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Save final form data
                    const finalData = {
                      ...formData,
                      tags: tags.join(', ')
                    }
                    console.log('Video configuration ready:', finalData)
                    alert('Video ready for upload! 🎉')
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Upload Video
                </button>
                <button
                  onClick={handleBack}
                  className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
