import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Force the account chooser so users can select which Google account to use
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password")
        }

        await connectDB()

        // Find user by email
        const user = await User.findOne({ email: credentials.email })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signup",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB()
          
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user with Google data
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              emailVerified: new Date(),
            })
            console.log("✅ New Google user created:", user.email)
          } else {
            console.log("✅ Existing Google user found:", user.email)
          }
        } catch (error) {
          console.error("❌ Error in signIn callback:", error)
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback - URL:", url, "BaseURL:", baseUrl)
      
      // If the URL includes /connect, use it
      if (url.includes("/connect")) {
        console.log("✅ Redirecting to /connect")
        return `${baseUrl}/connect`
      }
      
      // If url starts with baseUrl, return it as-is
      if (url.startsWith(baseUrl)) {
        console.log("✅ Using provided URL:", url)
        return url
      }
      
      // If it's a relative path, append to baseUrl
      if (url.startsWith("/")) {
        console.log("✅ Appending path to baseUrl:", url)
        return `${baseUrl}${url}`
      }
      
      // Default to /connect
      console.log("✅ Default redirect to /connect")
      return `${baseUrl}/connect`
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      // Store the access token from Google
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      // Include access token in session
      (session as any).accessToken = token.accessToken
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }