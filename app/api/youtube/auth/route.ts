import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  
  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    // Redirect to YouTube OAuth
    const youtubeAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    
    // Validate environment variables
    if (!process.env.YOUTUBE_CLIENT_ID) {
      console.error("YOUTUBE_CLIENT_ID is not set")
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect?error=missing_client_id`)
    }
    
    const redirectUri = `${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/api/youtube/auth`
    
    youtubeAuthUrl.searchParams.set("client_id", process.env.YOUTUBE_CLIENT_ID)
    youtubeAuthUrl.searchParams.set("redirect_uri", redirectUri)
    youtubeAuthUrl.searchParams.set("response_type", "code")
    youtubeAuthUrl.searchParams.set("scope", "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube")
    youtubeAuthUrl.searchParams.set("access_type", "offline")
    youtubeAuthUrl.searchParams.set("prompt", "consent")
    
    console.log("Redirecting to YouTube OAuth with URI:", redirectUri)
    
    return NextResponse.redirect(youtubeAuthUrl.toString())
  }

  // Exchange code for access token
  try {
    // Validate environment variables
    if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
      console.error("Missing YouTube client credentials")
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect?error=missing_credentials`)
    }
    
    const redirectUri = `${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/api/youtube/auth`
    
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()
    
    console.log("Token response:", tokenData)

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenData)
      const errorMessage = tokenData.error || "token_failed"
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect?error=${encodeURIComponent(errorMessage)}`)
    }

    // Redirect back to connect page with access token
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect`)
    redirectUrl.searchParams.set("youtube_token", tokenData.access_token)
    redirectUrl.searchParams.set("refresh_token", tokenData.refresh_token || "")
    
    console.log("Redirecting to connect page with tokens")
    
    return NextResponse.redirect(redirectUrl.toString())
  } catch (error: any) {
    console.error("YouTube auth error:", error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || process.env.CLIENT_URL || "http://localhost:3000"}/connect?error=auth_failed`)
  }
}