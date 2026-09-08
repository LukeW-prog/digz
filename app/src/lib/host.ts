import { createClient } from './supabase/server'

export type HostStatus =
  /** Supabase is not wired up. Local development only. */
  | { state: 'unconfigured' }
  | { state: 'signed_out' }
  | { state: 'blocked' }
  | { state: 'needs_phone'; id: string }
  | { state: 'ready'; id: string; phone: string }

/**
 * Where a host is in the sequence: signed in, phone verified, allowed to post.
 *
 * Pages use this to route someone to the right next step. Server Actions must
 * still check for themselves, because an action is reachable by direct POST
 * whatever the page decided to render.
 */
export async function getHostStatus(): Promise<HostStatus> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { state: 'unconfigured' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { state: 'signed_out' }

  const { data: host } = await supabase
    .from('hosts')
    .select('id, phone, phone_verified_at, blocked_at')
    .eq('id', user.id)
    .maybeSingle()

  if (!host) return { state: 'signed_out' }
  if (host.blocked_at) return { state: 'blocked' }
  if (!host.phone_verified_at) return { state: 'needs_phone', id: host.id }

  return { state: 'ready', id: host.id, phone: host.phone }
}
