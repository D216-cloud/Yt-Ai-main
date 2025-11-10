"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Link2, PenTool, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: Link2,
    title: "Connect with Ease",
    description: "Sign in with one click to your Twitter account. That's it.",
    color: "text-blue-500",
  },
  {
    icon: PenTool,
    title: "Create or Schedule Content",
    description: "Generate new tweet ideas with AI, or schedule your campaigns from a clean visual calendar.",
    color: "text-green-500",
  },
  {
    icon: TrendingUp,
    title: "Grow and Analyze",
    description: "Watch follower growth, track engagement, and get AI-powered insights to optimize your strategy.",
    color: "text-purple-500",
  },
]

export function HowItWorksSection() {
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([false, false, false])
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

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 sm:py-32 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Get started in minutes with our simple three-step process
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    visibleSteps[index] ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Card className="relative h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-6">
                        <Icon className={`h-6 w-6 ${step.color}`} />
                      </div>
                      <div className="absolute top-4 right-4 text-2xl font-bold text-muted-foreground/30">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3 text-balance">{step.title}</h3>
                      <p className="text-muted-foreground text-pretty">{step.description}</p>
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
