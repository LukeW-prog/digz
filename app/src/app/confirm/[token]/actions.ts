'use server'

import { revalidatePath } from 'next/cache'
import { FRESHNESS } from '@/lib/constants'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Mark a room still available, from the reminder email, with no sign-in.
 *
 * The token is the whole authorisation, and it grants exactly this one thing
 * for one listing. See 0005_confirm_tokens.sql for why that narrowness is the
 * safety property rather than a limitation.
 *
 * Admin client because there is no session: the host is identified by holding
 * a link we emailed them, not by being logged in.
 */
export async function confirmByToken(formData: FormData) {
  const token = String(formData.get('token') ?? '')
  if (!token) return

  const supabase = createAdminClient()

  const now = new Date()
  const expires = new Date(
    now.getTime() + FRESHNESS.expiresAfterDays * 86_400_000,
  )

  // Only a listing that is still showing can be confirmed. A removed listing
  // must not be brought back to life by an old link in someone's inbox — the
  // host took it down deliberately, or an admin did after a report.
  await supabase
    .from('listings')
    .update({
      last_confirmed_at: now.toISOString(),
      expires_at: expires.toISOString(),
      status: 'live',
    })
    .eq('confirm_token', token)
    .in('status', ['live', 'stale'])

  revalidatePath(`/confirm/${token}`)
  revalidatePath('/')
}
