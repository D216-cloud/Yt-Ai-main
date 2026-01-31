import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// DELETE /api/challenges/:id - Delete a challenge
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to delete a challenge' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const challengeId = params.id

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 })
    }

    // Verify the challenge belongs to the user
    const { data: challenge, error: fetchError } = await supabase
      .from('user_challenges')
      .select('id, user_id, status')
      .eq('id', challengeId)
      .single()

    if (fetchError || !challenge) {
      console.error('❌ Challenge fetch error:', fetchError)
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    if (challenge.user_id !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only delete your own challenges' },
        { status: 403 }
      )
    }

    // Delete the challenge (cascades will delete uploads, notifications, etc)
    const { error: deleteError } = await supabase
      .from('user_challenges')
      .delete()
      .eq('id', challengeId)

    if (deleteError) {
      console.error('❌ Challenge delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message || 'Failed to delete challenge' }, { status: 500 })
    }

    console.log('✅ Challenge deleted successfully:', challengeId)

    // Update user stats (reduce active challenges count)
    const { data: updatedStats } = await supabase
      .from('user_challenge_stats')
      .select('active_challenges')
      .eq('user_id', auth.userId)
      .single()

    return NextResponse.json({
      message: 'Challenge deleted successfully',
      activeChallengeCount: updatedStats?.active_challenges || 0
    })
  } catch (err: any) {
    console.error('challenge DELETE unexpected', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
