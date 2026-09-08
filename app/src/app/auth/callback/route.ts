import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Where the emailed sign-in link lands.
 *
 * Exchanges the one-time code for a session, then makes sure the person has
 * the profile row their role needs. Supabase Auth holds the credentials;
 * `students` and `hosts` hold everything else, and one of them has to exist
 * before the rest of the app will do anything useful.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') === 'host' ? 'host' : 'student'
  const next = safeNext(searchParams.get('next'), role)

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=link_invalid`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/sign-in?error=link_expired`)
  }

  const user = data.user
  const email = user.email ?? ''

  // Arriving by email link is itself the email verification, so record it.
  const verifiedAt = new Date().toISOString()

  if (role === 'host') {
    const { data: existing } = await supabase
      .from('hosts')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existing) {
      await supabase.from('hosts').insert({
        id: user.id,
        display_name: email.split('@')[0] ?? 'Host',
        // Phone is captured and verified separately, before any listing can
        // be published. See mvp.md: it is the highest-value anti-fraud step.
        phone: '',
        email,
        email_verified_at: verifiedAt,
      })
    }
  } else {
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existing) {
      await supabase.from('students').insert({
        id: user.id,
        email,
        email_verified_at: verifiedAt,
        // 18+ is confirmed at the point of sign-in. See mvp.md.
        over_18_confirmed_at: verifiedAt,
      })
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}

/** Only ever redirect within this site. An open redirect is a phishing gift. */
function safeNext(next: string | null, role: 'host' | 'student'): string {
  const fallback = role === 'host' ? '/host/new' : '/'
  if (!next) return fallback
  if (!next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}
