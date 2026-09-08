import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'
import { ContactPanel } from './contact-panel'
import { freshnessLabel, getListing, travelLead } from '@/lib/listings'
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
  const travel = travelLead(listing)

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/"
        className="label transition-colors duration-300 hover:text-ink"
      >
        ← All rooms
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <div>
          <ViewTransition name={`title-${listing.id}`}>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {ROOM_TYPE_LABEL[listing.room_type]} in {listing.area_label}
            </h1>
          </ViewTransition>

          <p className="mt-4 font-display text-2xl font-semibold">
            €{listing.price_per_week}
            <span className="label ml-2 inline">a week</span>
          </p>

          {freshness.stale && (
            <p
              role="status"
              className="mt-6 rounded-md bg-alert-wash px-4 py-3 text-sm leading-relaxed"
            >
              <strong className="font-semibold">This may be gone.</strong>{' '}
              {freshness.text}. We ask hosts to confirm weekly, and this one has
              not. It stays visible so you can still try, but do not be
              surprised if there is no reply.
            </p>
          )}

          {/* The differentiator, stated in minutes rather than kilometres. */}
          {travel && (
            <section className="reveal mt-10">
              <h2 className="label">Getting to {CAMPUS.name}</h2>
              <div className="mt-4 flex gap-12">
                <ViewTransition name={`travel-${listing.id}`}>
                  <div>
                    <p className="font-display text-5xl leading-none font-semibold text-accent">
                      {travel.minutes}
                    </p>
                    <p className="label mt-2">min {travel.mode}</p>
                  </div>
                </ViewTransition>

                {travel.secondary && (
                  <div>
                    <p className="font-display text-5xl leading-none font-semibold text-soft/60">
                      {travel.secondary.split(' ')[0]}
                    </p>
                    <p className="label mt-2">
                      {travel.secondary.split(' ').slice(1).join(' ')}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="reveal mt-12">
            <h2 className="label">The arrangement</h2>
            <dl className="mt-4 divide-y divide-rule border-y border-rule">
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
            <section className="reveal mt-12">
              <h2 className="label">From the host</h2>
              <p className="mt-4 text-lg leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </section>
          )}

          <section className="reveal mt-12 text-sm text-soft">
            <h2 className="label text-ink">This listing</h2>
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

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <ContactPanel listingId={listing.id} />
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3.5">
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
