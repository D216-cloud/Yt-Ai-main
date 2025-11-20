"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, TrendingUp, Users, Calendar, Zap, Star, CheckCircle, Sparkles, Rocket, Target, Youtube } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStat, setCurrentStat] = useState(0)
  const { data: session } = useSession()
  const router = useRouter()

  const stats = [
    { label: "Videos Created", value: 50000, suffix: "+" },
    { label: "Hours Saved", value: 250000, suffix: "+" },
    { label: "Creators Helped", value: 10000, suffix: "+" },
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleStartNow = () => {
    if (session) {
      router.push("/connect")
    } else {
      router.push("/signup")
    }
  }

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-background via-primary/5 to-secondary/10 py-12 sm:py-20 lg:py-32">
      {/* Animated Background Elements - Hidden on mobile for better performance */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-linear-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Icons - Hidden on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-20 left-20 animate-bounce animation-delay-1000">
          <Sparkles className="h-8 w-8 text-primary/30" />
        </div>
        <div className="absolute top-40 right-32 animate-bounce animation-delay-2000">
          <Rocket className="h-6 w-6 text-secondary/30" />
        </div>
        <div className="absolute bottom-40 left-32 animate-bounce animation-delay-3000">
          <Target className="h-7 w-7 text-primary/30" />
        </div>
        <div className="absolute bottom-20 right-20 animate-bounce animation-delay-4000">
          <Zap className="h-5 w-5 text-secondary/30" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-16">
            <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="inline-flex items-center justify-center mb-6 sm:mb-8 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors rounded-full px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold shadow-sm">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-red-500" />
                1 AI-Powered YouTube Tool
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight mb-4 sm:mb-8 px-2">
                Transform Your{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">
                  YouTube Channel
                </span>{" "}
                with AI Magic
              </h1>

              <p className="mt-4 sm:mt-8 text-base sm:text-lg lg:text-lg leading-6 sm:leading-7 text-muted-foreground text-pretty max-w-3xl mx-auto font-medium px-4">
                From zero to viral: Schedule, create, and optimize engaging video content automatically.
                Join <span className="text-primary font-semibold">10,000+ creators</span> who've exploded their growth with our intelligent AI platform.
              </p>
            </div>

            {/* Stats Counter */}
            <div className={`mt-8 sm:mt-12 transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="inline-flex items-center space-x-4 sm:space-x-8 bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl px-6 sm:px-8 py-4 sm:py-5 border shadow-xl mx-4">
                <div className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-primary mb-1">
                    {stats[currentStat].value.toLocaleString()}{stats[currentStat].suffix}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">{stats[currentStat].label}</div>
                </div>
                <div className="h-8 sm:h-12 w-px bg-border"></div>
                <div className="flex space-x-1 sm:space-x-2">
                  {stats.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-300 ${
                        index === currentStat ? "bg-primary scale-125" : "bg-muted"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className={`mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 transition-all duration-1000 delay-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"} px-4`}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold"
              onClick={handleStartNow}
            >
              <Rocket className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              {session ? "Go to Dashboard" : "Start Growing Now"}
              <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-2 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all duration-300 text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-semibold"
              asChild
            >
              <Link href="#demo">
                <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                Watch 2-Min Demo
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-10 sm:mt-16 transition-all duration-1000 delay-700 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                <span className="font-medium text-center sm:text-left">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                <span className="font-medium text-center sm:text-left">14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0" />
                <span className="font-medium text-center sm:text-left">Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Enhanced Preview Dashboard */}
          <div
            className={`mt-12 sm:mt-20 transition-all duration-1000 delay-900 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="relative mx-auto max-w-6xl px-4">
              <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl transform scale-110 hidden sm:block"></div>
              <div className="relative rounded-xl sm:rounded-2xl bg-card/95 backdrop-blur-sm border shadow-xl sm:shadow-2xl overflow-hidden">
                {/* Browser Header (desktop) */}
                <div className="hidden sm:flex bg-muted/50 px-4 sm:px-6 py-3 sm:py-4 border-b items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Small mock browser dots (keep for desktop) */}
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-destructive"></div>
                      <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500"></div>
                    </div>
                    {/* URL and logo */}
                    <div className="inline-flex items-center space-x-2">
                      <div className="bg-white/90 rounded-full px-2 py-1 border shadow-sm flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-500" />
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">youtube-growth.ai</span>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">/dashboard</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 mr-1 sm:mr-2 animate-pulse"></div>
                    Live Data
                  </Badge>
                </div>

                {/* Mobile Header: show pill with YouTube icon and gradient URL */}
                <div className="sm:hidden bg-muted/50 px-4 py-3 border-b">
                  <div className="text-center">
                    <div className="inline-flex items-center rounded-full bg-white/95 shadow-sm px-3 py-2 border border-muted">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-red-50 border border-red-200 mr-2">
                        <Youtube className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="text-sm font-semibold text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">
                        youtube-growth.ai/dashboard
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 sm:p-8">
                  {/* Mobile simplified preview */}
                  <div className="sm:hidden grid grid-cols-3 gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white/90 border text-center shadow-sm">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-base font-bold text-primary animate-pulse">+127%</div>
                      <div className="text-xs text-muted-foreground">Growth</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/90 border text-center shadow-sm">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="text-base font-bold text-secondary animate-pulse">45.2K</div>
                      <div className="text-xs text-muted-foreground">New Subs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/90 border text-center shadow-sm">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div className="text-base font-bold text-yellow-500 animate-pulse">4.8★</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Stats Cards */}
                    <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                      <div className="bg-linear-to-r from-primary/10 to-secondary/10 p-3 sm:p-4 rounded-lg sm:rounded-xl border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                              <div>
                                <div className="text-lg sm:text-xl font-bold text-primary">+127%</div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Growth Rate</div>
                              </div>
                            </div>
                            <div className="hidden sm:block w-16 h-5 bg-muted rounded-md">
                              {/* Sparkline placeholder */}
                              <svg viewBox="0 0 26 5" className="w-full h-full">
                                <polyline points="0,4 6,2 12,3 18,1 26,0" fill="none" stroke="#5b21b6" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity="0.6" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      <div className="bg-linear-to-r from-secondary/10 to-primary/10 p-3 sm:p-4 rounded-lg sm:rounded-xl border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                            <div>
                              <div className="text-lg sm:text-xl font-bold text-secondary">45.2K</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">New Subs</div>
                            </div>
                          </div>
                          <div className="hidden sm:block w-16 h-5 bg-muted rounded-md">
                            <svg viewBox="0 0 26 5" className="w-full h-full">
                              <polyline points="0,3 6,1 12,2 18,0 26,2" fill="none" stroke="#059669" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity="0.6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                      <div className="bg-muted/30 p-4 sm:p-6 rounded-lg sm:rounded-xl border mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2" />
                          AI Content Suggestions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Link href="/bulk-upload" className="block">
                            <div className="flex items-center justify-center p-4 bg-background rounded-lg border hover:shadow-md cursor-pointer h-16 sm:h-20">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none"><path d="M4 7h16v2H4zM4 11h10v2H4zM4 15h16v2H4z" fill="currentColor"/></svg>
                                </div>
                                <div className="text-sm sm:text-base font-semibold">Bulk Upload</div>
                              </div>
                            </div>
                          </Link>
                          <Link href="/dashboard/trending" className="block">
                            <div className="flex items-center justify-center p-4 bg-background rounded-lg border hover:shadow-md cursor-pointer h-16 sm:h-20">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none"><path d="M12 2l4 8-4-2-4 2 4-8zM4 18h16v2H4z" fill="currentColor"/></svg>
                                </div>
                                <div className="text-sm sm:text-base font-semibold">Find Keywords</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Analytics Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-background p-3 sm:p-4 rounded-lg sm:rounded-xl border">
                          <div className="text-xs sm:text-sm text-muted-foreground mb-1">Views Today</div>
                          <div className="text-xl sm:text-2xl font-bold">12,847</div>
                          <div className="text-xs sm:text-sm text-green-600">+23% vs yesterday</div>
                        </div>
                        <div className="bg-background p-3 sm:p-4 rounded-lg sm:rounded-xl border">
                          <div className="text-xs sm:text-sm text-muted-foreground mb-1">Watch Time</div>
                          <div className="text-xl sm:text-2xl font-bold">8.2hrs</div>
                          <div className="text-xs sm:text-sm text-green-600">+18% vs yesterday</div>
                        </div>
                        <div className="bg-background p-3 sm:p-4 rounded-lg sm:rounded-xl border">
                          <div className="text-xs sm:text-sm text-muted-foreground mb-1">Subscribers</div>
                            <div className="text-xl sm:text-2xl font-bold text-primary">+127</div>
                          <div className="text-xs sm:text-sm text-green-600">+45% vs yesterday</div>
                        </div>
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
