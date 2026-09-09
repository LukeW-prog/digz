import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { decideReport } from './actions'
import { currentAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import {
  REPORT_DECISION,
  REPORT_DECISION_LABEL,
  REPORT_REASON_LABEL,
  type ReportDecision,
  type ReportReason,
} from '@/lib/types'

/**
 * The reports queue. DSA Article 16 notice-and-action.
 *
 * Reports were already being taken and stored; there was no screen to act on
 * them, which meant the legal obligation had no way of being met.
 *
 * Every decision needs a written reason before the button will do anything.
 * That is not politeness: the reason goes to the reporter and stands as the
 * statement of reasons the Article requires.
 */

export const metadata: Metadata = {
  title: 'Reports',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Report = {
  id: string
  listing_id: string | null
  reporter_email: string | null
  reason: ReportReason
  details: string | null
  created_at: string
  reviewed_at: string | null
  decision: ReportDecision | null
  decision_reason: string | null
}

export default async function ReportsPage() {
  // A wrong guess at the URL should look like nothing is there, rather than
  // confirming an admin area exists.
  if (!(await currentAdmin())) notFound()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('reports')
    .select(
      'id, listing_id, reporter_email, reason, details, created_at, reviewed_at, decision, decision_reason',
    )
    .order('created_at', { ascending: false })
    .limit(100)

  const reports = (data ?? []) as Report[]
  const open = reports.filter((r) => !r.reviewed_at)
  const closed = reports.filter((r) => r.reviewed_at)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/admin" className="label transition-colors hover:text-ink">
        ← Admin
      </Link>

      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">
        Reports
      </h1>
      <p className="mt-3 text-soft">
        {open.length} waiting. Every decision needs a reason, and the reason is
        sent to whoever reported it.
      </p>

      <section className="mt-10">
        <h2 className="label border-b border-rule pb-3">Waiting</h2>
        {open.length === 0 ? (
          <p className="mt-6 text-soft">Nothing to act on.</p>
        ) : (
          <ul className="mt-2">
            {open.map((report) => (
              <li key={report.id} className="border-b border-rule py-6">
                <ReportBody report={report} />
                <form action={decideReport} className="mt-5 space-y-3">
                  <input type="hidden" name="reportId" value={report.id} />
                  <div>
                    <label
                      className="field-label"
                      htmlFor={`reason-${report.id}`}
                    >
                      Reason for the decision
                    </label>
                    <textarea
                      id={`reason-${report.id}`}
                      name="decisionReason"
                      rows={2}
                      required
                      minLength={3}
                      className="field-input"
                      placeholder="What you found, and why this is the outcome."
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {REPORT_DECISION.map((decision) => (
                      <button
                        key={decision}
                        type="submit"
                        name="decision"
                        value={decision}
                        /*
                          Three weights, not two. Blocking a host ends their
                          account and pulls every listing they have; taking one
                          advert down does not. Styling both in red made the
                          gravest button look like the routine one, which is
                          how a tired moderator blocks someone by mistake.
                        */
                        className={
                          decision === 'host_blocked'
                            ? 'rounded-full bg-danger px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90'
                            : decision === 'removed'
                              ? 'rounded-full border border-rule-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-accent-wash'
                              : 'rounded-full px-4 py-2 text-sm font-medium text-soft transition-colors hover:bg-accent-wash hover:text-ink'
                        }
                      >
                        {REPORT_DECISION_LABEL[decision]}
                      </button>
                    ))}
                  </div>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h2 className="label border-b border-rule pb-3">Decided</h2>
        {closed.length === 0 ? (
          <p className="mt-6 text-soft">Nothing yet.</p>
        ) : (
          <ul className="mt-2">
            {closed.map((report) => (
              <li key={report.id} className="border-b border-rule py-5">
                <ReportBody report={report} />
                <p className="mt-3 text-sm">
                  <span className="font-medium">
                    {report.decision
                      ? REPORT_DECISION_LABEL[report.decision]
                      : 'Decided'}
                  </span>
                  {report.decision_reason && (
                    <span className="text-soft"> — {report.decision_reason}</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function ReportBody({ report }: { report: Report }) {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-lg font-semibold">
          {REPORT_REASON_LABEL[report.reason]}
        </h3>
        <p className="label">{formatDate(report.created_at)}</p>
      </div>

      {report.details && (
        <p className="mt-2 text-[0.9375rem] leading-relaxed whitespace-pre-line">
          {report.details}
        </p>
      )}

      <p className="mt-2 text-sm text-soft">
        {report.listing_id ? (
          <Link
            href={`/listing/${report.listing_id}`}
            className="underline"
            target="_blank"
          >
            View the listing
          </Link>
        ) : (
          'No listing attached'
        )}
        {report.reporter_email
          ? ' · reporter left an address'
          : ' · reported anonymously'}
      </p>
    </>
  )
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
