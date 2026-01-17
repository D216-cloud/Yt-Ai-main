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
      
      {/* Hero-like soft gradient background */}
      <div className="absolute inset-x-0 top-0 h-[70%] sm:h-[80%] lg:h-[85%] bg-linear-to-b from-sky-50/20 to-white pointer-events-none z-0" />

      {/* Decorative orbs removed per request (icons/animated elements removed) */}

      {/* Main Content - Split layout */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-10 min-h-[calc(100vh-64px)] flex items-start justify-center">
        <div className="w-full max-w-[1100px] rounded-3xl overflow-hidden shadow-2xl bg-transparent">
          <div className="flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden">

            {/* Left art panel (hidden on small screens) */}
            <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-8" style={{clipPath: 'polygon(0 0, 72% 0, 58% 100%, 0% 100%)'}}>
              <div className="absolute inset-6 rounded-3xl border-8 border-white/90 overflow-hidden shadow-inner">
                <img src="/images/auth-art.svg" alt="art" className="w-full h-full object-cover" />
              </div>

              {/* Top labels */}
              <div className="absolute top-8 left-10 text-white text-sm font-semibold">Selected Works</div>
              <div className="absolute top-6 right-6 flex items-center gap-3">
                <button
                  onClick={() => { setAuthMode('signup'); document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                  className="text-white rounded-full px-3 py-1 border border-white/40 hover:bg-white/10 transition"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                  className="bg-white text-black rounded-full px-3 py-1 shadow-sm"
                >
                  Join Us
                </button>
              </div>

              {/* Bottom left author */}
              <div className="absolute bottom-8 left-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm font-semibold">A</div>
                <div className="text-white text-sm">
                  <div className="font-semibold">Andrew.ui</div>
                  <div className="text-xs text-white/80">UI & Illustration</div>
                </div>
              </div>

              {/* Bottom right arrows */}
              <div className="absolute bottom-8 right-8 flex gap-2">
                <button className="w-9 h-9 rounded-full bg-white/10 text-white border border-white/20">‹</button>
                <button className="w-9 h-9 rounded-full bg-white/10 text-white border border-white/20">›</button>
              </div>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 bg-white p-10 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md overflow-hidden flex items-center justify-center">
                    <img src="/vidiomex-logo.svg" alt="logo" className="object-cover" />
                  </div>
                  <div className="text-sm font-semibold">UISOCIAL</div>
                </div>

                <div>
                  <button className="text-xs px-3 py-1 rounded-full border border-gray-200">EN</button>
                </div>
              </div>

              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Hi Designer</h2>
              <p className="text-sm text-gray-500 mb-6">Welcome to UISOCIAL</p>

              <form id="auth-form" onSubmit={handleAuth} className="space-y-4 w-full max-w-md">
                <div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  />
                </div>
                <div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="form-checkbox h-4 w-4 rounded" />
                    <span className="text-gray-600">Remember me</span>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-red-400">Forgot password ?</Link>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <button type="button" onClick={handleGoogleAuth} className="w-full border border-gray-200 rounded-md py-3 text-sm flex items-center justify-center gap-2">
                      <img src="/images/google-icon.svg" alt="g" className="w-5 h-5" />
                      Login with Google
                    </button>
                  </div>
                  <div className="w-28">
                    <button type="submit" className="w-full bg-red-500 text-white rounded-full py-3">Login</button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">Don't have an account? <button type="button" onClick={() => { setAuthMode('signup'); document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => { (document.getElementById('name') || document.getElementById('email'))?.focus(); }, 500); }} className="text-red-500 font-semibold hover:underline">Sign up</button></p>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">f</div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">t</div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">in</div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">ig</div>
                </div>
              </form>
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
