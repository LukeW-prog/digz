import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Runs as the signed-in user, so row level security applies.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component, which cannot set cookies.
            // Safe to ignore when proxy is refreshing sessions.
          }
        },
      },
    },
  )
}

/**
 * Admin client. Bypasses row level security, so it must never be used in
 * anything reachable by a browser without an explicit authorisation check
 * first. Used for writes the user must not be able to forge: blocklist hits,
 * outcome checks, blocked phones.
 */
export function createAdminClient() {
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      cookies: { getAll: () => [], setAll: () => {} },
    },
  )
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill it in. See stack.md.`,
    )
  }
  return value
}
