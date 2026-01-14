"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ChannelScorePage() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard') }, [router])
  return null
}

interface ChannelScore {
  channelId: string
  channelTitle: string
  overallScore: number
  scores: {
    engagement: number
    growth: number
    consistency: number
    seo: number
    content: number
  }
  metrics: {
    avgViews: number
    engagementRate: number
    uploadFrequency: number
    subscriberGrowth: number
    viewsGrowth: number
  }
  recommendations: string[]
  strengths: string[]
  weaknesses: string[]
}
// Note: UI JSX removed — it was inadvertently left at top-level and caused a syntax error.
// If you intended to render the channel scoring UI here, move the JSX into a component
// (e.g. inside `ChannelScorePage`) and ensure all referenced variables and components
// (like `Button`, `Link`, icon components, and helper functions) are imported and defined.