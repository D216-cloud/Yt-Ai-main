"use client"

import React, { useState } from 'react'
import { Loader2, Bolt, Copy } from 'lucide-react'

interface GenerateTitleProps {
  title?: string
  onUse?: (title: string) => void
}

export default function GenerateTitle({ title, onUse }: GenerateTitleProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState<string[] | null>(null)
  const [error, setError] = useState('')
  const [usedIndex, setUsedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!title) {
      setError('No title available to generate from')
      return
    }

    setIsGenerating(true)
    setError('')
    setGenerated(null)

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || '', keywords: [] }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Generation failed' }))
        throw new Error(err.error || 'Generation failed')
      }

      const data = await response.json()
      setGenerated(data.titles || [])
    } catch (err: any) {
      console.error('Generation error:', err)
      setError(err.message || 'Failed to generate titles')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUse = (t: string, index: number) => {
    navigator.clipboard.writeText(t)
    setUsedIndex(index)
    if (onUse) onUse(t)
    setTimeout(() => setUsedIndex(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button onClick={handleGenerate} disabled={isGenerating} className="inline-flex items-center gap-2 bg-linear-to-r from-yellow-400 to-orange-400 text-white py-2 px-3 rounded-lg font-semibold">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bolt className="w-4 h-4" />} Generate Viral Titles
        </button>
        <span className="text-xs text-gray-500">(uses Gemini / model from server)</span>
      </div>

      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

      {generated && (
        <div className="mt-3 space-y-2">
          {generated.map((t, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:shadow-md transition transform hover:-translate-y-0.5">
              <p className="text-sm text-gray-800 flex-1">{t}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => navigator.clipboard.writeText(t)} className="p-2 rounded-md hover:bg-white bg-white/60">
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => handleUse(t, i)} className="px-3 py-1 rounded-md bg-linear-to-r from-yellow-400 to-orange-400 text-white font-semibold">{usedIndex === i ? 'Used' : 'Use'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}