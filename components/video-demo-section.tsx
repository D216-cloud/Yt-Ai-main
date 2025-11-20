"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, Maximize, RotateCcw, Sparkles, Zap, BarChart3, Target, Clock, CheckCircle, ArrowRight, Youtube, Star, Users, TrendingUp, Eye, ThumbsUp, MessageSquare } from "lucide-react"

export function VideoDemoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(45)
  const [isHovered, setIsHovered] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev < 180 ? prev + 1 : prev)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const features = [
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Watch AI create viral titles, descriptions, and tags in real-time",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      demoTime: "0:15"
    },
    {
      icon: Target,
      title: "Smart Thumbnail Creation",
      description: "See how AI designs eye-catching thumbnails that boost CTR",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      demoTime: "1:23"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time performance tracking and AI-powered insights",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      demoTime: "2:45"
    },
    {
      icon: Clock,
      title: "Automated Scheduling",
      description: "AI finds optimal upload times for maximum reach",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      demoTime: "3:12"
    },
  ]

  const stats = [
    { icon: Eye, value: "2.1M", label: "Demo Views", color: "text-blue-500" },
    { icon: ThumbsUp, value: "94%", label: "Satisfaction", color: "text-green-500" },
    { icon: Users, value: "50K+", label: "Watchers", color: "text-purple-500" },
    { icon: TrendingUp, value: "4.8★", label: "Rating", color: "text-yellow-500" }
  ]

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-32 bg-linear-to-br from-background via-purple-500/5 to-blue-500/10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-purple-500/3 to-blue-500/3 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center justify-center mb-6 bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/20 transition-colors rounded-full px-4 py-2 text-sm font-semibold shadow-sm">
              <Play className="h-4 w-4 mr-2" />
              Interactive Demo
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight mb-6">
              See{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">
                YouTubeAI
              </span>{" "}
              in Action
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
              Experience the full power of AI-driven YouTube optimization. Watch our interactive demo
              showcasing real-time content generation, thumbnail creation, and performance analytics.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            {/* Enhanced Video Player */}
            <div className="relative group h-full">
              <Card className="relative overflow-hidden bg-black rounded-2xl shadow-2xl border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 transform hover:scale-105 h-full flex flex-col">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="inline-flex items-center space-x-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-semibold text-white">YouTubeAI Demo</span>
                  </div>
                </CardHeader>
                  <div className="aspect-video bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center relative w-full">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-blue-500/5 to-transparent animate-pulse"></div>

                  {/* Demo Content Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white space-y-4">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <Youtube className="h-8 w-8 text-red-500" />
                        <span className="text-xl font-bold">YouTubeAI Demo</span>
                      </div>
                      <div className="space-y-2 text-sm opacity-80">
                        <p>AI Content Generation • Smart Scheduling</p>
                        <p>Real-time Analytics • Automated Optimization</p>
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Button
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`relative z-20 w-20 h-20 rounded-full bg-white/90 hover:bg-white text-black shadow-2xl transition-all duration-300 ${
                      isHovered ? 'scale-110' : 'scale-100'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-6">
                    <div className="flex items-center justify-between text-white mb-4">
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20 rounded-full"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <span className="text-sm font-medium">{formatTime(currentTime)} / 3:00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-linear-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(currentTime / 180) * 100}%` }}
                      ></div>
                    </div>

                    {/* Demo Timeline Markers */}
                    <div className="flex justify-between mt-2 text-xs text-white/60">
                      <span>AI Generation</span>
                      <span>Thumbnail Design</span>
                      <span>Analytics</span>
                      <span>Scheduling</span>
                    </div>
                  </div>
                    </div>
                          {/* Floating Stats */}
                          <div className="absolute -top-4 -right-4 flex gap-2">
                            <Badge className="bg-green-100 text-green-700 shadow-lg">
                              <Eye className="h-3 w-3 mr-1" />
                              Live Demo
                            </Badge>
                          </div>
                      </Card>
                  </div>

            {/* Enhanced Features Section */}
            <div className="h-full">
              <Card className="relative bg-card/95 h-full rounded-2xl border shadow-xl p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                      Complete AI-Powered Workflow
                    </h3>
                    <p className="text-muted-foreground text-pretty leading-relaxed mb-6">
                      Our interactive demo walks you through the entire YouTube optimization process,
                      from content ideation to performance analysis. See exactly how AI transforms your channel.
                    </p>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {stats.map((stat, index) => (
                        <div key={index} className="text-center p-3 bg-card/60 backdrop-blur-sm rounded-xl border">
                          <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                          <div className="text-lg font-bold text-foreground">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                <div className="space-y-4">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className={`border-2 hover:border-current/30 hover:shadow-xl transition-all duration-300 transform hover:scale-102 ${feature.bgColor} group cursor-pointer`}
                    onClick={() => setCurrentTime([15, 83, 165, 192][index])}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${feature.bgColor} shrink-0 group-hover:scale-110 transition-transform`}>
                          <feature.icon className={`h-5 w-5 ${feature.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground group-hover:text-current transition-colors">
                              {feature.title}
                            </h4>
                            <Badge variant="outline" className="text-xs border-current/20 text-current/70">
                              {feature.demoTime}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-current opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-xl font-semibold text-base flex-1"
                  onClick={() => setIsPlaying(true)}
                >
                  <Play className="h-5 w-5 mr-3" />
                  Watch Full Demo
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-300 px-8 py-4 rounded-xl font-semibold text-base"
                >
                  <Zap className="h-5 w-5 mr-3" />
                  Start Free Trial
                </Button>
                </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Social Proof */}
          <div className="mt-16 sm:mt-20 text-center">
            <div className="inline-flex items-center space-x-4 bg-card/60 backdrop-blur-sm rounded-2xl px-6 py-4 border shadow-lg mb-6">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-foreground">4.9/5 average rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-foreground">Interactive walkthrough</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-foreground">50K+ demo views</span>
              </div>
            </div>

            <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
              Join thousands of creators who've discovered the power of AI-driven YouTube optimization
              through our comprehensive interactive demo.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
