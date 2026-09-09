/** Values that appear in more than one place. Change them here only. */

/** Maynooth University, North Campus. Origin for every walk and cycle time. */
export const CAMPUS = {
  lat: Number(process.env.NEXT_PUBLIC_CAMPUS_LAT ?? 53.3814),
  lng: Number(process.env.NEXT_PUBLIC_CAMPUS_LNG ?? -6.6017),
  name: 'Maynooth University',
} as const

/** Listing rules, from mvp.md. */
export const LISTING = {
  /** Free text cap. Enough to describe the house, not to describe the lodger. */
  descriptionMaxLength: 300,
  minPhotos: 5,
  maxPhotos: 10,
  /** Sanity bounds on weekly price, in euro. Research says digs runs 120-150. */
  minPricePerWeek: 40,
  maxPricePerWeek: 500,
} as const

/** Freshness, from mvp.md. Host confirms weekly or the listing ages out. */
export const FRESHNESS = {
  /** Unconfirmed for this long and the listing greys out but still shows. */
  staleAfterDays: 7,
  /** Unconfirmed for this long and it is hidden. */
  expiresAfterDays: 14,

  /**
   * Ask the host to confirm from this day on, a day before the listing greys
   * out. Asking earlier trains hosts to ignore the email; asking only once it
   * has already greyed out means students saw a stale listing first.
   */
  promptAfterDays: 6,

  /**
   * And no more often than this. Between day 6 and day 14 that is at most
   * three emails: one before it greys out, one after, one before it vanishes.
   */
  promptEveryDays: 3,
} as const

/**
 * The two-week outcome check, from the success criteria in mvp.md.
 *
 * Contacts are easy to count and mean little on their own. This is the only
 * thing that says whether anyone actually got a room, so the kill gate is
 * measurable rather than a guess.
 */
export const OUTCOME = {
  /** Long enough for a viewing and a decision, short enough to be remembered. */
  askAfterDays: 14,
} as const

/**
 * The safety notice a student accepts before a host contact is revealed.
 * Bump the version whenever the wording changes. The accepted version is
 * stored on every contact_reveals row, so we can always say what someone saw.
 */
export const SAFETY_NOTICE_VERSION = '2026-09-08'
