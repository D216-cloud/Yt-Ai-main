"use client"

export const dynamic = 'force-dynamic'

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff } from "lucide-react"
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
    
    // Use redirect and prompt select_account so the account chooser opens
    signIn("google", {
      callbackUrl: "/connect",
      prompt: 'select_account'
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header - Use home page navbar */}
      <Header />
      
      {/* Hero-like soft gradient background */}
      <div className="absolute inset-x-0 top-0 h-[70%] sm:h-[80%] lg:h-[85%] bg-linear-to-b from-sky-50/20 to-white pointer-events-none z-0" />

      {/* Decorative orbs removed per request (icons/animated elements removed) */}

      {/* Main Content - Simple centered auth card */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-10 min-h-[calc(100vh-64px)] flex items-start justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md overflow-hidden flex items-center justify-center">
                <img src="/vidiomex-logo.svg" alt="logo" className="object-cover" />
              </div>
              <div className="text-sm font-semibold">UISOCIAL</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-gray-50 p-1 rounded-full w-full mb-5">
            <button type="button" onClick={() => { setAuthMode('signin'); (document.getElementById('email'))?.focus(); }} className={`flex-1 py-2 rounded-full text-sm font-semibold ${authMode === 'signin' ? 'bg-white shadow' : 'text-gray-500'}`}>Sign In</button>
            <button type="button" onClick={() => { setAuthMode('signup'); setTimeout(() => { (document.getElementById('name') || document.getElementById('email'))?.focus(); }, 120); }} className={`flex-1 py-2 rounded-full text-sm font-semibold ${authMode === 'signup' ? 'bg-white shadow' : 'text-gray-500'}`}>Sign Up</button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">{authMode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6">{authMode === 'signin' ? 'Sign in to continue' : 'Create an account to get started'}</p>

          <form id="auth-form" onSubmit={handleAuth} className="space-y-4 sm:space-y-5 w-full">
            {authMode === 'signup' && (
              <div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
              </div>
            )}

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

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <button type="button" onClick={handleGoogleAuth} aria-label="Sign in with Google" title="Sign in with Google" className="w-full border border-gray-200 rounded-md py-2 sm:py-3 text-sm flex items-center justify-center gap-3 hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200">
                  <svg className="w-5 h-5" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <path fill="#EA4335" d="M23 9.5c2.9 0 5.3 1 7.1 2.5l5.3-5.3C33.5 3 28.9 1 23 1 14 1 6.2 6.7 3.2 14.9l6.6 5.1C11.4 13 16.6 9.5 23 9.5z"/>
                    <path fill="#34A853" d="M44.5 24.5c0-1.6-.1-2.8-.4-4.1H23v7.5h12.2c-.5 2.6-1.9 4.9-4.1 6.4l6.3 4.9c3.7-3.4 5.1-8.6 5.1-14.7z"/>
                    <path fill="#4285F4" d="M23 45c5.9 0 10.9-1.9 14.6-5.3l-6.3-4.9C28.9 36 26.2 37 23 37c-6.4 0-11.6-3.5-13.2-8.7l-6.6 5.1C6.2 39.3 14 45 23 45z"/>
                    <path fill="#FBBC05" d="M3.2 14.9l6.6 5.1C10.8 20.3 16.1 17 23 17c3.6 0 6.9 1.2 9.4 3.3l6.9-6.9C34.5 7.6 28.3 5 23 5 16.6 5 11.5 7.8 8.5 12.2z"/>
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </button>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full bg-red-500 text-white rounded-full py-3 font-semibold">{authMode === 'signin' ? 'Sign in' : 'Sign up'}</button>
            </div>

            <div className="text-center">
              {authMode === 'signin' ? (
                <p className="text-xs text-gray-500">Don't have an account? <button type="button" onClick={() => { setAuthMode('signup'); setTimeout(() => { (document.getElementById('name') || document.getElementById('email'))?.focus(); }, 300); }} className="text-red-500 font-semibold hover:underline">Sign up</button></p>
              ) : (
                <p className="text-xs text-gray-500">Already have an account? <button type="button" onClick={() => { setAuthMode('signin'); (document.getElementById('email'))?.focus(); }} className="text-red-500 font-semibold hover:underline">Sign in</button></p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium">
                {error}
              </div>
            )}

          </form>

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
