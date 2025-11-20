"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Youtube, Github, Linkedin, Mail, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // For now, just mock a success state — real API can be wired later
    setSubscribed(true)
    setTimeout(() => {
      setSubscribed(false)
      setEmail("")
    }, 3000)
  }
  return (
    <footer className="bg-linear-to-br from-background via-primary/5 to-secondary/5 border-t">
      {/* CTA Row */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-linear-to-r from-primary to-secondary text-white p-6 mt-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Ready to grow your YouTube channel?</h3>
            <p className="text-sm opacity-90">Start with a 14-day free trial — no credit card required.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-white text-primary px-4 py-2 rounded-xl font-semibold">Start Free Trial</Button>
            <Button variant="outline" className="px-4 py-2 rounded-xl text-white border-white/30">Contact Sales</Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Youtube className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">YouTubeAI Pro</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              Effortless YouTube growth powered by AI. Join thousands of creators optimizing their channel presence.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trusted Row */}
        <div className="mt-8 mb-6 flex items-center justify-center gap-6">
          <div className="inline-flex items-center gap-3 bg-card/60 rounded-full px-4 py-2 shadow-sm">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Trusted by 10,000+ creators</span>
          </div>
          <div className="inline-flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700">AI-Optimized</Badge>
            <Badge className="bg-blue-100 text-blue-700">YouTube Ready</Badge>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 YouTubeAI Pro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="/status" className="text-sm text-muted-foreground hover:text-foreground">Status</Link>
            </div>

            {/* Newsletter subscribe */}
            <form className="flex items-center gap-2" onSubmit={handleSubscribe}>
              <Input
                placeholder="Your email"
                aria-label="Subscribe email"
                className="w-40 sm:w-56"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="px-3 py-2" disabled={!email || subscribed}>
                {subscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  )
}
