"use client"

import React from 'react'
import Link from 'next/link'
import { Sparkles, MessageSquare, Video } from 'lucide-react'

export default function AiToolsSection({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 border border-purple-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-50 animate-pulse"></div>
          <div className="relative p-3 bg-linear-to-br from-purple-500 to-pink-600 rounded-full shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">AI-Powered Tools</h3>
          <p className="text-sm text-gray-600">Supercharge your content workflow — titles, descriptions, scripts & thumbnails</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/ai-tools" className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition cursor-pointer flex items-start gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Title Generator</h4>
            <p className="text-xs text-gray-600">Create high-CTR titles using AI</p>
          </div>
        </Link>

        <Link href="/ai-tools" className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition cursor-pointer flex items-start gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 shadow-md">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Description Writer</h4>
            <p className="text-xs text-gray-600">Get SEO-optimized descriptions</p>
          </div>
        </Link>

        <Link href="/ai-tools" className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition cursor-pointer flex items-start gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-orange-500 to-red-500 shadow-md">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Script Generator</h4>
            <p className="text-xs text-gray-600">Generate AI-written scripts for videos</p>
          </div>
        </Link>
      </div>

      <div className="mt-4 text-xs text-gray-500">Explore tools to save time and improve content performance.</div>
    </div>
  )
}
