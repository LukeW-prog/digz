import Link from 'next/link'
import { ListingCard } from '@/components/listing-card'
import { SearchFiltersForm } from '@/components/search-filters'
import { filtersFromSearchParams, searchListings } from '@/lib/listings'

export default async function SearchPage(props: PageProps<'/'>) {
  const params = await props.searchParams
  const filters = filtersFromSearchParams(params)
  const { listings, usingSampleData } = await searchListings(filters)

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <p className="label">Maynooth University</p>
        <h1 className="mt-4 font-display text-[2.75rem] leading-[0.95] font-semibold tracking-tight sm:text-6xl">
          A room in someone&rsquo;s
          <br />
          house, near campus.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-soft">
          Monday to Friday or the full week. Walking time to campus on every
          listing, and the date the host last confirmed the room is still free.
        </p>
      </header>

      {usingSampleData && (
        <p className="mt-10 border-l-2 border-alert-rule bg-alert-wash px-4 py-3 text-sm">
          <strong className="font-semibold">Sample data.</strong> Supabase is
          not configured, so these listings are invented for local development.
          See stack.md.
        </p>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
        <SearchFiltersForm filters={filters} resultCount={listings.length} />

        <section aria-label="Search results">
          {/* The count is in the filter summary on phones, so it is not repeated. */}
          <p className="label mb-2 hidden border-b border-rule pb-4 lg:block">
            {listings.length} {listings.length === 1 ? 'room' : 'rooms'}
          </p>

          {listings.length === 0 ? (
            <div className="border-t border-rule py-12">
              <h2 className="font-display text-2xl font-semibold">
                No rooms match those filters.
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-soft">
                Try widening the price or the walking time. There are fewer
                rooms in January than in September, so it is worth checking
                back.
              </p>
              <Link href="/" className="btn-secondary mt-6">
                Clear filters
              </Link>
            </div>
          ) : (
            <ul>
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
