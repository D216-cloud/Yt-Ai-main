/**
 * EXAMPLE: How to refactor challenge/page.tsx with proper API patterns
 * Copy this pattern to your actual page.tsx
 */

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost } from '@/lib/api'

interface Challenge {
  id: string
  challenge_title: string
  status: 'active' | 'completed'
  progress?: any
  // ... other fields
}

interface ChallengeStats {
  total_challenges: number
  completed_challenges: number
  active_challenges: number
  total_points: number
  // ... other fields
}

export default function ChallengePage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  // State
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([])
  const [userStats, setUserStats] = useState<ChallengeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // Auth check
  useEffect(() => {
    if (sessionStatus === 'loading') return

    if (sessionStatus !== 'authenticated') {
      router.push('/signup')
      return
    }

    // Load data only when authenticated
    loadData()
  }, [sessionStatus, router])

  // Load all challenges
  const loadAllChallenges = async () => {
    try {
      const { data, error, status } = await apiGet<{ challenges: Challenge[] }>(
        '/api/challenges?includeUploads=true'
      )

      if (error) {
        console.error(`Failed to load challenges (${status}): ${error}`)
        // Show toast/error message to user
        return
      }

      setAllChallenges(data?.challenges || [])
    } catch (error) {
      console.error('Unexpected error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load user statistics
  const loadUserStats = async () => {
    try {
      const { data, error, status } = await apiGet<{ stats: ChallengeStats }>(
        '/api/challenges/stats'
      )

      if (error) {
        console.error(`Failed to load stats (${status}): ${error}`)
        return
      }

      setUserStats(data?.stats || null)
    } catch (error) {
      console.error('Unexpected error loading stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  // Combined data loading
  const loadData = async () => {
    setLoading(true)
    setStatsLoading(true)

    // Run both in parallel
    await Promise.all([
      loadAllChallenges(),
      loadUserStats()
    ])
  }

  // Create new challenge
  const handleCreateChallenge = async (config: any) => {
    try {
      const { data, error, status } = await apiPost<{ challenge: Challenge }>(
        '/api/challenges',
        config
      )

      if (error) {
        console.error(`Failed to create challenge (${status}): ${error}`)
        // Show error toast
        return
      }

      // Success - reload challenges
      await loadAllChallenges()
      // Show success toast
    } catch (error) {
      console.error('Unexpected error creating challenge:', error)
    }
  }

  // Loading state
  if (sessionStatus === 'loading') {
    return <div className="p-4">Authenticating...</div>
  }

  // Not authenticated
  if (sessionStatus !== 'authenticated') {
    return null // Router will redirect
  }

  // Render page
  return (
    <div className="container py-8">
      {/* User Stats Section */}
      <div className="mb-8">
        {statsLoading ? (
          <div>Loading stats...</div>
        ) : userStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <p className="text-gray-600">Total Challenges</p>
              <p className="text-2xl font-bold">{userStats.total_challenges}</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-gray-600">Active</p>
              <p className="text-2xl font-bold">{userStats.active_challenges}</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{userStats.completed_challenges}</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="text-gray-600">Total Points</p>
              <p className="text-2xl font-bold">{userStats.total_points}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Challenges Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Challenges</h2>
        {loading ? (
          <div>Loading challenges...</div>
        ) : allChallenges.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No challenges yet</p>
            <button
              onClick={() => handleCreateChallenge({})}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Your First Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {challenge.challenge_title}
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Status:{' '}
                    <span
                      className={`font-semibold ${
                        challenge.status === 'active'
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {challenge.status}
                    </span>
                  </p>
                </div>
                {challenge.progress && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${challenge.progress.percentage || 0}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {challenge.progress.percentage || 0}% complete
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    // Navigate to challenge details
                  }}
                  className="w-full px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
