import type { NextConfig } from 'next'

/**
 * Listing photos are served from the project's Supabase Storage bucket, and
 * next/image refuses remote hosts that are not named here. The hostname is
 * derived from the same env var the client uses rather than hard coded, so a
 * new Supabase project needs no config change.
 *
 * When Supabase is not configured the list is empty, which is correct: the
 * only photos in that case are the local fixtures under public/.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

/**
 * Protocol and port come from the URL rather than being assumed.
 *
 * Hard coding https broke the moment the site ran against a local Supabase,
 * which serves over http on port 54321: next/image refused every photo and
 * every page carrying one returned a 500. Hosted Supabase is https on the
 * default port, so nothing in production ever revealed it.
 */
function supabasePattern() {
  if (!supabaseUrl) return []
  const url = new URL(supabaseUrl)

  return [
    {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: '/storage/v1/object/public/**',
    },
  ]
}

/**
 * Next refuses to optimise an image whose host resolves to a private IP, as
 * SSRF protection. Local Supabase is 127.0.0.1, so every photo 400s and the
 * site cannot be reviewed against real data.
 *
 * The exception is switched on by the Supabase URL itself rather than by
 * NODE_ENV: it can only ever be true when the thing we are fetching from is
 * already on this machine, so a production build cannot turn it on by
 * accident, whatever the environment claims to be.
 */
const isLocalSupabase = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])/.test(
  supabaseUrl ?? '',
)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabasePattern(),
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
}

export default nextConfig
