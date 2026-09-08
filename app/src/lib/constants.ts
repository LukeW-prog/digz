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
} as const

/**
 * The safety notice a student accepts before a host contact is revealed.
 * Bump the version whenever the wording changes. The accepted version is
 * stored on every contact_reveals row, so we can always say what someone saw.
 */
export const SAFETY_NOTICE_VERSION = '2026-09-08'
