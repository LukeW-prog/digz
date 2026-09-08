'use server'

import { revalidatePath } from 'next/cache'
import { FRESHNESS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

/**
 * The weekly still-available confirmation, and taking a listing down.
 *
 * The confirmation is the freshness mechanic from avenues.md. No Irish site
 * shows a posting date at all, so "confirmed yesterday" is doing real work,
 * and it only stays true if this is one click.
 */

async function requireOwnedListing(listingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('listings')
    .select('id, host_id')
    .eq('id', listingId)
    .eq('host_id', user.id)
    .maybeSingle()

  return data ? { supabase, listing: data } : null
}

export async function confirmStillAvailable(formData: FormData) {
  const id = String(formData.get('listingId') ?? '')
  const owned = await requireOwnedListing(id)
  if (!owned) return

  const now = new Date()
  const expires = new Date(
    now.getTime() + FRESHNESS.expiresAfterDays * 86_400_000,
  )

  await owned.supabase
    .from('listings')
    .update({
      last_confirmed_at: now.toISOString(),
      expires_at: expires.toISOString(),
      // Confirming brings a greyed-out listing back to full visibility.
      status: 'live',
    })
    .eq('id', id)

  revalidatePath('/host/listings')
  revalidatePath('/')
}

export async function removeListing(formData: FormData) {
  const id = String(formData.get('listingId') ?? '')
  const reason = String(formData.get('reason') ?? '').trim()
  const owned = await requireOwnedListing(id)
  if (!owned) return

  await owned.supabase
    .from('listings')
    .update({
      status: 'removed',
      removed_at: new Date().toISOString(),
      removed_reason: reason || 'Taken down by the host',
    })
    .eq('id', id)

  revalidatePath('/host/listings')
  revalidatePath('/')
}
