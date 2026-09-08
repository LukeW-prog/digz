import { describe, expect, it } from 'vitest'
import { filtersFromSearchParams, freshnessLabel } from './listings'
import type { PublicListing } from './types'

const listing = (overrides: Partial<PublicListing> = {}): PublicListing => ({
  id: 'x',
  status: 'live',
  area_label: 'Maynooth',
  walk_minutes: 12,
  cycle_minutes: 5,
  room_type: 'single',
  price_per_week: 130,
  bills_included: true,
  schedule: 'mon_fri',
  meals: 'weekday_dinner',
  term_start: null,
  term_end: null,
  smoking_allowed: false,
  pets_in_house: false,
  quiet_hours: false,
  description: null,
  posted_at: new Date().toISOString(),
  last_confirmed_at: new Date().toISOString(),
  photos: [],
  ...overrides,
})

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString()

describe('reading filters from the URL', () => {
  it('defaults to sorting by walk time', () => {
    expect(filtersFromSearchParams({}).sort).toBe('walk')
  })

  it('reads every filter', () => {
    const f = filtersFromSearchParams({
      schedule: 'mon_fri',
      meals: '1',
      room: 'double',
      maxPrice: '140',
      maxWalk: '20',
      sort: 'price',
    })
    expect(f).toEqual({
      schedule: 'mon_fri',
      mealsIncluded: true,
      roomType: 'double',
      maxPricePerWeek: 140,
      maxWalkMinutes: 20,
      sort: 'price',
    })
  })

  it('ignores values it does not recognise rather than erroring', () => {
    const f = filtersFromSearchParams({
      schedule: 'whenever',
      room: 'penthouse',
      maxPrice: 'free',
      sort: 'sideways',
    })
    expect(f.schedule).toBeUndefined()
    expect(f.roomType).toBeUndefined()
    expect(f.maxPricePerWeek).toBeUndefined()
    expect(f.sort).toBe('walk')
  })

  it('ignores a negative price', () => {
    expect(filtersFromSearchParams({ maxPrice: '-50' }).maxPricePerWeek).toBeUndefined()
  })

  it('takes the first value when a param is repeated', () => {
    expect(
      filtersFromSearchParams({ room: ['single', 'double'] }).roomType,
    ).toBe('single')
  })
})

describe('freshness, which no Irish site shows at all', () => {
  it('says today for a listing just confirmed', () => {
    expect(freshnessLabel(listing()).text).toBe('Confirmed today')
    expect(freshnessLabel(listing()).stale).toBe(false)
  })

  it('says yesterday', () => {
    expect(freshnessLabel(listing({ last_confirmed_at: daysAgo(1) })).text).toBe(
      'Confirmed yesterday',
    )
  })

  it('is still fresh at six days', () => {
    const out = freshnessLabel(listing({ last_confirmed_at: daysAgo(6) }))
    expect(out.stale).toBe(false)
    expect(out.text).toBe('Confirmed 6 days ago')
  })

  it('goes stale at seven days, matching the weekly confirmation cycle', () => {
    const out = freshnessLabel(listing({ last_confirmed_at: daysAgo(7) }))
    expect(out.stale).toBe(true)
    expect(out.text).toMatch(/not confirmed for 7 days/i)
  })
})
