"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp, Users, Star, CheckCircle2, Play, Zap, BarChart3, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function HeroSection() {
    const [isVisible, setIsVisible] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        setIsVisible(true)

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 30,
                y: (e.clientY / window.innerHeight - 0.5) * 30,
            })
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const handleStartNow = () => {
        if (session) {
            router.push("/connect")
        } else {
            router.push("/signup")
        }
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
            {/* Subtle Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-white to-purple-50/30" />

            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_0.5px,transparent_0.5px),linear-gradient(to_bottom,#8882_0.5px,transparent_0.5px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

            {/* Enhanced Floating 3D Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large Gradient Orb - Top Left */}
                <div
                    className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/30 blur-3xl animate-blob"
                    style={{
                        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                        transition: 'transform 0.5s ease-out'
                    }}
                />

                {/* Capsule Shape - Top Right */}
                <div
                    className="absolute top-40 right-20 w-32 h-64 rounded-full bg-gradient-to-br from-purple-400/40 to-pink-400/40 blur-2xl animate-blob animation-delay-2000"
                    style={{
                        transform: `translate(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px) rotate(35deg)`,
                        transition: 'transform 0.5s ease-out'
                    }}
                />

                {/* Small Accent - Left Middle */}
                <div className="absolute top-1/3 left-32 w-24 h-24 rounded-full bg-gradient-to-br from-pink-400/30 to-orange-400/30 blur-xl animate-blob animation-delay-4000" />

                {/* Analytics Card Floating Element */}
                <div
                    className="absolute top-1/4 right-12 animate-float-card hidden lg:block"
                    style={{
                        transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                >
                    <div className="w-56 h-36 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-gray-700">Live Analytics</span>
                            </div>
                            <Sparkles className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Total Views</span>
                                <span className="text-sm font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">+127%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Subscribers</span>
                                <span className="text-sm font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">45.2K</span>
                            </div>
                            <div className="w-full h-12 flex items-end gap-1">
                                {[40, 60, 45, 75, 55, 85, 70, 90].map((height, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm opacity-70"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Growth Badge Floating Element */}
                <div
                    className="absolute bottom-1/3 left-16 animate-float-card hidden lg:block animation-delay-2000"
                    style={{
                        transform: `translate(${mousePosition.x * -0.2}px, ${mousePosition.y * -0.2}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                >
                    <div className="px-4 py-3 rounded-xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-600 font-medium">Channel Growth</div>
                                <div className="text-lg font-black text-gray-900">+347%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-6xl mx-auto text-center">
                    {/* Animated Badge */}
                    <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                #1 AI-Powered YouTube Growth Platform
                            </span>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Main Headline - Enhanced */}
                    <div className={`mb-8 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
                            Relevant data-driven
                            <br />
                            <span className="inline-block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-text">
                                insights for creators.
                            </span>
                        </h1>

                        <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-6 font-medium leading-relaxed">
                            Powerful AI tools to grow your YouTube channel faster.
                            <br />
                            <span className="text-gray-500">From analytics to automation, everything you need in one place.</span>
                        </p>

                        {/* Free Badge - Enhanced */}
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-green-300/50 shadow-lg">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                                We track everything for FREE • No credit card needed
                            </span>
                        </div>
                    </div>

                    {/* CTA Buttons - Enhanced */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <Button
                            size="lg"
                            onClick={handleStartNow}
                            className="group relative px-10 py-7 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                            <span className="relative flex items-center">
                                {session ? "Go to Dashboard" : "Get Started Free"}
                                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="group px-10 py-7 text-lg font-bold border-2 border-gray-300 hover:border-purple-300 hover:bg-purple-50 text-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <Link href="#demo">
                                <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Watch 2-Min Demo
                            </Link>
                        </Button>
                    </div>

                    {/* Trust Indicators - Enhanced */}
                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mb-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {/* Stat 1 */}
                        <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                            <div className="text-3xl font-black text-gray-900 mb-1">10,000+</div>
                            <p className="text-sm text-gray-600 font-semibold">Active Creators</p>
                        </div>

                        {/* Stat 2 */}
                        <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 50}ms` }} />
                                ))}
                            </div>
                            <div className="text-3xl font-black text-gray-900 mb-1">4.9/5</div>
                            <p className="text-sm text-gray-600 font-semibold">From 2,500+ Reviews</p>
                        </div>

                        {/* Stat 3 */}
                        <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                            <div className="text-3xl font-black text-gray-900 mb-1">+127%</div>
                            <p className="text-sm text-gray-600 font-semibold">Avg. Growth Rate</p>
                        </div>
                    </div>

                    {/* Dashboard Preview - Premium */}
                    <div className={`mt-24 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <div className="relative max-w-6xl mx-auto group">
                            {/* Enhanced Glow */}
                            <div className="absolute -inset-12 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            {/* Main Dashboard Card */}
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 bg-white">
                                {/* Browser Bar */}
                                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer" />
                                            <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer" />
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                                            <Image
                                                src="/creere-snap-logo.png"
                                                alt="TubeBoost AI"
                                                width={18}
                                                height={18}
                                            />
                                            <span className="text-sm font-medium text-gray-700">tubeboost.ai/dashboard</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-bold text-green-700">Live</span>
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="p-8 sm:p-12 bg-gradient-to-b from-white via-gray-50/30 to-white">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                        {[
                                            { label: "Total Views", value: "127.5K", change: "+23%", icon: BarChart3, gradient: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
                                            { label: "Subscribers", value: "45.2K", change: "+18%", icon: Users, gradient: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50" },
                                            { label: "Watch Time", value: "8.2K hrs", change: "+31%", icon: Clock, gradient: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" }
                                        ].map((stat, i) => (
                                            <div key={i} className={`group/card p-6 rounded-2xl bg-gradient-to-br ${stat.bg} border border-gray-200/50 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-sm font-bold text-gray-700">{stat.label}</span>
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center group-hover/card:scale-110 transition-transform`}>
                                                        <stat.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                                <div className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                                                    {stat.value}
                                                </div>
                                                <div className="text-sm text-green-600 font-bold">{stat.change} this month</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chart */}
                                    <div className="p-6 rounded-2xl bg-white border border-gray-200/50 shadow-lg">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-black text-gray-900">Channel Growth</h3>
                                            <span className="text-xs font-semibold text-gray-500 px-3 py-1.5 bg-gray-100 rounded-lg">Last 30 days</span>
                                        </div>
                                        <div className="h-40 flex items-end justify-between gap-2">
                                            {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 95, 88, 100].map((height, i) => (
                                                <div key={i} className="flex-1 group/bar cursor-pointer">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-blue-600 via-purple-600 to-pink-600 rounded-t-xl transition-all duration-300 group-hover/bar:from-blue-700 group-hover/bar:via-purple-700 group-hover/bar:to-pink-700 group-hover/bar:shadow-lg"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: scale(1) translate(0, 0); }
          33% { transform: scale(1.1) translate(30px, -50px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
        }
        
        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-blob {
          animation: blob 15s ease-in-out infinite;
        }

        .animate-float-card {
          animation: float-card 4s ease-in-out infinite;
        }

        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </section>
    )
}
