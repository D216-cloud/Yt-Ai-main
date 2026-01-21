import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  // Redirect GET requests to the signup page
  return NextResponse.redirect(new URL("/signup", req.url))
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user in Supabase
    const supabase = createServerSupabaseClient()
    const { data: user, error: dbErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .limit(1)
      .single()

    if (dbErr || !user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    return NextResponse.json(
      {
        message: "Sign in successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
