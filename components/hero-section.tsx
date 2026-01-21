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
    const [isStarting, setIsStarting] = useState(false)
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
        setIsStarting(true)
        if (session) {
            router.push("/connect")
        } else {
            router.push("/signup")
        }
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50">
            {/* Light sky-blue background covering most of the hero (lighter) */}
            <div className="absolute inset-x-0 top-0 h-[70%] sm:h-[80%] lg:h-[85%] bg-linear-to-b from-sky-50/20 to-white pointer-events-none z-0" />

            {/* Decorative Grid removed for clean white background */}

            {/* Enhanced Floating 3D Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large Gradient Orb - Top Left */}
                <div
                    className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-linear-to-br from-gray-100/70 to-white blur-3xl animate-blob"
                    style={{
                        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                        transition: 'transform 0.5s ease-out'
                    }}
                />

                {/* Capsule Shape - Top Right */}
                <div
                    className="absolute top-40 right-20 w-32 h-64 rounded-full bg-linear-to-br from-gray-100/60 to-white blur-2xl animate-blob animation-delay-2000"
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

            <div className="relative z-10 w-full pt-0 pb-12 lg:pb-20">
                <div className="w-full">
                    <div className={`relative w-full -mt-16 lg:-mt-20 rounded-none bg-white shadow-2xl p-6 sm:p-12 lg:p-20 pt-16 sm:pt-20 lg:pt-24 pb-24 min-h-screen lg:min-h-[110vh] flex flex-col justify-center text-center overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        {/* Main Headline - Matches reference image */}
                        <h1 className="text-4xl sm:text-5xl md:text-[64px] lg:text-[72px] font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
                            A place to display your masterpiece.
                        </h1>

                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-8">
                            Artists can display their masterpieces, and buyers can discover and purchase works that resonate with them.
                        </p>

                        {/* CTAs */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <Button size="lg" onClick={handleStartNow} className="px-8 py-4 text-base font-bold bg-black text-white rounded-full shadow-lg hover:scale-105 transition-transform">
                                Join for $9.99/m
                            </Button>

                            <Button size="lg" onClick={() => { setIsStarting(true); setTimeout(() => { if (session) { router.push('/connect') } else { router.push('/signup') } }, 150) }} className="px-8 py-4 text-base font-bold bg-emerald-600 text-white rounded-full shadow-lg hover:scale-105 transition-transform">
                                {isStarting ? 'Loading...' : 'Start Now'}
                            </Button>

                            <Link href="#" className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                                Read more
                            </Link>
                        </div>

                        {/* Overlapping card images */}
                        <div className="relative w-full flex items-center justify-center mt-6">
                            <div className="flex items-end justify-center -space-x-12">
                                {['093c240070b09768c8280bc645e16e96.jpg','66a41dab1d353d577be308f4951d4fa9.jpg','7a5cd134be322e939a42755c7117dd74.jpg','a7524e5cda8566e5e39c8410e7bcd142.jpg','boy-working.jpg'].map((img, i) => (
                                    <div key={img} className={`relative overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 ${i === 2 ? 'z-30 scale-105 rotate-0' : i < 2 ? 'z-20 -rotate-3' : 'z-10 rotate-3'}`} style={{ width: i === 2 ? 240 : 180, height: i === 2 ? 150 : 120 }}>
                                        <Image src={`/images/${img}`} alt={`card-${i}`} width={480} height={300} className="object-cover w-full h-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Small username badges positioned like the reference */}
                            <div className="absolute left-6 top-6">
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm shadow">@copin</div>
                            </div>

                            <div className="absolute right-6 top-6">
                                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm shadow">@andrea</div>
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
