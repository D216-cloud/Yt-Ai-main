"use client"

import Link from "next/link"
import Image from "next/image"
import { Home, User, GitCompare, Video, Upload, Play, LogOut, Menu, X, CheckCircle, Plus, List, Settings, Bell, ChevronDown, Youtube, Zap, Clock, Users, TrendingUp } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useRef, useMemo } from "react"
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import SharedSidebar from '@/components/shared-sidebar'
import ChannelSummary from '@/components/channel-summary'

export default function BulkUploadPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('bulk-upload')

  const [allChannels, setAllChannels] = useState<any[]>([])
  const [selectedUploadChannel, setSelectedUploadChannel] = useState<any | null>(null)
  const [uploadType, setUploadType] = useState<'short' | 'long'>('long')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState({ title: '', description: '', tags: '', category: '22', privacy: 'public', madeForKids: false, language: 'en', license: 'standard' })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAddBulkModal, setShowAddBulkModal] = useState(false)
  const [bulkVideos, setBulkVideos] = useState<any[]>([])
  // form state for Add Bulk Video modal
  const [bulkFormFile, setBulkFormFile] = useState<File | null>(null)
  const [bulkFormTitle, setBulkFormTitle] = useState('')
  const [bulkFormDescription, setBulkFormDescription] = useState('')
  const [bulkFormTags, setBulkFormTags] = useState('')
  const [bulkFormCategory, setBulkFormCategory] = useState('22')
  const [bulkFormPrivacy, setBulkFormPrivacy] = useState('public')
  const [bulkFormMadeForKids, setBulkFormMadeForKids] = useState(false)
  const [bulkFormChannelIds, setBulkFormChannelIds] = useState<string[]>([])
  const [bulkFiles, setBulkFiles] = useState<File[]>([])
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [addIndex, setAddIndex] = useState<number>(0)
  const [addMetadata, setAddMetadata] = useState<Record<string, any>>({})
  const [editingBulkId, setEditingBulkId] = useState<string | null>(null)
  const [editingBulkData, setEditingBulkData] = useState<any>({ title: '', description: '', tags: '', category: '22', madeForKids: false, language: 'en', license: 'standard', privacy: 'unlisted' })
  // default to show everything (history) so re-open shows all uploaded items
  const [showOnlyUnlisted, setShowOnlyUnlisted] = useState<boolean>(false)

  // persist UI state (modals / editing) so queue remains open after refresh
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bulk_ui_state')
      if (raw) {
        const s = JSON.parse(raw)
        if (typeof s.showUploadModal === 'boolean') setShowUploadModal(s.showUploadModal)
        if (typeof s.showAddBulkModal === 'boolean') setShowAddBulkModal(s.showAddBulkModal)
        if (typeof s.showOnlyUnlisted === 'boolean') setShowOnlyUnlisted(s.showOnlyUnlisted)
        if (s.editingBulkId) setEditingBulkId(s.editingBulkId)
        if (s.editingBulkData) setEditingBulkData(s.editingBulkData)
      }
    } catch (e) { console.error('Failed to load bulk_ui_state', e) }
  }, [])

  useEffect(() => {
    try {
      const payload = { showUploadModal, showAddBulkModal, showOnlyUnlisted, editingBulkId, editingBulkData }
      localStorage.setItem('bulk_ui_state', JSON.stringify(payload))
    } catch (e) { console.error('Failed to save bulk_ui_state', e) }
  }, [showUploadModal, showAddBulkModal, showOnlyUnlisted, editingBulkId, editingBulkData])


  // create a draft bulk item from a selected File (opens details editor instead of immediate upload)
  const createDraftFromFile = async (f: File, idx: number) => {
    const id = String(Date.now()) + Math.floor(Math.random() * 1000)
    try {
      // keep file in transient map for preview and later upload
      bulkFileMap.current[id] = f
      const thumb = await generateThumbnail(f).catch(() => '')
      const item = { id, title: f.name.replace(/\.[^/.]+$/, ''), fileName: f.name, size: f.size, thumbnail: thumb, cloudUrl: '', public_id: '', status: 'draft', progress: 0, privacy: 'unlisted' }
      setBulkVideos(prev => [...prev, item])
      setBulkFiles(prev => prev.filter((_, i) => i !== idx))
      // open the details editor for this new draft
      setEditingBulkId(id)
      setEditingBulkData({ title: item.title, description: '', tags: '', category: '22', madeForKids: false, language: 'en', license: 'standard', privacy: 'unlisted' })
    } catch (err) {
      console.error('Failed to create draft item', err)
      alert('Failed to add draft for ' + f.name)
    }
  }

  // publish (upload) a draft bulk item: upload file to Cloudinary then update the bulkVideos item
  const publishBulkItem = async (id: string) => {
    const file = bulkFileMap.current[id]
    if (!file) { alert('File missing for this item. It may have been removed.'); return }
    const accessToken = localStorage.getItem('youtube_access_token')
    if (!accessToken) { alert('YouTube access token missing. Connect channel.'); return }

    setBulkVideos(prev => prev.map(b => b.id === id ? { ...b, status: 'uploading', progress: 0 } : b))
    try {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', editingBulkData.title || file.name.replace(/\.[^/.]+$/, ''))
      formData.append('description', editingBulkData.description || '')
      formData.append('tags', editingBulkData.tags || '')
      formData.append('privacy', editingBulkData.privacy || 'unlisted')
      formData.append('madeForKids', String(editingBulkData.madeForKids || false))
      formData.append('category', editingBulkData.category || '22')
      formData.append('language', editingBulkData.language || 'en')
      formData.append('license', editingBulkData.license || 'standard')
      formData.append('access_token', accessToken)
      const channelIds = selectedUploadChannel ? [selectedUploadChannel.id] : []
      formData.append('channelIds', JSON.stringify(channelIds))

      await new Promise<void>((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/youtube/upload')
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setBulkVideos(prev => prev.map(v => v.id === id ? { ...v, progress: pct, status: 'uploading' } : v))
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText)
                if (data.success) {
                  const extra: any = {}
                  if (data.videoUrl) extra.cloudUrl = data.videoUrl
                  if (data.videoId) extra.youtubeId = data.videoId
                  if (data.youtubeUrl) extra.cloudUrl = data.youtubeUrl
                  // update item
                  setBulkVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'done', progress: 100, title: editingBulkData.title, description: editingBulkData.description, tags: editingBulkData.tags, category: editingBulkData.category, madeForKids: editingBulkData.madeForKids, language: editingBulkData.language, license: editingBulkData.license, privacy: editingBulkData.privacy || 'unlisted', ...extra } : v))
                  // if user published as Public, remove it from the queue automatically
                  if ((editingBulkData.privacy || 'unlisted') === 'public') {
                    setBulkVideos(prev => prev.filter(v => v.id !== id))
                  }
                  // remove from transient map
                  delete bulkFileMap.current[id]
                  setEditingBulkId(null)
                  resolve()
                } else {
                  setBulkVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'error' } : v))
                  reject(new Error(data.error || 'Upload failed'))
                }
              } catch (err) { reject(err) }
            } else {
              setBulkVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'error' } : v))
              reject(new Error('Upload failed with status ' + xhr.status))
            }
          }
          xhr.onerror = () => { setBulkVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'error' } : v)); reject(new Error('Network error')) }
          xhr.send(formData)
        } catch (err) { reject(err) }
      })

      alert('Added to Bulk list')
    } catch (err) {
      console.error('Publish failed', err)
      setBulkVideos(prev => prev.map(b => b.id === id ? { ...b, status: 'error' } : b))
      alert('Publish failed: ' + (err as any)?.message || '')
    }
  }

  // helper to upload a single file to Cloudinary and add to bulkVideos
  const addSingleFileToBulk = async (f: File, idx: number) => {
    const id = String(Date.now()) + Math.floor(Math.random() * 1000)
    try {
      // optimistic item
      setBulkVideos(prev => [...prev, { id, title: f.name.replace(/\.[^/.]+$/, ''), fileName: f.name, size: f.size, thumbnail: '', cloudUrl: '', public_id: '', status: 'uploading', progress: 0, privacy: 'unlisted' }])
      const fd = new FormData()
      fd.append('file', f, f.name)
      const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd })
      let data: any = null
      try { data = await res.json() } catch (e) { console.warn('Failed to parse JSON from cloudinary API route', e) }
      if (!(data && (data.success || data.secure_url))) {
        const text = data ? JSON.stringify(data) : await res.text().catch(() => '')
        console.error('Cloudinary upload unexpected response', res.status, text)
        throw new Error(data?.error || 'Cloudinary upload failed')
      }
      const item = { id, title: f.name.replace(/\.[^/.]+$/, ''), fileName: f.name, size: f.size, thumbnail: data.thumbnail_url, cloudUrl: data.secure_url || data.secureUrl, public_id: data.public_id, status: 'uploaded', progress: 100, privacy: 'unlisted' }
      // replace optimistic entry
      setBulkVideos(prev => prev.map(v => v.id === id ? item : v))
      // remove from bulkFiles
      setBulkFiles(prev => prev.filter((_, i) => i !== idx))
      // adjust addIndex if needed
      setAddIndex(prev => Math.max(0, Math.min(prev, bulkFiles.length - 2)))
    } catch (err) {
      console.error('Upload failed', err)
      setBulkVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'error' } : v))
      alert('Upload failed for ' + f.name)
    }
  }

  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc)
    }
  }, [previewSrc])

  // transient map to hold File objects for preview (not stored in localStorage)
  const bulkFileMap = useRef<Record<string, File>>({})
  const modalFileInputRef = useRef<HTMLInputElement | null>(null)

  // Sort bulk videos so unlisted appear first, then private, then public
  const sortedBulkVideos = useMemo(() => {
    const order: Record<string, number> = { unlisted: 0, private: 1, public: 2 }
    return [...bulkVideos].sort((a, b) => {
      const pa = order[((a.privacy || 'unlisted') as string).toLowerCase()] ?? 0
      const pb = order[((b.privacy || 'unlisted') as string).toLowerCase()] ?? 0
      if (pa !== pb) return pa - pb
      // fallback: show currently uploading/higher progress first
      return (b.progress || 0) - (a.progress || 0)
    })
  }, [bulkVideos])

  // If the user has 'unlisted only' enabled but there are no unlisted items in the queue,
  // fall back to showing all items so the queue remains useful (history view).
  useEffect(() => {
    try {
      if (showOnlyUnlisted && bulkVideos.length > 0) {
        const hasUnlisted = bulkVideos.some(b => ((b.privacy || 'unlisted').toString().toLowerCase() === 'unlisted'))
        if (!hasUnlisted) setShowOnlyUnlisted(false)
      }
    } catch (e) { console.error('Failed to evaluate unlisted filter fallback', e) }
  }, [bulkVideos, showOnlyUnlisted])

  // Apply filter after sorting
  const filteredBulkVideos = useMemo(() => {
    if (showOnlyUnlisted) return sortedBulkVideos.filter(v => ((v.privacy || 'unlisted').toString().toLowerCase() === 'unlisted'))
    return sortedBulkVideos
  }, [sortedBulkVideos, showOnlyUnlisted])

  // load persisted bulk items (metadata + thumbnail) from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bulk_videos')
      if (raw) {
        const items = JSON.parse(raw)
        if (Array.isArray(items)) {
          // ensure privacy defaults to 'unlisted' if missing, and normalize case
          const normalized = items.map((it: any) => ({ ...it, privacy: (it.privacy || 'unlisted').toString().toLowerCase() }))
          console.debug('Loaded persisted bulk_videos:', normalized.length, normalized.map((i: any) => i.privacy))
          setBulkVideos(normalized)
        }
      }
    } catch (e) { console.error('Failed to load bulk_videos from localStorage', e) }
  }, [])

  // persist bulk items (without File objects) to localStorage
  useEffect(() => {
    try {
      // persist privacy and channel IDs as well so we can restore accurate history
      const serialized = bulkVideos.map(({ id, title, fileName, size, thumbnail, status, progress, cloudUrl, public_id, youtubeId, privacy, channelIds }) => ({ id, title, fileName, size, thumbnail, status, progress, cloudUrl, public_id, youtubeId, privacy: (privacy || 'unlisted').toString().toLowerCase(), channelIds }))
      localStorage.setItem('bulk_videos', JSON.stringify(serialized))
    } catch (e) { console.error('Failed to save bulk_videos to localStorage', e) }
  }, [bulkVideos])

  // generate a thumbnail (dataURL) for a video File
  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = url
      video.muted = true
      video.playsInline = true
      const cleanup = () => { try { URL.revokeObjectURL(url) } catch (e) { } }

      const onLoaded = () => {
        // seek a tiny bit into the video to ensure frame available
        const seekTime = Math.min(0.15, Math.max(0.01, (video.duration || 0) * 0.01))
        const seekHandler = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth || 320
            canvas.height = video.videoHeight || 180
            const ctx = canvas.getContext('2d')
            if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const data = canvas.toDataURL('image/jpeg', 0.7)
            cleanup()
            resolve(data)
          } catch (err) {
            cleanup()
            reject(err)
          }
        }
        const onSeeked = () => { seekHandler(); video.removeEventListener('seeked', onSeeked) }
        video.addEventListener('seeked', onSeeked)
        video.currentTime = seekTime
      }

      video.addEventListener('loadedmetadata', onLoaded)
      video.addEventListener('error', (e) => { cleanup(); reject(e) })
    })
  }

  const openPreviewForItem = (item: any) => {
    try {
      if (previewSrc && previewSrc.startsWith('blob:')) URL.revokeObjectURL(previewSrc)
    } catch (e) { }
    // prefer cloud-hosted video URL if available (survives refresh)
    if (item.cloudUrl) {
      setPreviewSrc(item.cloudUrl)
      return
    }
    const f = bulkFileMap.current[item.id]
    if (f) {
      const url = URL.createObjectURL(f)
      setPreviewSrc(url)
      return
    }
    if (item.thumbnail) {
      setPreviewSrc(item.thumbnail)
      return
    }
    alert('No preview available for this item')
  }

  const closePreviewOnly = () => {
    try { if (previewSrc && previewSrc.startsWith('blob:')) URL.revokeObjectURL(previewSrc) } catch (e) { }
    setPreviewSrc(null)
  }

  const handleAddBulkVideo = (item: any) => {
    const id = String(Date.now()) + Math.floor(Math.random() * 1000)
    setBulkVideos((prev) => [...prev, { id, status: 'pending', progress: 0, ...item }])
    setShowAddBulkModal(false)
  }

  const removeBulkVideo = (id: string) => {
    setBulkVideos((prev) => prev.filter(v => v.id !== id))
  }

  const handleUploadBulkVideo = async (video: any) => {
    if (!video.file) { alert('No file attached for this bulk item'); return }
    const accessToken = localStorage.getItem('youtube_access_token')
    if (!accessToken) { alert('YouTube access token missing. Connect channel.'); return }

    setBulkVideos((prev) => prev.map(v => v.id === video.id ? { ...v, status: 'uploading', progress: 0 } : v))

    try {
      const formData = new FormData()
      formData.append('video', video.file)
      formData.append('title', video.title)
      formData.append('description', video.description || '')
      formData.append('tags', video.tags || '')
      formData.append('privacy', video.privacy || 'public')
      formData.append('madeForKids', String(video.madeForKids || false))
      formData.append('category', video.category || '22')
      formData.append('access_token', accessToken)
      formData.append('channelIds', JSON.stringify(video.channelIds || []))

      await new Promise<void>((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/youtube/upload')
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setBulkVideos(prev => prev.map(v => v.id === video.id ? { ...v, progress: pct, status: 'uploading' } : v))
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText)
                if (data.success) {
                  // persist any returned metadata (video URL or id) so the item survives refresh
                  const extra: any = {}
                  if (data.videoUrl) extra.cloudUrl = data.videoUrl
                  if (data.videoId) extra.youtubeId = data.videoId
                  if (data.youtubeUrl) extra.cloudUrl = data.youtubeUrl
                  setBulkVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'done', progress: 100, ...extra } : v))
                  resolve()
                } else {
                  setBulkVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'error' } : v))
                  reject(new Error(data.error || 'Upload failed'))
                }
              } catch (err) { reject(err) }
            } else {
              setBulkVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'error' } : v))
              reject(new Error('Upload failed with status ' + xhr.status))
            }
          }
          xhr.onerror = () => { setBulkVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: 'error' } : v)); reject(new Error('Network error')) }
          xhr.send(formData)
        } catch (err) { reject(err) }
      })
    } catch (err: any) {
      console.error(err)
      setBulkVideos((prev) => prev.map(v => v.id === video.id ? { ...v, status: 'error' } : v))
      alert('Bulk upload failed: ' + (err?.message || 'Please try again'))
    }
  }
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions] = useState(['gaming', 'tutorial', 'vlog', 'shorts', 'howto', 'review'])
  const [uploadSpeedMbps, setUploadSpeedMbps] = useState<number>(5) // used to estimate upload time
  const [showDetails, setShowDetails] = useState(false)

  const navLinks = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
    { icon: GitCompare, label: 'Compare', href: '/compare', id: 'compare' },
    { icon: Video, label: 'Content', href: '/content', id: 'content' },
    { icon: Upload, label: 'Bulk Upload', href: '/bulk-upload', id: 'bulk-upload' },
  ]

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push('/')
  }

  useEffect(() => {
    // load channels from localStorage (same shape as other pages expect)
    const channels: any[] = []
    const storedMain = localStorage.getItem('youtube_channel')
    if (storedMain) {
      try { channels.push(JSON.parse(storedMain)) } catch (e) { console.error(e) }
    }
    const storedAdditional = localStorage.getItem('additional_youtube_channels')
    if (storedAdditional) {
      try {
        const extra = JSON.parse(storedAdditional)
        extra.forEach((ch: any) => { if (!channels.find(c => c.id === ch.id)) channels.push(ch) })
      } catch (e) { console.error(e) }
    }
    setAllChannels(channels)
    if (channels.length > 0) setSelectedUploadChannel(channels[0])
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(file.type)) {
      alert('Unsupported file type. Please select an MP4, WebM, MOV or AVI.')
      return
    }
    setSelectedFile(file)
    setUploadData((s) => ({ ...s, title: file.name.replace(/\.[^/.]+$/, '') }))
    setPreviewSrc('')
    setShowDetails(true)
  }

  // Upload the currently selected file from the modal to YouTube
  const handleUpload = async () => {
    if (!selectedFile) { alert('No file selected to upload'); return }
    const accessToken = localStorage.getItem('youtube_access_token')
    if (!accessToken) { alert('YouTube access token missing. Connect channel.'); return }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      await new Promise<void>((resolve, reject) => {
        try {
          const fd = new FormData()
          fd.append('video', selectedFile)
          fd.append('title', uploadData.title || selectedFile.name.replace(/\.[^/.]+$/, ''))
          fd.append('description', uploadData.description || '')
          fd.append('tags', uploadData.tags || '')
          fd.append('privacy', uploadData.privacy || 'unlisted')
          fd.append('madeForKids', String(uploadData.madeForKids || false))
          fd.append('category', uploadData.category || '22')
          fd.append('language', uploadData.language || 'en')
          fd.append('license', uploadData.license || 'standard')
          fd.append('access_token', accessToken)
          const channelIds = selectedUploadChannel ? [selectedUploadChannel.id] : []
          fd.append('channelIds', JSON.stringify(channelIds))

          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/youtube/upload')
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              setUploadProgress(pct)
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText)
                if (data.success) {
                  // reset modal state and selected file
                  setSelectedFile(null)
                  setUploadData({ title: '', description: '', tags: '', category: '22', privacy: 'public', madeForKids: false, language: 'en', license: 'standard' })
                  setShowDetails(false)
                  setShowUploadModal(false)
                  resolve()
                  return
                }
                reject(new Error(data.error || 'Upload failed'))
              } catch (err) { reject(err) }
            } else {
              reject(new Error('Upload failed with status ' + xhr.status))
            }
          }
          xhr.onerror = () => reject(new Error('Network error during upload'))
          xhr.send(fd)
        } catch (err) { reject(err) }
      })

      alert('Upload completed successfully')
    } catch (err: any) {
      console.error('Upload failed', err)
      alert('Upload failed: ' + (err?.message || 'Please try again'))
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Save current selection as a draft item in the bulk queue (keeps File in-memory)
  const saveDraft = async () => {
    if (!selectedFile) { alert('No file selected to save as draft'); return }
    try {
      // generate thumbnail if possible
      let thumb = ''
      try { thumb = await generateThumbnail(selectedFile) } catch (e) { thumb = '' }
      const id = String(Date.now()) + Math.floor(Math.random() * 1000)
      // keep file in transient map for later preview/upload
      bulkFileMap.current[id] = selectedFile
      const item = { id, title: uploadData.title || selectedFile.name.replace(/\.[^/.]+$/, ''), fileName: selectedFile.name, size: selectedFile.size, thumbnail: thumb, cloudUrl: '', public_id: '', status: 'draft', progress: 0, privacy: 'unlisted', channelIds: selectedUploadChannel ? [selectedUploadChannel.id] : [] }
      setBulkVideos(prev => [...prev, item])
      // reset modal state
      setSelectedFile(null)
      setPreviewSrc(null)
      setShowDetails(false)
      setShowUploadModal(false)
      alert('Saved draft to Bulk list. You can upload later from the Bulk Upload Queue.')
    } catch (err) {
      console.error('Failed to save draft', err)
      alert('Failed to save draft')
    }
  }

  // helper to access the currently-editing bulk item (used in the details editor)
  const currentEditingItem = editingBulkId ? bulkVideos.find(b => b.id === editingBulkId) : null

  function estimateUploadTime(size: number, uploadSpeedMbps: number): string {
    if (uploadSpeedMbps <= 0) return 'Unknown'
    const bits = size * 8
    const bps = uploadSpeedMbps * 1_000_000
    const seconds = bits / bps
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  return (
    <div>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 pt-2 pb-2 px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <a href="/" className="flex items-center space-x-2 group">
              <Image
                src="/vidiomex-logo.svg"
                alt="Vidiomex"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <span className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Vidiomex</span>
            </a>
          </div>

          <div className="flex items-center space-x-2">
            {session && (
              <div
                role="button"
                title="Profile"
                onClick={() => router.push('/dashboard?page=profile')}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-md"
              >
                <span className="text-white text-sm font-bold uppercase">
                  {session.user?.email?.substring(0, 2) || "U"}
                </span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-red-600 p-2 rounded-md"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

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
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "Creator Studio"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email || "Premium Plan"}</p>
              </div>
              <div
                role="button"
                title="Profile"
                onClick={() => router.push('/dashboard?page=profile')}
                className="cursor-pointer w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-200 shadow-md flex items-center justify-center flex-shrink-0"
              >
                <span className="text-white text-sm font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        {/* Shared Sidebar */}
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="bulk-upload" />

        {/* Main content */}
        <main className={`flex-1 pt-20 md:pt-20 md:ml-72 md:mr-24 pb-20 md:pb-0 p-4 md:p-8 md:pr-12`}>
          <div className="max-w-5xl mx-auto">
            {/* Hero removed per request (kept page layout intact) */}

            {/* Welcome & Smart Upload */}
            <div className="mb-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Welcome back, {session?.user?.name?.split(' ')[0] || 'Creator'}! 👋</h1>
                  <p className="text-gray-600">Manage smart uploads for your connected channel below.</p>
                </div>
              </div>

              <div className="mb-4 max-w-4xl mx-auto">
                <ChannelSummary
                  channel={selectedUploadChannel}
                  wide={true}
                  analyticsData={{
                    views: selectedUploadChannel ? parseInt(selectedUploadChannel.viewCount || '0') : 0,
                    subscribers: selectedUploadChannel ? parseInt(selectedUploadChannel.subscriberCount || '0') : 0,
                    watchTime: 0,
                  }}
                />
                <p className="text-sm text-gray-600 mt-3">Hello — are you ready? Start a Smart Upload for <span className="font-semibold">{selectedUploadChannel?.title || 'your channel'}</span>.</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <h3 className="text-xl font-black text-gray-900 mb-2">Smart Upload</h3>
                <p className="text-sm text-gray-600 mb-4">Start a single, smart upload for the selected channel</p>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => router.push('/bulk-upload/upload')}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl transition"
                  >
                    <Upload className="w-4 h-4" />
                    Start New Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Bulk Upload Queue (desktop) removed per request */}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !isUploading && setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Upload Video</h2>
                  <p className="text-white/80 text-sm">Upload a video to the selected channel</p>
                </div>
              </div>
              {!isUploading && (
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-full bg-white/20">
                  <X className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <input ref={modalFileInputRef} type="file" accept="video/*" onChange={(e) => {
                // use existing handler to set selected file and open details panel for editing
                handleFileSelect(e as React.ChangeEvent<HTMLInputElement>)
                setTimeout(() => setShowDetails(true), 80)
              }} className="hidden" />

              {!showDetails && (
                <div
                  onDrop={(e) => { 
                    e.preventDefault()
                    const files = Array.from(e.dataTransfer.files)
                    const videoFile = files.find(f => f.type.startsWith('video/'))
                    if (videoFile) {
                      setSelectedFile(videoFile)
                      setUploadData(prev => ({ ...prev, title: videoFile.name.replace(/\.[^/.]+$/, '') }))
                      setTimeout(() => setShowDetails(true), 120)
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className="w-full rounded-xl p-12 text-center bg-white border border-gray-200 shadow-sm"
                >
                  <div className="mx-auto w-40 h-40 rounded-full bg-gray-50 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mt-6">Drag and drop video files to upload</h3>
                  <p className="text-sm text-gray-500 mt-2">Your videos will be private until you publish them.</p>
                  <div className="mt-6">
                    <button onClick={() => modalFileInputRef.current?.click()} className="px-6 py-2 bg-black text-white rounded-full">Select files</button>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center text-xs text-gray-500">
                By submitting your videos to YouTube, you acknowledge that you agree to YouTube's <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Community Guidelines</a>.
                <div className="mt-2">Please make sure that you do not violate others' copyright or privacy rights. <a className="underline" href="#">Learn more</a></div>
              </div>

              {/* Animated Details panel - opens after a file is selected */}
              <div className={`mt-6 overflow-hidden transition-all duration-500 ${showDetails ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Video details</h3>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-500">Step 1 of 1</div>
                          <button onClick={saveDraft} className="px-3 py-1 border rounded-md text-sm">Save draft</button>
                          <button onClick={handleUpload} disabled={!selectedFile || !uploadData.title.trim() || isUploading} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">
                            {isUploading ? 'Uploading...' : 'Upload to YouTube'}
                          </button>
                        </div>
                      </div>

                      <label className="block text-sm font-medium mb-1">Title <span className="text-xs text-gray-400">(required)</span></label>
                      <input type="text" value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} rows={5} className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                      <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                      <input type="text" value={uploadData.tags} onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })} className="w-full px-3 py-2 border rounded-md mb-3" placeholder="tag1,tag2" />

                      <label className="block text-sm font-medium mb-2">Suggested hashtags</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tagSuggestions.map(t => (
                          <button key={t} type="button" onClick={() => { const newTags = (uploadData.tags ? uploadData.tags + ',' : '') + t; setUploadData({ ...uploadData, tags: newTags }) }} className="px-3 py-1 text-sm bg-gray-100 rounded">#{t}</button>
                        ))}
                        <button onClick={() => { setUploadData({ ...uploadData, tags: tagSuggestions.join(',') }) }} className="px-3 py-1 text-sm bg-gray-50 rounded border">Add all</button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select value={uploadData.category} onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                            <option value="22">People & Blogs</option>
                            <option value="1">Film & Animation</option>
                            <option value="2">Autos & Vehicles</option>
                            <option value="10">Music</option>
                            <option value="15">Pets & Animals</option>
                            <option value="17">Sports</option>
                            <option value="20">Gaming</option>
                            <option value="24">Entertainment</option>
                            <option value="25">News & Politics</option>
                            <option value="26">Howto & Style</option>
                            <option value="27">Education</option>
                            <option value="28">Science & Technology</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Made for kids</label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2">
                              <input type="radio" name="kids" checked={uploadData.madeForKids === true} onChange={() => setUploadData({ ...uploadData, madeForKids: true })} />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input type="radio" name="kids" checked={uploadData.madeForKids === false} onChange={() => setUploadData({ ...uploadData, madeForKids: false })} />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Language</label>
                          <select value={uploadData.language} onChange={(e) => setUploadData({ ...uploadData, language: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="hi">Hindi</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">License</label>
                          <select value={uploadData.license} onChange={(e) => setUploadData({ ...uploadData, license: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                            <option value="standard">Standard YouTube License</option>
                            <option value="creative">Creative Commons</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="w-96">
                      <div className="w-full bg-gray-900 rounded-md overflow-hidden mb-3">
                        {previewSrc ? (
                          <video src={previewSrc} controls className="w-full h-56 object-cover bg-black" />
                        ) : (
                          <div className="w-full h-56 flex items-center justify-center text-gray-400">No preview</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Filename</div>
                      <div className="text-sm font-medium mb-2">{selectedFile?.name || '—'}</div>
                      <div className="text-xs text-gray-500">Estimated upload time: {selectedFile ? estimateUploadTime(selectedFile.size, uploadSpeedMbps) : '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setShowDetails(false); setSelectedFile(null); setPreviewSrc(null) }} className="px-4 py-2 border rounded-lg">Cancel</button>
                    <button onClick={saveDraft} className="px-4 py-2 border rounded-lg">Save draft</button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500 mr-2">{isUploading ? `Uploading… ${uploadProgress}%` : ''}</div>
                    <button onClick={handleUpload} disabled={!selectedFile || !uploadData.title.trim() || isUploading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                      {isUploading ? 'Uploading...' : 'Upload to YouTube'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bulk Video Modal (Shorts-focused: multiple files, max 60, per-item preview) */}
      {showAddBulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !isUploading && setShowAddBulkModal(false)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add Bulk Video (Shorts)</h2>
                  <p className="text-white/80 text-sm">Upload multiple short videos and add them to the Bulk queue</p>
                </div>
              </div>
              {!isUploading && (
                <button onClick={() => setShowAddBulkModal(false)} className="p-2 rounded-full bg-white/20">
                  <X className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <input id="bulk-files-input" type="file" accept="video/*" multiple onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length > 60) {
                  alert('Maximum 60 videos allowed. Only the first 60 will be selected.')
                  files.splice(60)
                }
                setBulkFiles(files)
              }} className="hidden" />

              {bulkVideos.length === 0 && bulkFiles.length === 0 && (
                <div className="w-full rounded-xl p-12 text-center bg-white border border-gray-200 shadow-sm">
                  <div className="mx-auto w-40 h-40 rounded-full bg-gray-50 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mt-6">Drag and drop short video files to upload</h3>
                  <p className="text-sm text-gray-500 mt-2">Select up to 60 shorts. Files will be added to your Bulk list after upload.</p>
                  <div className="mt-6">
                    <button onClick={() => { const el = document.getElementById('bulk-files-input') as HTMLInputElement | null; el?.click() }} className="px-6 py-2 bg-black text-white rounded-full">Select files</button>
                  </div>
                </div>
              )}

              {bulkFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {bulkFiles.map((f, idx) => (
                    <div key={f.name + idx} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-20 h-12 bg-black rounded overflow-hidden flex items-center justify-center">
                          <video className="w-full h-full object-cover" src={URL.createObjectURL(f)} muted playsInline />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{f.name}</p>
                          <p className="text-xs text-gray-500">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => createDraftFromFile(f, idx)} className="px-3 py-1 border rounded text-sm">Add</button>
                        <button onClick={() => setBulkFiles(prev => prev.filter((_, i) => i !== idx))} className="px-3 py-1 border rounded text-sm">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredBulkVideos.length > 0 && (
                <div className="mt-4 space-y-3">
                  {filteredBulkVideos.map(v => (
                    <div key={v.id} className="p-3 border rounded-md bg-gray-50 flex items-center gap-3">
                      <div className="w-20 h-12 rounded overflow-hidden bg-black flex items-center justify-center">
                        {v.thumbnail ? <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" /> : <div className="text-xs text-white px-2">No preview</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{v.title || v.fileName}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${v.privacy === 'public' ? 'bg-blue-100 text-blue-700' : v.privacy === 'unlisted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>{(v.privacy || 'unlisted').toString().toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-gray-500">{v.size ? `${(v.size / (1024 * 1024)).toFixed(1)} MB` : '—'}</p>
                        <div className="mt-2 h-2 bg-gray-200 rounded overflow-hidden"><div className="bg-green-500 h-2" style={{ width: `${v.progress || 0}%` }} /></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openPreviewForItem(v)} className="px-3 py-1 border rounded text-sm">Preview</button>
                        <button onClick={() => {
                          // open per-item details editor
                          setEditingBulkId(v.id)
                          setEditingBulkData({ title: v.title || '', description: v.description || '', tags: v.tags || '', category: v.category || '22', madeForKids: !!v.madeForKids, language: v.language || 'en', license: v.license || 'standard', privacy: v.privacy || 'unlisted' })
                        }} className="px-3 py-1 border rounded text-sm">Details</button>
                        <button onClick={() => removeBulkVideo(v.id)} className="px-3 py-1 border rounded text-sm">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Per-item Details editor for bulk items */}
              {editingBulkId && (
                <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex gap-6">
                    <div className="w-96">
                      <div className="w-full bg-gray-900 rounded-md overflow-hidden mb-3">
                        {(() => {
                          const f = bulkFileMap.current[editingBulkId]
                          if (f) return <video src={URL.createObjectURL(f)} controls className="w-full h-56 object-cover bg-black" />
                          if (currentEditingItem?.cloudUrl) return <video src={currentEditingItem.cloudUrl} controls className="w-full h-56 object-cover bg-black" />
                          if (currentEditingItem?.thumbnail) return <img src={currentEditingItem.thumbnail} className="w-full h-56 object-cover" />
                          return <div className="w-full h-56 flex items-center justify-center text-gray-400">No preview</div>
                        })()}
                      </div>
                      <div className="text-xs text-gray-600">Filename</div>
                      <div className="text-sm font-medium mb-2">{currentEditingItem?.fileName || '—'}</div>
                      <div className="text-xs text-gray-500">Estimated upload time: {currentEditingItem?.size ? estimateUploadTime(currentEditingItem.size, uploadSpeedMbps) : '—'}</div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Edit details</h4>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingBulkId(null) }} className="px-3 py-1 border rounded text-sm">Cancel</button>
                          <button onClick={() => {
                            // save metadata edits to the draft item
                            setBulkVideos(prev => prev.map(b => b.id === editingBulkId ? { ...b, ...editingBulkData } : b))
                            setEditingBulkId(null)
                          }} className="px-3 py-1 border rounded text-sm">Save draft</button>
                          <button onClick={() => editingBulkId && publishBulkItem(editingBulkId)} disabled={!bulkFileMap.current[editingBulkId as string]} className={`px-3 py-1 text-sm rounded ${!bulkFileMap.current[editingBulkId as string] ? 'bg-gray-300 text-gray-600' : 'bg-red-600 text-white'}`}>
                            Publish
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <input value={editingBulkData.title} onChange={(e) => setEditingBulkData((s: any) => ({ ...s, title: e.target.value }))} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select value={editingBulkData.category} onChange={(e) => setEditingBulkData((s: any) => ({ ...s, category: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                            <option value="22">People & Blogs</option>
                            <option value="1">Film & Animation</option>
                            <option value="2">Autos & Vehicles</option>
                            <option value="10">Music</option>
                            <option value="20">Gaming</option>
                            <option value="24">Entertainment</option>
                            <option value="27">Education</option>
                            <option value="28">Science & Technology</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea value={editingBulkData.description} onChange={(e) => setEditingBulkData((s: any) => ({ ...s, description: e.target.value }))} rows={4} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                          <input value={editingBulkData.tags} onChange={(e) => setEditingBulkData((s: any) => ({ ...s, tags: e.target.value }))} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Made for kids</label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2"><input type="radio" name="bulkKids" checked={editingBulkData.madeForKids === true} onChange={() => setEditingBulkData((s: any) => ({ ...s, madeForKids: true }))} /> <span className="text-sm">Yes</span></label>
                            <label className="inline-flex items-center gap-2"><input type="radio" name="bulkKids" checked={editingBulkData.madeForKids === false} onChange={() => setEditingBulkData((s: any) => ({ ...s, madeForKids: false }))} /> <span className="text-sm">No</span></label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Language</label>
                          <select value={editingBulkData.language} onChange={(e) => setEditingBulkData((s: any) => ({ ...s, language: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="hi">Hindi</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">License</label>
                          <select value={editingBulkData.license} onChange={(e) => setEditingBulkData((s: any) => ({ ...s, license: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                            <option value="standard">Standard YouTube License</option>
                            <option value="creative">Creative Commons</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium mb-1">Privacy</label>
                          <select value={editingBulkData.privacy} onChange={(e) => setEditingBulkData((s: any) => ({ ...s, privacy: e.target.value }))} className="w-full px-3 py-2 border rounded-md mb-2">
                            <option value="public">Public</option>
                            <option value="unlisted">Unlisted</option>
                            <option value="private">Private</option>
                          </select>

                          <div className="text-xs text-gray-500">Bulk uploads default to <strong>Unlisted</strong>. You can change privacy here before publishing.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowAddBulkModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={() => {
                if (bulkFiles.length === 0) { alert('No files queued for bulk add. Use the Add buttons next to each file.'); return }
                const filesToAdd: File[] = [...bulkFiles].slice(0, 60)
                  ; (async () => {
                    for (const f of filesToAdd) {
                      try {
                        const fd = new FormData()
                        fd.append('file', f, f.name)
                        const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd })
                        let data: any = null
                        try { data = await res.json() } catch (e) { console.warn('Failed to parse JSON from cloudinary API route', e) }
                        if (!(data && (data.success || data.secure_url))) { console.error('Upload failed for', f.name, data); continue }
                        const id = String(Date.now()) + Math.floor(Math.random() * 1000)
                        const item = { id, title: f.name.replace(/\.[^/.]+$/, ''), fileName: f.name, size: f.size, thumbnail: data.thumbnail_url, cloudUrl: data.secure_url, public_id: data.public_id, status: 'uploaded', progress: 100, privacy: 'unlisted' }
                        setBulkVideos(prev => [...prev, item])
                      } catch (err) {
                        console.error('Upload failed', err)
                      }
                    }
                    setBulkFiles([])
                  })()
              }} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded">Add {bulkFiles.length > 0 ? `(${Math.min(bulkFiles.length, 60)})` : ''} to Bulk List</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
