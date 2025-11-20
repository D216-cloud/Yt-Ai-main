"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Youtube, Sparkles, Calendar, TrendingUp, Zap, Play, BarChart3, Rocket, Target, CheckCircle, ArrowRight, Clock, Users } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    icon: Youtube,
    title: "Connect Your Channel",
    description: "Link your YouTube account securely in seconds. We only access what you authorize for complete privacy.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    features: ["One-click connection", "Secure OAuth", "Privacy-first"],
    duration: "30 seconds"
  },
  {
    icon: Sparkles,
    title: "AI Content Creation",
    description: "Our advanced AI analyzes trending topics, your niche, and audience preferences to generate viral video ideas.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: ["Trend analysis", "Niche optimization", "Engagement prediction"],
    duration: "2 minutes"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Schedule your content calendar with optimal posting times, automated uploads, and thumbnail generation.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: ["Best time scheduling", "Auto-upload", "Thumbnail AI"],
    duration: "5 minutes"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track views, engagement, subscriber growth, and get AI recommendations to improve your content strategy.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    features: ["Real-time analytics", "AI insights", "Growth tracking"],
    duration: "Ongoing"
  },
]

export function HowItWorksSection() {
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([false, false, false, false])
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleSteps((prev) => {
                  const newState = [...prev]
                  newState[index] = true
                  return newState
                })
              }, index * 300)
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
    <section id="how-it-works" ref={sectionRef} className="relative py-20 sm:py-32 bg-linear-to-br from-background via-primary/5 to-secondary/10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-primary/3 to-secondary/3 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center mb-6 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors rounded-full px-4 py-2 text-sm font-semibold shadow-sm">
            <Zap className="h-4 w-4 mr-2" />
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight mb-6">
            From Zero to{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">
              YouTube Success
            </span>{" "}
            in Minutes
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators who've transformed their channels with our AI-powered platform.
            No complex setup, no technical skills required.
          </p>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isLast = index === steps.length - 1

              return (
                <div
                  key={index}
                  className={`relative transition-all duration-700 ${
                    visibleSteps[index] ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 300}ms` }}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Connection Line */}
                  {!isLast && (
                    <div className="hidden xl:block absolute top-16 left-full w-full h-0.5 bg-linear-to-r from-primary/30 to-transparent transform -translate-x-8 z-0">
                      <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
                    </div>
                  )}

                  <Card className={`relative h-full hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-2 ${
                    hoveredStep === index ? 'border-primary/50 shadow-primary/20' : 'border-border hover:border-primary/30'
                  } ${step.bgColor} hover:${step.bgColor} backdrop-blur-sm`}>
                    <CardContent className="p-6 sm:p-8">
                      {/* Step Number & Duration */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${step.bgColor} border border-current/20`}>
                            <span className="text-lg font-bold text-current">{index + 1}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs font-medium">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.duration}
                          </Badge>
                        </div>
                      </div>

                      {/* Icon */}
                      <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${step.bgColor} mb-6 transform transition-transform duration-300 ${
                        hoveredStep === index ? 'scale-110' : ''
                      }`}>
                        <Icon className={`h-8 w-8 ${step.color}`} />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 text-balance leading-tight">{step.title}</h3>
                      <p className="text-muted-foreground text-pretty mb-6 leading-relaxed">{step.description}</p>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {step.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Hover Effect Indicator */}
                      <div className={`h-1 bg-linear-to-r from-current to-current rounded-full transition-all duration-300 ${
                        hoveredStep === index ? 'w-full opacity-100' : 'w-0 opacity-0'
                      }`} style={{ background: `linear-gradient(to right, ${step.color.replace('text-', '')}, ${step.color.replace('text-', '')})` }} />
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="inline-flex items-center space-x-2 bg-card/60 backdrop-blur-sm rounded-2xl px-6 py-4 border shadow-lg mb-8">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Join 10,000+ creators already growing</span>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-xl font-semibold text-base"
              asChild
            >
              <Link href="/signup">
                <Rocket className="mr-3 h-5 w-5" />
                Start Your Growth Journey
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-300 px-8 py-4 rounded-xl font-semibold text-base"
              asChild
            >
              <Link href="#demo">
                <Play className="mr-3 h-5 w-5" />
                Watch Demo Video
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
