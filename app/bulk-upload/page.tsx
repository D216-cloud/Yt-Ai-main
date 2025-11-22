"use client"

import Link from "next/link"
import SidebarButton from '@/components/ui/sidebar-button'
import { Button } from '@/components/ui/button'
import { Home, User, GitCompare, Video, Upload, Play, LogOut, Menu, X, CheckCircle, Plus, List, Settings } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect, useRef, useMemo } from "react"
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

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
  const [editingPreviewSrc, setEditingPreviewSrc] = useState<string | null>(null)
  const [bulkFilesPreviews, setBulkFilesPreviews] = useState<string[]>([])
  const [addIndex, setAddIndex] = useState<number>(0)
  const [addMetadata, setAddMetadata] = useState<Record<string, any>>({})
  const [editingBulkId, setEditingBulkId] = useState<string | null>(null)
  const [editingBulkData, setEditingBulkData] = useState<any>({ title: '', description: '', tags: '', category: '22', madeForKids: false, language: 'en', license: 'standard', privacy: 'unlisted' })
  // default to show everything (history) so re-open shows all uploaded items
  const [showOnlyUnlisted, setShowOnlyUnlisted] = useState<boolean>(false)
  const [bulkSearch, setBulkSearch] = useState<string>('')
  const [bulkSort, setBulkSort] = useState<'newest'|'oldest'|'progress'>('newest')
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([])
  const [privacyFilter, setPrivacyFilter] = useState<'public'|'unlisted'|'private'>('unlisted')
  const [myChannelOnly, setMyChannelOnly] = useState<boolean>(false)
  const [isImportingPrivate, setIsImportingPrivate] = useState<boolean>(false)
  const [showPrivateModal, setShowPrivateModal] = useState<boolean>(false)
  const [privateModalVideos, setPrivateModalVideos] = useState<any[]>([])
  const [selectedPrivateIds, setSelectedPrivateIds] = useState<string[]>([])
  const [previewPrivateVideos, setPreviewPrivateVideos] = useState<any[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false)
  const [scheduleCandidates, setScheduleCandidates] = useState<any[]>([])
  const [scheduleBaseISO, setScheduleBaseISO] = useState<string>('')
  const [schedulePublicDelayHours, setSchedulePublicDelayHours] = useState<number>(24)
  const [scheduleStaggerDaily, setScheduleStaggerDaily] = useState<boolean>(false)

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

  // add a fetched/private video into the bulk list (deduped by youtubeId)
  const addFetchedVideoToBulk = (v: any) => {
    const youtubeId = v.id || v.videoId
    const exists = bulkVideos.find(b => (b.youtubeId || b.id) === youtubeId)
    if (exists) return false
    const id = 'yt-'+(youtubeId || String(Date.now())+Math.floor(Math.random()*1000))
    const item = { id, title: v.title || v.name || 'Untitled', fileName: '', size: 0, thumbnail: v.thumbnail || '', cloudUrl: '', public_id: '', status: 'fetched', progress: 100, privacy: 'private', youtubeId, channelIds: [v._channelId || v.channelId || ''] }
    setBulkVideos(prev => [...prev, item])
    return true
  }

  const openScheduleForCandidates = (items: any[]) => {
    if (!items || items.length === 0) return
    setScheduleCandidates(items)
    // set sensible defaults: if multiple, start next day at 09:00; if single, start 15 minutes from now
    const now = new Date()
    let base: Date
    if (items.length > 1) {
      base = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0)
      setScheduleStaggerDaily(true)
    } else {
      base = new Date(now.getTime() + 15 * 60 * 1000)
      setScheduleStaggerDaily(false)
    }
    setScheduleBaseISO(base.toISOString().slice(0,16)) // for input datetime-local
    setSchedulePublicDelayHours(24)
    setShowScheduleModal(true)
  }

  useEffect(() => {
    return () => {
      if (previewSrc) try { URL.revokeObjectURL(previewSrc) } catch (e) {}
    }
  }, [previewSrc])

  // Generate and manage preview blob URLs for files selected in the "Add Bulk Video" modal
  useEffect(() => {
    // revoke previous previews
    try {
      bulkFilesPreviews.forEach(u => { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u) })
    } catch (e) {}
    if (!bulkFiles || bulkFiles.length === 0) {
      setBulkFilesPreviews([])
      return
    }
    const previews = bulkFiles.map((f) => {
      try { return URL.createObjectURL(f) } catch (e) { return '' }
    })
    setBulkFilesPreviews(previews)
    return () => {
      try { previews.forEach(u => { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u) }) } catch (e) {}
    }
  }, [bulkFiles])

  // transient map to hold File objects for preview (not stored in localStorage)
  const bulkFileMap = useRef<Record<string, File>>({})
  const modalFileInputRef = useRef<HTMLInputElement | null>(null)

  // Sort/filter bulk videos: group by privacy (private first), then sort within groups according to user preference
  const sortedBulkVideos = useMemo(() => {
    const groups: Record<string, any[]> = { private: [], unlisted: [], public: [], other: [] }
    for (const v of bulkVideos) {
      const p = ((v.privacy || v.privacyStatus || 'unlisted') as string).toString().toLowerCase()
      if (p === 'private') groups.private.push(v)
      else if (p === 'unlisted') groups.unlisted.push(v)
      else if (p === 'public') groups.public.push(v)
      else groups.other.push(v)
    }

    const sortGroup = (arr: any[]) => {
      if (bulkSort === 'newest') return arr.sort((a, b) => (b.id || '').toString().localeCompare((a.id || '').toString()))
      if (bulkSort === 'oldest') return arr.sort((a, b) => (a.id || '').toString().localeCompare((b.id || '').toString()))
      if (bulkSort === 'progress') return arr.sort((a, b) => (b.progress || 0) - (a.progress || 0))
      return arr
    }

    const res = [
      ...sortGroup(groups.private),
      ...sortGroup(groups.unlisted),
      ...sortGroup(groups.public),
      ...sortGroup(groups.other),
    ]
    return res
  }, [bulkVideos, bulkSort])

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

  // Apply filter, privacy, channel-only and search after sorting
  const filteredBulkVideos = useMemo(() => {
    let arr = [...sortedBulkVideos]
    // privacy filter
    if (privacyFilter) {
      arr = arr.filter(v => ((v.privacy || v.privacyStatus || 'unlisted').toString().toLowerCase() === privacyFilter))
    }
    // my channel only filter
    if (myChannelOnly && selectedUploadChannel && selectedUploadChannel.id) {
      arr = arr.filter(v => {
        if (Array.isArray(v.channelIds)) return v.channelIds.includes(selectedUploadChannel.id)
        if (v.channelId) return v.channelId === selectedUploadChannel.id
        return false
      })
    }
    // search
    if (bulkSearch && bulkSearch.trim()) {
      const q = bulkSearch.trim().toLowerCase()
      arr = arr.filter(v => (v.title || v.fileName || '').toString().toLowerCase().includes(q) || (v.fileName || '').toString().toLowerCase().includes(q))
    }
    return arr
  }, [sortedBulkVideos, privacyFilter, myChannelOnly, bulkSearch])

  const scheduledBulkVideos = useMemo(() => {
    return bulkVideos.filter(b => (b.status || '').toString().toLowerCase() === 'scheduled')
  }, [bulkVideos])

  const toggleSelectBulk = (id: string) => {
    setSelectedBulkIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAllVisible = () => {
    const ids = filteredBulkVideos.map(v => v.id)
    setSelectedBulkIds(ids)
  }

  const clearSelection = () => setSelectedBulkIds([])

  const bulkDeleteSelected = () => {
    if (selectedBulkIds.length === 0) { alert('No items selected'); return }
    if (!confirm(`Delete ${selectedBulkIds.length} selected items from the queue? This cannot be undone.`)) return
    setBulkVideos(prev => prev.filter(v => !selectedBulkIds.includes(v.id)))
    clearSelection()
  }

  const bulkPublishSelected = () => {
    if (selectedBulkIds.length === 0) { alert('No items selected'); return }
    // publish each selected item that has a file in memory
    selectedBulkIds.forEach(id => {
      const item = bulkVideos.find(b => b.id === id)
      if (item) publishBulkItem(id)
    })
    clearSelection()
  }

  // load persisted bulk items (metadata + thumbnail) from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bulk_videos')
      if (raw) {
        const items = JSON.parse(raw)
        if (Array.isArray(items)) {
          // ensure privacy defaults to 'unlisted' if missing, and normalize case
          const normalized = items.map((it: any) => ({ ...it, privacy: (it.privacy || 'unlisted').toString().toLowerCase() }))
          console.debug('Loaded persisted bulk_videos:', normalized.length, normalized.map((i:any) => i.privacy))
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
      const cleanup = () => { try { URL.revokeObjectURL(url) } catch (e) {} }

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
    } catch (e) {}
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
    try { if (previewSrc && previewSrc.startsWith('blob:')) URL.revokeObjectURL(previewSrc) } catch (e) {}
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
  const [tagSuggestions] = useState(['gaming','tutorial','vlog','shorts','howto','review'])
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

  // Add a body class to hide the mobile bottom nav while this page is mounted
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.classList.add('hide-mobile-nav')
    return () => {
      try { document.body.classList.remove('hide-mobile-nav') } catch (e) {}
    }
  }, [])

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

  // helper to fetch private videos across connected channels (reused by button and auto-load)
  const autoFetchedPrivateRef = useRef(false)
  const fetchPrivateAcrossChannels = async (autoOpen = false) => {
    const token = localStorage.getItem('youtube_access_token')
    if (!token) {
      console.debug('No access token present for private video fetch')
      return []
    }
    if (!allChannels || allChannels.length === 0) {
      console.debug('No connected channels for private video fetch')
      return []
    }
    try {
      setIsImportingPrivate(true)
      const aggregated: any[] = []
      for (const ch of allChannels) {
        try {
          const tokenParam = token ? `&access_token=${encodeURIComponent(token)}` : ''
          const res = await fetch(`/api/youtube/videos?channelId=${ch.id}&fetchAll=true${tokenParam}`)
          if (!res.ok) {
            const text = await res.text().catch(() => '')
            console.warn('Videos API returned non-OK for channel', ch.id, res.status, text)
            continue
          }
          const data = await res.json()
          if (data && data.success && Array.isArray(data.videos)) {
            const privateVideos = data.videos.filter((v:any) => ((v.privacyStatus || v.privacy || '').toString().toLowerCase()) === 'private')
            const mapped = privateVideos.map((v:any) => ({ ...v, _channelId: ch.id, _channelTitle: ch.title }))
            aggregated.push(...mapped)
          } else {
            console.warn('Videos API returned unexpected shape for channel', ch.id, data)
          }
        } catch (e) { console.error('Failed to fetch for channel', ch, e) }
      }
      setPrivateModalVideos(aggregated)
      setPreviewPrivateVideos(aggregated.slice(0, 10))
      setSelectedPrivateIds([])
      if (autoOpen && aggregated.length > 0) setShowPrivateModal(true)
      return aggregated
    } catch (err) {
      console.error('Failed to load private videos', err)
      return []
    } finally { setIsImportingPrivate(false) }
  }

  // Auto-fetch private videos once when channels load and a token exists
  useEffect(() => {
    if (autoFetchedPrivateRef.current) return
    if (!allChannels || allChannels.length === 0) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('youtube_access_token') : null
    if (!token) return
    // mark as attempted so we don't repeatedly auto-fetch
    autoFetchedPrivateRef.current = true
    ;(async () => {
      try {
        const res = await fetchPrivateAcrossChannels(false)
        if (!res || res.length === 0) {
          console.debug('Auto-load found no private videos')
        }
      } catch (e) { console.error(e) }
    })()
  }, [allChannels])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid video file (MP4, WebM, MOV, AVI)')
      return
    }
    // Suggest a title based on filename (nice UX boost)
    const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    setUploadData((d) => ({ ...d, title: d.title || name }))
    setSelectedFile(file)
    try {
      // revoke any previous blob URL we created
      try { if (previewSrc && previewSrc.startsWith('blob:')) URL.revokeObjectURL(previewSrc) } catch (e) {}
      const url = URL.createObjectURL(file)
      setPreviewSrc(url)
    } catch (e) {}
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(fakeEvent)
    }
  }

  const estimateUploadTime = (bytes: number, mbps: number) => {
    if (!bytes || !mbps) return '—'
    const bits = bytes * 8
    const seconds = bits / (mbps * 1_000_000)
    if (seconds < 60) return `${Math.ceil(seconds)}s`
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const handleUpload = async () => {
    if (!selectedFile) { alert('Please select a video file'); return }
    if (!uploadData.title.trim()) { alert('Please enter a title'); return }
    if (!selectedUploadChannel) { alert('Please select a channel'); return }

    const accessToken = localStorage.getItem('youtube_access_token')
    if (!accessToken) { alert('YouTube access token missing. Connect channel.'); return }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('title', uploadData.title)
      formData.append('description', uploadData.description)
      formData.append('tags', uploadData.tags)
      formData.append('privacy', uploadData.privacy)
      formData.append('madeForKids', String(uploadData.madeForKids))
      formData.append('language', uploadData.language || 'en')
      formData.append('license', uploadData.license || 'standard')
      formData.append('category', uploadData.category)
      formData.append('access_token', accessToken)
      // support multiple channel upload; fallback to single selected channel
      const channelIds = selectedUploadChannel ? [selectedUploadChannel.id] : []
      formData.append('channelIds', JSON.stringify(channelIds))

      // Use XMLHttpRequest so we can get real upload progress events
      await new Promise<void>((resolve, reject) => {
        try {
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
                    setUploadProgress(100)
                    alert('Upload successful!')
                    // Add uploaded video to Bulk Queue (so private/unlisted shows in the right-side queue)
                    try {
                      const id = String(Date.now()) + Math.floor(Math.random() * 1000)
                      const item = {
                        id,
                        title: uploadData.title,
                        fileName: selectedFile?.name || '',
                        size: selectedFile?.size || 0,
                        thumbnail: data.thumbnail || data.thumbnailUrl || '',
                        cloudUrl: data.videoUrl || data.youtubeUrl || '',
                        youtubeId: data.videoId || data.youtubeId || '',
                        public_id: data.public_id || '',
                        status: 'done',
                        progress: 100,
                        privacy: uploadData.privacy || 'unlisted'
                      }
                      setBulkVideos(prev => [...prev, item])
                    } catch (e) { console.warn('Failed to add uploaded video to bulk queue', e) }

                    setShowUploadModal(false)
                    // reset
                    setSelectedFile(null)
                    setUploadData({ title: '', description: '', tags: '', category: '22', privacy: 'public', madeForKids: false, language: 'en', license: 'standard' })
                    resolve()
                } else {
                  reject(new Error(data.error || 'Upload failed'))
                }
              } catch (err) { reject(err) }
            } else {
              reject(new Error('Upload failed with status ' + xhr.status))
            }
          }
          xhr.onerror = () => reject(new Error('Network error during upload'))
          xhr.send(formData)
        } catch (err) { reject(err) }
      })
    } catch (err: any) {
      console.error(err)
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

  // Manage a stable preview URL for the currently editing bulk item (if it has a File in memory)
  useEffect(() => {
    // clear previous
    try { if (editingPreviewSrc && editingPreviewSrc.startsWith('blob:')) URL.revokeObjectURL(editingPreviewSrc) } catch (e) {}
    setEditingPreviewSrc(null)
    if (!editingBulkId) return
    const f = bulkFileMap.current[editingBulkId]
    if (f) {
      try {
        const url = URL.createObjectURL(f)
        setEditingPreviewSrc(url)
      } catch (e) { setEditingPreviewSrc(null) }
    } else if (currentEditingItem?.cloudUrl) {
      setEditingPreviewSrc(currentEditingItem.cloudUrl)
    } else if (currentEditingItem?.thumbnail) {
      setEditingPreviewSrc(currentEditingItem.thumbnail)
    }
    return () => {
      try { if (editingPreviewSrc && editingPreviewSrc.startsWith('blob:')) URL.revokeObjectURL(editingPreviewSrc) } catch (e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingBulkId, currentEditingItem])

  return (
    <div>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 pt-2 pb-2 px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <a href="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
                <Play className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-sm font-semibold">YouTubeAI Pro</span>
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
      <header className="hidden md:block sticky top-0 z-40 border-b border-gray-200 bg-white h-16">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <a href="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
              <Play className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">YouTubeAI Pro</span>
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
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 md:hidden z-30 top-16" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Mobile Sidebar - slide-in */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:hidden z-40 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' as any }}
        >
          <nav className="p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon as any
              const isActive = activePage === link.id
              return (
                <SidebarButton
                  key={link.id}
                  id={link.id}
                  href={link.href}
                  label={link.label}
                  Icon={Icon}
                  isActive={isActive}
                  onClick={() => setSidebarOpen(false)}
                />
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={() => { setSidebarOpen(false); handleSignOut() }}
              disabled={isLoading}
              className="w-full justify-start h-12 text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Desktop Sidebar - fixed expanded layout */}
        <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="p-4 space-y-1 flex-1">
            {navLinks.map((link) => {
              const Icon = link.icon as any
              const isActive = activePage === link.id
              return (
                <SidebarButton
                  key={link.id}
                  id={link.id}
                  href={link.href}
                  label={link.label}
                  Icon={Icon}
                  isActive={isActive}
                />
              )
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-100">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start h-12 text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 md:ml-64 pb-6 md:pb-0 p-4 sm:p-6`}> 
          <div className="w-full">
            <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-6">
              <h1 className="text-2xl font-bold">Bulk Upload</h1>
              <p className="text-sm text-gray-600 mt-1">Top-level bulk upload workspace (separate from Dashboard).</p>
            </div>

            <div className="mb-6 rounded-xl sm:rounded-2xl bg-card/95 backdrop-blur-sm border shadow-xl sm:shadow-2xl overflow-hidden lg:min-h-[420px] flex flex-col">
              <div className="hidden sm:flex bg-muted/50 px-4 sm:px-6 py-3 sm:py-4 border-b items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="inline-flex items-center space-x-2">
                    <div className="bg-white/150 rounded-full px-4 py-1 border shadow-sm flex items-center gap-5 min-w-[160px] justify-center">
                      <Upload className="h-4 w-4 text-red-500" />
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">youtube-growth.ai</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">/bulk-upload</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Manage bulk uploads</h2>
                  <p className="text-sm text-gray-600">Upload batches to multiple channels from one place.</p>
                </div>
              </div>

              <div className="border-dashed border-2 border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-600 mb-4">Upload batches to one or more connected channels. Select a channel and upload video files.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
                  >
                    Upload Video
                  </button>
                  <button
                    onClick={() => setShowAddBulkModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg"
                  >
                    Add Bulk Video
                  </button>
                  <Link href="/connect">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg">
                      Connect Channels
                    </button>
                  </Link>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Bulk List Panel (inline after hero card) */}
          <div className="mt-6 p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-stretch">
          {/* Left: filler to match layout spacing; can host additional content */}
          <div className="lg:col-span-1" />
          {/* Right: Bulk Upload Queue as a card (now ~80% width on lg) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 lg:self-start">
            <div className="mb-6 rounded-xl sm:rounded-2xl bg-card/95 backdrop-blur-sm border shadow-xl sm:shadow-2xl overflow-hidden lg:min-h-[420px] flex flex-col">
              <div className="hidden sm:flex bg-muted/50 px-4 sm:px-6 py-3 sm:py-4 border-b items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="inline-flex items-center space-x-2">
                    <div className="bg-white/90 rounded-full px-4 py-1 border shadow-sm flex items-center gap-2 min-w-[160px] justify-center">
                      <Upload className="h-4 w-4 text-red-500" />
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">youtube-growth.ai</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">/bulk-upload</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Queue</span>
                </div>
              </div>
              <div className="p-2 sm:p-4 flex-1">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                <div className="flex-1">
                  <h3 className="font-bold mb-2 sm:mb-0">Bulk Upload Queue</h3>
                  <div className="flex items-center gap-2">
                    <input value={bulkSearch} onChange={(e) => setBulkSearch(e.target.value)} placeholder="Search title or filename" className="px-3 py-2 border rounded-md w-full sm:max-w-xs text-sm" />
                    <select value={bulkSort} onChange={(e) => setBulkSort(e.target.value as any)} className="text-sm px-2 py-2 border rounded-md bg-white">
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="progress">Progress</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select value={privacyFilter} onChange={(e) => setPrivacyFilter(e.target.value as any)} className="text-sm px-2 py-2 border rounded-md bg-white">
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                  </select>
                  <button
                    onClick={async () => {
                      let token = localStorage.getItem('youtube_access_token')
                      if (!token) { alert('You must connect a channel (owner token) to load private videos'); return }
                      if (!allChannels || allChannels.length === 0) { alert('No connected channels available'); return }
                      try {
                        setIsImportingPrivate(true)
                        const aggregated: any[] = []
                        for (const ch of allChannels) {
                          try {
                            const tokenParam = token ? `&access_token=${encodeURIComponent(token)}` : ''
                            const res = await fetch(`/api/youtube/videos?channelId=${ch.id}&fetchAll=true${tokenParam}`)
                            if (!res.ok) {
                              const text = await res.text().catch(() => '')
                              console.warn('Videos API returned non-OK for channel', ch.id, res.status, text)
                              continue
                            }
                            const data = await res.json()
                            if (data && data.success && Array.isArray(data.videos)) {
                              const privateVideos = data.videos.filter((v:any) => ((v.privacyStatus || v.privacy || '').toString().toLowerCase()) === 'private')
                              const mapped = privateVideos.map((v:any) => ({ ...v, _channelId: ch.id, _channelTitle: ch.title }))
                              aggregated.push(...mapped)
                            } else {
                              console.warn('Videos API returned unexpected shape for channel', ch.id, data)
                            }
                          } catch (e) { console.error('Failed to fetch for channel', ch, e) }
                        }
                        if (aggregated.length === 0) {
                          alert('No private videos found across connected channels. Make sure you connected the owner access token with the correct scopes.')
                        }
                        setPrivateModalVideos(aggregated)
                        setSelectedPrivateIds([])
                        setShowPrivateModal(true)
                      } catch (err) {
                        console.error('Failed to load private videos', err)
                        alert('Failed to load private videos: ' + (err as any)?.message || '')
                      } finally { setIsImportingPrivate(false) }
                    }}
                    disabled={isImportingPrivate}
                    className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded text-sm"
                  >
                    {isImportingPrivate ? 'Loading…' : 'Show private (all channels)'}
                  </button>
                </div>
              </div>
              {/* Preview of first 10 private videos (auto-loaded) */}
              {scheduledBulkVideos && scheduledBulkVideos.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Scheduled videos</h4>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowPrivateModal(true)} className="text-sm px-2 py-1 border rounded">View all videos</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {scheduledBulkVideos.slice(0,5).map(s => (
                      <div key={s.id} className="p-2 border rounded bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-10 bg-gray-100 overflow-hidden rounded"><img src={s.thumbnail||''} className="w-full h-full object-cover" /></div>
                          <div className="text-sm truncate">{s.title}</div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          <div>Unlisted: {s.scheduledUnlistedAt ? new Date(s.scheduledUnlistedAt).toLocaleString() : '—'}</div>
                          <div>Public: {s.scheduledPublicAt ? new Date(s.scheduledPublicAt).toLocaleString() : '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previewPrivateVideos && previewPrivateVideos.length > 0 && (
                <div className="mt-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Private videos preview</h4>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowPrivateModal(true)} className="text-sm px-2 py-1 border rounded">View all videos</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {previewPrivateVideos.map((pv, idx) => {
                      const pid = pv.id || pv.videoId || ('yt-'+idx)
                      return (
                        <div key={pid} className="p-2 border rounded-md bg-white flex flex-col items-start gap-2">
                          <div className="w-full h-20 bg-gray-100 overflow-hidden rounded">
                            <img src={pv.thumbnail || ''} alt={pv.title || 'thumb'} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-xs font-semibold truncate w-full">{pv.title || 'Untitled'}</div>
                          <div className="w-full flex items-center justify-between">
                                    <button onClick={() => openScheduleForCandidates([pv])} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Add</button>
                            <button onClick={() => setShowPrivateModal(true)} className="text-xs px-2 py-1 border rounded">View</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {filteredBulkVideos.length === 0 ? (
                bulkVideos.length === 0 ? (
                  <div className="text-sm text-gray-500">No bulk videos added yet. Click "Add Bulk Video" to create items.</div>
                ) : (
                  <div className="text-sm text-gray-500">No bulk videos match the current filter.
                    <button onClick={() => setShowOnlyUnlisted(false)} className="ml-2 text-sm text-blue-600 underline">Show all</button>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {filteredBulkVideos.map((v) => (
                    <div key={v.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedBulkIds.includes(v.id)} onChange={() => toggleSelectBulk(v.id)} className="w-5 h-5" />
                        </div>
                        <div className="w-20 sm:w-24 h-12 sm:h-14 rounded overflow-hidden bg-black flex items-center justify-center flex-shrink-0">
                          {v.thumbnail ? (
                            <img src={v.thumbnail} alt={v.title || v.fileName || 'thumb'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs text-white px-2">No preview</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{v.title || v.fileName || 'Untitled'}</p>
                          <p className="text-xs text-gray-500 truncate">{v.size ? `${(v.size/(1024*1024)).toFixed(1)} MB` : '—'}</p>
                          <div className="mt-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${v.privacy === 'public' ? 'bg-blue-100 text-blue-700' : v.privacy === 'unlisted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>{(v.privacy || 'unlisted').toString().toUpperCase()}</span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-200 rounded overflow-hidden">
                            <div className="bg-green-500 h-2" style={{ width: `${v.progress || 0}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => openPreviewForItem(v)} className="w-full sm:w-auto px-3 py-2 border rounded text-sm">Preview</button>
                        </div>
                        <span className={"ml-0 sm:ml-auto text-xs font-semibold " + (v.status === 'error' ? 'text-red-600' : 'text-green-600')}>{v.status === 'error' ? 'Error' : 'Uploaded'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !isUploading && setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-4 sm:p-6 flex items-center justify-between">
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

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[calc(90vh-200px)]">
              <input ref={modalFileInputRef} type="file" accept="video/*" onChange={(e) => {
                // use existing handler to set selected file and open details panel for editing
                handleFileSelect(e as React.ChangeEvent<HTMLInputElement>)
                setTimeout(() => setShowDetails(true), 80)
              }} className="hidden" />

              {!showDetails && (
                <div
                  onDrop={(e) => { e.preventDefault(); handleDrop(e as unknown as React.DragEvent<HTMLDivElement>); setTimeout(() => setShowDetails(true), 120) }}
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
                <div className={`mt-6 overflow-hidden transition-all duration-500 ${showDetails ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col lg:flex-row items-start gap-6">
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
                      <input type="text" value={uploadData.title} onChange={(e) => setUploadData({...uploadData, title: e.target.value})} className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea value={uploadData.description} onChange={(e) => setUploadData({...uploadData, description: e.target.value})} rows={5} className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                      <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                      <input type="text" value={uploadData.tags} onChange={(e) => setUploadData({...uploadData, tags: e.target.value})} className="w-full px-3 py-2 border rounded-md mb-3" placeholder="tag1,tag2" />

                      <label className="block text-sm font-medium mb-2">Suggested hashtags</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tagSuggestions.map(t => (
                          <button key={t} type="button" onClick={() => { const newTags = (uploadData.tags ? uploadData.tags + ',' : '') + t; setUploadData({...uploadData, tags: newTags}) }} className="px-3 py-1 text-sm bg-gray-100 rounded">#{t}</button>
                        ))}
                        <button onClick={() => { setUploadData({...uploadData, tags: tagSuggestions.join(',')}) }} className="px-3 py-1 text-sm bg-gray-50 rounded border">Add all</button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select value={uploadData.category} onChange={(e) => setUploadData({...uploadData, category: e.target.value})} className="w-full px-3 py-2 border rounded-md">
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
                              <input type="radio" name="kids" checked={uploadData.madeForKids === true} onChange={() => setUploadData({...uploadData, madeForKids: true})} />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input type="radio" name="kids" checked={uploadData.madeForKids === false} onChange={() => setUploadData({...uploadData, madeForKids: false})} />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Language</label>
                          <select value={uploadData.language} onChange={(e) => setUploadData({...uploadData, language: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="hi">Hindi</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">License</label>
                          <select value={uploadData.license} onChange={(e) => setUploadData({...uploadData, license: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                            <option value="standard">Standard YouTube License</option>
                            <option value="creative">Creative Commons</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-96">
                      <div className="w-full bg-gray-900 rounded-md overflow-hidden mb-3">
                        {previewSrc ? (
                          <video src={previewSrc} controls className="w-full h-40 lg:h-56 object-cover bg-black" />
                        ) : (
                          <div className="w-full h-40 lg:h-56 flex items-center justify-center text-gray-400">No preview</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Filename</div>
                      <div className="text-sm font-medium mb-2">{selectedFile?.name || '—'}</div>
                      <div className="text-xs text-gray-500">Estimated upload time: {selectedFile ? estimateUploadTime(selectedFile.size, uploadSpeedMbps) : '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-3">
                    <button onClick={() => { setShowDetails(false); setSelectedFile(null); setPreviewSrc(null) }} className="w-full sm:w-auto px-4 py-2 border rounded-lg">Cancel</button>
                    <button onClick={saveDraft} className="w-full sm:w-auto px-4 py-2 border rounded-lg">Save draft</button>
                  </div>

                  <div className="flex w-full sm:w-auto items-center gap-3">
                    <div className="text-sm text-gray-500 mr-2 hidden sm:block">{isUploading ? `Uploading… ${uploadProgress}%` : ''}</div>
                    <button onClick={handleUpload} disabled={!selectedFile || !uploadData.title.trim() || isUploading} className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                      {isUploading ? 'Uploading...' : 'Upload to YouTube'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Schedule Modal: set unlisted/public times for fetched videos */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowScheduleModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-3xl w-full p-4 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Schedule release for {scheduleCandidates.length} video{scheduleCandidates.length>1?'s':''}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-sm px-2 py-1">Close</button>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-600">Set when fetched (private) videos should become <strong>Unlisted</strong>, and when Unlisted should become <strong>Public</strong>.</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Unlisted at (date & time)</label>
                  <input type="datetime-local" value={scheduleBaseISO} onChange={(e) => setScheduleBaseISO(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="text-xs font-medium">Delay until Public (hours)</label>
                  <input type="number" min={1} value={schedulePublicDelayHours} onChange={(e) => setSchedulePublicDelayHours(Number(e.target.value)||1)} className="w-full px-3 py-2 border rounded" />
                </div>
              </div>

              {scheduleCandidates.length > 1 && (
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={scheduleStaggerDaily} onChange={(e) => setScheduleStaggerDaily(e.target.checked)} />
                  <div className="text-sm">Stagger unlisted dates daily (one video per day starting from the Unlisted date above)</div>
                </div>
              )}

              <div className="text-xs text-gray-500">If staggered, each subsequent video will be scheduled on the next calendar day at the same time. Public release will be scheduled relative to each video's Unlisted time by the delay above.</div>

              <div className="space-y-2 max-h-40 overflow-y-auto border-t pt-3">
                {scheduleCandidates.map((c, idx) => (
                  <div key={c.id || c.videoId || idx} className="flex items-center gap-3 p-2 border rounded">
                    <div className="w-14 h-10 bg-gray-100 overflow-hidden rounded"><img src={c.thumbnail||''} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0 text-sm truncate">{c.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-500">Channel: {c._channelTitle || c.channelTitle || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={() => {
                if (!scheduleBaseISO) { alert('Please select Unlisted datetime'); return }
                const base = new Date(scheduleBaseISO)
                if (isNaN(base.getTime())) { alert('Invalid Unlisted datetime'); return }
                const delay = Number(schedulePublicDelayHours) || 24
                // add each candidate to bulk list with scheduled fields
                setBulkVideos(prev => {
                  const existingIds = new Set(prev.map(p => p.youtubeId || p.id))
                  const merged = [...prev]
                  scheduleCandidates.forEach((c, i) => {
                    const youtubeId = c.id || c.videoId
                    if (existingIds.has(youtubeId)) return
                    const offsetDays = (scheduleStaggerDaily && scheduleCandidates.length > 1) ? i : 0
                    const unlistedAt = new Date(base.getTime() + offsetDays * 24 * 60 * 60 * 1000)
                    const publicAt = new Date(unlistedAt.getTime() + delay * 60 * 60 * 1000)
                    const id = 'yt-'+(youtubeId || String(Date.now())+Math.floor(Math.random()*1000))
                    merged.push({ id, title: c.title || 'Untitled', fileName: '', size: 0, thumbnail: c.thumbnail || '', cloudUrl: '', public_id: '', status: 'scheduled', progress: 0, privacy: 'private', youtubeId, channelIds: [c._channelId || c.channelId || ''], scheduledUnlistedAt: unlistedAt.toISOString(), scheduledPublicAt: publicAt.toISOString() })
                    existingIds.add(youtubeId)
                  })
                  return merged
                })
                setShowScheduleModal(false)
                setScheduleCandidates([])
                setSelectedPrivateIds([])
                setPrivateModalVideos(prev => prev.filter(v => !scheduleCandidates.find((s:any) => (s.id||s.videoId) === (v.id||v.videoId))))
              }} className="px-4 py-2 bg-green-600 text-white rounded">Schedule and Add to Bulk List</button>
            </div>
          </div>
        </div>
      )}
      {/* Private Videos Modal (all channels) */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPrivateModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-4xl w-full p-4 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Private videos (all channels)</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedPrivateIds(privateModalVideos.map(v => v.id || v.videoId || ('yt-'+Math.random())))} className="text-sm px-2 py-1 border rounded">Select all</button>
                <button onClick={() => setSelectedPrivateIds([])} className="text-sm px-2 py-1 border rounded">Clear</button>
                <button onClick={() => setShowPrivateModal(false)} className="text-sm px-2 py-1">Close</button>
              </div>
            </div>

            <div className="space-y-3">
              {scheduledBulkVideos.length === 0 && privateModalVideos.length === 0 ? (
                <div className="text-sm text-gray-500">No private videos found across connected channels.</div>
              ) : (
                <div>
                  {scheduledBulkVideos.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold mb-2">Scheduled videos</h4>
                      <div className="space-y-2">
                        {scheduledBulkVideos.map((s) => (
                          <div key={s.id} className="flex items-center gap-3 p-2 rounded border bg-white">
                            <div className="w-28 h-16 overflow-hidden rounded"><img src={s.thumbnail||''} className="w-full h-full object-cover" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{s.title}</div>
                              <div className="text-xs text-gray-500">Unlisted: {s.scheduledUnlistedAt ? new Date(s.scheduledUnlistedAt).toLocaleString() : '—'}</div>
                              <div className="text-xs text-gray-500">Public: {s.scheduledPublicAt ? new Date(s.scheduledPublicAt).toLocaleString() : '—'}</div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button onClick={() => {
                                if (!confirm('Cancel scheduled item and remove from Bulk list?')) return
                                setBulkVideos(prev => prev.filter(p => p.id !== s.id))
                              }} className="px-3 py-1 border rounded text-sm">Cancel schedule</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {privateModalVideos.length > 0 && (
                    <div className="space-y-3">
                      {privateModalVideos.map((video) => {
                        const vid = video.id || video.videoId || ('yt-'+Math.random())
                        const checked = selectedPrivateIds.includes(vid)
                        return (
                          <div key={vid} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50">
                            <input type="checkbox" checked={checked} onChange={() => setSelectedPrivateIds(prev => prev.includes(vid) ? prev.filter(x=>x!==vid) : [...prev, vid])} className="w-5 h-5" />
                            <img src={video.thumbnail || ''} alt={video.title} className="w-28 h-16 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{video.title || video.name || 'Untitled'}</div>
                              <div className="text-xs text-gray-500">Channel: {video._channelTitle || video.channelTitle || '—'}</div>
                              <div className="text-xs text-gray-500">Published: {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : '—'}</div>
                            </div>
                            <div>
                              <button onClick={() => openScheduleForCandidates([video])} className="px-3 py-1 border rounded text-sm">Add</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setShowPrivateModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={() => {
                const toAdd = privateModalVideos.filter(v => {
                  const vid = v.id || v.videoId || ''
                  return selectedPrivateIds.includes(vid)
                })
                if (toAdd.length === 0) { alert('No videos selected'); return }
                openScheduleForCandidates(toAdd)
              }} className="px-4 py-2 bg-green-600 text-white rounded">Add selected to Bulk List</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bulk Video Modal (Shorts-focused: multiple files, max 60, per-item preview) */}
      {showAddBulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => !isUploading && setShowAddBulkModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-5xl h-[92vh] sm:h-auto max-h-[95vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg sm:text-2xl font-bold text-white">Add Bulk Video (Shorts)</h2>
                  <p className="text-white/80 text-xs sm:text-sm">Upload multiple short videos and add them to the Bulk queue</p>
                </div>
              </div>
              {!isUploading && (
                <button onClick={() => setShowAddBulkModal(false)} className="p-2 rounded-full bg-white/20">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              )}
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
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
                    <div key={f.name + idx} className="p-3 border rounded-md bg-gray-50">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="w-24 sm:w-28 h-14 sm:h-16 bg-black rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                          {bulkFilesPreviews[idx] ? (
                            <video className="w-full h-full object-cover" src={bulkFilesPreviews[idx]} muted playsInline />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No preview</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{f.name}</p>
                          <p className="text-xs text-gray-500">{(f.size/(1024*1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <button onClick={() => createDraftFromFile(f, idx)} className="w-full sm:w-auto px-3 py-2 border rounded text-sm">Add</button>
                        <button onClick={() => setBulkFiles(prev => prev.filter((_, i) => i !== idx))} className="w-full sm:w-auto px-3 py-2 border rounded text-sm">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

                  {filteredBulkVideos.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {filteredBulkVideos.map(v => (
                    <div key={v.id} className="p-3 border rounded-md bg-gray-50 flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedBulkIds.includes(v.id)} onChange={() => toggleSelectBulk(v.id)} className="w-5 h-5" />
                      </div>
                      <div className="w-20 h-12 rounded overflow-hidden bg-black flex items-center justify-center">
                        {v.thumbnail ? <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" /> : <div className="text-xs text-white px-2">No preview</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{v.title || v.fileName}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${v.privacy === 'public' ? 'bg-blue-100 text-blue-700' : v.privacy === 'unlisted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>{(v.privacy || 'unlisted').toString().toUpperCase()}</span>
                        </div>
                          <p className="text-xs text-gray-500">{v.size ? `${(v.size/(1024*1024)).toFixed(1)} MB` : '—'}</p>
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
                        {editingPreviewSrc ? (
                          editingPreviewSrc.startsWith('blob:') ? (
                            <video src={editingPreviewSrc} controls className="w-full h-56 object-cover bg-black" />
                          ) : (
                            // cloudUrl or thumbnail
                            editingPreviewSrc.endsWith('.jpg') || editingPreviewSrc.startsWith('data:') || editingPreviewSrc.includes('thumbnail') ? (
                              <img src={editingPreviewSrc} className="w-full h-56 object-cover" />
                            ) : (
                              <video src={editingPreviewSrc} controls className="w-full h-56 object-cover bg-black" />
                            )
                          )
                        ) : (
                          <div className="w-full h-56 flex items-center justify-center text-gray-400">No preview</div>
                        )}
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
                          <input value={editingBulkData.title} onChange={(e) => setEditingBulkData((s:any) => ({ ...s, title: e.target.value }))} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select value={editingBulkData.category} onChange={(e) => setEditingBulkData((s:any) => ({ ...s, category: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
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
                          <textarea value={editingBulkData.description} onChange={(e) => setEditingBulkData((s:any) => ({ ...s, description: e.target.value }))} rows={4} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                          <input value={editingBulkData.tags} onChange={(e) => setEditingBulkData((s:any) => ({ ...s, tags: e.target.value }))} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Made for kids</label>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2"><input type="radio" name="bulkKids" checked={editingBulkData.madeForKids === true} onChange={() => setEditingBulkData((s:any) => ({ ...s, madeForKids: true }))} /> <span className="text-sm">Yes</span></label>
                            <label className="inline-flex items-center gap-2"><input type="radio" name="bulkKids" checked={editingBulkData.madeForKids === false} onChange={() => setEditingBulkData((s:any) => ({ ...s, madeForKids: false }))} /> <span className="text-sm">No</span></label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Language</label>
                          <select value={editingBulkData.language} onChange={(e) => setEditingBulkData((s:any) => ({ ...s, language: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="hi">Hindi</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">License</label>
                          <select value={editingBulkData.license} onChange={(e) => setEditingBulkData((s:any) => ({ ...s, license: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                            <option value="standard">Standard YouTube License</option>
                            <option value="creative">Creative Commons</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium mb-1">Privacy</label>
                                  <select value={editingBulkData.privacy} onChange={(e) => setEditingBulkData((s:any) => ({ ...s, privacy: e.target.value }))} className="w-full px-3 py-2 border rounded-md mb-2">
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
                ;(async () => {
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
              }} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded">Add {bulkFiles.length > 0 ? `(${Math.min(bulkFiles.length,60)})` : ''} to Bulk List</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
