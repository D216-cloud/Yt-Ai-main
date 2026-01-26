import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createServerSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function resolveUser() {
  const session = await getServerSession()
  if (!session?.user?.email) return null
  const supabase = createServerSupabaseClient()
  const { data: userRow } = await supabase.from('users').select('id,email').eq('email', session.user.email).limit(1).single()
  if (!userRow?.id) return null
  return { supabase, userRow }
}

export async function GET(req: Request) {
  try {
    const resolved = await resolveUser()
    if (!resolved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { supabase, userRow } = resolved

    const { data, error } = await supabase.from('user_challenges').select('*').eq('user_id', userRow.id).eq('status', 'active').limit(1).maybeSingle()
    if (error) {
      console.error('user-challenge GET error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
    return NextResponse.json({ challenge: data || null })
  } catch (err: any) {
    console.error('user-challenge GET unexpected', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const resolved = await resolveUser()
    if (!resolved) {
      console.error('user-challenge POST unauthorized: no session')
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }
    const { supabase, userRow } = resolved

    const body = await req.json()
    const config = body.config || {}
    const progress = Array.isArray(body.progress) ? body.progress : []
    const challengeId = body.challengeId || 'creator-challenge'

    // Extract explicit columns from config for easier queries and integrity
    const durationMonths = Number(config?.durationMonths || config?.duration_months || null)
    const cadenceEveryDays = Number(config?.cadenceEveryDays || config?.cadence_every_days || null)
    const videosPerCadence = Number(config?.videosPerCadence || config?.videos_per_cadence || null)
    const videoType = (config?.videoType || config?.video_type || null)
    const scheduledMeta = body.scheduledMeta || body.scheduled_meta || (Array.isArray(progress) ? null : null)

    // Build config with all fields properly named
    const fullConfig = {
      durationMonths: !isNaN(durationMonths) ? durationMonths : (config?.durationMonths || config?.duration_months),
      cadenceEveryDays: !isNaN(cadenceEveryDays) ? cadenceEveryDays : (config?.cadenceEveryDays || config?.cadence_every_days),
      videosPerCadence: !isNaN(videosPerCadence) ? videosPerCadence : (config?.videosPerCadence || config?.videos_per_cadence),
      videoType: videoType || config?.videoType || config?.video_type,
    }

    const payload: any = {
      user_id: userRow.id,
      challenge_id: challengeId,
      started_at: new Date().toISOString(),
      config: fullConfig,
      progress: progress.length > 0 ? progress : [],
      status: 'active',
      updated_at: new Date().toISOString(),
    }

    // Add explicit columns for easier queries
    if (!isNaN(durationMonths)) payload.duration_months = durationMonths
    if (!isNaN(cadenceEveryDays)) payload.cadence_every_days = cadenceEveryDays
    if (!isNaN(videosPerCadence)) payload.videos_per_cadence = videosPerCadence
    if (videoType) payload.video_type = videoType
    if (scheduledMeta) payload.scheduled_meta = scheduledMeta

    console.log('user-challenge POST payload:', { userId: userRow.id, challengeId, config: fullConfig, progressCount: progress.length })

    let data, error, res
    try {
      res = await supabase
        .from('user_challenges')
        .upsert(payload, { onConflict: 'user_id,challenge_id' })
        .select()
        .maybeSingle()
      data = res.data
      error = res.error
      console.log('supabase upsert result', { success: !error, id: data?.id })
    } catch (e: any) {
      console.error('user-challenge POST exception', e)
      return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
    }

    if (error) {
      console.error('user-challenge POST error', error)
      const msg = error?.message || String(error)
      if (msg.includes('does not exist') || msg.includes('42P01')) {
        return NextResponse.json({ error: 'Missing table user_challenges. Run migrations to create it.' }, { status: 500 })
      }
      if (msg.includes('permission') || msg.includes('RLS')) {
        return NextResponse.json({ error: 'Permission error: RLS may be blocking writes. Check RLS policies and Supabase Auth.' }, { status: 500 })
      }
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // Return created/updated challenge
    return NextResponse.json({ 
      success: true, 
      id: data?.id || null, 
      challenge: data || payload
    })
  } catch (err: any) {
    console.error('user-challenge POST unexpected', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const resolved = await resolveUser()
    if (!resolved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { supabase, userRow } = resolved

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const body = await req.json()

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const updates: any = { updated_at: new Date().toISOString() }
    
    // Update config and progress columns
    if (body.config) updates.config = body.config
    if (body.progress) updates.progress = body.progress
    if (body.status) updates.status = body.status

    // Update explicit columns for structured queries
    if (typeof body.durationMonths !== 'undefined') updates.duration_months = Number(body.durationMonths)
    if (typeof body.cadenceEveryDays !== 'undefined') updates.cadence_every_days = Number(body.cadenceEveryDays)
    if (typeof body.videosPerCadence !== 'undefined') updates.videos_per_cadence = Number(body.videosPerCadence)
    if (typeof body.videoType !== 'undefined') updates.video_type = body.videoType
    if (typeof body.scheduledMeta !== 'undefined') updates.scheduled_meta = body.scheduledMeta

    // Ensure config has all the fields when updating
    if (body.config && typeof updates.config === 'object') {
      updates.config = {
        ...updates.config,
        durationMonths: updates.duration_months || updates.config.durationMonths,
        cadenceEveryDays: updates.cadence_every_days || updates.config.cadenceEveryDays,
        videosPerCadence: updates.videos_per_cadence || updates.config.videosPerCadence,
        videoType: updates.video_type || updates.config.videoType,
      }
    }

    const { data, error } = await supabase
      .from('user_challenges')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userRow.id)
      .select()
      .maybeSingle()
    
    if (error) {
      console.error('user-challenge PATCH error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, challenge: data })
  } catch (err: any) {
    console.error('user-challenge PATCH unexpected', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const resolved = await resolveUser()
    if (!resolved) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { supabase, userRow } = resolved

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data, error } = await supabase.from('user_challenges').update({ status: 'deleted', updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userRow.id).select().maybeSingle()
    if (error) {
      console.error('user-challenge DELETE error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('user-challenge DELETE unexpected', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}