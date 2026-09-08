import type { PublicListing } from './types'

/**
 * Sample listings for local development only.
 *
 * Used when Supabase is not configured, so the site can be run and looked at
 * before any accounts exist. Every page that falls back to this data shows a
 * banner saying so. It is never used when NEXT_PUBLIC_SUPABASE_URL is set.
 *
 * The prices and areas are drawn from research.md so the thing looks right:
 * Maynooth digs runs about EUR 120-150 a week, and supply spreads into
 * Kilcock, Celbridge, Leixlip and Clane.
 */

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString()

export const SAMPLE_LISTINGS: PublicListing[] = [
  {
    id: 'sample-1',
    status: 'live',
    area_label: 'Maynooth',
    walk_minutes: 12,
    cycle_minutes: 5,
    room_type: 'single',
    price_per_week: 130,
    bills_included: true,
    schedule: 'mon_fri',
    meals: 'weekday_dinner',
    term_start: '2027-01-12',
    term_end: '2027-05-28',
    smoking_allowed: false,
    pets_in_house: true,
    quiet_hours: true,
    description:
      'Quiet house on the Moyglare Road, twelve minutes from the front gate. Own desk, fast broadband. Dinner Monday to Thursday. We have an old labrador.',
    posted_at: daysAgo(3),
    last_confirmed_at: daysAgo(1),
    photos: [],
  },
  {
    id: 'sample-2',
    status: 'live',
    area_label: 'Maynooth',
    walk_minutes: 8,
    cycle_minutes: 3,
    room_type: 'double',
    price_per_week: 150,
    bills_included: true,
    schedule: 'full_week',
    meals: 'weekday_dinner_and_weekend',
    term_start: null,
    term_end: null,
    smoking_allowed: false,
    pets_in_house: false,
    quiet_hours: false,
    description:
      'Double room in a family home just off Straffan Road. All meals included. Washing machine use any time.',
    posted_at: daysAgo(6),
    last_confirmed_at: daysAgo(2),
    photos: [],
  },
  {
    id: 'sample-3',
    status: 'live',
    area_label: 'Kilcock',
    walk_minutes: 62,
    cycle_minutes: 21,
    room_type: 'single',
    price_per_week: 110,
    bills_included: false,
    schedule: 'mon_fri',
    meals: 'none',
    term_start: '2027-01-12',
    term_end: '2027-06-01',
    smoking_allowed: false,
    pets_in_house: false,
    quiet_hours: true,
    description:
      'Single room in Kilcock, five minutes walk to the bus and the train. Kitchen use, no meals. Bills split.',
    posted_at: daysAgo(11),
    last_confirmed_at: daysAgo(9),
    photos: [],
  },
  {
    id: 'sample-4',
    status: 'stale',
    area_label: 'Celbridge',
    walk_minutes: 74,
    cycle_minutes: 26,
    room_type: 'single',
    price_per_week: 125,
    bills_included: true,
    schedule: 'either',
    meals: 'weekday_dinner',
    term_start: null,
    term_end: null,
    smoking_allowed: false,
    pets_in_house: true,
    quiet_hours: false,
    description:
      'Room in Celbridge with dinner during the week. Bus to Maynooth from the end of the road. Two cats in the house.',
    posted_at: daysAgo(21),
    last_confirmed_at: daysAgo(9),
    photos: [],
  },
  {
    id: 'sample-5',
    status: 'live',
    area_label: 'Maynooth',
    walk_minutes: 18,
    cycle_minutes: 7,
    room_type: 'twin',
    price_per_week: 95,
    bills_included: false,
    schedule: 'full_week',
    meals: 'none',
    term_start: null,
    term_end: null,
    smoking_allowed: false,
    pets_in_house: false,
    quiet_hours: true,
    description:
      'Twin room, suits two people sharing who already know each other. Quiet estate near the Harbour.',
    posted_at: daysAgo(1),
    last_confirmed_at: daysAgo(1),
    photos: [],
  },
  {
    id: 'sample-6',
    status: 'live',
    area_label: 'Leixlip',
    walk_minutes: 55,
    cycle_minutes: 19,
    room_type: 'double',
    price_per_week: 140,
    bills_included: true,
    schedule: 'mon_fri',
    meals: 'all_meals',
    term_start: '2027-01-11',
    term_end: '2027-05-30',
    smoking_allowed: false,
    pets_in_house: false,
    quiet_hours: true,
    description:
      'Large double in Leixlip. All meals included Monday to Friday. Ten minute drive or a straight bus to campus.',
    posted_at: daysAgo(8),
    last_confirmed_at: daysAgo(3),
    photos: [],
  },
]
