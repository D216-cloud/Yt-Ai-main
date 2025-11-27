"use client"

import { Check, Sparkles, Zap, Crown, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Perfect for beginners",
    price: "Free",
    period: "forever",
    icon: Rocket,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    features: [
      "5 AI-generated video ideas/month",
      "Basic analytics dashboard",
      "1 YouTube channel",
      "Email support",
      "Community access"
    ],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    description: "For serious creators",
    price: "$29",
    period: "/month",
    icon: Zap,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    features: [
      "Unlimited AI content generation",
      "Advanced analytics & insights",
      "Up to 5 YouTube channels",
      "Bulk upload & scheduling",
      "SEO optimization tools",
      "Priority support",
      "Competitor analysis"
    ],
    cta: "Start 14-Day Trial",
    popular: true
  },
  {
    name: "Enterprise",
    description: "For agencies & teams",
    price: "$99",
    period: "/month",
    icon: Crown,
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
    features: [
      "Everything in Pro",
      "Unlimited YouTube channels",
      "White-label solution",
      "Custom AI training",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "24/7 phone support"
    ],
    cta: "Contact Sales",
    popular: false
  }
]

export function PricingSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-200 shadow-lg mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simple Pricing
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
            Choose your
            <span className="block mt-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              growth plan
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free, upgrade when you're ready. All plans include a 14-day money-back guarantee.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Card Glow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${plan.gradient} rounded-3xl blur ${plan.popular ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'} transition duration-500`} />

              {/* Card */}
              <div className={`relative h-full p-8 rounded-3xl bg-gradient-to-br ${plan.bgGradient} border-2 ${plan.popular ? 'border-purple-300' : 'border-gray-200'} hover:border-gray-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${plan.gradient} mb-6 shadow-lg`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-500 text-lg">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className={`w-full mb-8 rounded-xl font-bold ${plan.popular
                      ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white shadow-lg`
                      : 'bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900'
                    }`}
                >
                  <Link href={plan.popular ? "/signup" : plan.name === "Enterprise" ? "/contact" : "/signup"}>
                    {plan.cta}
                  </Link>
                </Button>

                {/* Features */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700 mb-4">
                    What's included:
                  </div>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Section */}
        <div className="mt-20 text-center">
          <div className="inline-block p-1 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <div className="px-8 py-6 rounded-3xl bg-white">
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    10,000+
                  </div>
                  <div className="text-sm text-gray-600">Active Creators</div>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                    50,000+
                  </div>
                  <div className="text-sm text-gray-600">Videos Created</div>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-1">
                    4.9★
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Have questions? Check out our{" "}
            <Link href="/faq" className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:underline">
              FAQ section
            </Link>
            {" "}or{" "}
            <Link href="/contact" className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:underline">
              contact our team
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
