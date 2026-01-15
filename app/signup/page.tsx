"use client"

export const dynamic = 'force-dynamic'

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Play, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, TrendingUp, Users } from "lucide-react"
import { Header } from "@/components/header"

type AuthMode = "signup" | "signin"

export default function SignupPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<AuthMode>("signin")
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header - Use home page navbar */}
      <Header />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating icons decoration */}
      <div className="absolute top-32 right-20 hidden lg:block animate-float">
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-2xl shadow-2xl">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="absolute bottom-32 left-20 hidden lg:block animate-float-delayed">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
          <Users className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-20 min-h-[calc(100vh-64px)]">
        <div className="max-w-3xl mx-auto flex items-center justify-center">

          {/* Centered Auth Card */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
              {/* Top Logo + Title */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-lg overflow-hidden shadow-md flex items-center justify-center">
                  <Image src="/vidiomex-logo.svg" alt="Vidiomex" width={44} height={44} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {authMode === "signup" ? "Create your account" : "Welcome back"}
                  </h1>
                  <p className="text-sm text-gray-500">{authMode === "signup" ? "Get started in seconds" : "Sign in to continue"}</p>
                </div>
              </div>

              {/* Mode Toggle - Inline */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {authMode === "signup" ? "Already have an account?" : "Don't have an account?"}
                </div>
                <button
                  onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}
                  className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors text-sm"
                >
                  {authMode === "signup" ? "Sign In" : "Sign Up"}
                </button>
              </div>

              {/* Google Sign In Button */}
              <div className="relative">
                <Button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 shadow-md transition-colors duration-200 mb-5"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                      <span className="text-sm font-bold text-gray-700">Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {authMode === "signup" ? "Continue with Google" : "Sign in with Google"}
                      </span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/90 text-gray-500 font-medium">Or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === "signup" && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Name (Optional)
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 text-base bg-white"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
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
                      className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 text-base bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full pl-12 pr-12 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 text-base bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="form-checkbox h-4 w-4 rounded" />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-sm shadow-lg hover:shadow-xl disabled:opacity-50 transition-all mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {authMode === "signup" ? "Creating Account..." : "Signing In..."}
                    </>
                  ) : (
                    <>
                      {authMode === "signup" ? "Create Account" : "Sign In"}
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <p className="text-center text-xs text-gray-500 mt-6">
                By {authMode === "signup" ? "signing up" : "signing in"}, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Bottom Features */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-xs text-gray-600 mt-1">Creators</div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  2M+
                </div>
                <div className="text-xs text-gray-600 mt-1">Videos</div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  99%
                </div>
                <div className="text-xs text-gray-600 mt-1">Success</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-gentle-bounce {
          animation: gentle-bounce 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
