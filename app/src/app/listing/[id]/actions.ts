'use server'

import { SAFETY_NOTICE_VERSION } from '@/lib/constants'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export type RevealState = {
  contact?: { displayName: string; phone: string; email: string }
  message?: string
  needsSignIn?: boolean
}

/**
 * Reveal a host's contact details to a student.
 *
 * This is the moment the student leaves our care, so it is the moment the
 * safety notice has to land. Accepting it is recorded with the version of the
 * wording that was shown, so we can always say exactly what someone saw.
 *
 * The reveal row is also the "contacted a host" number in the success
 * criteria, and it is what the two-week outcome email hangs off. Without it
 * the January kill gate has no data. See mvp.md.
 */
export async function revealContact(
  _prev: RevealState,
  formData: FormData,
): Promise<RevealState> {
  const listingId = String(formData.get('listingId') ?? '')
  if (!listingId) return { message: 'Something went wrong. Refresh and retry.' }

  if (formData.get('accepted') !== 'on') {
    return { message: 'Tick the box to confirm you have read the notice.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      needsSignIn: true,
      message:
        'Create a free account to see the host&rsquo;s contact details. It takes an email address and nothing else.',
    }
  }

  const { data: student } = await supabase
    .from('students')
    .select('id, email_verified_at')
    .eq('id', user.id)
    .single()

  if (!student?.email_verified_at) {
    return { message: 'Confirm your email address first. Check your inbox.' }
  }

  // The listing must still be visible. A removed listing must never leak a
  // phone number, even to someone who had the page open.
  const { data: listing } = await supabase
    .from('listings')
    .select('id, host_id, status')
    .eq('id', listingId)
    .in('status', ['live', 'stale'])
    .single()

  if (!listing) {
    return { message: 'This listing is no longer available.' }
  }

  // Admin client: host contact details are not readable under the public
  // policies, which is the point. We hand them over only after this check.
  const admin = createAdminClient()
  const { data: host } = await admin
    .from('hosts')
    .select('display_name, phone, email')
    .eq('id', listing.host_id)
    .single()

  if (!host) return { message: 'This listing is no longer available.' }

  // Idempotent: re-revealing does not create a second row, so the contact
  // count stays honest.
  await admin.from('contact_reveals').upsert(
    {
      listing_id: listingId,
      student_id: student.id,
      safety_notice_version: SAFETY_NOTICE_VERSION,
    },
    { onConflict: 'listing_id,student_id', ignoreDuplicates: true },
  )

  return {
    contact: {
      displayName: host.display_name,
      phone: host.phone,
      email: host.email,
    },
  }
}
