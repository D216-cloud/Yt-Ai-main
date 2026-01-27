"use client"

import { useState, useRef } from "react"
import SharedSidebar from "@/components/shared-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload, FileVideo, Image, Wand2, Sparkles, CheckCircle,
  AlertCircle, Eye, Clock, Hash, BarChart3, Zap, Target,
  FileText, Video, Youtube, Download, Trash2, RotateCcw,
  Play, Pause, Volume2, VolumeX, Maximize, Settings,
  TrendingUp, Users, Heart, MessageSquare, Share2, X,
  CloudUpload, FolderOpen, Film, Camera, Mic, Edit3,
  Globe, Lock, Calendar, Tag, DollarSign, Crown, Star
} from "lucide-react"

interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  duration?: number
  thumbnail?: string
  status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error'
  progress: number
  analysis?: VideoAnalysis
  uploadProgress?: number
  processingStage?: string
}

interface VideoAnalysis {
  predictedViews: number
  viralScore: number
  thumbnailScore: number
  titleSuggestions: string[]
  tagSuggestions: string[]
  descriptionSuggestions: string
  bestUploadTime: string
  competitorAnalysis: {
    similarVideos: number
    averageViews: number
    topKeywords: string[]
  }
  seoScore: number
  engagementPrediction: number
  monetizationPotential: 'high' | 'medium' | 'low'
  audienceMatch: number
  trendingTopics: string[]
}

