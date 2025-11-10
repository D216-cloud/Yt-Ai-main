"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Play, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { YouTubeAnimation } from "@/components/youtube-animation"
import { SkeletonContent } from "@/components/skeleton-loader"

type AuthMode = "signup" | "signin"

export default function SignupPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<AuthMode>("signup")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (authMode === "signup") {
        // Register new user
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to sign up")
        }

        // After successful signup, sign in the user
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (signInResult?.error) {
          throw new Error("Failed to sign in after signup")
        }

        router.push("/connect")
      } else {
        // Sign in existing user
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          throw new Error("Invalid email or password")
        }

        router.push("/connect")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    setIsLoading(true)
    setError("")
    
    // Use redirect: true to let NextAuth handle the redirect automatically
    signIn("google", {
      callbackUrl: "/connect",
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Desktop Animation Section */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-2xl">
        {isLoading ? <SkeletonContent /> : <YouTubeAnimation />}
      </div>

      {/* Mobile & Desktop Form Section */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50">
        {/* Mobile Header with Safe Area */}
        <div className="md:hidden pt-2 px-4 pb-4 bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">YouTubeAI Pro</p>
              <p className="text-xs text-gray-500">Grow Smarter</p>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex h-16 items-center px-8 border-b border-gray-200 bg-white">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">YouTubeAI Pro</span>
          </Link>
          <div className="ml-auto flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {authMode === "signup" ? "Have an account?" : "No account yet?"}
            </span>
            <Button
              onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}
              variant="outline"
              className="text-gray-600 hover:text-gray-900 border-gray-300"
            >
              {authMode === "signup" ? "Sign In" : "Sign Up"}
            </Button>
          </div>
        </div>

        {/* Form Container - Mobile App Style */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md md:max-w-none">
            <div className="mb-6 md:mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {authMode === "signup" ? "Get Started" : "Welcome Back"}
              </h1>
              <p className="text-gray-600 text-sm">
                {authMode === "signup"
                  ? "Join creators growing their YouTube channels"
                  : "Continue your journey to YouTube growth"}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ) : (
              <>
                <form onSubmit={handleAuth} className="space-y-4 mb-6">
                  {authMode === "signup" && (
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name (Optional)
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          disabled={isLoading}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 text-base"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 rounded-lg font-semibold shadow-lg disabled:opacity-50 text-base mt-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {authMode === "signup" ? "Creating..." : "Signing In..."}
                      </>
                    ) : authMode === "signup" ? (
                      <>
                        Get Started <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 bg-white text-base hover:bg-gray-50 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </>
            )}

            <p className="text-center text-xs text-gray-500 mt-6">
              By {authMode === "signup" ? "signing up" : "signing in"}, you agree to our Terms
            </p>
          </div>
        </div>

        {/* Mobile Bottom Safe Area */}
        <div className="md:hidden h-4 bg-white"></div>
      </div>
    </div>
  )
}
