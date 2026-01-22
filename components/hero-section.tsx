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
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const { data: session } = useSession()
    const router = useRouter()

    const images = ['093c240070b09768c8280bc645e16e96.jpg','66a41dab1d353d577be308f4951d4fa9.jpg','7a5cd134be322e939a42755c7117dd74.jpg','a7524e5cda8566e5e39c8410e7bcd142.jpg','boy-working.jpg']

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

    // Auto-scroll carousel every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [images.length])

    const handleStartNow = () => {
        setIsStarting(true)
        if (session) {
            router.push("/connect")
        } else {
            router.push("/signup")
        }
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-visible bg-gray-50">
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

            <div className="relative z-10 w-full pt-0 pb-8 lg:pb-20 overflow-visible">
                <div className="w-full overflow-visible">
                    <div className={`relative w-full mt-0 sm:-mt-16 lg:-mt-20 rounded-none bg-white shadow-2xl p-6 sm:p-10 lg:p-20 pt-4 sm:pt-14 lg:pt-20 pb-12 sm:pb-16 lg:pb-24 flex flex-col justify-center text-center overflow-visible transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        
                        {/* Star Badge Card */}
                        <div className="relative z-50 inline-flex items-center justify-center mx-auto mb-6">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 px-4 sm:px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-shadow">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm sm:text-base font-semibold text-gray-800">Hello Future YouTubers! 🎉</span>
                            </div>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4 sm:mb-6">
                            A place to display your masterpiece.
                        </h1>

                        <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
                            Artists can display their masterpieces, and buyers can discover and purchase works that resonate with them.
                        </p>

                        {/* CTAs - Removed pricing button */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                            <Button size="lg" onClick={handleStartNow} className="w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-5 text-sm sm:text-base font-bold bg-black text-white rounded-xl shadow-lg hover:bg-gray-900 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                                ✨ Start Now
                            </Button>

                            <Link href="#features" className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-12 py-4 sm:py-5 rounded-xl border-2 border-gray-900 text-sm sm:text-base font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200 transform hover:scale-105">
                                📚 Learn More
                            </Link>
                        </div>

                        {/* Image Carousel - Mobile Only */}
                        <div className="sm:hidden relative w-full mt-8">
                            {/* Carousel Container */}
                            <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-xl">
                                <div className="relative w-full aspect-video flex items-center justify-center">
                                    {images.map((img, i) => (
                                        <div
                                            key={img}
                                            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                                                i === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        >
                                            <Image 
                                                src={`/images/${img}`} 
                                                alt={`carousel-${i}`} 
                                                width={480} 
                                                height={300} 
                                                className="w-full h-full object-cover" 
                                                priority={i === currentImageIndex}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all"
                                    aria-label="Previous image"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all"
                                    aria-label="Next image"
                                >
                                    →
                                </button>
                            </div>

                            {/* Dot Navigation */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`transition-all duration-300 rounded-full ${
                                            i === currentImageIndex
                                                ? 'bg-gray-900 w-3 h-3'
                                                : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Go to image ${i + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Image Counter */}
                            <div className="text-center mt-3 text-sm text-gray-600 font-medium">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </div>

                        {/* Desktop Overlapping Cards */}
                        <div className="hidden sm:block relative w-full mt-8 sm:mt-12 lg:mt-16">
                            <div className="relative w-full flex items-center justify-center">
                                <div className="flex items-end justify-center gap-2 sm:gap-3 lg:gap-0 lg:items-end lg:justify-center">
                                    {images.map((img, i) => (
                                        <div key={img} className={`relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl transform transition-all duration-500 flex-shrink-0 ${i === 2 ? 'lg:z-30 lg:scale-110 sm:scale-100 sm:rotate-0' : i < 2 ? 'lg:z-20 lg:-rotate-3 hidden sm:block' : 'lg:z-10 lg:rotate-3 hidden lg:block'}`} style={{ width: typeof window !== 'undefined' && window.innerWidth < 1024 ? (i === 2 ? 150 : 120) : (i === 2 ? 200 : 150), height: typeof window !== 'undefined' && window.innerWidth < 1024 ? (i === 2 ? 110 : 90) : (i === 2 ? 140 : 120) }}>
                                            <Image src={`/images/${img}`} alt={`card-${i}`} width={480} height={300} className="object-cover w-full h-full" priority={i === 2} />
                                        </div>
                                    ))}
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
