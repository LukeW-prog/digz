'use client'

import { useActionState } from 'react'
import { sendSignInLink, type SignInState } from '../auth/actions'

const initialState: SignInState = {}

export function SignInForm({
  role,
  next,
}: {
  role: 'student' | 'host'
  next?: string
}) {
  const [state, formAction, pending] = useActionState(
    sendSignInLink,
    initialState,
  )

  if (state.sent) {
    return (
      <div className="border-l-2 border-accent bg-accent-wash px-5 py-4">
        <h2 className="font-display text-xl font-semibold">Check your email</h2>
        <p className="mt-2 leading-relaxed">
          We sent a sign-in link to{' '}
          <strong className="font-semibold">{state.email}</strong>. It works
          once and lasts an hour.
        </p>
        <p className="mt-3 text-sm text-soft">
          Nothing there? Check the spam folder, and make sure the address is
          right.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="max-w-md">
      <input type="hidden" name="role" value={role} />
      {next && <input type="hidden" name="next" value={next} />}

      <label className="field-label" htmlFor="email">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        autoFocus
        className="field-input"
        placeholder="you@example.com"
        aria-describedby="email-hint"
      />
      <p id="email-hint" className="mt-2 text-sm text-soft">
        We email you a link. No password to invent or forget.
      </p>

      {state.error && (
        <p role="alert" className="field-error">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary mt-5 w-full sm:w-auto" disabled={pending}>
        {pending ? 'Sending…' : 'Email me a link'}
      </button>
    </form>
  )
}
