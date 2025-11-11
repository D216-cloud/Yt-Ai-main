import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Check if required environment variables are set
  const clientId = process.env.YOUTUBE_CLIENT_ID
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
  const apiKey = process.env.YOUTUBE_API_KEY

  return NextResponse.json({
    success: true,
    config: {
      clientId: clientId ? "Set" : "Missing",
      clientSecret: clientSecret ? "Set" : "Missing",
      apiKey: apiKey ? "Set" : "Missing",
      redirectUri: `${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/api/youtube/auth`
    },
    message: clientId && clientSecret ? "Configuration looks good!" : "Missing required credentials"
  })
}