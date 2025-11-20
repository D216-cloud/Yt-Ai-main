"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, CheckCircle, Star, Zap, Crown, Users, TrendingUp, Youtube, ArrowRight, DollarSign } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "Perfect for creators starting their YouTube journey",
    features: [
      "Up to 50 videos/month",
      "AI content generation",
      "Basic analytics dashboard",
      "Single YouTube channel",
      "Thumbnail AI (5/month)",
      "Email support",
      "14-day free trial"
    ],
    popular: false,
    badge: "Most Popular for Beginners",
    savings: ""
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "Ideal for growing creators and small businesses",
    features: [
      "Up to 200 videos/month",
      "Advanced AI content generation",
      "Detailed analytics & insights",
      "Up to 3 YouTube channels",
      "Unlimited thumbnail AI",
      "Competitor analysis",
      "Priority support",
      "Bulk operations",
      "Custom branding"
    ],
    popular: true,
    badge: "Best Value",
    savings: "Save $120/year"
  },
  {
    name: "Enterprise",
    price: "$149",
    period: "/month",
    description: "For agencies and creators with advanced needs",
    features: [
      "Unlimited videos",
      "Custom AI training",
      "Advanced analytics suite",
      "Unlimited YouTube channels",
      "Team collaboration",
      "White-label options",
      "Dedicated account manager",
      "24/7 phone support",
      "API access",
      "Custom integrations"
    ],
    popular: false,
    badge: "For Scale",
    savings: "Save $500/year"
  },
]

export function PricingSection() {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)
  const [visiblePlans, setVisiblePlans] = useState<boolean[]>(new Array(plans.length).fill(false))
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            plans.forEach((_, index) => {
              setTimeout(() => {
                setVisiblePlans((prev) => {
                  const newState = [...prev]
                  newState[index] = true
                  return newState
                })
              }, index * 200)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="pricing" ref={sectionRef} className="relative py-20 sm:py-32 bg-linear-to-br from-background via-green-500/5 to-blue-500/10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-green-500/3 to-blue-500/3 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center mb-6 bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 transition-colors rounded-full px-4 py-2 text-sm font-semibold shadow-sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight mb-6">
            Simple, Transparent{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary animate-pulse-glow">
              Pricing
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your YouTube growth journey. All plans include our core AI features
            with no hidden fees. Start free and upgrade anytime.
          </p>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative transition-all duration-700 ${
                  visiblePlans[index] ? "animate-fade-in-up opacity-100" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                <Card
                  className={`relative h-full hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-2 overflow-hidden ${
                    plan.popular
                      ? 'border-blue-500/50 shadow-blue-500/20 bg-card/95 backdrop-blur-sm'
                      : 'border-border hover:border-green-500/30 bg-card/95 backdrop-blur-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center space-x-2 bg-linear-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        <Crown className="h-4 w-4" />
                        <span>{plan.badge}</span>
                      </div>
                    </div>
                  )}

                  {!plan.popular && plan.savings && (
                    <div className="absolute -top-4 right-4 z-10">
                      <Badge className="bg-green-100 text-green-700 shadow-sm">
                        {plan.savings}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6 pt-8">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                        plan.popular ? 'bg-blue-500/10' : 'bg-green-500/10'
                      }`}>
                        {plan.popular ? (
                          <Star className="h-6 w-6 text-blue-500" />
                        ) : (
                          <Zap className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                    </div>

                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">{plan.name}</CardTitle>

                    <div className="mt-4 mb-2">
                      <span className="text-4xl sm:text-5xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-lg">{plan.period}</span>
                    </div>

                    <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className={`h-5 w-5 shrink-0 mt-0.5 ${
                            plan.popular ? 'text-blue-500' : 'text-green-500'
                          }`} />
                          <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4">
                      <Button
                        className={`w-full font-semibold transition-all duration-300 ${
                          plan.popular
                            ? 'bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                            : 'bg-linear-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                        }`}
                        size="lg"
                        asChild
                      >
                        <Link href="/signup" className="flex items-center justify-center">
                          {plan.popular ? (
                            <>
                              <Crown className="h-4 w-4 mr-2" />
                              Get Started Now
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Choose Plan
                            </>
                          )}
                        </Link>
                      </Button>
                    </div>

                    {/* Hover Effect Indicator */}
                    <div className={`h-1 bg-linear-to-r rounded-full transition-all duration-300 mt-4 ${
                      hoveredPlan === index ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`} style={{
                      background: plan.popular
                        ? 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                        : 'linear-gradient(to right, #10b981, #3b82f6)'
                    }} />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="inline-flex items-center space-x-4 bg-card/60 backdrop-blur-sm rounded-2xl px-6 py-4 border shadow-lg mb-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-foreground">14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-foreground">10,000+ creators</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Cancel anytime</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-linear-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-xl font-semibold text-base"
            >
              <Zap className="h-5 w-5 mr-3" />
              Start Free Trial
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 transition-all duration-300 px-8 py-4 rounded-xl font-semibold text-base"
            >
              <Youtube className="h-5 w-5 mr-3" />
              Compare Plans
            </Button>
          </div>

          <p className="text-muted-foreground text-pretty max-w-2xl mx-auto mt-6">
            All plans include our core AI features. No setup fees, no hidden costs.
            Upgrade or downgrade anytime with no penalties.
          </p>
        </div>
      </div>
    </section>
  )
}
