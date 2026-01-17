"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PillNav, PillButton } from "@/components/pills"
import { Menu, X, Play, LogOut, User, Mail, Sparkles, DollarSign, Cog, Youtube, Search } from "lucide-react"
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
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-transparent">
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center h-16">
          {/* Left: Logo */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md overflow-hidden shadow-sm flex items-center justify-center">
                <Image src="/vidiomex-logo.svg" alt="Vidiomex" width={32} height={32} className="object-cover" />
              </div>
              <span className="hidden sm:inline-block text-sm font-semibold text-gray-800">Pallet Ross</span>
            </Link>
          </div>

          {/* Center: Navigation (absolutely centered) */}
          {!isAuthPage && (
            <nav className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto hidden md:flex items-center gap-6 md:translate-x-6">
                <PillNav items={[
                  { href: "#", label: "Get Started" },
                  { href: "#", label: "Create strategy" },
                  { href: "#pricing", label: "Pricing" },
                  { href: "#contact", label: "Contact" },
                  { href: "#", label: "Solution" },
                  { href: "#", label: "E-Commerce" },
                ]} />
              </div>
            </nav>
          )}

          {/* Right: Icons / Account */}
          <div className="ml-auto flex items-center space-x-3">
            <button aria-label="Search" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Search className="h-4 w-4 text-gray-700" />
            </button>

            {session ? (
              <div className="hidden md:flex items-center gap-3">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Play className="h-4 w-4 text-gray-700" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">{session.user?.name?.[0]?.toUpperCase() || "U"}</div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <PillButton onClick={handleGetStarted}>Get Started</PillButton>
                <PillButton onClick={handleGetStarted} variant="primary">Sign up</PillButton>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
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
        </div>

        {/* Mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-white/95 backdrop-blur-lg rounded-b-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 space-y-2">
              {!isAuthPage && (
                <>
                  <Link href="#" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700">Get Started</Link>
                  <Link href="#" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700">Create strategy</Link>
                  <Link href="#pricing" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700">Pricing</Link>
                  <Link href="#contact" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700">Contact</Link>
                </>
              )}
              {session ? (
                <Button onClick={handleLogout} className="w-full">Logout</Button>
              ) : (
                <Button onClick={handleGetStarted} className="w-full">Get Started</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
