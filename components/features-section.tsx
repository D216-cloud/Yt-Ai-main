"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Calendar, BarChart3, Users, Clock, Target, Zap, Shield, Sparkles, TrendingUp, Youtube, Play, Star, CheckCircle, ArrowUpRight } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Content Generator",
    description: "Create viral video scripts, titles, and descriptions with advanced AI that understands trending topics and your audience's preferences.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    category: "Content Creation",
    stats: "10x faster",
    popular: true
  },
  {
    icon: Sparkles,
    title: "Smart Thumbnail Creator",
    description: "Generate eye-catching thumbnails with AI that analyzes successful videos and creates designs that boost click-through rates.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    category: "Visual Design",
    stats: "300% more clicks",
    popular: true
  },
  {
    icon: Calendar,
    title: "AI Scheduling Engine",
    description: "Schedule uploads at optimal times with machine learning that predicts the best posting windows for maximum engagement.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    category: "Automation",
    stats: "Best time AI",
    popular: false
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description: "Track performance with real-time metrics, competitor analysis, and AI-powered insights to optimize your growth strategy.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    category: "Analytics",
    stats: "Real-time data",
    popular: false
  },
  {
    icon: Users,
    title: "Audience Intelligence",
    description: "Understand subscriber demographics, engagement patterns, and content preferences with detailed audience analytics.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    category: "Audience",
    stats: "Deep insights",
    popular: false
  },
  {
    icon: Target,
    title: "Trend Discovery Engine",
    description: "Stay ahead of trends with AI that monitors YouTube, social media, and search data to find profitable content opportunities.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    category: "Research",
    stats: "Trending topics",
    popular: true
  },
  {
    icon: Zap,
    title: "Bulk Management Suite",
    description: "Manage multiple channels, schedule hundreds of videos, and automate repetitive tasks with our powerful bulk operations.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    category: "Productivity",
    stats: "Scale unlimited",
    popular: false
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption, OAuth authentication, and 99.9% uptime guarantee. Your channel data is completely secure.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    category: "Security",
    stats: "99.9% uptime",
    popular: false
  },
]

export function FeaturesSection() {
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>(new Array(features.length).fill(false))
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleFeatures((prev) => {
                  const newState = [...prev]
                  newState[index] = true
                  return newState
                })
              }, index * 150)
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

  return (
    <section id="features" ref={sectionRef} className="relative py-20 sm:py-32 bg-linear-to-br from-background via-secondary/5 to-primary/10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-linear-to-r from-primary/3 to-secondary/3 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center mb-6 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors rounded-full px-4 py-2 text-sm font-semibold shadow-sm">
            <Star className="h-4 w-4 mr-2" />
            8 Powerful Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight mb-6">
            Powerful Features for{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">
              YouTube Growth
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Everything you need to create, optimize, and scale your YouTube channel with AI-powered tools
            that actually work. Join creators who've grown from 0 to 100K+ subscribers.
          </p>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={`relative transition-all duration-700 ${
                    visibleFeatures[index] ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <Card className={`relative h-full hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-2 overflow-hidden ${
                    hoveredFeature === index ? 'border-primary/50 shadow-primary/20' : 'border-border hover:border-primary/30'
                  } ${feature.bgColor} hover:${feature.bgColor} backdrop-blur-sm group`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bgColor} transform transition-all duration-300 ${
                          hoveredFeature === index ? 'scale-110 rotate-3' : ''
                        }`}>
                          <Icon className={`h-7 w-7 ${feature.color}`} />
                        </div>
                        {feature.popular && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-medium">
                            Popular
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs font-medium border-current/20 text-current/70">
                          {feature.category}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs font-semibold text-current/60">
                          <TrendingUp className="h-3 w-3" />
                          <span>{feature.stats}</span>
                        </div>
                      </div>

                      <CardTitle className="text-lg sm:text-xl text-balance leading-tight group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-pretty leading-relaxed mb-4">{feature.description}</p>

                      {/* Hover Effect Indicator */}
                      <div className={`h-1 bg-linear-to-r from-current to-current rounded-full transition-all duration-300 ${
                        hoveredFeature === index ? 'w-full opacity-100' : 'w-0 opacity-0'
                      }`} style={{ background: `linear-gradient(to right, ${feature.color.replace('text-', '')}, ${feature.color.replace('text-', '')})` }} />

                      {/* Action Hint */}
                      <div className={`flex items-center justify-end mt-4 transition-all duration-300 ${
                        hoveredFeature === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                      }`}>
                        <ArrowUpRight className={`h-4 w-4 ${feature.color} transition-transform duration-300 ${
                          hoveredFeature === index ? 'rotate-45' : ''
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="inline-flex items-center space-x-4 bg-card/60 backdrop-blur-sm rounded-2xl px-6 py-4 border shadow-lg mb-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-foreground">All features included</span>
            </div>
            <div className="flex items-center space-x-2">
              <Youtube className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-foreground">YouTube optimized</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-foreground">AI powered</span>
            </div>
          </div>

          <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
            Start with our free trial and experience all features risk-free.
            Upgrade anytime to unlock unlimited usage and premium support.
          </p>
        </div>
      </div>
    </section>
  )
}