export default function VideoUploadAnalysisPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith('video/')) {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          size: file.size,
          status: 'uploading',
          progress: 0
        }
        
        setFiles(prev => [...prev, newFile])
        
        // Simulate file upload and analysis
        simulateFileProcessing(newFile.id)
      }
    })
  }

  const simulateFileProcessing = async (fileId: string) => {
    // Upload simulation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, progress: i, uploadProgress: i }
          : file
      ))
    }

    // Processing stage
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: 'processing', processingStage: 'Extracting video metadata...' }
        : file
    ))

    await new Promise(resolve => setTimeout(resolve, 1000))

    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, processingStage: 'Analyzing video content...' }
        : file
    ))

    await new Promise(resolve => setTimeout(resolve, 1500))

    // Analysis stage
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: 'analyzing', processingStage: 'Running AI analysis...' }
        : file
    ))

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate mock analysis
    const mockAnalysis: VideoAnalysis = {
      predictedViews: Math.floor(Math.random() * 100000) + 10000,
      viralScore: Math.floor(Math.random() * 40) + 60,
      thumbnailScore: Math.floor(Math.random() * 30) + 70,
      titleSuggestions: [
        "🔥 This Video Will BLOW YOUR MIND!",
        "The Secret They Don't Want You to Know",
        "How I Got 1M Views in 24 Hours (INSANE!)",
        "Why Everyone is Talking About This..."
      ],
      tagSuggestions: [
        "viral", "trending", "tutorial", "howto", "amazing",
        "secret", "tips", "hacks", "2024", "youtube"
      ],
      descriptionSuggestions: "🎯 In this video, I'll show you the exact strategies that helped me...\n\n⏰ Timestamps:\n0:00 - Introduction\n2:30 - Main content\n8:45 - Conclusion\n\n🔔 Subscribe for more content like this!\n\n#trending #viral #youtube",
      bestUploadTime: "Tuesday at 3:00 PM EST",
      competitorAnalysis: {
        similarVideos: Math.floor(Math.random() * 50) + 20,
        averageViews: Math.floor(Math.random() * 50000) + 25000,
        topKeywords: ["tutorial", "guide", "tips", "2024", "beginner"]
      },
      seoScore: Math.floor(Math.random() * 20) + 75,
      engagementPrediction: Math.floor(Math.random() * 3) + 3,
      monetizationPotential: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
      audienceMatch: Math.floor(Math.random() * 20) + 80,
      trendingTopics: ["AI Tools", "YouTube Growth", "Content Creation", "Social Media"]
    }

    // Complete analysis
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
          ...file, 
          status: 'completed',
          progress: 100,
          analysis: mockAnalysis,
          thumbnail: URL.createObjectURL(file.file),
          duration: Math.floor(Math.random() * 600) + 60 // 1-10 minutes
        }
        : file
    ))
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-blue-500 to-cyan-600'
    if (score >= 40) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  const getViralScoreLabel = (score: number) => {
    if (score >= 80) return '🚀 Viral Potential'
    if (score >= 60) return '⚡ Strong Content'
    if (score >= 40) return '📈 Good Content'
    return '🎯 Needs Optimization'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return '🔥'
    if (score >= 60) return '⭐'
    if (score >= 40) return '👍'
    return '⚠️'
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="flex">
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="vid-info" />

        <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 leading-tight">
                  Video Intelligence Uploader
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Upload your videos for AI-powered analysis, optimization suggestions, and viral potential scoring
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Wand2 className="w-4 h-4 text-purple-500" />
                    <span>AI Analysis</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <span>Viral Scoring</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span>SEO Optimization</span>
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 gap-1 sm:gap-2 bg-white p-2 rounded-xl shadow-lg border border-gray-200/50">
                <TabsTrigger 
                  value="upload"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold px-4 py-3 rounded-lg transition-all"
                >
                  <CloudUpload className="w-4 h-4 mr-2" />
                  Upload & Analyze
                </TabsTrigger>
                <TabsTrigger 
                  value="results"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold px-4 py-3 rounded-lg transition-all"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analysis Results ({files.filter(f => f.status === 'completed').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                {/* Enhanced Upload Zone */}
                <Card className="border border-gray-200/50 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b border-gray-100/50">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Upload Videos for Analysis</h3>
                        <p className="text-sm text-gray-600 mt-1">Get AI insights, viral scoring, and optimization suggestions</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      <div className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                          <CloudUpload className="w-10 h-10 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                            Drop your videos here
                          </h3>
                          <p className="text-gray-600 text-base sm:text-lg mb-6">
                            Or click to browse and select video files from your device
                          </p>
                          
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <FolderOpen className="w-5 h-5 mr-3" />
                            Choose Video Files
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
                          <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <FileVideo className="w-4 h-4 text-blue-500" />
                            <span>MP4, MOV, AVI</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span>Max 2GB per file</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Zap className="w-4 h-4 text-purple-500" />
                            <span>AI-Powered Analysis</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* File Processing Queue */}
                {files.length > 0 && (
                  <Card className="border border-gray-200/50 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-gray-600 to-blue-600 rounded-lg">
                            <FileVideo className="w-5 h-5 text-white" />
                          </div>
                          <span>Processing Queue ({files.length})</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setFiles([])}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {files.map((file) => (
                          <div key={file.id} className="p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-white to-gray-50/50 shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {file.thumbnail ? (
                                  <img 
                                    src={file.thumbnail} 
                                    alt={file.name}
                                    className="w-16 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <FileVideo className="w-6 h-6 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{file.name}</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                  <span>{formatFileSize(file.size)}</span>
                                  {file.duration && <span>{formatDuration(file.duration)}</span>}
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      file.status === 'completed' ? 'border-green-500 text-green-700 bg-green-50' :
                                      file.status === 'error' ? 'border-red-500 text-red-700 bg-red-50' :
                                      'border-blue-500 text-blue-700 bg-blue-50'
                                    }`}
                                  >
                                    {file.status === 'uploading' ? 'Uploading...' :
                                     file.status === 'processing' ? 'Processing...' :
                                     file.status === 'analyzing' ? 'Analyzing...' :
                                     file.status === 'completed' ? 'Complete' : 'Error'}
                                  </Badge>
                                </div>
                                
                                {file.status !== 'completed' && file.status !== 'error' && (
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span className="text-gray-600">
                                        {file.processingStage || `${file.progress}% complete`}
                                      </span>
                                      <span className="font-semibold text-blue-600">{file.progress}%</span>
                                    </div>
                                    <Progress value={file.progress} className="h-2" />
                                  </div>
                                )}
                                
                                {file.status === 'completed' && file.analysis && (
                                  <div className="mt-3 grid grid-cols-3 gap-2">
                                    <div className="text-center p-2 bg-green-50 rounded-lg">
                                      <p className="text-xs text-green-600 font-medium">Viral Score</p>
                                      <p className="text-sm font-bold text-green-900">{file.analysis.viralScore}/100</p>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                                      <p className="text-xs text-blue-600 font-medium">SEO Score</p>
                                      <p className="text-sm font-bold text-blue-900">{file.analysis.seoScore}/100</p>
                                    </div>
                                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                                      <p className="text-xs text-purple-600 font-medium">Est. Views</p>
                                      <p className="text-sm font-bold text-purple-900">
                                        {file.analysis.predictedViews >= 1000 ? 
                                          `${Math.round(file.analysis.predictedViews / 1000)}K` : 
                                          file.analysis.predictedViews
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {file.status === 'completed' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => setActiveTab('results')}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Results
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                {files.filter(f => f.status === 'completed').length === 0 ? (
                  <Card className="border border-gray-200/50 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mb-6">
                        <BarChart3 className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">No Analysis Results Yet</h3>
                      <p className="text-gray-600 mb-6">Upload and analyze videos to see detailed insights here</p>
                      <Button 
                        onClick={() => setActiveTab('upload')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Videos
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {files.filter(f => f.status === 'completed').map((file) => (
                      file.analysis && (
                        <Card key={file.id} className="border border-gray-200/50 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b border-gray-100/50">
                            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <img 
                                  src={file.thumbnail} 
                                  alt={file.name}
                                  className="w-24 h-16 object-cover rounded-lg shadow-md"
                                />
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">{file.name}</h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span>{formatDuration(file.duration!)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge 
                                  className={`px-3 py-1 text-sm font-bold ${
                                    file.analysis.viralScore >= 80 ? 'bg-green-100 text-green-800' :
                                    file.analysis.viralScore >= 60 ? 'bg-blue-100 text-blue-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {getScoreIcon(file.analysis.viralScore)} {getViralScoreLabel(file.analysis.viralScore)}
                                </Badge>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            {/* Performance Overview */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="w-5 h-5 text-green-600" />
                                  <h4 className="font-bold text-green-900">Viral Score</h4>
                                </div>
                                <p className="text-2xl font-black text-green-900">{file.analysis.viralScore}/100</p>
                                <div className="mt-2 bg-green-200 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000"
                                    style={{ width: `${file.analysis.viralScore}%` }}
                                  />
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <BarChart3 className="w-5 h-5 text-blue-600" />
                                  <h4 className="font-bold text-blue-900">SEO Score</h4>
                                </div>
                                <p className="text-2xl font-black text-blue-900">{file.analysis.seoScore}/100</p>
                                <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-1000"
                                    style={{ width: `${file.analysis.seoScore}%` }}
                                  />
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Eye className="w-5 h-5 text-purple-600" />
                                  <h4 className="font-bold text-purple-900">Est. Views</h4>
                                </div>
                                <p className="text-2xl font-black text-purple-900">
                                  {file.analysis.predictedViews >= 1000000 ? 
                                    `${(file.analysis.predictedViews / 1000000).toFixed(1)}M` :
                                    file.analysis.predictedViews >= 1000 ? 
                                    `${Math.round(file.analysis.predictedViews / 1000)}K` : 
                                    file.analysis.predictedViews
                                  }
                                </p>
                                <p className="text-xs text-purple-700 mt-1">Predicted in 30 days</p>
                              </div>

                              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="w-5 h-5 text-orange-600" />
                                  <h4 className="font-bold text-orange-900">Engagement</h4>
                                </div>
                                <p className="text-2xl font-black text-orange-900">{file.analysis.engagementPrediction}%</p>
                                <p className="text-xs text-orange-700 mt-1">Expected rate</p>
                              </div>
                            </div>

                            {/* Analysis Sections */}
                            <Tabs defaultValue="suggestions" className="space-y-6">
                              <TabsList className="grid w-full grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
                                <TabsTrigger value="suggestions" className="text-xs sm:text-sm">
                                  <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">Suggestions</span>
                                  <span className="sm:hidden">Tips</span>
                                </TabsTrigger>
                                <TabsTrigger value="seo" className="text-xs sm:text-sm">
                                  <Hash className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  SEO
                                </TabsTrigger>
                                <TabsTrigger value="timing" className="text-xs sm:text-sm">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">Timing</span>
                                  <span className="sm:hidden">Time</span>
                                </TabsTrigger>
                                <TabsTrigger value="competition" className="text-xs sm:text-sm">
                                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">Market</span>
                                  <span className="sm:hidden">Comp</span>
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent value="suggestions" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Title Suggestions */}
                                  <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-blue-900">
                                        <Edit3 className="w-5 h-5" />
                                        Title Suggestions
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      {file.analysis.titleSuggestions.map((title, index) => (
                                        <div key={index} className="p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
                                          <div className="flex items-start justify-between">
                                            <p className="text-sm font-medium text-gray-900 flex-1">{title}</p>
                                            <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-700">
                                              #{index + 1}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </CardContent>
                                  </Card>

                                  {/* Description Template */}
                                  <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-green-900">
                                        <FileText className="w-5 h-5" />
                                        Description Template
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="p-4 bg-white border border-green-200 rounded-lg">
                                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                                          {file.analysis.descriptionSuggestions}
                                        </pre>
                                      </div>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="mt-3 w-full border-green-300 text-green-700 hover:bg-green-50"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Copy Template
                                      </Button>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="seo" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Tags */}
                                  <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-purple-900">
                                        <Tag className="w-5 h-5" />
                                        Recommended Tags
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex flex-wrap gap-2">
                                        {file.analysis.tagSuggestions.map((tag, index) => (
                                          <Badge 
                                            key={index}
                                            variant="secondary"
                                            className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border border-purple-200 hover:from-purple-200 hover:to-pink-200 transition-colors cursor-pointer"
                                          >
                                            #{tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Trending Topics */}
                                  <Card className="border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-orange-900">
                                        <TrendingUp className="w-5 h-5" />
                                        Trending Topics
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-3">
                                        {file.analysis.trendingTopics.map((topic, index) => (
                                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded-lg">
                                            <span className="font-medium text-gray-900">{topic}</span>
                                            <Badge 
                                              className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs"
                                            >
                                              🔥 Hot
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="timing" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <Card className="border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-cyan-900">
                                        <Clock className="w-5 h-5" />
                                        Best Upload Time
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                      <div className="p-6 bg-white border border-cyan-200 rounded-xl">
                                        <Calendar className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
                                        <p className="text-2xl font-bold text-cyan-900 mb-2">{file.analysis.bestUploadTime}</p>
                                        <p className="text-sm text-cyan-700">Optimal timing based on audience analysis</p>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-indigo-900">
                                        <Users className="w-5 h-5" />
                                        Audience Match
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                      <div className="p-6 bg-white border border-indigo-200 rounded-xl">
                                        <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                                        <p className="text-2xl font-bold text-indigo-900 mb-2">{file.analysis.audienceMatch}%</p>
                                        <p className="text-sm text-indigo-700">Content-audience alignment score</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="competition" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <Card className="border border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-red-900">
                                        <BarChart3 className="w-5 h-5" />
                                        Market Analysis
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                                          <span className="text-sm font-medium text-gray-700">Similar Videos</span>
                                          <span className="font-bold text-red-900">{file.analysis.competitorAnalysis.similarVideos}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                                          <span className="text-sm font-medium text-gray-700">Avg Competitor Views</span>
                                          <span className="font-bold text-red-900">
                                            {file.analysis.competitorAnalysis.averageViews >= 1000 ? 
                                              `${Math.round(file.analysis.competitorAnalysis.averageViews / 1000)}K` : 
                                              file.analysis.competitorAnalysis.averageViews
                                            }
                                          </span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-yellow-900">
                                        <DollarSign className="w-5 h-5" />
                                        Monetization Potential
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                      <div className="p-6 bg-white border border-yellow-200 rounded-xl">
                                        <div className="mb-4">
                                          {file.analysis.monetizationPotential === 'high' ? (
                                            <Crown className="w-12 h-12 text-yellow-600 mx-auto" />
                                          ) : file.analysis.monetizationPotential === 'medium' ? (
                                            <Star className="w-12 h-12 text-yellow-600 mx-auto" />
                                          ) : (
                                            <Target className="w-12 h-12 text-yellow-600 mx-auto" />
                                          )}
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-900 mb-2 capitalize">
                                          {file.analysis.monetizationPotential} Potential
                                        </p>
                                        <p className="text-sm text-yellow-700">Revenue generation capability</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      )
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}