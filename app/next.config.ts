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

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: 'https',
            hostname: new URL(supabaseUrl).hostname,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
}

export default nextConfig
