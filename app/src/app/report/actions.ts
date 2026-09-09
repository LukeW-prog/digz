'use server'

import { REPORT_REASON, type ReportReason } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

export type ReportState = {
  ok?: boolean
  error?: string
}

/**
 * Notice-and-action, per DSA Article 16.
 *
 * Anyone can report, including people without an account and without leaving
 * an email address. Requiring either would put friction in front of the safety
 * mechanism, which is the wrong trade.
 *
 * Reports are write-only for the public: the RLS policy allows insert and
 * nothing else, so nobody can read back what others have reported.
 */
export async function submitReport(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const reason = String(formData.get('reason') ?? '') as ReportReason
  if (!REPORT_REASON.includes(reason)) {
    return { error: 'Choose what is wrong with the listing.' }
  }

  const details = String(formData.get('details') ?? '').trim()
  const reporterEmail = String(formData.get('reporterEmail') ?? '').trim()
  const listingId = String(formData.get('listingId') ?? '').trim()

  if (details.length > 2000) {
    return { error: 'Please keep it under 2000 characters.' }
  }

  const supabase = await createClient()

  // Record who the report is about, not just which advert.
  //
  // `reports.listing_id` is `on delete set null`, so a deleted listing would
  // otherwise leave a report pointing at nothing — with no way to tell whose
  // it was, and "block the host" on the admin queue silently doing nothing.
  // The host is exactly what a scam report is about, so it is stored now
  // rather than resolved later from a row that may be gone.
  let hostId: string | null = null
  if (listingId) {
    const { data: listing } = await supabase
      .from('listings')
      .select('host_id')
      .eq('id', listingId)
      .maybeSingle()
    hostId = listing?.host_id ?? null
  }

  const { error } = await supabase.from('reports').insert({
    listing_id: listingId || null,
    host_id: hostId,
    reason,
    details: details || null,
    reporter_email: reporterEmail || null,
  })

  if (error) {
    return {
      error:
        'We could not save that. Please email us directly so it does not get lost.',
    }
  }

  return { ok: true }
}
