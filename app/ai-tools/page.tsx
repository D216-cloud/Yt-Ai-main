"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  Image, 
  FileText, 
  Video, 
  BarChart3, 
  Wand2, 
  Play,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Hash,
  Palette,
  Edit3,
  Target,
  Brain,
  Lightbulb,
  Zap,
  Award
} from "lucide-react"
import Link from "next/link"
import SharedSidebar from "@/components/shared-sidebar"
import DashboardHeader from "@/components/dashboard-header"

export default function AIToolsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<any>(null)

  // Load YouTube channel data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        setYoutubeChannel(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load channel data:', error)
    }
  }, [])

  const aiTools = [
    {
      id: 'thumbnail-generator',
      title: 'AI Thumbnail Generator',
      description: 'Create eye-catching thumbnails with AI-powered design suggestions',
      icon: Image,
      gradient: 'from-purple-500 to-pink-500',
      status: 'available',
      features: ['Auto Design', 'Custom Text', 'Brand Colors', 'Multiple Styles'],
      href: '/ai-tools/thumbnail-generator'
    },
    {
      id: 'channel-score',
      title: 'Score Your Channel',
      description: 'Get AI-powered analytics and improvement suggestions for your channel',
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      status: 'available',
      features: ['Performance Analysis', 'Growth Tips', 'Competitor Insights', 'SEO Score'],
      href: '/ai-tools/channel-score'
    },
    {
      id: 'ai-title',
      title: 'AI Title Generator',
      description: 'Generate engaging video titles that boost clicks and views',
      icon: Edit3,
      gradient: 'from-green-500 to-emerald-500',
      status: 'available',
      features: ['SEO Optimized', 'Trending Keywords', 'A/B Testing', 'Click-worthy'],
      href: '/ai-tools/title-generator'
    },
    {
      id: 'ai-description',
      title: 'AI Description Writer',
      description: 'Create compelling video descriptions with optimal SEO',
      icon: FileText,
      gradient: 'from-orange-500 to-red-500',
      status: 'available',
      features: ['SEO Tags', 'Call-to-Action', 'Timestamps', 'Hashtags'],
      href: '/ai-tools/description-writer'
    },
    {
      id: 'video-ideas',
      title: 'AI Video Ideas',
      description: 'Discover trending video concepts tailored to your niche',
      icon: Lightbulb,
      gradient: 'from-yellow-500 to-orange-500',
      status: 'available',
      features: ['Trend Analysis', 'Niche Focus', 'Viral Potential', 'Content Calendar'],
      href: '/ai-tools/video-ideas'
    },
    {
      id: 'content-optimizer',
      title: 'Content Optimizer',
      description: 'Optimize your content for maximum reach and engagement',
      icon: Target,
      gradient: 'from-indigo-500 to-purple-500',
      status: 'available',
      features: ['Algorithm Boost', 'Engagement Tips', 'Best Times', 'Tag Suggestions'],
      href: '/ai-tools/content-optimizer'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="ai-tools" />
        
        {/* Main Content */}
        <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      AI Tools Studio ✨
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg">
                      Supercharge your YouTube content with AI-powered tools
                    </p>
                  </div>
                </div>
                
                {/* Quick Action Button */}
                <div className="md:ml-auto">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce">
                    <Star className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              </div>
              
              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 md:p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">🚀 Welcome to the Future of Content Creation!</h3>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                      Our AI-powered tools analyze your content, suggest improvements, and help you create engaging videos that your audience will love. 
                      Each tool uses real-time data from your YouTube channels to provide personalized recommendations.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-purple-600 border border-purple-200">Real-time Analysis</span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-purple-600 border border-purple-200">AI-Powered</span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-purple-600 border border-purple-200">Multi-Channel Support</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">6</p>
                      <p className="text-sm text-gray-600">AI Tools</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">AI</p>
                      <p className="text-sm text-gray-600">Powered</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">100%</p>
                      <p className="text-sm text-gray-600">Free</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">Pro</p>
                      <p className="text-sm text-gray-600">Quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {aiTools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-[1.03] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Header */}
                  <div className={`h-28 md:h-32 bg-gradient-to-br ${tool.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-3 left-3 w-6 h-6 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                      </div>
                    </div>
                    
                    <div className="absolute top-3 md:top-4 right-3 md:right-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/30 transition-all duration-300">
                        <tool.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 group-hover:bg-white transition-all duration-300">
                        <span className="text-xs font-semibold text-gray-700">
                          {tool.status === 'available' ? '✅ Ready' : '🔄 Soon'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced Decorative Elements */}
                    <div className="absolute -top-6 -right-6 w-20 md:w-24 h-20 md:h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 md:w-16 h-12 md:h-16 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Features with improved mobile design */}
                    <div className="space-y-2 mb-4 md:mb-6">
                      {tool.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 group/feature">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover/feature:scale-110 transition-transform duration-300"></div>
                          <span className="text-xs md:text-sm text-gray-600 group-hover/feature:text-gray-800 transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Feature count badge */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-500">{tool.features.length} features available</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href={tool.href} className="block">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 md:py-3 rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <span className="flex items-center justify-center gap-2 relative z-10">
                          <Wand2 className="w-4 h-4" />
                          <span className="text-sm md:text-base">Try AI Tool</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA with enhanced design */}
            <div className="mt-8 md:mt-12 text-center">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-16 h-16 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-300 animate-bounce" />
                    <h2 className="text-xl md:text-3xl font-black">
                      Ready to Supercharge Your Content?
                    </h2>
                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-300 animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </div>
                  
                  <p className="text-purple-100 text-sm md:text-lg mb-6 leading-relaxed max-w-2xl mx-auto">
                    Join thousands of creators using our AI tools to grow their YouTube channels faster than ever before. 
                    Get personalized insights, optimize your content, and boost your engagement with real-time analytics.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                    <Button className="bg-white text-purple-600 hover:bg-gray-50 font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                      <Star className="w-4 h-4 mr-2" />
                      Start Creating Now
                    </Button>
                    <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-xl transition-all duration-300 w-full sm:w-auto">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Demo
                    </Button>
                  </div>
                  
                  {/* Social proof */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-purple-200">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>10,000+ Active Creators</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Average 40% Growth</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>100% Free Tools</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}