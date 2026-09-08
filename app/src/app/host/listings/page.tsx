import type { Metadata } from 'next'
import Link from 'next/link'
import { confirmStillAvailable, removeListing } from './actions'
import { getHostStatus } from '@/lib/host'
import { createClient } from '@/lib/supabase/server'
import { freshnessLabel } from '@/lib/listings'
import {
  ROOM_TYPE_LABEL,
  SCHEDULE_LABEL,
  type PublicListing,
} from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your listings',
  description: 'Confirm your rooms are still available, or take one down.',
}

type Row = PublicListing & {
  address_line: string
  removed_reason: string | null
}

export default async function HostListingsPage(
  props: PageProps<'/host/listings'>,
) {
  const params = await props.searchParams
  const justPosted = params.posted !== undefined
  const host = await getHostStatus()

  if (host.state !== 'ready') {
    return (
      <Shell>
        <p className="mt-8 leading-relaxed text-soft">
          {host.state === 'unconfigured'
            ? 'Supabase is not configured, so there is nothing to show here yet. See stack.md.'
            : 'Sign in as a host to see your listings.'}
        </p>
        {host.state === 'signed_out' && (
          <Link
            href="/sign-in?role=host&next=/host/listings"
            className="btn-primary mt-6"
          >
            Sign in
          </Link>
        )}
      </Shell>
    )
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('host_id', host.id)
    .neq('status', 'removed')
    .order('posted_at', { ascending: false })

  const listings = (data ?? []) as Row[]

  return (
    <Shell>
      {justPosted && (
        <p
          role="status"
          className="mt-8 border-l-2 border-accent bg-accent-wash px-4 py-3"
        >
          <strong className="font-semibold">Your listing is live.</strong>{' '}
          Students can see it now.
        </p>
      )}

      {listings.length === 0 ? (
        <div className="mt-10 border-t border-rule pt-8">
          <h2 className="font-display text-2xl font-semibold">
            No listings yet
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-soft">
            Posting one takes about five minutes, and it goes live straight
            away.
          </p>
          <Link href="/host/new" className="btn-primary mt-6">
            List a room
          </Link>
        </div>
      ) : (
        <ul className="mt-10">
          {listings.map((listing) => {
            const freshness = freshnessLabel(listing)
            return (
              <li
                key={listing.id}
                className="border-t border-rule py-7 first:border-t-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h2 className="font-display text-xl font-semibold">
                    {ROOM_TYPE_LABEL[listing.room_type]} in{' '}
                    {listing.area_label}
                  </h2>
                  <p className="font-display text-xl font-semibold">
                    €{listing.price_per_week}
                    <span className="label ml-2 inline">a week</span>
                  </p>
                </div>

                <p className="mt-1 text-sm text-soft">
                  {listing.address_line} · {SCHEDULE_LABEL[listing.schedule]}
                </p>

                <p
                  className={
                    freshness.stale
                      ? 'mt-3 inline-block bg-alert-wash px-2 py-1 text-xs font-semibold uppercase tracking-[0.07em] text-alert'
                      : 'label mt-3'
                  }
                >
                  {freshness.text}
                </p>

                {freshness.stale && (
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-soft">
                    Students can still see this, but it is marked as possibly
                    gone. Confirming brings it back to normal. If nobody
                    confirms it, it disappears after two weeks.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <form action={confirmStillAvailable}>
                    <input
                      type="hidden"
                      name="listingId"
                      value={listing.id}
                    />
                    <button type="submit" className="btn-primary !py-2">
                      Still available
                    </button>
                  </form>

                  <Link
                    href={`/listing/${listing.id}`}
                    className="btn-secondary !py-2"
                  >
                    View
                  </Link>

                  <details className="w-full sm:w-auto">
                    <summary className="label cursor-pointer py-2 hover:text-ink">
                      Take it down
                    </summary>
                    <form
                      action={removeListing}
                      className="mt-3 max-w-md border-l-2 border-rule pl-4"
                    >
                      <input
                        type="hidden"
                        name="listingId"
                        value={listing.id}
                      />
                      <label className="field-label" htmlFor={`why-${listing.id}`}>
                        Why, roughly?
                      </label>
                      <p className="field-hint">
                        Only we see this. It tells us whether the site is
                        actually working.
                      </p>
                      <select
                        id={`why-${listing.id}`}
                        name="reason"
                        className="field-input"
                        defaultValue=""
                      >
                        <option value="">Prefer not to say</option>
                        <option value="let_through_digs">
                          Someone took it through Digs
                        </option>
                        <option value="let_elsewhere">
                          Someone took it, found another way
                        </option>
                        <option value="no_longer_letting">
                          Not letting the room any more
                        </option>
                        <option value="other">Something else</option>
                      </select>
                      <button
                        type="submit"
                        className="btn-secondary mt-4 !py-2"
                      >
                        Take it down
                      </button>
                    </form>
                  </details>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="label">For hosts</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Your listings
          </h1>
        </div>
        <Link href="/host/new" className="label text-accent hover:underline">
          List another room
        </Link>
      </div>
      {children}
    </div>
  )
}
