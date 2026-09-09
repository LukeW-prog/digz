/**
 * Domain types. These mirror the enums in supabase/migrations/0001_init.sql.
 * If you change one, change both.
 */

export const LISTING_STATUS = ['live', 'stale', 'expired', 'removed'] as const
export type ListingStatus = (typeof LISTING_STATUS)[number]

export const ROOM_TYPE = ['single', 'double', 'twin'] as const
export type RoomType = (typeof ROOM_TYPE)[number]

export const SCHEDULE = ['mon_fri', 'full_week', 'either'] as const
export type Schedule = (typeof SCHEDULE)[number]

export const MEALS = [
  'none',
  'weekday_dinner',
  'weekday_dinner_and_weekend',
  'all_meals',
] as const
export type Meals = (typeof MEALS)[number]

export const REPORT_REASON = [
  'scam',
  'discriminatory',
  'not_real',
  'already_gone',
  'unsafe',
  'other',
] as const
export type ReportReason = (typeof REPORT_REASON)[number]

/** What an admin may decide about a report. DSA Article 16 needs a reason too. */
export const REPORT_DECISION = ['removed', 'kept', 'host_blocked'] as const
export type ReportDecision = (typeof REPORT_DECISION)[number]

export const REPORT_DECISION_LABEL: Record<ReportDecision, string> = {
  removed: 'Take the listing down',
  kept: 'Leave it up',
  host_blocked: 'Block the host',
}

/** Labels shown to people. Kept next to the values so they cannot drift. */

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  single: 'Single room',
  double: 'Double room',
  twin: 'Twin room',
}

export const SCHEDULE_LABEL: Record<Schedule, string> = {
  mon_fri: 'Monday to Friday',
  full_week: 'Full week',
  either: 'Either, flexible',
}

export const MEALS_LABEL: Record<Meals, string> = {
  none: 'No meals',
  weekday_dinner: 'Weekday dinner',
  weekday_dinner_and_weekend: 'Weekday dinner and weekend meals',
  all_meals: 'All meals',
}

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  scam: 'This looks like a scam',
  discriminatory: 'This listing discriminates',
  not_real: 'This property does not exist',
  already_gone: 'This room is already taken',
  unsafe: 'This is unsafe',
  other: 'Something else',
}

/**
 * A listing as the public sees it. Note what is missing: address_line,
 * eircode, lat and lng never leave the server. See data-model.md.
 */
export type PublicListing = {
  id: string
  status: ListingStatus
  area_label: string
  walk_minutes: number | null
  cycle_minutes: number | null
  room_type: RoomType
  price_per_week: number
  bills_included: boolean
  schedule: Schedule
  meals: Meals
  term_start: string | null
  term_end: string | null
  smoking_allowed: boolean
  pets_in_house: boolean
  quiet_hours: boolean
  description: string | null
  posted_at: string
  last_confirmed_at: string
  photos: { storage_path: string; subject?: string | null }[]
}

/** The columns safe to select for public views. Use this, never `*`. */
export const PUBLIC_LISTING_COLUMNS = [
  'id',
  'status',
  'area_label',
  'walk_minutes',
  'cycle_minutes',
  'room_type',
  'price_per_week',
  'bills_included',
  'schedule',
  'meals',
  'term_start',
  'term_end',
  'smoking_allowed',
  'pets_in_house',
  'quiet_hours',
  'description',
  'posted_at',
  'last_confirmed_at',
].join(', ')
