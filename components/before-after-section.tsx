"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  MessageSquare,
  Clock,
  BarChart3,
  Palette,
  AlertTriangle,
  CheckCircle,
  Zap,
  TrendingUp,
  ArrowRight,
  X,
  Play,
  Users,
  Target,
  Award,
  Star,
  ArrowUpRight,
  Timer,
  Activity,
  ThumbsUp,
  Eye,
  Calendar,
  Bot,
  Sparkles,
  Crown
} from "lucide-react"

export function BeforeAfterSection() {
  const [activeTab, setActiveTab] = useState<"with" | "without">("without")
  const [isAnimating, setIsAnimating] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [activeTab])

  const beforeProblems = [
    {
      icon: User,
      number: 1,
      text: "No idea what content to create",
      impact: "Stagnant growth"
    },
    {
      icon: MessageSquare,
      number: 2,
      text: "Manual content creation & editing",
      impact: "10+ hours wasted weekly"
    },
    {
      icon: Clock,
      number: 3,
      text: "Inconsistent upload schedule",
      impact: "Lost algorithm visibility"
    },
    {
      icon: BarChart3,
      number: 4,
      text: "No performance analytics",
      impact: "Blind optimization"
    },
    {
      icon: Palette,
      number: 5,
      text: "Generic thumbnails & titles",
      impact: "Low click-through rates"
    },
  ]

  const afterBenefits = [
    {
      icon: Sparkles,
      text: "AI generates viral content ideas daily",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      metric: "100+ ideas/month"
    },
    {
      icon: Bot,
      text: "Automated content creation & optimization",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      metric: "90% time saved"
    },
    {
      icon: Calendar,
      text: "Smart scheduling with optimal timing",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      metric: "3x more views"
    },
    {
      icon: BarChart3,
      text: "Real-time analytics & AI insights",
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      metric: "Data-driven growth"
    },
    {
      icon: Target,
      text: "Optimized thumbnails & metadata",
      color: "text-red-600",
      bgColor: "bg-red-500/10",
      metric: "300% higher CTR"
    },
  ]

  const statsComparison = [
    {
      metric: "Time Saved",
      before: "10+ hours/week",
      after: "1 hour/week",
      improvement: "90% reduction"
    },
    {
      metric: "Content Ideas",
      before: "0-2 per week",
      after: "50+ per week",
      improvement: "25x more ideas"
    },
    {
      metric: "Growth Rate",
      before: "+50 subs/month",
      after: "+500+ subs/month",
      improvement: "10x faster growth"
    },
    {
      metric: "Engagement",
      before: "2-3%",
      after: "8-12%",
      improvement: "4x higher engagement"
    }
  ]

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-32 bg-linear-to-br from-background via-red-500/5 to-blue-500/10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-red-500/3 to-blue-500/3 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-5xl text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center mb-6 bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-colors rounded-full px-4 py-2 text-sm font-semibold shadow-sm">
            <ArrowRight className="h-4 w-4 mr-2" />
            Transformation Results
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight mb-6">
            Before vs. After{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">
              YouTubeAI Pro
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            See the dramatic transformation when creators switch from manual content creation to AI-powered automation.
            Real results from thousands of successful YouTube channels.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-4 mb-12 sm:mb-16">
          <Button
            variant={activeTab === "without" ? "default" : "outline"}
            onClick={() => setActiveTab("without")}
            className={`px-8 py-3 rounded-xl font-semibold text-base transition-all duration-300 ${
              activeTab === "without"
                ? "bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-xl"
                : "border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500"
            }`}
          >
            <X className="h-5 w-5 mr-2" />
            Without YouTubeAI Pro
          </Button>
          <Button
            variant={activeTab === "with" ? "default" : "outline"}
            onClick={() => setActiveTab("with")}
            className={`px-8 py-3 rounded-xl font-semibold text-base transition-all duration-300 ${
              activeTab === "with"
                ? "bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-xl"
                : "border-2 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500"
            }`}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            With YouTubeAI Pro
          </Button>
        </div>

        {/* Comparison Cards */}
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-start transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
          {/* Before Section */}
          <Card className={`p-6 sm:p-8 bg-card/95 backdrop-blur-sm border-2 shadow-2xl transition-all duration-500 ${
            activeTab === "without" ? 'border-red-500/50 shadow-red-500/20 scale-105' : 'border-border hover:border-red-500/30'
          }`}>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                  <X className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Before YouTubeAI Pro</CardTitle>
                  <p className="text-muted-foreground">The Struggle is Real</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-700 w-fit">
                <Timer className="h-3 w-3 mr-1" />
                10+ hours wasted weekly
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {beforeProblems.map((problem) => (
                <div key={problem.number} className="flex items-start gap-4 p-4 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 transition-colors group">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full text-red-600 font-bold text-sm shrink-0">
                    {problem.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <problem.icon className="w-4 h-4 text-red-500" />
                      <span className="text-foreground font-medium">{problem.text}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{problem.impact}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}

              <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20 mt-6">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <span className="text-red-700 font-semibold">Result: </span>
                  <span className="text-red-600">Slow growth, burnout, and frustration</span>
                </div>
              </div>

              {/* Missing Features List - YouTube specific */}
              <div className="mt-6 p-4 rounded-xl border border-red-500/10 bg-red-50">
                <h4 className="font-semibold text-foreground mb-2">Missing YouTube Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-muted-foreground"><X className="h-4 w-4 text-red-500 mr-2" /> No AI-driven thumbnail generation</li>
                  <li className="flex items-center text-sm text-muted-foreground"><X className="h-4 w-4 text-red-500 mr-2" /> Manual title & metadata editing</li>
                  <li className="flex items-center text-sm text-muted-foreground"><X className="h-4 w-4 text-red-500 mr-2" /> No publish-time optimization</li>
                  <li className="flex items-center text-sm text-muted-foreground"><X className="h-4 w-4 text-red-500 mr-2" /> No automated scheduling & bulk tools</li>
                  <li className="flex items-center text-sm text-muted-foreground"><X className="h-4 w-4 text-red-500 mr-2" /> Limited analytics & insights</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* After Section */}
          <Card className={`p-6 sm:p-8 bg-card/95 backdrop-blur-sm border-2 shadow-2xl transition-all duration-500 ${
            activeTab === "with" ? 'border-blue-500/50 shadow-blue-500/20 scale-105' : 'border-border hover:border-blue-500/30'
          }`}>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">After YouTubeAI Pro</CardTitle>
                  <p className="text-muted-foreground">AI-Powered Success</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 w-fit">
                <Zap className="h-3 w-3 mr-1" />
                90% time saved
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {afterBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 ${benefit.bgColor} hover:${benefit.bgColor} rounded-xl border border-current/10 transition-all duration-300 group`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 bg-current/20 rounded-full shrink-0`}>
                    <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground font-medium">{benefit.text}</span>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs border-current/20 text-current/70">
                        {benefit.metric}
                      </Badge>
                      <ArrowUpRight className="h-4 w-4 text-current opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20 mt-6">
                <Crown className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <span className="text-green-700 font-semibold">Result: </span>
                  <span className="text-green-600">Explosive growth, passive income, and freedom</span>
                </div>
              </div>

              {/* Included Features List - YouTube specific */}
              <div className="mt-6 p-4 rounded-xl border border-green-500/10 bg-green-50">
                <h4 className="font-semibold text-foreground mb-2">YouTubeAI Pro Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> AI thumbnail generation</li>
                  <li className="flex items-center text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> AI titles & metadata optimization</li>
                  <li className="flex items-center text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Smart publishing & bulk scheduling</li>
                  <li className="flex items-center text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Real-time analytics & A/B testing</li>
                  <li className="flex items-center text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Automated optimization & growth insights</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Comparison */}
        <div className="mt-16 sm:mt-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 mr-3 text-blue-500" />
            Real Transformation Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsComparison.map((stat, index) => (
              <Card key={index} className="bg-card/95 backdrop-blur-sm border-2 hover:border-blue-500/30 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-3">{stat.metric}</div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-semibold">{stat.before}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-semibold">{stat.after}</span>
                    </div>
                  </div>

                  <Badge className="bg-green-100 text-green-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.improvement}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories Preview */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="inline-flex items-center space-x-4 bg-card/60 backdrop-blur-sm rounded-2xl px-6 py-4 border shadow-lg mb-8">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-foreground">10,000+ creators transformed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-foreground">Average 10x growth</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Proven results</span>
            </div>
          </div>

          <p className="text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
            Join thousands of creators who've transformed their YouTube channels from struggling to thriving
            with AI-powered automation and optimization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-xl font-semibold text-base"
            >
              <Play className="h-5 w-5 mr-3" />
              See Success Stories
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500 transition-all duration-300 px-8 py-4 rounded-xl font-semibold text-base"
            >
              <Zap className="h-5 w-5 mr-3" />
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
