import { CAMPUS } from './constants'

/**
 * Geocoding and travel time, via Google Maps Platform.
 *
 * Called once when a listing is submitted. The results are stored on the row
 * and never recomputed, so cost scales with new listings, not with searches.
 *
 * This module carries two anti-fraud controls from safety.md, not just the
 * walk-time feature:
 *
 *   1. The address must resolve to an actual building, not a town centre.
 *      Counters the fake-property scam.
 *   2. It returns coordinates, which is what makes one-live-listing-per-address
 *      enforceable. Counters the mass-showings scam.
 *
 * Doing walk time by hand would delete both.
 */

export type GeocodeSuccess = {
  ok: true
  lat: number
  lng: number
  /** Public, coarse. "Maynooth", "Kilcock". Never the street address. */
  areaLabel: string
  formattedAddress: string
  precision: GooglePrecision
}

export type GeocodeFailure = {
  ok: false
  reason: 'not_found' | 'too_vague' | 'outside_area' | 'api_error'
  message: string
}

export type GeocodeResult = GeocodeSuccess | GeocodeFailure

type GooglePrecision =
  | 'ROOFTOP'
  | 'RANGE_INTERPOLATED'
  | 'GEOMETRIC_CENTER'
  | 'APPROXIMATE'

/**
 * Precise enough to be a real building.
 *
 * ROOFTOP is an exact building. RANGE_INTERPOLATED is a point interpolated
 * between two known addresses on a street, which is normal for rural Irish
 * addresses and still specific.
 *
 * GEOMETRIC_CENTER and APPROXIMATE mean Google found a road, a townland or a
 * town, not a house. Those are rejected: "somewhere in Maynooth" is exactly
 * what a fake listing looks like.
 */
const ACCEPTABLE_PRECISION: GooglePrecision[] = ['ROOFTOP', 'RANGE_INTERPOLATED']

/** Listings must be within this far of campus. Generous on purpose. */
const MAX_KM_FROM_CAMPUS = 30

type GoogleAddressComponent = {
  long_name: string
  types: string[]
}

type GoogleGeocodeResult = {
  formatted_address: string
  address_components: GoogleAddressComponent[]
  geometry: {
    location: { lat: number; lng: number }
    location_type: GooglePrecision
  }
}

/**
 * Pick the public area label from Google's address components.
 *
 * Preference order matters: `locality` is the town ("Maynooth"), and
 * `postal_town` covers it where locality is missing. We deliberately fall back
 * to the county rather than to anything street-level, because this string is
 * shown publicly and must never narrow to a house.
 */
export function pickAreaLabel(components: GoogleAddressComponent[]): string {
  const byType = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name

  return (
    byType('locality') ??
    byType('postal_town') ??
    byType('administrative_area_level_2') ??
    byType('administrative_area_level_1') ??
    'Unknown area'
  )
}

/** Great-circle distance in km. Used only as a sanity bound, not for display. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Turn a raw Google geocode response into our result type. Pure, so testable. */
export function interpretGeocodeResponse(
  status: string,
  results: GoogleGeocodeResult[],
): GeocodeResult {
  if (status === 'ZERO_RESULTS' || results.length === 0) {
    return {
      ok: false,
      reason: 'not_found',
      message:
        'We could not find that address. Check the Eircode and try again.',
    }
  }

  if (status !== 'OK') {
    return {
      ok: false,
      reason: 'api_error',
      message: 'Address lookup is temporarily unavailable. Try again shortly.',
    }
  }

  const top = results[0]
  const precision = top.geometry.location_type

  if (!ACCEPTABLE_PRECISION.includes(precision)) {
    return {
      ok: false,
      reason: 'too_vague',
      message:
        'That address only matched an area, not a specific building. Add the house name or number, and the Eircode.',
    }
  }

  const { lat, lng } = top.geometry.location

  if (haversineKm({ lat, lng }, CAMPUS) > MAX_KM_FROM_CAMPUS) {
    return {
      ok: false,
      reason: 'outside_area',
      message: `That address is too far from ${CAMPUS.name}. We only cover Maynooth and the surrounding towns for now.`,
    }
  }

  return {
    ok: true,
    lat,
    lng,
    areaLabel: pickAreaLabel(top.address_components),
    formattedAddress: top.formatted_address,
    precision,
  }
}

/** Look up an address. Eircode included because it makes Irish results exact. */
export async function geocodeAddress(
  addressLine: string,
  eircode: string,
): Promise<GeocodeResult> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) {
    return {
      ok: false,
      reason: 'api_error',
      message: 'Address lookup is not configured.',
    }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', `${addressLine}, ${eircode}, Ireland`)
  url.searchParams.set('components', 'country:IE')
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const body = await res.json()
    return interpretGeocodeResponse(body.status, body.results ?? [])
  } catch {
    return {
      ok: false,
      reason: 'api_error',
      message: 'Address lookup is temporarily unavailable. Try again shortly.',
    }
  }
}

export type TravelTimes = {
  walkMinutes: number | null
  cycleMinutes: number | null
}

/** Read minutes off a Distance Matrix response. Pure, so testable. */
export function interpretMatrixResponse(body: {
  status?: string
  rows?: { elements?: { status?: string; duration?: { value?: number } }[] }[]
}): number | null {
  if (body.status !== 'OK') return null
  const element = body.rows?.[0]?.elements?.[0]
  if (!element || element.status !== 'OK') return null
  const seconds = element.duration?.value
  if (typeof seconds !== 'number') return null
  return Math.round(seconds / 60)
}

async function durationMinutes(
  origin: { lat: number; lng: number },
  mode: 'walking' | 'bicycling',
): Promise<number | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return null

  const url = new URL(
    'https://maps.googleapis.com/maps/api/distancematrix/json',
  )
  url.searchParams.set('origins', `${origin.lat},${origin.lng}`)
  url.searchParams.set('destinations', `${CAMPUS.lat},${CAMPUS.lng}`)
  url.searchParams.set('mode', mode)
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url, { cache: 'no-store' })
    return interpretMatrixResponse(await res.json())
  } catch {
    return null
  }
}

/**
 * Walk and cycle time to campus.
 *
 * Returns nulls rather than throwing. A listing without travel times is worse
 * than one with them, but far better than a submission the host cannot
 * complete because Google had a bad minute. The admin list shows which
 * listings are missing times so they can be backfilled.
 */
export async function travelTimesToCampus(origin: {
  lat: number
  lng: number
}): Promise<TravelTimes> {
  const [walkMinutes, cycleMinutes] = await Promise.all([
    durationMinutes(origin, 'walking'),
    durationMinutes(origin, 'bicycling'),
  ])

  return { walkMinutes, cycleMinutes }
}
