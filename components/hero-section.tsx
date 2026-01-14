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
            {/* Light sky-blue background covering most of the hero (lighter) */}
            <div className="absolute inset-x-0 top-0 h-[70%] sm:h-[80%] lg:h-[85%] bg-gradient-to-b from-sky-50/20 to-white pointer-events-none z-0" />

            {/* Decorative Grid removed for clean white background */}

            {/* Enhanced Floating 3D Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large Gradient Orb - Top Left */}
                <div
                    className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-gray-100/70 to-white blur-3xl animate-blob"
                    style={{
                        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                        transition: 'transform 0.5s ease-out'
                    }}
                />

                {/* Capsule Shape - Top Right */}
                <div
                    className="absolute top-40 right-20 w-32 h-64 rounded-full bg-gradient-to-br from-gray-100/60 to-white blur-2xl animate-blob animation-delay-2000"
                    style={{
                        transform: `translate(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px) rotate(35deg)`,
                        transition: 'transform 0.5s ease-out'
                    }}
                />

                {/* Small Accent - Left Middle */}
                <div className="absolute top-1/3 left-32 w-24 h-24 rounded-full bg-gray-100/50 blur-xl animate-blob animation-delay-4000" />

                {/* Analytics Card Floating Element removed per request */}

                {/* Growth Badge Floating Element removed per request */}
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
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
                        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-3 leading-tight">
                            Grow your YouTube channel faster with AI-driven insights.
                        </h1>

                        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mb-4 font-medium leading-normal">
                            Powerful, easy-to-use AI tools for analytics, automation, and growth — all in one place.
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
                            className="group relative px-8 py-4 sm:px-10 sm:py-6 text-base sm:text-lg font-extrabold bg-black hover:bg-gray-900 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
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
                            className="group px-8 py-4 sm:px-10 sm:py-7 text-base sm:text-lg font-bold border-2 border-gray-300 hover:border-purple-300 hover:bg-purple-50 text-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <Link href="#demo">
                                <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Watch 2-Min Demo
                            </Link>
                        </Button>
                    </div>

                    {/* Trust Indicators - Enhanced */}
                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mb-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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

                    {/* Dashboard Preview - Premium removed per request */}
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
