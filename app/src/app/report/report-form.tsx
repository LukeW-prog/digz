'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { submitReport, type ReportState } from './actions'
import { REPORT_REASON, REPORT_REASON_LABEL } from '@/lib/types'

const initialState: ReportState = {}

export function ReportForm({ listingId }: { listingId?: string }) {
  const [state, formAction, pending] = useActionState(
    submitReport,
    initialState,
  )

  if (state.ok) {
    return (
      <div className="card border-brand bg-brand-tint p-5">
        <h2 className="text-lg font-semibold">Thank you, we have it</h2>
        <p className="mt-2">
          We look at reports daily. If you left an email address we will tell
          you what we decided and why.
        </p>
        <p className="mt-3 text-sm text-muted">
          If money has changed hands, or you feel unsafe, please also contact An
          Garda Síochána. Do not wait for us.
        </p>
        <Link href="/" className="btn-secondary mt-4">
          Back to search
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="card p-5">
      {listingId && (
        <input type="hidden" name="listingId" value={listingId} />
      )}

      <fieldset>
        <legend className="field-label">What is wrong?</legend>
        {REPORT_REASON.map((reason) => (
          <label key={reason} className="mt-2 flex items-center gap-3">
            <input
              type="radio"
              name="reason"
              value={reason}
              required
              className="size-4 accent-brand"
            />
            {REPORT_REASON_LABEL[reason]}
          </label>
        ))}
      </fieldset>

      <div className="mt-5">
        <label className="field-label" htmlFor="details">
          Tell us what happened{' '}
          <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="details"
          name="details"
          rows={5}
          maxLength={2000}
          className="field-input"
          placeholder="Anything that helps us understand. If someone asked you for money, say how they asked and how much."
        />
      </div>

      <div className="mt-5">
        <label className="field-label" htmlFor="reporterEmail">
          Your email{' '}
          <span className="font-normal text-muted">(optional)</span>
        </label>
        <p className="field-hint">
          Only so we can tell you what we decided. You can report anonymously.
        </p>
        <input
          id="reporterEmail"
          name="reporterEmail"
          type="email"
          autoComplete="email"
          className="field-input"
        />
      </div>

      {state.error && (
        <p role="alert" className="field-error">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary mt-6" disabled={pending}>
        {pending ? 'Sending…' : 'Send report'}
      </button>
    </form>
  )
}
