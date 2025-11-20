"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat2, TrendingUp, Clock, Zap, Target, Users, Play, Star, CheckCircle, ArrowUpRight, BarChart3, Youtube, Award, Crown } from "lucide-react"

const exampleVideos = [
  {
    title: "MrBeast-style Viral Challenge",
    thumbnail: "/images/mrbeast-thumb.svg",
    time: "4 days ago",
    views: 1240,
    likes: 210,
    comments: 34,
    engagement: "6.1%",
    type: "Tutorial",
    growth: "+45%",
    subscribers: "+127",
    category: "Travel",
    aiOptimized: true
  },
  {
    title: "Top Movie Review Picks 2025",
    thumbnail: "/images/movie-thumb.svg",
    time: "1 week ago",
    views: 5420,
    likes: 810,
    comments: 123,
    engagement: "7.8%",
    type: "Lifestyle",
    growth: "+67%",
    subscribers: "+89",
    category: "Cooking",
    aiOptimized: true
  },
  {
    title: "Pro Gaming Highlights",
    thumbnail: "/images/game-thumb.svg",
    time: "3 days ago",
    views: 890,
    likes: 95,
    comments: 12,
    engagement: "4.5%",
    type: "Productivity",
    growth: "+23%",
    subscribers: "+34",
    category: "Tech",
    aiOptimized: true
  },
]

const successStories = [
  {
    name: "Sarah Chen",
    channel: "TechTutorials",
    subscribers: "45.2K",
    growth: "+127% in 3 months",
    avatar: "SC",
    quote: "From 5K to 45K subscribers in 3 months. The AI suggestions are incredible!",
    metrics: { views: "2.1M", engagement: "8.7%" }
  },
  {
    name: "Mike Rodriguez",
    channel: "CookingMaster",
    subscribers: "78.9K",
    growth: "+89% in 2 months",
    avatar: "MR",
    quote: "Best investment ever. My channel grew 3x faster than before!",
    metrics: { views: "4.5M", engagement: "9.2%" }
  },
  {
    name: "Emma Wilson",
    channel: "TravelDiaries",
    subscribers: "23.1K",
    growth: "+156% in 4 months",
    avatar: "EW",
    quote: "The thumbnail AI alone increased my CTR by 300%. Game changer!",
    metrics: { views: "1.8M", engagement: "7.4%" }
  }
]

const reasons = [
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    description: "Automate video publishing and scheduling with smart AI timing",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    stat: "10hrs saved"
  },
  {
    icon: TrendingUp,
    title: "3x Faster Growth",
    description: "AI-optimized metadata, thumbnails, and content strategy",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    stat: "300% growth"
  },
  {
    icon: Target,
    title: "Higher Watch Time",
    description: "Recommendations and topics that retain viewers 2x longer",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    stat: "2x retention"
  },
  {
    icon: Users,
    title: "Quality Subscribers",
    description: "Focus on community while AI handles optimization and growth",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    stat: "85% retention"
  },
]

