'use server'

import { revalidatePath } from 'next/cache'
import { currentAdmin } from '@/lib/admin'
import { sendEmail } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/server'
import { REPORT_DECISION, type ReportDecision } from '@/lib/types'

/**
 * Act on a report. DSA Article 16 notice-and-action.
 *
 * Two things the law actually requires, and both are enforced here rather
 * than left to whoever is on the queue that day:
 *
 * 1. A statement of reasons for every decision. The action refuses without
 *    one, so there is no path that records a decision with no explanation.
 * 2. Telling the reporter what happened, when they left an address.
 *
 * Runs as the service role, so `currentAdmin()` is checked first and the whole
 * function returns if it fails. A Server Action is reachable by direct POST,
 * so this is the only thing between a stranger and blocking every host.
 */
export async function decideReport(formData: FormData) {
  const admin = await currentAdmin()
  if (!admin) return

  const reportId = String(formData.get('reportId') ?? '')
  const decision = String(formData.get('decision') ?? '') as ReportDecision
  const reason = String(formData.get('decisionReason') ?? '').trim()

  if (!reportId) return
  if (!REPORT_DECISION.includes(decision)) return

  // No silent decisions. The reporter and the host are both entitled to know
  // why, and a blank reason makes the audit trail worthless.
  if (reason.length < 3) return

  const supabase = createAdminClient()

  const { data: report } = await supabase
    .from('reports')
    .select('id, listing_id, reporter_email, reviewed_at')
    .eq('id', reportId)
    .single()

  if (!report || report.reviewed_at) return

  // The report stores the listing; the host comes from it. Resolved here
  // rather than trusted from the form, which the browser controls.
  let hostId: string | null = null
  if (report.listing_id) {
    const { data: listing } = await supabase
      .from('listings')
      .select('host_id')
      .eq('id', report.listing_id)
      .single()
    hostId = listing?.host_id ?? null
  }

  const now = new Date().toISOString()

  if (decision === 'removed' && report.listing_id) {
    await supabase
      .from('listings')
      .update({
        status: 'removed',
        removed_at: now,
        removed_reason: `Report ${report.id}: ${reason}`,
      })
      .eq('id', report.listing_id)
  }

  if (decision === 'host_blocked' && hostId) {
    await supabase.from('hosts').update({ blocked_at: now }).eq('id', hostId)

    // Every listing goes, not just the reported one. A host blocked for a
    // scam does not get to keep their other adverts up.
    await supabase
      .from('listings')
      .update({
        status: 'removed',
        removed_at: now,
        removed_reason: `Host blocked, report ${report.id}: ${reason}`,
      })
      .eq('host_id', hostId)
      .in('status', ['live', 'stale', 'expired'])

    // The phone is what stops them simply signing up again, since a verified
    // Irish mobile is the one thing a new account cannot cheaply replace.
    const { data: host } = await supabase
      .from('hosts')
      .select('phone')
      .eq('id', hostId)
      .single()

    if (host?.phone) {
      await supabase
        .from('blocked_phones')
        .upsert(
          { phone: host.phone, reason: `Report ${report.id}: ${reason}` },
          { onConflict: 'phone', ignoreDuplicates: true },
        )
    }
  }

  await supabase
    .from('reports')
    .update({ decision, decision_reason: reason, reviewed_at: now })
    .eq('id', reportId)

  if (report.reporter_email) {
    await sendEmail({
      to: report.reporter_email,
      subject: 'About the listing you reported',
      text: [
        'Hello,',
        '',
        'You reported a listing on Digs. Here is what we did and why.',
        '',
        `Decision: ${DECISION_TEXT[decision]}`,
        `Reason: ${reason}`,
        '',
        'If you think this is wrong, reply to this email and it will be looked at again by a person.',
        '',
        'Digs',
      ].join('\n'),
    })
  }

  revalidatePath('/admin/reports')
}

const DECISION_TEXT: Record<ReportDecision, string> = {
  removed: 'the listing has been taken down',
  kept: 'the listing stays up',
  host_blocked: 'the host has been blocked and their listings taken down',
}
