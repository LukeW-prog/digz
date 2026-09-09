import { NextResponse } from 'next/server'
import { FRESHNESS } from '@/lib/constants'
import { sendEmail } from '@/lib/email'
import { daysBetween, promptEmail, sweepAction, type SweepRow } from '@/lib/freshness'
import { createAdminClient } from '@/lib/supabase/server'
import { ROOM_TYPE_LABEL, type RoomType } from '@/lib/types'

/**
 * The nightly freshness sweep.
 *
 * Ages listings that have gone quiet and emails their hosts. This is the other
 * half of the confirm button on /host/listings: without it nothing ever asks a
 * host to press it and nothing ever greys out, so every listing reads as fresh
 * forever and "confirmed yesterday" means nothing.
 *
 * Idempotent on purpose. It can run twice in an hour or once after a day of
 * downtime and the outcome is the same, because every decision is taken from
 * timestamps on the row rather than from the fact the job ran. See
 * lib/freshness.ts for the rules and 0003_freshness_prompts.sql for the column
 * that makes catching up possible.
 *
 * Scheduled in vercel.json. Runs as the service role, so authorisation is the
 * shared secret below and nothing else.
 */

/** Long enough for a few hundred listings and their emails. */
export const maxDuration = 60

type Row = SweepRow & {
  area_label: string
  room_type: RoomType
  hosts: { display_name: string; email: string } | null
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 503 })
  }

  // Vercel Cron sends this header. A plain GET from anywhere else gets nothing:
  // the job runs as the service role and writes to every host's listings.
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  const now = new Date()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('listings')
    .select(
      'id, status, last_confirmed_at, last_prompted_at, area_label, room_type, hosts (display_name, email)',
    )
    .in('status', ['live', 'stale'])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as unknown as Row[]
  const actions = rows
    .map((row) => ({ row, action: sweepAction(row, now) }))
    .filter((entry) => entry.action !== null)

  const expired = actions.filter((e) => e.action!.nextStatus === 'expired')
  const staled = actions.filter((e) => e.action!.nextStatus === 'stale')
  const prompts = actions.filter((e) => e.action!.prompt)

  // Status changes go in two statements rather than one per listing.
  if (expired.length > 0) {
    await supabase
      .from('listings')
      .update({ status: 'expired' })
      .in('id', expired.map((e) => e.row.id))
  }

  if (staled.length > 0) {
    await supabase
      .from('listings')
      .update({ status: 'stale' })
      .in('id', staled.map((e) => e.row.id))
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const sent: string[] = []
  const failed: string[] = []

  for (const { row, action } of prompts) {
    if (!row.hosts?.email) {
      failed.push(row.id)
      continue
    }

    const days = daysBetween(row.last_confirmed_at, now)
    const { subject, text } = promptEmail({
      displayName: row.hosts.display_name,
      areaLabel: row.area_label,
      roomLabel: ROOM_TYPE_LABEL[row.room_type],
      daysSinceConfirmed: days,
      stale: days >= FRESHNESS.staleAfterDays || action!.nextStatus === 'stale',
      siteUrl,
    })

    const result = await sendEmail({ to: row.hosts.email, subject, text })
    if (result.ok) sent.push(row.id)
    else failed.push(row.id)
  }

  // Only listings that were actually emailed get their clock reset. A send
  // that failed should be retried on the next run, not silently swallowed.
  if (sent.length > 0) {
    await supabase
      .from('listings')
      .update({ last_prompted_at: now.toISOString() })
      .in('id', sent)
  }

  return NextResponse.json({
    checked: rows.length,
    expired: expired.length,
    staled: staled.length,
    emailed: sent.length,
    emailFailures: failed.length,
  })
}