export function YouTubeGrowthShowcase() {
  const [autopilotEnabled, setAutopilotEnabled] = useState(false)
  const [visibleStories, setVisibleStories] = useState<boolean[]>(new Array(successStories.length).fill(false))
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            successStories.forEach((_, index) => {
              setTimeout(() => {
                setVisibleStories((prev) => {
                  const newState = [...prev]
                  newState[index] = true
                  return newState
                })
              }, index * 200)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const toggleAutopilot = () => {
    setAutopilotEnabled(!autopilotEnabled)
  }

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-32 bg-linear-to-br from-background via-red-500/5 to-orange-500/10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-red-500/3 to-orange-500/3 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center mb-6 bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-colors rounded-full px-4 py-2 text-sm font-semibold shadow-sm">
            <Award className="h-4 w-4 mr-2" />
            Creator Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight mb-6">
            See What Creators Publish & Why They{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">
              Grow on YouTube
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Real results from creators using our AI-powered tools. From struggling channels to viral success stories,
            see how our platform transforms YouTube growth with data-driven optimization.
          </p>
        </div>

        {/* Success Stories */}
        <div className="mb-16 sm:mb-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12 flex items-center justify-center">
            <Crown className="h-6 w-6 mr-3 text-yellow-500" />
            Creator Success Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  visibleStories[index] ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <Card className="relative h-full hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-2 hover:border-red-500/30 bg-card/95 backdrop-blur-sm overflow-hidden group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-500 text-white font-bold text-lg shadow-lg">
                        {story.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{story.name}</h4>
                        <p className="text-sm text-muted-foreground">{story.channel}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{story.subscribers}</div>
                        <div className="text-xs text-muted-foreground">Subscribers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{story.metrics.views}</div>
                        <div className="text-xs text-muted-foreground">Total Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">{story.metrics.engagement}</div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                    </div>

                    <Badge className="bg-green-100 text-green-700 w-fit">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {story.growth}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <blockquote className="text-muted-foreground italic mb-4">
                      "{story.quote}"
                    </blockquote>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Verified Success</span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-red-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Autopilot Toggle */}
        <div className="flex justify-center mb-16 sm:mb-20">
          <Card className="bg-card/95 backdrop-blur-sm shadow-2xl border-2 hover:border-red-500/30 p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">AI Autopilot Mode</h3>
              <p className="text-muted-foreground">
                {autopilotEnabled
                  ? "AI is automatically optimizing your uploads, thumbnails, and scheduling"
                  : "Take full control or let AI handle the optimization"}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-sm font-medium">Manual Control</div>
                <div className="text-xs text-muted-foreground">Full customization</div>
              </div>

              <div className="relative">
                <button
                  onClick={toggleAutopilot}
                  className={`relative inline-flex h-20 w-36 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-xl ${
                    autopilotEnabled ? "bg-linear-to-r from-red-500 to-orange-500 shadow-red-500/25" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-16 w-16 transform rounded-full bg-white shadow-lg transition-all duration-500 flex items-center justify-center ${
                      autopilotEnabled ? "translate-x-20" : "translate-x-2"
                    }`}
                  >
                    {autopilotEnabled ? (
                      <Zap className="h-8 w-8 text-red-500 animate-pulse" />
                    ) : (
                      <Play className="h-8 w-8 text-gray-400" />
                    )}
                  </span>
                </button>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <div className="text-sm font-medium">AI Autopilot</div>
                <div className="text-xs text-muted-foreground">Smart optimization</div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Badge
                variant={autopilotEnabled ? "default" : "secondary"}
                className={`text-lg px-4 py-2 ${autopilotEnabled ? "bg-linear-to-r from-red-500 to-orange-500" : ""}`}
              >
                {autopilotEnabled ? "✨ AI OPTIMIZING" : "🎮 MANUAL MODE"}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Example Videos */}
          <div className="mb-16 sm:mb-20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center rounded-full bg-white/95 shadow-sm px-3 py-2 border">
              <Youtube className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm font-semibold text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">youtube-growth.ai/dashboard</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-center">
              <span className="sr-only">AI-Optimized Video Examples</span>
              AI-Optimized Video Examples
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {exampleVideos.map((video, index) => (
              <Card
                key={index}
                className={
                  `bg-card/95 backdrop-blur-sm shadow-xl border-2 hover:border-red-500/30 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden group`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative overflow-hidden">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-48 sm:h-44 object-cover" />
                  {/* Top-left pill */}
                  <div className="absolute top-3 left-3 flex items-center bg-white/95 rounded-full px-2 py-1 border shadow-sm">
                    {video.aiOptimized && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs mr-2 flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                    <div className="inline-flex items-center text-xs text-muted-foreground font-semibold">
                      <Youtube className="h-3 w-3 text-red-500 mr-1" />
                      <span className="truncate max-w-32">youtube-growth.ai</span>
                    </div>
                  </div>

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-white leading-tight mb-1 max-w-[90%]">{video.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-white/80">
                          <span>{video.views.toLocaleString()} views</span>
                          <span>{video.engagement} engagement</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-white bg-white/10 hover:bg-white/20 rounded-full">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">{video.type}</Badge>
                      <span className="text-xs text-muted-foreground">{video.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <Badge className="bg-green-100 text-green-700 text-xs flex items-center">+{video.subscribers} subs</Badge>
                      <Badge className="bg-blue-100 text-blue-700 text-xs flex items-center"><TrendingUp className="h-3 w-3 mr-1" />{video.growth}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center"><Heart className="h-3 w-3 mr-1" />{video.likes}</span>
                      <span className="flex items-center"><MessageCircle className="h-3 w-3 mr-1" />{video.comments}</span>
                    </div>
                    <div className={`h-1 bg-linear-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300 ${hoveredCard === index ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Users Love It */}
        <div className="mb-16 sm:mb-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12 flex items-center justify-center">
            <Star className="h-6 w-6 mr-3 text-yellow-500" />
            Why 10,000+ Creators Choose Us
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason, index) => {
              const Icon = reason.icon
              return (
                <Card
                  key={index}
                  className={`bg-card/95 backdrop-blur-sm shadow-xl border-2 hover:border-red-500/30 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 text-center group ${reason.bgColor}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-2xl ${reason.bgColor} transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className={`h-8 w-8 ${reason.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-current mb-2">{reason.stat}</div>
                    <CardTitle className="text-lg group-hover:text-red-500 transition-colors">{reason.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 bg-card/60 backdrop-blur-sm rounded-2xl px-6 py-4 border shadow-lg mb-8">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-foreground">Join 10,000+ successful creators</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-foreground">Average 3x growth rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-foreground">Proven results</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-xl font-semibold text-base"
            >
              <Zap className="h-5 w-5 mr-3" />
              Start Your Growth Journey
              <ArrowUpRight className="h-5 w-5 ml-3" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 px-8 py-4 rounded-xl font-semibold text-base"
            >
              <Play className="h-5 w-5 mr-3" />
              Watch Success Stories
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
