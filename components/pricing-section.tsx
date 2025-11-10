"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for individuals getting started with Twitter automation",
    features: [
      "Up to 100 scheduled posts/month",
      "Basic AI content generation",
      "Analytics dashboard",
      "Single Twitter account",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "Ideal for content creators and small businesses",
    features: [
      "Up to 500 scheduled posts/month",
      "Advanced AI content generation",
      "Detailed analytics & insights",
      "Up to 3 Twitter accounts",
      "Competitor analysis",
      "Priority support",
      "Bulk operations",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For agencies and large businesses with advanced needs",
    features: [
      "Unlimited scheduled posts",
      "Custom AI training",
      "Advanced analytics suite",
      "Unlimited Twitter accounts",
      "Team collaboration",
      "White-label options",
      "Dedicated account manager",
      "24/7 phone support",
    ],
    popular: false,
  },
]

export function PricingSection() {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)

  return (
    <section id="pricing" className="py-20 sm:py-32 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Choose the perfect plan for your Twitter growth journey
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${hoveredPlan === index ? "scale-105" : ""}`}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                <Card
                  className={`relative h-full ${
                    plan.popular ? "border-secondary shadow-lg ring-1 ring-secondary/20" : "hover:shadow-lg"
                  } transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="flex items-center space-x-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        <Star className="h-4 w-4" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground text-pretty">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${plan.popular ? "bg-secondary hover:bg-secondary/90" : ""}`}
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
