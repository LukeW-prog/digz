import { NextResponse } from 'next/server'
import { OUTCOME } from '@/lib/constants'
import { sendEmail } from '@/lib/email'
import { outcomeEmail } from '@/lib/outcomes'
import { createAdminClient } from '@/lib/supabase/server'
import { ROOM_TYPE_LABEL, type RoomType } from '@/lib/types'

/**
 * Ask students, two weeks after they got a host's number, whether they found
 * somewhere.
 *
 * This is the measurement half of the success criteria. Contacts are counted
 * already and are close to meaningless on their own; this is the only thing
 * that says whether the site housed anyone. See lib/outcomes.ts.
 *
 * Runs as the service role: it reads student email addresses, which no policy
 * exposes to anyone else. Authorisation is the same shared secret as the
 * freshness sweep and is checked before anything is read.
 */

export const maxDuration = 60

/** Kept well inside maxDuration. The rest are picked up by the next run. */
const BATCH = 200

type Reveal = {
  id: string
  created_at: string
  students: { email: string } | null
  listings: { area_label: string; room_type: RoomType } | null
  outcome_checks: { id: string }[]
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 503 })
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  const now = new Date()
  const cutoff = new Date(
    now.getTime() - OUTCOME.askAfterDays * 86_400_000,
  ).toISOString()

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('contact_reveals')
    .select(
      'id, created_at, students (email), listings (area_label, room_type), outcome_checks (id)',
    )
    .lte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(BATCH)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Already asked. The unique index on reveal_id would refuse the insert
  // anyway; filtering here keeps a normal run from generating constraint
  // errors for every reveal that has ever been asked about.
  const due = ((data ?? []) as unknown as Reveal[]).filter(
    (reveal) => reveal.outcome_checks.length === 0,
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  let asked = 0
  let failed = 0
  let skipped = 0

  for (const reveal of due) {
    if (!reveal.students?.email || !reveal.listings) {
      skipped++
      continue
    }

    // The row goes in first so a doubled run cannot ask twice: the second
    // attempt hits the unique index instead of sending a second email.
    const { data: check, error: insertError } = await supabase
      .from('outcome_checks')
      .insert({ reveal_id: reveal.id, asked_at: now.toISOString() })
      .select('token')
      .single()

    if (insertError || !check) {
      failed++
      continue
    }

    const { subject, text } = outcomeEmail({
      roomLabel: ROOM_TYPE_LABEL[reveal.listings.room_type],
      areaLabel: reveal.listings.area_label,
      siteUrl,
      token: check.token as string,
    })

    const result = await sendEmail({
      to: reveal.students.email,
      subject,
      text,
    })

    if (result.ok) {
      asked++
    } else {
      // Undo the ask so the next run retries. Leaving the row would mean the
      // student is recorded as asked and never actually hears from us, which
      // is the one outcome that quietly corrupts the metric.
      await supabase.from('outcome_checks').delete().eq('reveal_id', reveal.id)
      failed++
    }
  }

  return NextResponse.json({ due: due.length, asked, failed, skipped })
}
