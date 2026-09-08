'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { revealContact, type RevealState } from './actions'

const initialState: RevealState = {}

/**
 * The safety notice, and the contact reveal behind it.
 *
 * feasibility.md is blunt about this: we are making it easier to enter an
 * arrangement with no legal protection, so we say so plainly, before the
 * student commits, and not buried in terms. It costs conversions. Do it
 * anyway.
 */
export function ContactPanel({ listingId }: { listingId: string }) {
  const [state, formAction, pending] = useActionState(
    revealContact,
    initialState,
  )

  if (state.contact) {
    return (
      <div className="card border-brand bg-brand-tint p-5">
        <h2 className="text-lg font-semibold">
          Contact {state.contact.displayName}
        </h2>
        <dl className="mt-3 space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted">Phone</dt>
            <dd>
              <a className="font-medium underline" href={`tel:${state.contact.phone}`}>
                {state.contact.phone}
              </a>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">Email</dt>
            <dd>
              <a
                className="font-medium underline"
                href={`mailto:${state.contact.email}`}
              >
                {state.contact.email}
              </a>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm">
          <strong>Never pay anything before you have seen the room.</strong> No
          deposit, no holding fee, no first month. If they push for money before
          a viewing, that is the scam.{' '}
          <Link href="/report" className="underline">
            Report it
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="card p-5">
      <h2 className="text-lg font-semibold">Before you get in touch</h2>

      <div className="mt-4 space-y-4 text-sm">
        <div>
          <h3 className="font-semibold">Digs is not a tenancy</h3>
          <p className="mt-1 text-muted">
            You are a licensee, living in someone&rsquo;s home. That means{' '}
            <strong className="text-text">
              no Residential Tenancies Board protection, no minimum notice
              period, no rent book and no dispute resolution
            </strong>
            . Students have been asked to leave with less than a day&rsquo;s
            notice.{' '}
            <Link href="/what-digs-is" className="underline">
              What this means in practice
            </Link>
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Never pay before you view</h3>
          <p className="mt-1 text-muted">
            Not a deposit, not a holding fee, not to &ldquo;secure&rdquo; the
            room. Every common accommodation scam works by getting money out of
            you before you have seen the place. Gardaí recorded €400,000 lost in
            2026 alone.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">At the viewing</h3>
          <ul className="mt-1 space-y-1 text-muted">
            <li>Bring someone with you.</li>
            <li>Tell someone where you are going and when you will be back.</li>
            <li>Go in daylight.</li>
            <li>
              Never hand over your passport or PPS number to hold a room.
            </li>
            <li>Take your time. Do not let anyone rush you.</li>
          </ul>
        </div>

        <p className="text-muted">
          Digs does not inspect properties and does not vet hosts. We confirm a
          host&rsquo;s phone number and that the address is real. Nothing more.
        </p>
      </div>

      <input type="hidden" name="listingId" value={listingId} />

      <label className="mt-5 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="accepted"
          className="mt-0.5 size-5 shrink-0 rounded border-border accent-brand"
        />
        <span>I have read this and I understand digs has no RTB protection.</span>
      </label>

      {state.message && (
        <p role="alert" className="field-error">
          {state.message}
          {state.needsSignIn && (
            <>
              {' '}
              <Link href="/sign-in" className="underline">
                Sign in or create an account
              </Link>
            </>
          )}
        </p>
      )}

      <button type="submit" className="btn-primary mt-4 w-full" disabled={pending}>
        {pending ? 'Just a moment…' : 'Show me the contact details'}
      </button>
    </form>
  )
}
