import type { Metadata } from 'next'
import Link from 'next/link'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Digs with an emailed link. No password needed.',
}

const ERRORS: Record<string, string> = {
  link_invalid: 'That link was not valid. Ask for a new one below.',
  link_expired:
    'That link has expired or was already used. Ask for a new one below.',
}

export default async function SignInPage(props: PageProps<'/sign-in'>) {
  const params = await props.searchParams
  const one = (key: string) => {
    const value = params[key]
    return Array.isArray(value) ? value[0] : value
  }

  const role = one('role') === 'host' ? 'host' : 'student'
  const next = one('next')
  const error = one('error')

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="label">{role === 'host' ? 'For hosts' : 'For students'}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {role === 'host' ? 'Sign in to list a room' : 'Sign in'}
      </h1>

      <p className="mt-5 max-w-md leading-relaxed text-soft">
        {role === 'host'
          ? 'You need an account to post a listing. Browsing needs nothing at all.'
          : 'You only need an account to see a host’s contact details. Searching and browsing need nothing at all.'}
      </p>

      {error && ERRORS[error] && (
        <p
          role="alert"
          className="mt-6 border-l-2 border-alert-rule bg-alert-wash px-4 py-3 text-sm"
        >
          {ERRORS[error]}
        </p>
      )}

      <div className="mt-8">
        <SignInForm role={role} next={next} />
      </div>

      <p className="mt-10 border-t border-rule pt-6 text-sm text-soft">
        By signing in you confirm you are 18 or over. Digs is for adults only —
        see{' '}
        <Link href="/terms" className="underline">
          the terms
        </Link>
        . We never ask you for money.
      </p>

      <p className="mt-4 text-sm">
        {role === 'host' ? (
          <Link href="/sign-in" className="underline">
            I am a student looking for a room
          </Link>
        ) : (
          <Link href="/sign-in?role=host" className="underline">
            I have a room to let
          </Link>
        )}
      </p>
    </div>
  )
}
