import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Session refresh.
 *
 * Next 16 renamed Middleware to Proxy. The file must be `proxy.ts` beside
 * `app/`, and a `middleware.ts` here would simply never run.
 *
 * All this does is refresh an expiring Supabase token and write the rotated
 * cookies onto the response. It deliberately does no authorisation: the docs
 * are explicit that Proxy is for optimistic checks, not a session management
 * or authorisation solution, and every Server Action already checks the user
 * itself because actions are reachable by direct POST.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Not configured yet: the site runs on sample data, so do nothing.
  if (!url || !key) return NextResponse.next({ request })

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // Touching getUser is what triggers the refresh. Do not remove.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
      Everything except static assets and images. Auth cookies are not needed
      to serve a font.
    */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
}
