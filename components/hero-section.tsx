"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, TrendingUp, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleStartNow = () => {
    if (session) {
      router.push("/connect")
    } else {
      router.push("/signup")
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Effortless YouTube Growth,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Powered by AI
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
              Schedule, create, and analyze engaging video content with our intelligent tools. Smart automation that
              feels personal.
            </p>
          </div>

          <div
            className={`mt-10 flex items-center justify-center gap-x-6 transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Button size="lg" className="animate-pulse-glow" onClick={handleStartNow}>
              {session ? "Go to Dashboard" : "Start Now"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">
                <Play className="mr-2 h-4 w-4" />
                View Demo
              </Link>
            </Button>
          </div>

          <div
            className={`mt-16 transition-all duration-1000 delay-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"></div>
              <div className="relative rounded-xl bg-card border shadow-2xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-destructive"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30">
                      <TrendingUp className="h-8 w-8 text-secondary" />
                      <div>
                        <div className="font-semibold">Growth Analytics</div>
                        <div className="text-sm text-muted-foreground">Real-time insights</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30">
                      <Calendar className="h-8 w-8 text-secondary" />
                      <div>
                        <div className="font-semibold">Smart Scheduling</div>
                        <div className="text-sm text-muted-foreground">AI-optimized timing</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30">
                      <Users className="h-8 w-8 text-secondary" />
                      <div>
                        <div className="font-semibold">Channel Insights</div>
                        <div className="text-sm text-muted-foreground">Deep engagement data</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
