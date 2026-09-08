import { FRESHNESS } from './constants'
import { SAMPLE_LISTINGS } from './sample-data'
import { createClient } from './supabase/server'
import {
  PUBLIC_LISTING_COLUMNS,
  type PublicListing,
  type Meals,
  type RoomType,
  type Schedule,
} from './types'

export type SearchFilters = {
  schedule?: Schedule
  /** True means any meals at all, i.e. anything other than 'none'. */
  mealsIncluded?: boolean
  roomType?: RoomType
  maxPricePerWeek?: number
  maxWalkMinutes?: number
  sort: 'walk' | 'price' | 'newest'
}

export type SearchResult = {
  listings: PublicListing[]
  /** True when Supabase is not configured and sample data is being shown. */
  usingSampleData: boolean
}

const supabaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

/** Parse filters out of the URL. Every filter is optional and shareable. */
export function filtersFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): SearchFilters {
  const one = (key: string) => {
    const value = params[key]
    return Array.isArray(value) ? value[0] : value
  }
  const num = (key: string) => {
    const parsed = Number(one(key))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }
  const sort = one('sort')

  return {
    schedule: (['mon_fri', 'full_week'] as const).find((s) => s === one('schedule')),
    mealsIncluded: one('meals') === '1',
    roomType: (['single', 'double', 'twin'] as const).find(
      (r) => r === one('room'),
    ),
    maxPricePerWeek: num('maxPrice'),
    maxWalkMinutes: num('maxWalk'),
    sort: sort === 'price' || sort === 'newest' ? sort : 'walk',
  }
}

const MEALS_INCLUDED: Meals[] = [
  'weekday_dinner',
  'weekday_dinner_and_weekend',
  'all_meals',
]

/**
 * Search live and stale listings.
 *
 * Stale ones are included on purpose: mvp.md decided they stay visible but
 * greyed out, so a student can still try them rather than see an empty page.
 * Expired and removed listings are never returned.
 */
export async function searchListings(
  filters: SearchFilters,
): Promise<SearchResult> {
  if (!supabaseConfigured()) {
    return {
      listings: sortListings(SAMPLE_LISTINGS.filter(matches(filters)), filters.sort),
      usingSampleData: true,
    }
  }

  const supabase = await createClient()
  let query = supabase
    .from('listings')
    .select(`${PUBLIC_LISTING_COLUMNS}, listing_photos (storage_path)`)
    .in('status', ['live', 'stale'])

  if (filters.schedule) {
    // 'either' listings satisfy both specific schedules.
    query = query.in('schedule', [filters.schedule, 'either'])
  }
  if (filters.mealsIncluded) {
    query = query.in('meals', MEALS_INCLUDED)
  }
  if (filters.roomType) {
    query = query.eq('room_type', filters.roomType)
  }
  if (filters.maxPricePerWeek) {
    query = query.lte('price_per_week', filters.maxPricePerWeek)
  }
  if (filters.maxWalkMinutes) {
    query = query.lte('walk_minutes', filters.maxWalkMinutes)
  }

  if (filters.sort === 'price') {
    query = query.order('price_per_week', { ascending: true })
  } else if (filters.sort === 'newest') {
    query = query.order('posted_at', { ascending: false })
  } else {
    query = query.order('walk_minutes', { ascending: true, nullsFirst: false })
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return { listings: [], usingSampleData: false }
  }

  const listings = (data ?? []).map((row) => {
    const { listing_photos, ...rest } = row as unknown as PublicListing & {
      listing_photos: { storage_path: string }[]
    }
    return { ...rest, photos: listing_photos ?? [] }
  })

  return { listings, usingSampleData: false }
}

export async function getListing(id: string): Promise<PublicListing | null> {
  if (!supabaseConfigured()) {
    return SAMPLE_LISTINGS.find((l) => l.id === id) ?? null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`${PUBLIC_LISTING_COLUMNS}, listing_photos (storage_path)`)
    .eq('id', id)
    .in('status', ['live', 'stale'])
    .single()

  if (error || !data) return null

  const { listing_photos, ...rest } = data as unknown as PublicListing & {
    listing_photos: { storage_path: string }[]
  }
  return { ...rest, photos: listing_photos ?? [] }
}

/* ------------------------------------------- helpers, shared with samples */

function matches(f: SearchFilters) {
  return (l: PublicListing) => {
    if (f.schedule && l.schedule !== f.schedule && l.schedule !== 'either') {
      return false
    }
    if (f.mealsIncluded && !MEALS_INCLUDED.includes(l.meals)) return false
    if (f.roomType && l.room_type !== f.roomType) return false
    if (f.maxPricePerWeek && l.price_per_week > f.maxPricePerWeek) return false
    if (
      f.maxWalkMinutes &&
      (l.walk_minutes === null || l.walk_minutes > f.maxWalkMinutes)
    ) {
      return false
    }
    return true
  }
}

function sortListings(listings: PublicListing[], sort: SearchFilters['sort']) {
  const sorted = [...listings]
  if (sort === 'price') {
    sorted.sort((a, b) => a.price_per_week - b.price_per_week)
  } else if (sort === 'newest') {
    sorted.sort((a, b) => b.posted_at.localeCompare(a.posted_at))
  } else {
    sorted.sort(
      (a, b) => (a.walk_minutes ?? 9999) - (b.walk_minutes ?? 9999),
    )
  }
  return sorted
}

/** Days since the host last confirmed the room is still free. */
export function daysSinceConfirmed(listing: PublicListing): number {
  const ms = Date.now() - new Date(listing.last_confirmed_at).getTime()
  return Math.floor(ms / 86_400_000)
}

/**
 * The freshness line shown on every listing. No Irish site shows this at all,
 * which is the whole point of avenue 3 in avenues.md.
 */
export function freshnessLabel(listing: PublicListing): {
  text: string
  stale: boolean
} {
  const days = daysSinceConfirmed(listing)

  if (days <= 0) return { text: 'Confirmed today', stale: false }
  if (days === 1) return { text: 'Confirmed yesterday', stale: false }
  if (days < FRESHNESS.staleAfterDays) {
    return { text: `Confirmed ${days} days ago`, stale: false }
  }
  return {
    text: `Not confirmed for ${days} days`,
    stale: true,
  }
}
