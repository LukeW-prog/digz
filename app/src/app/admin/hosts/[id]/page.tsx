import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unblockHost } from '../actions'
import { currentAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import {
  REPORT_DECISION_LABEL,
  REPORT_REASON_LABEL,
  ROOM_TYPE_LABEL,
  type ListingStatus,
  type ReportDecision,
  type ReportReason,
  type RoomType,
} from '@/lib/types'

/**
 * Everything known about one host, in one place.
 *
 * Blocking a host was one click from the reports queue and there was nothing
 * that showed the case afterwards: no way to see why, what else they had
 * posted, or whether the decision still looked right. A block you cannot
 * review is a block nobody will revisit, and the DSA gives people a right of
 * appeal that has to be answerable by someone.
 *
 * So: the decisions taken about them, the adverts they tried to publish, and
 * an undo that asks for a reason.
 */

export const metadata: Metadata = {
  title: 'Host',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * How much history to show at once.
 *
 * A host with a hundred reports is exactly the one an admin most needs to read,
 * and rendering all of it turns the page into a scroll nobody finishes. The
 * newest are the ones a decision turns on.
 */
const RECENT = 20

type Host = {
  id: string
  display_name: string
  email: string
  phone: string
  phone_verified_at: string | null
  blocked_at: string | null
  created_at: string
}

export default async function HostPage(props: PageProps<'/admin/hosts/[id]'>) {
  if (!(await currentAdmin())) notFound()

  const { id } = await props.params
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('hosts')
    .select('id, display_name, email, phone, phone_verified_at, blocked_at, created_at')
    .eq('id', id)
    .maybeSingle()

  const host = data as Host | null
  if (!host) notFound()

  const [listings, reports, hits] = await Promise.all([
    supabase
      .from('listings')
      .select('id, status, area_label, room_type, price_per_week, posted_at, removed_reason')
      .eq('host_id', id)
      .order('posted_at', { ascending: false }),
    supabase
      .from('reports')
      .select('id, reason, details, created_at, decision, decision_reason')
      .eq('host_id', id)
      .order('created_at', { ascending: false })
      .limit(RECENT),
    supabase
      .from('blocklist_hits')
      .select('id, phrase, category, submitted_text, created_at')
      .eq('host_id', id)
      .order('created_at', { ascending: false })
      .limit(RECENT),
  ])

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/admin/hosts" className="label transition-colors hover:text-ink">
        ← Hosts
      </Link>

      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">
        {host.display_name}
      </h1>
      <p className="mt-3 text-soft">
        {host.email} · {host.phone}
        {host.phone_verified_at ? ' · verified' : ' · phone not verified'} ·
        joined {formatDate(host.created_at)}
      </p>

      {host.blocked_at ? (
        <section className="mt-8 rounded-lg border border-danger bg-danger-wash p-5">
          <p className="font-semibold text-danger">
            Blocked {formatDate(host.blocked_at)}
          </p>
          <p className="mt-2 text-sm">
            Their listings were taken down and their phone number cannot be used
            to sign up again. Unblocking lifts both. It does not put the
            listings back.
          </p>

          <form action={unblockHost} className="mt-4 space-y-3">
            <input type="hidden" name="hostId" value={host.id} />
            <div>
              <label className="field-label" htmlFor="note">
                Why are you unblocking them?
              </label>
              <textarea
                id="note"
                name="note"
                rows={2}
                required
                minLength={3}
                className="field-input"
                placeholder="What changed, or what the appeal said."
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-rule-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-accent-wash"
            >
              Unblock this host
            </button>
          </form>
        </section>
      ) : (
        <p className="mt-8 text-soft">Not blocked.</p>
      )}

      <Section title={`Listings (${listings.data?.length ?? 0})`}>
        {listings.data?.length ? (
          <ul className="divide-y divide-rule">
            {listings.data.map((listing) => (
              <li key={listing.id} className="flex flex-wrap gap-x-4 gap-y-1 py-3">
                <span className="font-medium">
                  {ROOM_TYPE_LABEL[listing.room_type as RoomType]} in{' '}
                  {listing.area_label}
                </span>
                <span className="text-soft">€{listing.price_per_week}</span>
                <span className="label">
                  {(listing.status as ListingStatus).replace('_', ' ')}
                </span>
                {listing.removed_reason && (
                  <span className="w-full text-sm text-soft">
                    {listing.removed_reason}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-soft">None.</p>
        )}
      </Section>

      <Section
        title={`Reports about them${countSuffix(reports.data?.length)}`}
      >
        {reports.data?.length ? (
          <ul className="divide-y divide-rule">
            {reports.data.map((report) => (
              <li key={report.id} className="py-3">
                <p className="font-medium">
                  {REPORT_REASON_LABEL[report.reason as ReportReason]}
                  <span className="label ml-3 inline">
                    {formatDate(report.created_at)}
                  </span>
                </p>
                {report.details && (
                  <p className="mt-1 text-sm">{report.details}</p>
                )}
                <p className="mt-1 text-sm text-soft">
                  {report.decision
                    ? `${REPORT_DECISION_LABEL[report.decision as ReportDecision]} — ${report.decision_reason}`
                    : 'Not yet decided'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-soft">None.</p>
        )}
      </Section>

      {/*
        What they tried to publish. This is the part that usually decides
        whether a block was right: one refusal is a person who did not know
        the law, a pattern is somebody who does and kept going.
      */}
      <Section title={`Adverts refused${countSuffix(hits.data?.length)}`}>
        {hits.data?.length ? (
          <ul className="divide-y divide-rule">
            {hits.data.map((hit) => (
              <li key={hit.id} className="py-3">
                <p className="font-medium">
                  &ldquo;{hit.phrase}&rdquo;
                  <span className="label ml-3 inline">
                    {hit.category.replace(/_/g, ' ')} ·{' '}
                    {formatDate(hit.created_at)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-soft">{hit.submitted_text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-soft">None.</p>
        )}
      </Section>
    </div>
  )
}

/** Says when a list has been cut short, so nobody reads 20 as "all of them". */
function countSuffix(shown: number | undefined): string {
  if (!shown) return ' (0)'
  return shown >= RECENT ? ` (${RECENT} most recent)` : ` (${shown})`
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-12">
      <h2 className="label border-b border-rule pb-3">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
