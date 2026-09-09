import Image from 'next/image'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { freshnessLabel, travelLead } from '@/lib/listings'
import { leadPhoto } from '@/lib/photos'
import {
  MEALS_LABEL,
  ROOM_TYPE_LABEL,
  SCHEDULE_LABEL,
  type PublicListing,
} from '@/lib/types'

/**
 * A listing, as a row that lifts rather than a card that sits.
 *
 * There is no box at rest, only the hairline above it. Hovering floats a pane
 * of glass under the content, so the surface arrives with the pointer instead
 * of being permanently drawn.
 *
 * The travel time sits in the left gutter as a large numeral, because it is
 * the one number nobody else in this market shows. The column is scannable:
 * a student reads down the minutes, then across. It also carries a view
 * transition name, so it morphs into the same figure on the listing page.
 */
export function ListingCard({
  listing,
  index = 0,
}: {
  listing: PublicListing
  index?: number
}) {
  const freshness = freshnessLabel(listing)
  const travel = travelLead(listing)
  const lead = leadPhoto(listing.photos)

  const facts = [
    SCHEDULE_LABEL[listing.schedule],
    listing.meals !== 'none' && MEALS_LABEL[listing.meals],
    listing.bills_included && 'Bills included',
    listing.quiet_hours && 'Quiet hours',
    listing.pets_in_house && 'Pets in house',
  ].filter(Boolean) as string[]

  return (
    <article
      className="reveal group relative border-t border-rule"
      style={{ animationDelay: `${Math.min(index, 6) * 20}ms` }}
    >
      <Link
        href={`/listing/${listing.id}`}
        className="relative block rounded-lg px-3 py-6 transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-0.5 sm:px-4"
      >
        {/* A honey rule slides in along the left edge on hover. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-4 left-0 w-[3px] origin-top scale-y-0 rounded-full bg-signal transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-y-100"
        />
        {/* The glass arrives with the pointer rather than being always drawn. */}
        <span
          aria-hidden
          className="glass pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-500 ease-[var(--ease-out)] group-hover:opacity-100"
        />

        <div
          className={`relative grid gap-x-5 gap-y-1 sm:gap-x-8 ${
            lead
              ? 'grid-cols-[3.5rem_1fr_5rem] sm:grid-cols-[5rem_1fr_11rem]'
              : 'grid-cols-[3.75rem_1fr] sm:grid-cols-[5rem_1fr]'
          }`}
        >
          <div className="pt-1">
            {travel ? (
              <ViewTransition name={`travel-${listing.id}`}>
                <div>
                  <p className="font-display text-[2.25rem] leading-none font-semibold text-accent sm:text-[2.75rem]">
                    {travel.minutes}
                  </p>
                  <p className="label mt-1.5 leading-tight">
                    min
                    <br />
                    {travel.mode}
                  </p>
                </div>
              </ViewTransition>
            ) : (
              <p className="label pt-2">
                Time
                <br />
                unknown
              </p>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <ViewTransition name={`title-${listing.id}`}>
                <h3 className="font-display text-xl font-semibold sm:text-[1.375rem]">
                  {ROOM_TYPE_LABEL[listing.room_type]} in {listing.area_label}
                </h3>
              </ViewTransition>

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
            {freshness.stale ? (
              <p className="mt-3 inline-block rounded-sm bg-alert-wash px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.07em] text-alert">
                {freshness.text} — may be gone
              </p>
            ) : (
              <p className="label mt-3 flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block size-1.5 rounded-full bg-signal"
                />
                {freshness.text}
              </p>
            )}
          </div>

          {/*
            The photo is decorative here on purpose. The link already reads
            "Double room in Maynooth", and the host writes no description of
            the image, so alt text would either repeat the heading or invent
            detail. The listing page numbers its photos instead.
          */}
          {lead && (
            <ViewTransition name={`photo-${listing.id}`}>
              <div className="relative aspect-[4/3] self-start overflow-hidden rounded-md bg-rule">
                <Image
                  src={lead}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 11rem, 5rem"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
              </div>
            </ViewTransition>
          )}
        </div>
      </Link>
    </article>
  )
}
