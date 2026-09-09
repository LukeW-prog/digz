'use server'

import { revalidatePath } from 'next/cache'
import { currentAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Unblock a host.
 *
 * Blocking was one click from the reports queue and there was no way back, so
 * a wrong call — or a right call that a host successfully appealed, which the
 * DSA gives them — could only be undone with SQL. A moderation tool without an
 * undo makes moderators slower and more cautious than the job needs.
 *
 * It does not put their listings back. Those were taken down with a stated
 * reason, and republishing an advert nobody has looked at again would undo a
 * separate decision. The host can post again; that path already screens the
 * wording and re-checks the address.
 */
export async function unblockHost(formData: FormData) {
  const admin = await currentAdmin()
  if (!admin) return

  const hostId = String(formData.get('hostId') ?? '')
  const note = String(formData.get('note') ?? '').trim()
  if (!hostId || note.length < 3) return

  const supabase = createAdminClient()

  const { data: host } = await supabase
    .from('hosts')
    .select('id, phone, blocked_at')
    .eq('id', hostId)
    .single()

  if (!host?.blocked_at) return

  await supabase
    .from('hosts')
    .update({ blocked_at: null })
    .eq('id', hostId)

  // The phone block is what actually stops them signing up again, so leaving
  // it in place would make the unblock look like it worked and do nothing.
  if (host.phone) {
    await supabase.from('blocked_phones').delete().eq('phone', host.phone)
  }

  revalidatePath(`/admin/hosts/${hostId}`)
  revalidatePath('/admin/hosts')
}
