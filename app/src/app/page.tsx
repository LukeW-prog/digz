import Link from 'next/link'
import { ListingCard } from '@/components/listing-card'
import { SearchFiltersForm } from '@/components/search-filters'
import { filtersFromSearchParams, searchListings } from '@/lib/listings'

export default async function SearchPage(props: PageProps<'/'>) {
  const params = await props.searchParams
  const filters = filtersFromSearchParams(params)
  const { listings, usingSampleData } = await searchListings(filters)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">
          Digs near Maynooth University
        </h1>
        <p className="mt-3 text-muted">
          Rooms in people&rsquo;s homes, Monday to Friday or full week. Walking
          time to campus on every listing, and you can see when the host last
          confirmed the room is still free.
        </p>
      </div>

      {usingSampleData && (
        <p className="mt-6 rounded-lg border border-warning-border bg-warning-tint p-3 text-sm">
          <strong>Sample data.</strong> Supabase is not configured, so these
          listings are made up for local development. See stack.md.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <SearchFiltersForm filters={filters} />

        <section aria-label="Search results">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-medium" aria-live="polite">
              {listings.length}{' '}
              {listings.length === 1 ? 'room' : 'rooms'}
            </h2>
          </div>

          {listings.length === 0 ? (
            <div className="card p-6">
              <p className="font-medium">No rooms match those filters.</p>
              <p className="mt-2 text-sm text-muted">
                Try widening the price or the walking time. There are fewer
                rooms in January than in September, so it is worth checking
                back.
              </p>
              <Link href="/" className="btn-secondary mt-4">
                Clear all filters
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
