"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat2, TrendingUp, Clock, Zap, Target, Users, Play } from "lucide-react"

const exampleVideos = [
  {
    title: "How to edit cinematic travel videos",
    thumbnail: "/images/video-sample-1.jpg",
    time: "4 days ago",
    views: 1240,
    likes: 210,
    comments: 34,
    engagement: "6.1%",
    type: "Tutorial",
  },
  {
    title: "Quick cooking tips for busy people",
    thumbnail: "/images/video-sample-2.jpg",
    time: "1 week ago",
    views: 5420,
    likes: 810,
    comments: 123,
    engagement: "7.8%",
    type: "Lifestyle",
  },
  {
    title: "AI tools that boost watch time",
    thumbnail: "/images/video-sample-3.jpg",
    time: "3 days ago",
    views: 890,
    likes: 95,
    comments: 12,
    engagement: "4.5%",
    type: "Productivity",
  },
]

const reasons = [
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    description: "Automate video publishing and scheduling",
    color: "text-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Faster Channel Growth",
    description: "AI-optimized metadata and thumbnails",
    color: "text-green-500",
  },
  {
    icon: Target,
    title: "Higher Watch Time",
    description: "Recommendations and topics that retain viewers",
    color: "text-purple-500",
  },
  {
    icon: Users,
    title: "Build Real Subscribers",
    description: "Focus on community while AI handles optimization",
    color: "text-orange-500",
  },
]

export function YouTubeGrowthShowcase() {
  const [autopilotEnabled, setAutopilotEnabled] = useState(false)

  const toggleAutopilot = () => {
    setAutopilotEnabled(!autopilotEnabled)
  }

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-yellow-50 via-white to-red-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent sm:text-4xl text-balance">
            See What Creators Publish & Why They Grow on YouTube
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Real videos from creators using our AI-powered tools to improve titles, thumbnails and metadata.
          </p>
        </div>

        {/* Autopilot Toggle */}
        <div className="flex justify-center mb-12">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 p-6">
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Autopilot Mode</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {autopilotEnabled ? "AI is optimizing your uploads" : "Manual publishing mode"}
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={toggleAutopilot}
                  className={`relative inline-flex h-16 w-28 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    autopilotEnabled ? "bg-gradient-to-r from-red-500 to-orange-500 shadow-lg" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center ${
                      autopilotEnabled ? "translate-x-14" : "translate-x-2"
                    }`}
                  >
                    {autopilotEnabled ? (
                      <Zap className="h-6 w-6 text-red-500" />
                    ) : (
                      <Play className="h-6 w-6 text-gray-400" />
                    )}
                  </span>
                </button>
              </div>

              <div className="text-center">
                <Badge
                  variant={autopilotEnabled ? "default" : "secondary"}
                  className={`${autopilotEnabled ? "bg-gradient-to-r from-red-500 to-orange-500" : ""}`}
                >
                  {autopilotEnabled ? "ON" : "OFF"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {autopilotEnabled ? "Optimizes metadata" : "Manual control"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Example Videos */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Example Videos Optimized by AI</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {exampleVideos.map((video, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {video.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{video.time}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={video.thumbnail} alt={video.title} className="w-28 h-16 rounded-md object-cover" />
                    <div>
                      <h4 className="font-semibold text-sm">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{video.views} views • {video.engagement} engagement</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {video.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {video.comments}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {video.engagement} engagement
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Users Love It */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Why Creators Choose Our Tool</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason, index) => {
              const Icon = reason.icon
              return (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 rounded-full bg-gradient-to-r from-red-100 to-orange-100">
                        <Icon className={`h-6 w-6 ${reason.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{reason.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <Zap className="h-5 w-5 mr-2" />
            Optimize Your Videos
          </Button>
        </div>
      </div>
    </section>
  )
}
