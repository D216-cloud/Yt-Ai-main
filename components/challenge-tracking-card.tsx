"use client"

import { Edit, Trash2, Calendar, Flame } from 'lucide-react'

interface ChallengeTrackingCardProps {
  latestVideoTitle: string
  latestVideoDate: string
  latestVideoViews: number
  nextUploadDate: string
  daysUntilNext: number
  dayStreak: number
  uploadProgress: number
  totalVideosRequired: number
  videosUploaded: number
  onEdit: () => void
  onDelete: () => void
}

export default function ChallengeTrackingCard({
  latestVideoTitle,
  latestVideoDate,
  latestVideoViews,
  nextUploadDate,
  daysUntilNext,
  dayStreak,
  uploadProgress,
  totalVideosRequired,
  videosUploaded,
  onEdit,
  onDelete
}: ChallengeTrackingCardProps) {
  return (
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
            onClick={onDelete}
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
      <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-4 mb-4">
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
        <div className="text-xs text-slate-400">{videosUploaded} of {totalVideosRequired} videos uploaded this month</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-700/70 border border-slate-600 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-3xl font-bold text-white">{dayStreak}</span>
          </div>
          <div className="text-xs text-slate-400">Day Streak</div>
          <div className="text-xs text-orange-400 font-semibold mt-1">🔥 Keep it going!</div>
        </div>

        <div className="rounded-lg bg-slate-700/70 border border-slate-600 p-4 text-center">
          <div className="mb-2">
            <span className="text-3xl font-bold text-white">{totalVideosRequired - videosUploaded}</span>
          </div>
          <div className="text-xs text-slate-400">Videos Remaining</div>
          <div className="text-xs text-cyan-400 font-semibold mt-1">in challenge</div>
        </div>
      </div>
    </div>
  )
}
