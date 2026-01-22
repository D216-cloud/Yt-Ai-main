"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, TrendingUp, Award } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function ChangelogPlansSection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleGetStarted = () => {
    setIsStarting(true)
    if (session) {
      router.push("/connect")
    } else {
      router.push("/signup")
    }
  }

  const plans = [
    {
      duration: "1 Year",
      price: "$99",
      pricePerMonth: "$8.25",
      description: "Perfect for beginners",
      features: [
        "AI Title Generator",
        "AI Tag Suggestions",
        "Video Analytics",
        "Content Strategy",
        "5 Videos/month limit",
        "Email Support",
        "Basic Channel Tools"
      ],
      popular: false
    },
    {
      duration: "2 Years",
      price: "$179",
      pricePerMonth: "$7.46",
      description: "Best value & savings",
      features: [
        "Everything in 1 Year",
        "Unlimited Videos",
        "Advanced Analytics Dashboard",
        "Priority Support",
        "AI Thumbnail Generator",
        "Auto-Reply System",
        "Bulk Upload Tool",
        "Channel Optimization",
        "Save $19/year"
      ],
      popular: true
    },
    {
      duration: "3 Years",
      price: "$249",
      pricePerMonth: "$6.92",
      description: "Maximum savings",
      features: [
        "Everything in 2 Years",
        "Premium Analytics",
        "24/7 Priority Support",
        "AI Content Calendar",
        "Video-to-Audio Conversion",
        "Custom Integrations",
        "Dedicated Support",
        "Lifetime Updates",
        "Save $48/year"
      ],
      popular: false
    }
  ]

  return (
    <section className="relative py-16 sm:py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white overflow-visible">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-br from-cyan-100/20 to-blue-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-4 sm:px-6 py-2 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Flexible Plans</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Lifetime Access Plans
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Choose a plan that works best for you. All plans include lifetime access to your purchased version.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl transition-all duration-300 overflow-hidden group ${
                plan.popular
                  ? 'md:scale-105 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl'
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  BEST VALUE
                </div>
              )}

              <div className="p-8 sm:p-10">
                {/* Plan Duration */}
                <h3 className={`text-2xl sm:text-3xl font-bold mb-1 ${
                  plan.popular ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.duration}
                </h3>

                {/* Description */}
                <p className={`text-sm mb-6 ${
                  plan.popular ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-2">
                  <span className={`text-4xl sm:text-5xl font-extrabold ${
                    plan.popular ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.price}
                  </span>
                  <span className={`text-xs ml-2 ${
                    plan.popular ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    one-time payment
                  </span>
                </div>

                <p className={`text-xs mb-6 ${
                  plan.popular ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  ${plan.pricePerMonth}/month
                </p>

                {/* CTA Button */}
                <Button
                  onClick={handleGetStarted}
                  disabled={isStarting}
                  className={`w-full mb-8 py-3 font-bold rounded-lg transition-all duration-200 ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Get Started Now
                </Button>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'text-yellow-300' : 'text-blue-600'
                      }`} />
                      <span className={`text-sm ${
                        plan.popular ? 'text-blue-50' : 'text-gray-700'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Text */}
        <div className="text-center space-y-3">
          <p className="text-gray-600 text-sm">
            ✅ 30-day money-back guarantee on all plans
          </p>
          <p className="text-gray-600 text-sm">
            ✅ No credit card required to start · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
