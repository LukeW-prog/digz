import Link from 'next/link'
import { freshnessLabel, travelLead } from '@/lib/listings'
import {
  MEALS_LABEL,
  ROOM_TYPE_LABEL,
  SCHEDULE_LABEL,
  type PublicListing,
} from '@/lib/types'

/**
 * A listing, as an editorial row rather than a panel.
 *
 * The travel time sits in the left gutter as a large numeral, because it is
 * the one number nobody else in this market shows, and putting it there makes
 * the column scannable: a student reads down the minutes first, then across.
 * The layout argues the product's case.
 */
export function ListingCard({ listing }: { listing: PublicListing }) {
  const freshness = freshnessLabel(listing)
  const travel = travelLead(listing)

  const facts = [
    SCHEDULE_LABEL[listing.schedule],
    listing.meals !== 'none' && MEALS_LABEL[listing.meals],
    listing.bills_included && 'Bills included',
    listing.quiet_hours && 'Quiet hours',
    listing.pets_in_house && 'Pets in house',
  ].filter(Boolean) as string[]

  return (
    <article className="border-t border-rule first:border-t-0">
      <Link
        href={`/listing/${listing.id}`}
        className="group grid grid-cols-[3.75rem_1fr] gap-x-5 gap-y-1 py-6 sm:grid-cols-[5rem_1fr] sm:gap-x-8"
      >
        {/* The gutter numeral. */}
        <div className="pt-1">
          {travel ? (
            <>
              <p className="font-display text-[2.25rem] leading-none font-semibold text-accent sm:text-[2.75rem]">
                {travel.minutes}
              </p>
              <p className="label mt-1.5 leading-tight">
                min
                <br />
                {travel.mode}
              </p>
            </>
          ) : (
            <p className="label pt-2">Time
              <br />unknown</p>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-xl font-semibold decoration-1 underline-offset-4 group-hover:underline sm:text-[1.375rem]">
              {ROOM_TYPE_LABEL[listing.room_type]} in {listing.area_label}
            </h3>
            <p className="shrink-0 text-right">
              <span className="font-display text-xl font-semibold sm:text-[1.375rem]">
                €{listing.price_per_week}
              </span>
              <span className="label mt-0.5">a week</span>
            </p>
          </div>

          <p className="mt-2 text-sm text-soft">
            {facts.join(' · ')}
            {travel?.secondary && (
              <span className="whitespace-nowrap"> · {travel.secondary}</span>
            )}
          </p>

          {listing.description && (
            <p className="mt-2.5 line-clamp-2 text-[0.9375rem] leading-relaxed text-ink/85">
              {listing.description}
            </p>
          )}

          {/*
            Stale listings are flagged, not dimmed. Reducing opacity was the
            obvious move and it was wrong: it made the warning the hardest
            text on the row to read, and it failed WCAG AA contrast.
          */}
          <p
            className={
              freshness.stale
                ? 'mt-3 inline-block rounded-sm bg-alert-wash px-2 py-1 text-xs font-semibold uppercase tracking-[0.07em] text-alert'
                : 'label mt-3'
            }
          >
            {freshness.stale ? `${freshness.text} — may be gone` : freshness.text}
          </p>
        </div>
      </Link>
    </article>
  )
}

