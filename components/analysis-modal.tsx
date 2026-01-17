"use client"

import React, { useEffect, useState } from 'react'
import { Loader2, X, Check, Copy, Youtube } from 'lucide-react'
import { signIn } from 'next-auth/react'
import GenerateTitle from '@/components/generate-title' 

export default function AnalysisModal() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any | null>(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    function onOpen(e: any) {
      const payload = e.detail
      if (!payload) return
      setTitle(payload.title || '')
      setOpen(true)
      // allow dialog to render before visible for animation
      setTimeout(() => setVisible(true), 10)
      fetchAnalysis(payload.title)
    }

    window.addEventListener('open-analysis', onOpen as any)
    return () => window.removeEventListener('open-analysis', onOpen as any)
  }, [])

  // lock scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setVisible(false)
        setTimeout(() => setOpen(false), 160)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const fetchAnalysis = async (t: string) => {
    setIsLoading(true)
    setData(null)
    try {
      const res = await fetch('/api/video/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t }),
      })

      if (!res.ok) {
        // try to get a JSON error message
        const errJson = await res.json().catch(() => null)
        const msg = errJson?.error || (res.status === 401 ? 'Unauthorized - please sign in' : `Error ${res.status}`)
        setData({ error: msg, status: res.status })
        return
      }

      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
      setData({ error: 'Failed to fetch analysis' })
    } finally {
      setIsLoading(false)
    }
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={() => { setVisible(false); setTimeout(() => setOpen(false), 160) }} />

      <div className={`relative max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-160 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header gradient (premium navy → gold) */}
        <div className="flex items-center gap-4 p-6 bg-linear-to-b from-slate-800 to-amber-500">
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
            <img src="/icons/youtube-play.svg" alt="YouTube" className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/90">Analysis</p>
            <p className="text-white font-semibold truncate max-w-full">{title}</p>
          </div>
          <button onClick={() => { setVisible(false); setTimeout(() => setOpen(false), 160) }} className="p-2 rounded-full bg-white/80 hover:bg-white">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Scrollable content area (max height) */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-6" />
              <p className="text-gray-700">Analyzing title and gathering insights...</p>
            </div>
          ) : data?.error ? (
            <div className="p-8 text-center space-y-4">
              <p className="text-gray-700">{data.error}</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => fetchAnalysis(title)} className="px-4 py-2 bg-linear-to-r from-slate-700 to-amber-500 text-white rounded-lg">Retry</button>
                {data.status === 401 && (
                  <button onClick={() => signIn()} className="px-4 py-2 border border-gray-200 rounded-lg">Sign in</button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title Score - full width */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Title Score</p>
                    <p className="text-3xl font-bold text-gray-900">{data?.titleScore ?? '--'}</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                      <div className={`h-full bg-linear-to-r ${data ? (data.titleScore >= 80 ? 'from-green-500 to-emerald-600' : data.titleScore >= 60 ? 'from-blue-500 to-cyan-600' : 'from-yellow-500 to-orange-600') : 'from-gray-300 to-gray-400'} transition-all`} style={{ width: `${data?.titleScore || 0}%` }} />
                    </div>
                    <div className="flex gap-6 text-sm text-gray-700">
                      <div className="flex justify-between w-1/3"><span>Length</span><span className="font-semibold">{data?.breakdown?.lengthScore ?? '--'}/20</span></div>
                      <div className="flex justify-between w-1/3"><span>Keywords</span><span className="font-semibold">{data?.breakdown?.keywordScore ?? '--'}/25</span></div>
                      <div className="flex justify-between w-1/3"><span>Power Words</span><span className="font-semibold">{data?.breakdown?.powerWordsScore ?? '--'}/15</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-semibold">{data?.status ?? '--'}</p>
                  </div>
                </div>
              </div>

              {/* Search queries + Generate + Suggestions */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-sm text-gray-500 mb-3">People are searching for</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {data?.searchQueries?.slice(0, 10)?.map((q: string, i: number) => (
                    <div key={i} className="inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700">✔ {q}</div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <GenerateTitle title={title} onUse={(t: string) => { copy(t); setVisible(false); setTimeout(()=>setOpen(false),160) }} />
                </div> 

                <p className="text-sm text-gray-500 mb-3">Suggested Titles</p>
                <div className="space-y-3">
                  {data?.suggestedTitles?.slice(0, 8)?.map((t: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg hover:shadow-md transition transform hover:-translate-y-1">
                      <p className="text-sm text-gray-800 flex-1">{t}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { copy(t) }} className="p-2 rounded-md hover:bg-white bg-white/60">
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                        <button onClick={() => { copy(t); setVisible(false); setTimeout(()=>setOpen(false),160) }} className="px-3 py-1 rounded-md bg-linear-to-r from-amber-400 to-amber-600 text-white font-semibold">Use</button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-4">ℹ️ {data?.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
