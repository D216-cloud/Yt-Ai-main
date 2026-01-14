"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Play, LogOut, User, Mail, Sparkles, DollarSign, Cog, Youtube } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on signup/signin page
  const isAuthPage = pathname === "/signup" || pathname === "/signin"
  // Hide the CTA Get Started when on connect page (it's redundant)
  const hideGetStarted = pathname === "/connect"
  const showGetStarted = !isAuthPage && !hideGetStarted && !session

  const handleGetStarted = () => {
    if (session) {
      router.push("/connect")
    } else {
      router.push("/signup")
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 border-b bg-white/95 backdrop-blur-xl supports-backdrop-filter:bg-white/90 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="h-10 w-10 rounded-lg overflow-hidden shadow-md flex items-center justify-center hover:shadow-lg transition-shadow">
              <Image src="/vidiomex-logo.svg" alt="Vidiomex" width={40} height={40} className="object-cover" />
            </div>
          </Link>

          {/* Only show navigation links if NOT on auth pages */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="#features"
                className="group flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-linear-to-r hover:from-primary hover:to-secondary transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105"
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary group-hover:text-white transition-colors" />
                Features
              </Link>
              <Link
                href="#pricing"
                className="group flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-linear-to-r hover:from-primary hover:to-secondary transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105"
              >
                <DollarSign className="h-4 w-4 mr-2 text-primary group-hover:text-white transition-colors" />
                Pricing
              </Link>
              <Link
                href="#how-it-works"
                className="group flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-linear-to-r hover:from-primary hover:to-secondary transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105"
              >
                <Cog className="h-4 w-4 mr-2 text-primary group-hover:text-white transition-colors" />
                How It Works
              </Link>
            </nav>
          )}

          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <>
                <div className="group flex items-center space-x-3 px-4 py-2 rounded-xl bg-gray-100 hover:bg-linear-to-r hover:from-primary hover:to-secondary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105 cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm group-hover:from-white group-hover:to-white group-hover:text-primary transition-colors">
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-white transition-colors">{session.user?.name || "User"}</span>
                    <span className="text-xs text-gray-600 group-hover:text-white/80 transition-colors">{session.user?.email}</span>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="group flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-linear-to-r hover:from-primary hover:to-secondary transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105 border-gray-300 hover:border-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2 text-primary group-hover:text-white transition-colors" />
                  Logout
                </Button>
              </>
            ) : null}
            {showGetStarted && (
              <Button
                onClick={handleGetStarted}
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                Get Started
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {session && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 shadow-md">
                <span className="text-white text-sm font-bold uppercase">
                  {session.user?.email?.substring(0, 2) || "U"}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Only show navigation links if NOT on auth pages */}
              {!isAuthPage && (
                <>
                  <Link
                    href="#features"
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#pricing"
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                </>
              )}
              <div className="px-4 py-2 space-y-2">
                {session ? (
                  <>
                    <div className="group flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-100 hover:bg-linear-to-r hover:from-primary hover:to-secondary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105 cursor-pointer">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white font-semibold group-hover:from-white group-hover:to-white group-hover:text-primary transition-colors">
                        {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-white transition-colors">{session.user?.name || "User"}</span>
                        <span className="text-xs text-gray-600 group-hover:text-white/80 transition-colors">{session.user?.email}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full group flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-white hover:bg-linear-to-r hover:from-primary hover:to-secondary transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105 border-gray-300 hover:border-transparent"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-primary group-hover:text-white transition-colors" />
                      Logout
                    </Button>
                  </>
                ) : null}
                {showGetStarted && (
                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
