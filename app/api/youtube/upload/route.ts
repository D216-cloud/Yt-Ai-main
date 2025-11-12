import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const accessToken = formData.get("access_token") as string
    const videoFile = formData.get("video") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string
    const privacy = formData.get("privacy") as string
    const madeForKids = formData.get("madeForKids") === "true"
    const category = formData.get("category") as string

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "No access token provided" }, { status: 401 })
    }

    if (!videoFile) {
      return NextResponse.json({ success: false, error: "No video file provided" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ success: false, error: "No title provided" }, { status: 400 })
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    })

    // Convert File to Buffer
    const arrayBuffer = await videoFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse tags
    const tagArray = tags
      ? tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0)
      : []

    // Upload video
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title,
          description: description || "",
          tags: tagArray,
          categoryId: category || "22", // Default to People & Blogs
        },
        status: {
          privacyStatus: privacy as "public" | "private" | "unlisted",
          selfDeclaredMadeForKids: madeForKids,
        },
      },
      media: {
        body: require("stream").Readable.from(buffer),
        mimeType: videoFile.type,
      },
    })

    return NextResponse.json({
      success: true,
      video: {
        id: response.data.id,
        title: response.data.snippet?.title,
        url: `https://youtube.com/watch?v=${response.data.id}`,
      },
    })
  } catch (error: any) {
    console.error("YouTube upload error:", error)
    
    if (error.code === 401 || error.message?.includes("invalid_grant")) {
      return NextResponse.json(
        { success: false, error: "Token expired", expired: true },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload video",
      },
      { status: 500 }
    )
  }
}
