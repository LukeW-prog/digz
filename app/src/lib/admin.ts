import { createClient } from './supabase/server'

/**
 * Who may see the admin pages.
 *
 * An env var rather than a database role, because at MVP there is one operator
 * and a role table would be a permissions system nobody administers. The list
 * is read on the server only.
 *
 * The consequence to be aware of: revoking access means a redeploy. That is
 * the right trade while the list is one person, and the wrong one the moment
 * it is not. Move this to a table before the second admin.
 */

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const allowed = adminEmails()
  // An empty list must never mean "everyone", which is what a bare
  // `includes` on an unset env var would quietly allow in production.
  if (allowed.length === 0) return false
  return allowed.includes(email.toLowerCase())
}

/**
 * The signed-in admin, or null.
 *
 * Every admin page and action calls this first. It uses the session client,
 * not the service role, so identity comes from a verified session rather than
 * anything the request can claim.
 */
export async function currentAdmin(): Promise<{ id: string; email: string } | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email || !isAdminEmail(user.email)) return null
    return { id: user.id, email: user.email }
  } catch {
    // A missing or broken Supabase config throws in createClient. An admin
    // page must answer that by refusing, not by returning a 500: a
    // misconfigured deploy should lock everyone out, and a stack trace on
    // /admin also confirms to a stranger that there is an admin area here.
    return null
  }
}
