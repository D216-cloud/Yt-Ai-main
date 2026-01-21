import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createServerSupabaseClient } from "@/lib/supabase"

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

        try {
          const supabase = createServerSupabaseClient()

          // Find user by email in Supabase users table
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email.toLowerCase())
            .limit(1)
            .single()

          if (error || !user || !user.password) {
            throw new Error("Invalid email or password")
          }

          // Check password (bcrypt hash stored in users.password)
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error("Invalid email or password")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (err) {
          console.error('Credentials authorize error:', err)
          throw new Error('Invalid email or password')
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
      // Upsert user into Supabase users table (for Google sign-ins)
      try {
        const supabase = createServerSupabaseClient()

        const payload: any = {
          email: user.email,
          name: user.name,
          image: (user as any).image || null,
        }

        if (account?.provider === 'google') {
          payload.provider = 'google'
          payload.email_verified = new Date()
        }

        const { data, error } = await supabase
          .from('users')
          .upsert(payload, { onConflict: 'email' })
          .select('id,email')
          .limit(1)
          .single()

        if (error) {
          console.error('Error upserting user to Supabase:', error)
          return false
        }

        console.log('✅ Supabase user upserted:', data?.email)
      } catch (error) {
        console.error('❌ Error in signIn callback:', error)
        return false
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // If the URL includes /connect, use it
      if (url.includes("/connect")) {
        return `${baseUrl}/connect`
      }

      // If url starts with baseUrl, return it as-is
      if (url.startsWith(baseUrl)) {
        return url
      }

      // If it's a relative path, append to baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // Default to /connect
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