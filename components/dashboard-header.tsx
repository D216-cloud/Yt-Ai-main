"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
    Search,
    Bell,
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
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)

    const handleSignOut = async () => {
        await signOut({ redirect: false })
        router.push('/')
    }

    const notifications = [
        { id: 1, type: 'success', message: 'Video published successfully', time: '5m ago' },
        { id: 2, type: 'info', message: 'New subscriber milestone: 45K', time: '1h ago' },
        { id: 3, type: 'warning', message: 'Scheduled video in 2 hours', time: '2h ago' },
    ]

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

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                TubeBoost AI
                            </span>
                            <p className="text-xs text-gray-500 font-medium">Creator Studio</p>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:flex items-center flex-1 max-w-xl ml-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search videos, analytics, insights..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3">
                    {/* Search Icon - Mobile */}
                    <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Search className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${notif.type === 'success' ? 'bg-green-500' :
                                                    notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                                    }`}></div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-900">{notif.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-gray-50 text-center">
                                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <Link href="/settings">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <Settings className="w-5 h-5 text-gray-600" />
                        </button>
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                    {session?.user?.name || "Creator"}
                                </p>
                                <p className="text-xs text-gray-500">Premium Plan</p>
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
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                    <p className="font-bold text-gray-900">{session?.user?.name || "Creator"}</p>
                                    <p className="text-sm text-gray-600">{session?.user?.email}</p>
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
