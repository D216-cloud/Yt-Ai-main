"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Calendar, BarChart3, Users, Clock, Target, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Content Generator",
    description:
      "Create engaging videos instantly with our advanced AI that understands your channel voice and audience.",
    color: "text-blue-500",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Schedule uploads at optimal times with AI-powered timing recommendations for maximum reach.",
    color: "text-green-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track performance with detailed insights, view metrics, and growth analytics.",
    color: "text-purple-500",
  },
  {
    icon: Users,
    title: "Audience Insights",
    description: "Understand your subscribers better with demographic data and engagement patterns.",
    color: "text-orange-500",
  },
  {
    icon: Clock,
    title: "Auto-Publishing",
    description: "Set it and forget it. Your content goes live automatically at the perfect time.",
    color: "text-red-500",
  },
  {
    icon: Target,
    title: "Trend Analysis",
    description: "Monitor trending topics and discover popular niches for better content strategy.",
    color: "text-cyan-500",
  },
  {
    icon: Zap,
    title: "Bulk Operations",
    description: "Manage multiple channels and schedule hundreds of videos with our bulk management tools.",
    color: "text-yellow-500",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime guarantee. Your data is always protected.",
    color: "text-indigo-500",
  },
]

export function FeaturesSection() {
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>(new Array(features.length).fill(false))
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
              }, index * 100)
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
    <section id="features" ref={sectionRef} className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Powerful Features for YouTube Growth
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Everything you need to build and grow your YouTube channel effectively
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    visibleFeatures[index] ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-lg text-balance">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-pretty">{feature.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
