'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import {
  confirmPhoneVerification,
  startPhoneVerification,
  type VerifyState,
} from './actions'

/*
  Defined here, not in actions.ts. A 'use server' module may only export async
  functions, so a plain object exported from there never arrives on the client
  and every step check silently falls through to the else branch.
*/
const initialVerifyState: VerifyState = { step: 'enter_phone' }

export function VerifyForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(
    // One form element, two steps. Which action runs depends on where we are.
    async (prev: VerifyState, formData: FormData) =>
      prev.step === 'enter_code'
        ? confirmPhoneVerification(prev, formData)
        : startPhoneVerification(prev, formData),
    initialVerifyState,
  )

  if (state.step === 'done') {
    return (
      <div className="border-l-2 border-accent bg-accent-wash px-5 py-4">
        <h2 className="font-display text-xl font-semibold">Number verified</h2>
        <p className="mt-2 leading-relaxed">
          {state.display ?? 'Your number'} is confirmed. You can post a listing
          now.
        </p>
        <Link href="/host/new" className="btn-primary mt-5">
          List a room
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="max-w-md">
      {!configured && (
        <p className="mb-5 border-l-2 border-alert-rule bg-alert-wash px-4 py-3 text-sm">
          <strong className="font-semibold">Not configured.</strong> Twilio keys
          are not set, so no text will be sent. See stack.md.
        </p>
      )}

      {state.step === 'enter_phone' ? (
        <>
          <label className="field-label" htmlFor="phone">
            Your mobile number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            autoFocus
            placeholder="087 123 4567"
            className="field-input"
            aria-describedby="phone-hint"
          />
          <p id="phone-hint" className="mt-2 text-sm text-soft">
            Irish mobile only. Students see this number once they have read the
            safety notice, so use the one you are happy to be rung on.
          </p>
        </>
      ) : (
        <>
          <input type="hidden" name="phone" value={state.phone} />
          <label className="field-label" htmlFor="code">
            The six digit code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={8}
            required
            autoFocus
            className="field-input max-w-40 text-lg tracking-[0.4em]"
            aria-describedby="code-hint"
          />
          <p id="code-hint" className="mt-2 text-sm text-soft">
            Sent to {state.display ?? 'your phone'}. It lasts ten minutes.
          </p>
        </>
      )}

      {state.error && (
        <p role="alert" className="field-error">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary mt-5 w-full sm:w-auto"
        disabled={pending}
      >
        {pending
          ? 'Just a moment…'
          : state.step === 'enter_code'
            ? 'Confirm the code'
            : 'Text me a code'}
      </button>
    </form>
  )
}
