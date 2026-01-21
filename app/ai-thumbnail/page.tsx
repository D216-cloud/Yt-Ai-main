"use client"

import Link from "next/link"
import Image from "next/image"
import { Home, Video, Upload, Settings, Sparkles, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import SharedSidebar from '@/components/shared-sidebar'

export default function AIThumbnailPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCard, setSelectedCard] = useState<'shorts'|'video'|'smart'>('shorts')

  // Drag & Drop / file upload state for thumbnail generator
  const [dropActive, setDropActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  // New states for image-to-image and text-to-image
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [promptText, setPromptText] = useState<string>('')
  const [mode, setMode] = useState<'file'|'image'|'text'>('file')

  // Preview state and generated thumbnail image (data URL)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)

  const handleDragOver = (e: any) => { e.preventDefault(); setDropActive(true) }
  const handleDragLeave = () => setDropActive(false)
  const handleDrop = (e: any) => {
    e.preventDefault(); setDropActive(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (mode === 'image') {
      const images = files.filter((f: File) => f.type.startsWith('image/'))
      setImageFiles(images)
    } else {
      setUploadedFiles(files)
    }
  }
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (mode === 'image') {
      const images = files.filter((f: File) => f.type.startsWith('image/'))
      setImageFiles(images)
    } else {
      setUploadedFiles(files)
    }
  }
  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f: File) => f.type.startsWith('image/'))
    setImageFiles(files)
  }

  // Capture a single frame from a video File and return as data URL
  const generateThumbnailFromVideo = (file: File, atTime = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = url
      video.muted = true
      video.playsInline = true

      const cleanup = () => { try { URL.revokeObjectURL(url) } catch (e) {} }

      const onLoaded = () => {
        const seekTime = Math.min(video.duration || 1, Math.max(0.01, atTime))
        const onSeeked = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth || 1280
            canvas.height = video.videoHeight || 720
            const ctx = canvas.getContext('2d')
            if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const data = canvas.toDataURL('image/jpeg', 0.85)
            cleanup()
            resolve(data)
          } catch (err) { cleanup(); reject(err) }
        }
        video.addEventListener('seeked', onSeeked, { once: true })
        try { video.currentTime = seekTime } catch (e) { onSeeked() }
      }

      video.addEventListener('loadedmetadata', onLoaded, { once: true })
      video.addEventListener('error', (e) => { cleanup(); reject(e) })
    })
  }

  const handleGenerateThumbnail = async () => {
    try {
      const file = uploadedFiles[0]
      if (!file) return
      const dataUrl = await generateThumbnailFromVideo(file, 0.5)
      // draw overlay text if present
      if (promptText && dataUrl) {
        const img = new Image()
        img.src = dataUrl
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          // overlay text
          ctx.fillStyle = 'rgba(0,0,0,0.6)'
          ctx.fillRect(12, canvas.height - 90, canvas.width - 24, 70)
          ctx.font = 'bold 48px Arial'
          ctx.fillStyle = 'white'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          // wrap text
          const words = promptText.split(' ')
          let line = ''
          let y = canvas.height - 86
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' '
            const metrics = ctx.measureText(testLine)
            if (metrics.width > canvas.width - 48 && n > 0) {
              ctx.fillText(line, 24, y)
              line = words[n] + ' '
              y += 48
            } else {
              line = testLine
            }
          }
          if (line) ctx.fillText(line.trim(), 24, y)
        }
        setPreviewImage(canvas.toDataURL('image/png'))
      } else {
        setPreviewImage(dataUrl)
      }

    } catch (err) {
      console.error('Thumbnail generation failed', err)
      alert('Failed to generate thumbnail')
    }
  }

  const handleEnhanceWithHF = async () => {
    if (!previewImage) return
    setIsEnhancing(true)
    try {
      const res = await fetch('/api/ai/hf-thumbnail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: previewImage, prompt: promptText }) })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        console.error('HF API Error', err)
        alert('Failed to enhance image with Hugging Face')
        setIsEnhancing(false)
        return
      }
      const data = await res.json()
      if (data && data.image) {
        setPreviewImage(data.image)
      } else {
        alert('Hugging Face returned no image')
      }
    } catch (err) {
      console.error('HF enhancement failed', err)
      alert('Enhancement failed')
    } finally { setIsEnhancing(false) }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <div>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white h-16">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <a href="/" className="flex items-center space-x-3 group">
            <Image
              src="/vidiomex-logo.svg"
              alt="Vidiomex"
              width={36}
              height={36}
              className="flex-shrink-0"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Vidiomex</span>
          </a>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'AI Studio'}</p>
                <p className="text-xs text-gray-500">AI Thumbnail Generator</p>
              </div>
              <div
                role="button"
                title="Profile"
                onClick={() => router.push('/dashboard?page=profile')}
                className="cursor-pointer w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-200 shadow-md flex items-center justify-center flex-shrink-0"
              >
                <span className="text-white text-sm font-semibold">{session?.user?.name?.[0]?.toUpperCase() || 'A'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="ai-thumbnail" isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />

        <main className={`flex-1 pt-20 md:pt-20 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'} pb-20 md:pb-0 bg-slate-50 min-h-screen transition-all duration-300`}>
          <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
            <div className="relative w-full max-w-lg">
              <div className="rounded-3xl bg-white p-10 shadow-[0_30px_60px_rgba(8,15,52,0.06)]">
                <h2 className="text-center text-xl font-semibold mb-1">Upload your files</h2>
                <p className="text-center text-xs text-gray-400 mb-6">File should be an MP4, MOV, or AVI video</p>

                {/* Mode-aware upload area */}
                {mode === 'file' && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`w-full rounded-xl border-2 ${dropActive ? 'border-blue-300 bg-blue-50/40' : 'border-dashed border-gray-200 bg-white'} p-8 flex items-center justify-center transition-all`}
                  >
                    <div className="w-full">
                      <div className="mx-auto w-56 h-28 rounded-lg bg-white flex items-center justify-center border border-gray-100">
                        <div className="text-center text-gray-400">
                          <svg className="mx-auto mb-2 w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7a4 4 0 014-4h10a4 4 0 014 4v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                          <div className="text-sm font-medium">Drag & Drop your files here</div>
                          <div className="text-xs text-gray-400 mt-1">Or <button onClick={() => document.getElementById('ai-files-input')?.click()} className="text-blue-600 underline">select files</button></div>
                        </div>
                      </div>

                      <input id="ai-files-input" type="file" accept=".zip,.eps,.avi" onChange={handleFileInput} className="hidden" multiple />

                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 text-sm">
                          <div className="font-medium mb-2">Selected files</div>
                          <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {uploadedFiles.map((f, i) => (
                              <li key={i} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                                <div className="text-sm text-gray-700 truncate">{f.name}</div>
                                <div className="text-xs text-gray-400">{Math.max(1, Math.round(f.size / 1024))} KB</div>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail text</label>
                            <input value={promptText} onChange={(e) => setPromptText(e.target.value)} placeholder="Text to overlay on thumbnail" className="w-full px-4 py-2 border rounded-lg" />

                            <div className="mt-3">
                              <div className="text-xs text-gray-500 mb-2">Preview</div>
                              <div className="w-full h-40 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                                {previewImage ? (
                                  <img src={previewImage} className="object-contain w-full h-full" alt="preview" />
                                ) : (
                                  <div className="text-xs text-gray-400">No preview yet — select a video to generate a thumbnail</div>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                              <button onClick={handleGenerateThumbnail} disabled={uploadedFiles.length === 0} className={`px-5 py-2 rounded-full font-semibold text-white ${uploadedFiles.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
                                Capture & Preview
                              </button>
                              <button onClick={handleEnhanceWithHF} disabled={!previewImage || isEnhancing} className={`px-5 py-2 rounded-full font-semibold text-white ${!previewImage ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600'}`}>
                                {isEnhancing ? 'Enhancing...' : 'Enhance (Hugging Face)'}
                              </button>
                              <div className="text-xs text-gray-400 ml-auto">Real-time preview with overlay text</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {mode === 'image' && (
                  <div className={`w-full rounded-xl border-2 ${imageFiles.length > 0 ? 'border-green-300 bg-green-50/30' : 'border-dashed border-gray-200 bg-white'} p-8 flex flex-col items-center justify-center transition-all`}> 
                    <div className="mx-auto w-56 h-28 rounded-lg bg-white flex items-center justify-center border border-gray-100 mb-4">
                      <div className="text-center text-gray-400">
                        <svg className="mx-auto mb-2 w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7a4 4 0 014-4h10a4 4 0 014 4v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                        <div className="text-sm font-medium">Drag & Drop images here</div>
                        <div className="text-xs text-gray-400 mt-1">Or <button onClick={() => document.getElementById('ai-images-input')?.click()} className="text-pink-600 underline">select images</button></div>
                      </div>
                    </div>

                    <input id="ai-images-input" type="file" accept="image/*" onChange={handleImageInput} className="hidden" multiple />

                    {imageFiles.length > 0 && (
                      <div className="mt-4 w-full">
                        <div className="font-medium mb-2">Selected images</div>
                        <div className="grid grid-cols-3 gap-2">
                          {imageFiles.map((f, i) => (
                            <div key={i} className="w-full h-20 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                              <img src={URL.createObjectURL(f)} className="object-cover w-full h-full" alt={f.name} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-center">
                      <button onClick={() => alert('Start image->image generation (TODO)')} disabled={imageFiles.length === 0} className={`px-6 py-3 rounded-full font-semibold text-white ${imageFiles.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-red-500 hover:from-pink-700 hover:to-red-600'}`}>
                        Upload Images & Generate
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'text' && (
                  <div className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 transition-all">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Describe your thumbnail</label>
                      <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} rows={6} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200" placeholder="Describe scene, colors, text, style..." />
                    </div>

                    <div className="mt-6 flex items-center justify-center">
                      <button onClick={() => alert('Start text->image generation (TODO)')} disabled={!promptText.trim()} className={`px-6 py-3 rounded-full font-semibold text-white ${!promptText.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600'}`}>
                        Generate from Text
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side mode buttons (click to switch mode) */}
              <div className="absolute right-[-96px] top-6 hidden lg:flex flex-col gap-4">
                <button onClick={() => { setMode('image') }} className={`w-14 h-12 rounded-lg flex items-center justify-center shadow-sm text-xs font-semibold ${mode === 'image' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`} title="Image to Image">IMG</button>
                <button onClick={() => { setMode('text') }} className={`w-14 h-12 rounded-lg flex items-center justify-center shadow-sm text-xs font-semibold ${mode === 'text' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-600'}`} title="Text to Image">TXT</button>
                <button onClick={() => { setMode('file') }} className={`w-14 h-12 rounded-lg flex items-center justify-center shadow-sm text-xs font-semibold ${mode === 'file' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600'}`} title="File upload">ZIP</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}