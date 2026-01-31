"use client"

import { useState } from 'react'
import { Edit, Trash2, Calendar, Flame, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ChallengeTrackingCardProps {
  latestVideoTitle: string
  latestVideoDate: string
  latestVideoViews: number
  nextUploadDate: string
  daysUntilNext: number
  uploadProgress: number
  videosUploaded: number
  onEdit: () => void
  onDelete: () => void
  challengeTitle?: string
}

export default function ChallengeTrackingCard({
  latestVideoTitle,
  latestVideoDate,
  latestVideoViews,
  nextUploadDate,
  daysUntilNext,
  uploadProgress,
  videosUploaded,
  onEdit,
  onDelete,
  challengeTitle = "Challenge"
}: ChallengeTrackingCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div className="rounded-2xl bg-slate-800 border border-slate-700 shadow-lg p-4 sm:p-6 mb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Challenge Tracking</h2>
            </div>
            <p className="text-slate-400 text-sm">Keep your upload streak alive and reach your goals</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Edit challenge"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors"
              title="Delete challenge"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Latest Upload */}
        <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Latest Upload</span>
            <span></span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{latestVideoTitle}</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-emerald-400">📈</span>
              <span>{latestVideoViews.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{latestVideoDate}</span>
            </div>
          </div>
        </div>

        {/* Next Upload */}
        <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Next Upload</span>
              <p className="text-xl font-bold text-white mt-1">{nextUploadDate}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-cyan-400">{daysUntilNext}</div>
              <div className="text-xs text-slate-400">Days until</div>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Upload Progress</span>
            <span className="text-sm font-bold text-cyan-400">{uploadProgress}% Complete</span>
          </div>
          <div className="w-full bg-slate-600 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="h-2 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-400">
            {videosUploaded} videos uploaded
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Delete Challenge?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{challengeTitle}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
            <p className="text-red-300 text-sm">
              <strong>Warning:</strong> All data associated with this challenge will be permanently deleted.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-slate-600"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
            >
              Delete Challenge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
        </div>
        <div className="text-xs text-slate-400">{videosUploaded} videos uploaded this month</div>
      </div>


    </div>
  )
}
