"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
} from "lucide-react"

export function BeforeAfterSection() {
  const [activeTab, setActiveTab] = useState<"with" | "without">("without")

  const beforeProblems = [
    {
      icon: User,
      number: 1,
      text: "No idea what to create",
    },
    {
      icon: MessageSquare,
      number: 2,
      text: "Creating everything manually",
    },
    {
      icon: Clock,
      number: 3,
      text: "Inconsistent upload schedule",
    },
    {
      icon: BarChart3,
      number: 4,
      text: "No performance insights",
    },
    {
      icon: Palette,
      number: 5,
      text: "Off-brand content",
    },
  ]

  const afterBenefits = [
    {
      icon: Zap,
      text: "AI generates viral content ideas",
      color: "text-blue-600",
    },
    {
      icon: TrendingUp,
      text: "Consistent growth & engagement",
      color: "text-purple-600",
    },
    {
      icon: CheckCircle,
      text: "Automated upload schedule",
      color: "text-green-600",
    },
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Before vs. After{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              YouTubeAI Pro
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your YouTube channel from struggling to grow to effortless AI-powered content creation
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Button
              variant={activeTab === "without" ? "default" : "outline"}
              onClick={() => setActiveTab("without")}
              className={activeTab === "without" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Without YouTubeAI Pro
            </Button>
            <Button
              variant={activeTab === "with" ? "default" : "outline"}
              onClick={() => setActiveTab("with")}
              className={activeTab === "with" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              With YouTubeAI Pro
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Before Section */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-900">Before YouTubeAI Pro</h3>
            </div>

            <div className="space-y-6">
              {beforeProblems.map((problem) => (
                <div key={problem.number} className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-semibold text-sm">
                    {problem.number}
                  </div>
                  <problem.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-medium">{problem.text}</span>
                </div>
              ))}

              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200 mt-8">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">
                  Spending <span className="font-bold text-green-600">10+ hours weekly</span> on manual YouTube
                  management
                </span>
              </div>
            </div>
          </Card>

          {/* After Section */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-900">After YouTubeAI Pro</h3>
            </div>

            <div className="space-y-6 mb-8">
              {afterBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg"
                >
                  <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                  <span className="text-gray-700 font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-6">
                <h4 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Autopilot Mode
                </h4>
                <p className="text-gray-600">Set it and forget it</p>
              </div>

              <div className="relative mb-6">
                <div className="w-32 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-end px-2 shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">Save 10+ Hours</div>
                  <div className="text-sm text-green-700 font-medium">Weekly Time Saved</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">10x Growth</div>
                  <div className="text-sm text-blue-700 font-medium">Faster Results</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
