import Link from 'next/link'
import { freshnessLabel } from '@/lib/listings'
import {
  MEALS_LABEL,
  ROOM_TYPE_LABEL,
  SCHEDULE_LABEL,
  type PublicListing,
} from '@/lib/types'

export function ListingCard({ listing }: { listing: PublicListing }) {
  const freshness = freshnessLabel(listing)
  const mealsIncluded = listing.meals !== 'none'

  return (
    <article
      className={`card overflow-hidden transition-opacity ${
        freshness.stale ? 'opacity-60' : ''
      }`}
    >
      <Link
        href={`/listing/${listing.id}`}
        className="block p-4 hover:bg-brand-tint focus-visible:bg-brand-tint"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {ROOM_TYPE_LABEL[listing.room_type]} in {listing.area_label}
            </h3>

            {/* The differentiator: minutes, not kilometres. */}
            {listing.walk_minutes !== null && (
              <p className="mt-1 font-medium text-brand">
                {listing.walk_minutes} min walk to campus
                {listing.cycle_minutes !== null && (
                  <span className="font-normal text-muted">
                    {' '}
                    · {listing.cycle_minutes} min cycle
                  </span>
                )}
              </p>
            )}
          </div>

          <p className="shrink-0 text-right">
            <span className="text-xl font-bold">€{listing.price_per_week}</span>
            <span className="block text-sm text-muted">a week</span>
          </p>
        </div>

        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          <Tag>{SCHEDULE_LABEL[listing.schedule]}</Tag>
          {mealsIncluded && <Tag>{MEALS_LABEL[listing.meals]}</Tag>}
          {listing.bills_included && <Tag>Bills included</Tag>}
          {listing.quiet_hours && <Tag>Quiet hours</Tag>}
          {listing.pets_in_house && <Tag>Pets in house</Tag>}
        </ul>

        {listing.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted">
            {listing.description}
          </p>
        )}

        <p
          className={`mt-3 text-sm ${
            freshness.stale ? 'font-medium text-danger' : 'text-muted'
          }`}
        >
          {freshness.text}
          {freshness.stale && ' — may be gone'}
        </p>
      </Link>
    </article>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-full border border-border px-2.5 py-1">
      {children}
    </li>
  )
}
