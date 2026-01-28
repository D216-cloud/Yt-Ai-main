"use client"

import React, { useState } from 'react'
import { X, Calendar, CheckCircle, AlertCircle, Upload, Zap } from 'lucide-react'

interface ScheduledVideo {
  date: string
  uploaded: boolean
  title?: string
  notes?: string
  metrics?: {
    views?: number
    likes?: number
    comments?: number
  }
}

interface ChallengeVideosModalProps {
  isOpen: boolean
  onClose: () => void
  videoSchedule: ScheduledVideo[]
  totalVideos: number
  uploadedCount: number
  nextUploadDate?: string
  challengeStartDate?: string
  challengeEndDate?: string
}

export default function ChallengeVideosModal({
  isOpen,
  onClose,
  videoSchedule,
  totalVideos,
  uploadedCount,
  nextUploadDate,
  challengeStartDate,
  challengeEndDate
}: ChallengeVideosModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const uploadedVideos = videoSchedule.filter(v => v.uploaded).length
  const progressPercentage = totalVideos > 0 ? Math.round((uploadedVideos / totalVideos) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-start justify-between bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                Challenge Videos Schedule
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Track all your scheduled uploads and progress
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto">
            {/* Progress Summary */}
            <div className="bg-slate-700/40 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{uploadedCount}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Uploaded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{totalVideos - uploadedCount}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">{progressPercentage}%</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{totalVideos}</div>
                  <div className="text-xs text-slate-400 font-medium mt-1">Total</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-600/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 h-3 rounded-full transition-all duration-500 shadow-lg shadow-cyan-400/30"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Timeline Info */}
            {(challengeStartDate || challengeEndDate || nextUploadDate) && (
              <div className="bg-slate-700/40 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {challengeStartDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Started</p>
                        <p className="text-sm text-white font-semibold">{new Date(challengeStartDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {nextUploadDate && (
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Next Upload</p>
                        <p className="text-sm text-white font-semibold">{new Date(nextUploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {challengeEndDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Ends</p>
                        <p className="text-sm text-white font-semibold">{new Date(challengeEndDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Videos List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Upload Schedule</h3>
              
              {videoSchedule.length > 0 ? (
                <div className="space-y-2">
                  {videoSchedule.map((video, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border transition-all duration-200 cursor-pointer ${
                        video.uploaded
                          ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                          : 'bg-slate-700/40 border-slate-600/50 hover:border-slate-500/70'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {video.uploaded ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${video.uploaded ? 'text-white' : 'text-slate-300'}`}>
                              {video.title || `Video ${index + 1}`}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(video.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          video.uploaded
                            ? 'bg-emerald-500/30 text-emerald-200'
                            : 'bg-slate-600/50 text-slate-300'
                        }`}>
                          {video.uploaded ? 'Done' : 'Pending'}
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {expandedIndex === index && (
                        <div className="px-4 pb-4 border-t border-current border-opacity-10">
                          {video.notes && (
                            <div className="mt-3">
                              <p className="text-xs text-slate-400 font-medium mb-1">Notes</p>
                              <p className="text-sm text-slate-300 bg-slate-900/50 rounded p-2">{video.notes}</p>
                            </div>
                          )}
                          
                          {video.metrics && (
                            <div className="mt-3">
                              <p className="text-xs text-slate-400 font-medium mb-2">Performance</p>
                              <div className="grid grid-cols-3 gap-2">
                                {video.metrics.views !== undefined && (
                                  <div className="bg-slate-900/50 rounded p-2 text-center">
                                    <p className="text-xs text-slate-400">Views</p>
                                    <p className="text-sm font-bold text-white">{video.metrics.views.toLocaleString()}</p>
                                  </div>
                                )}
                                {video.metrics.likes !== undefined && (
                                  <div className="bg-slate-900/50 rounded p-2 text-center">
                                    <p className="text-xs text-slate-400">Likes</p>
                                    <p className="text-sm font-bold text-white">{video.metrics.likes.toLocaleString()}</p>
                                  </div>
                                )}
                                {video.metrics.comments !== undefined && (
                                  <div className="bg-slate-900/50 rounded p-2 text-center">
                                    <p className="text-xs text-slate-400">Comments</p>
                                    <p className="text-sm font-bold text-white">{video.metrics.comments.toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No videos scheduled yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900/50 border-t border-slate-700 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
