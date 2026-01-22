"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, TrendingUp, Users, Gift, BarChart3, Sparkles, Play } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SuccessEarningSection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleStartNow = () => {
    setIsStarting(true)
    if (session) {
      router.push("/connect")
    } else {
      router.push("/signup")
    }
  }

  const steps = [
    {
      icon: Play,
      title: "Create Engaging Content",
      description: "Use AI tools to generate titles, thumbnails, and tags that attract viewers"
    },
    {
      icon: BarChart3,
      title: "Analyze & Optimize",
      description: "Get real-time analytics and insights to improve your videos' performance"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Audience",
      description: "Implement proven strategies to increase subscribers and watch time"
    },
    {
      icon: Gift,
      title: "Monetize Your Channel",
      description: "Reach 1K subscribers and start earning money from ads, sponsors, and more"
    }
  ]

  const stats = [
    { number: "10K+", label: "Creators Using Our Platform" },
    { number: "$2M+", label: "Total Earnings Generated" },
    { number: "5x", label: "Average Growth Rate" },
    { number: "24/7", label: "AI Support Available" }
  ]

  return (
    <section className="relative py-16 sm:py-20 lg:py-32 overflow-visible">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 pointer-events-none" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 px-4 sm:px-6 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-800">Success Stories</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Become a Successful YouTuber
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Join thousands of creators earning money on YouTube using our AI-powered platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 sm:mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {stat.number}
              </div>
              <p className="text-gray-600 text-sm sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Journey Steps */}
        <div className="mb-16 sm:mb-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Your Path to Success
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className="relative bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 mt-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-600 text-sm">{step.description}</p>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 sm:p-12 lg:p-16 text-center text-white">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            Ready to Start Earning?
          </h3>

          <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
            Get instant access to all AI tools, analytics, and resources you need to grow your YouTube channel and start earning money today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartNow}
              disabled={isStarting}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-white text-white font-bold hover:bg-white/10 transition-all"
            >
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          <p className="text-blue-100 text-xs sm:text-sm mt-6">
            ✅ No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
