import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    // Redirect to YouTube OAuth
    const youtubeAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    youtubeAuthUrl.searchParams.set("client_id", process.env.YOUTUBE_CLIENT_ID!)
    youtubeAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/api/youtube/auth`)
    youtubeAuthUrl.searchParams.set("response_type", "code")
    youtubeAuthUrl.searchParams.set("scope", "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube")
    youtubeAuthUrl.searchParams.set("access_type", "offline")
    youtubeAuthUrl.searchParams.set("prompt", "consent")

    return NextResponse.redirect(youtubeAuthUrl.toString())
  }

  // Exchange code for access token
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID!,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/api/youtube/auth`,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenData)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect?error=token_failed`)
    }

    // Redirect back to connect page with access token
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect`)
    redirectUrl.searchParams.set("youtube_token", tokenData.access_token)
    redirectUrl.searchParams.set("refresh_token", tokenData.refresh_token || "")
    
    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error("YouTube auth error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect?error=auth_failed`)
  }
}