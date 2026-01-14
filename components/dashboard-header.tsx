"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
    Search,
    Settings,
    User,
    LogOut,
    Menu,
    X,
    Play,
    ChevronDown,
    Youtube
} from "lucide-react"

interface DashboardHeaderProps {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
}

export default function DashboardHeader({ sidebarOpen, setSidebarOpen }: DashboardHeaderProps) {
    const router = useRouter()
    const { data: session } = useSession()
    const [showProfileMenu, setShowProfileMenu] = useState(false)

    // Determine user's plan (fallback to Free)
    const planName = (session?.user as any)?.plan || (session?.user as any)?.subscription || 'Free'

    const handleSignOut = async () => {
        await signOut({ redirect: false })
        router.push('/')
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-sm h-16">
            <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Left: Logo & Search */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {sidebarOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
                    </button>

                    {/* Logo Icon Only */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <Image
                              src="/vidiomex-logo.svg"
                              alt="Vidiomex"
                              width={36}
                              height={36}
                              className="rounded-lg"
                            />
                        </div>
                    </Link>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3">
                    {/* Notifications & Settings removed per request */}

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-gray-900">{session?.user?.name || "Creator"}</p>
                            </div>
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold">
                                        {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                                    </span>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                        </button>

                        {/* Profile Menu Dropdown */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-64 md:w-80 lg:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                                <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                    <p className="font-bold text-gray-900">{session?.user?.name || "Creator"}</p>
                                    <p className="text-sm text-gray-600">{session?.user?.email || '—'}</p>
                                    <p className="text-sm text-gray-600 mt-1">Plan: <span className="font-semibold text-gray-900">{planName}</span></p>
                                </div>
                                <div className="p-2">
                                    <Link href="/profile">
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                                            <User className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-900">Profile Settings</span>
                                        </button>
                                    </Link>
                                    <Link href="/connect">
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                                            <Youtube className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-900">Manage Channels</span>
                                        </button>
                                    </Link>
                                    <Link href="/settings">
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                                            <Settings className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-900">Settings</span>
                                        </button>
                                    </Link>
                                </div>
                                <div className="p-2 border-t border-gray-200">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-600">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
