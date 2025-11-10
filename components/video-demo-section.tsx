"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, Volume2, Maximize, RotateCcw } from "lucide-react"

export function VideoDemoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  const features = [
    "AI-powered content generation",
    "Smart scheduling optimization",
    "Real-time analytics dashboard",
    "Automated engagement tracking",
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TwitterGrow
            </span>{" "}
            in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how our AI-powered platform transforms your Twitter presence in just minutes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Video Player */}
          <Card className="relative overflow-hidden bg-black rounded-2xl shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              {/* Video Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>

              {/* Play Button */}
              <Button
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="relative z-10 w-20 h-20 rounded-full bg-white/90 hover:bg-white text-black shadow-2xl"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <span className="text-sm">2:34 / 5:12</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-1 mt-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Demo Features */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Complete Twitter Automation
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Our demo showcases the full power of AI-driven Twitter management, from content creation to performance
                optimization.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Watch Full Demo
              </Button>
              <Button size="lg" variant="outline">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
