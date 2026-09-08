import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactPanel } from './contact-panel'
import { freshnessLabel, getListing } from '@/lib/listings'
import { CAMPUS } from '@/lib/constants'
import {
  MEALS_LABEL,
  ROOM_TYPE_LABEL,
  SCHEDULE_LABEL,
  type PublicListing,
} from '@/lib/types'

export async function generateMetadata(
  props: PageProps<'/listing/[id]'>,
): Promise<Metadata> {
  const { id } = await props.params
  const listing = await getListing(id)
  if (!listing) return { title: 'Listing not found' }

  return {
    title: `${ROOM_TYPE_LABEL[listing.room_type]} in ${listing.area_label}, €${listing.price_per_week} a week`,
    description: listing.description ?? undefined,
  }
}

export default async function ListingPage(props: PageProps<'/listing/[id]'>) {
  const { id } = await props.params
  const listing = await getListing(id)
  if (!listing) notFound()

  const freshness = freshnessLabel(listing)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm text-soft hover:underline">
        ← All rooms
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {ROOM_TYPE_LABEL[listing.room_type]} in {listing.area_label}
          </h1>

          <p className="mt-2 text-2xl font-bold">
            €{listing.price_per_week}{' '}
            <span className="text-base font-normal text-soft">a week</span>
          </p>

          {freshness.stale && (
            <p
              role="status"
              className="mt-4 rounded-lg border border-alert-rule bg-alert-wash p-3 text-sm"
            >
              <strong>This may be gone.</strong> {freshness.text}. We ask hosts
              to confirm weekly, and this one has not. It stays visible so you
              can still try, but do not be surprised if there is no reply.
            </p>
          )}

          {/* The differentiator, stated in minutes rather than kilometres. */}
          {listing.walk_minutes !== null && (
            <section className="panel mt-6 p-4">
              <h2 className="font-semibold">Getting to {CAMPUS.name}</h2>
              <div className="mt-3 flex gap-8">
                <div>
                  <p className="text-2xl font-bold text-accent">
                    {listing.walk_minutes}
                    <span className="text-base font-normal"> min</span>
                  </p>
                  <p className="text-sm text-soft">walking</p>
                </div>
                {listing.cycle_minutes !== null && (
                  <div>
                    <p className="text-2xl font-bold text-accent">
                      {listing.cycle_minutes}
                      <span className="text-base font-normal"> min</span>
                    </p>
                    <p className="text-sm text-soft">cycling</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="mt-6">
            <h2 className="text-lg font-semibold">The arrangement</h2>
            <dl className="mt-3 divide-y divide-rule border-y border-rule">
              <Row label="Nights" value={SCHEDULE_LABEL[listing.schedule]} />
              <Row label="Meals" value={MEALS_LABEL[listing.meals]} />
              <Row
                label="Bills"
                value={
                  listing.bills_included
                    ? 'Included in the price'
                    : 'Not included'
                }
              />
              <Row label="Term dates" value={termDates(listing)} />
              <Row
                label="Smoking"
                value={listing.smoking_allowed ? 'Allowed' : 'Not allowed'}
              />
              <Row
                label="Pets in the house"
                value={listing.pets_in_house ? 'Yes' : 'No'}
              />
              <Row
                label="Quiet hours"
                value={listing.quiet_hours ? 'Yes, in the evening' : 'No'}
              />
            </dl>
          </section>

          {listing.description && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">From the host</h2>
              <p className="mt-2 whitespace-pre-line">{listing.description}</p>
            </section>
          )}

          <section className="mt-6 text-sm text-soft">
            <h2 className="font-semibold text-ink">This listing</h2>
            <p className="mt-2">
              Posted {formatDate(listing.posted_at)}. {freshness.text}.
            </p>
            <p className="mt-2">
              <Link href={`/report?listing=${listing.id}`} className="underline">
                Report this listing
              </Link>
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-4 lg:h-fit">
          <ContactPanel listingId={listing.id} />
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-soft">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function termDates(listing: PublicListing): string {
  if (!listing.term_start && !listing.term_end) return 'Flexible'
  if (listing.term_start && listing.term_end) {
    return `${formatDate(listing.term_start)} to ${formatDate(listing.term_end)}`
  }
  if (listing.term_start) return `From ${formatDate(listing.term_start)}`
  return `Until ${formatDate(listing.term_end!)}`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
