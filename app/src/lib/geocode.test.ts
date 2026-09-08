import { describe, expect, it } from 'vitest'
import {
  haversineKm,
  interpretGeocodeResponse,
  interpretMatrixResponse,
  pickAreaLabel,
} from './geocode'

const MAYNOOTH = { lat: 53.3814, lng: -6.6017 }

const components = (pairs: [string, string][]) =>
  pairs.map(([long_name, type]) => ({ long_name, types: [type] }))

const result = (
  precision: string,
  location = MAYNOOTH,
  addressComponents = components([
    ['Maynooth', 'locality'],
    ['County Kildare', 'administrative_area_level_2'],
  ]),
) => ({
  formatted_address: '12 Moyglare Road, Maynooth, Co. Kildare',
  address_components: addressComponents,
  geometry: {
    location,
    location_type: precision as 'ROOFTOP',
  },
})

describe('address precision, which is an anti-fraud control', () => {
  it('accepts an exact building', () => {
    const out = interpretGeocodeResponse('OK', [result('ROOFTOP')])
    expect(out.ok).toBe(true)
  })

  it('accepts an interpolated street address, common in rural Ireland', () => {
    const out = interpretGeocodeResponse('OK', [result('RANGE_INTERPOLATED')])
    expect(out.ok).toBe(true)
  })

  it.each(['GEOMETRIC_CENTER', 'APPROXIMATE'])(
    'rejects %s, which means a road or a town, not a house',
    (precision) => {
      const out = interpretGeocodeResponse('OK', [result(precision)])
      expect(out.ok).toBe(false)
      if (!out.ok) expect(out.reason).toBe('too_vague')
    },
  )

  it('rejects an address nowhere near campus', () => {
    // Cork, about 220km away.
    const out = interpretGeocodeResponse('OK', [
      result('ROOFTOP', { lat: 51.8985, lng: -8.4756 }),
    ])
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.reason).toBe('outside_area')
  })

  it('reports a not-found address as not found', () => {
    const out = interpretGeocodeResponse('ZERO_RESULTS', [])
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.reason).toBe('not_found')
  })

  it('treats an API failure separately from a bad address', () => {
    const out = interpretGeocodeResponse('OVER_QUERY_LIMIT', [result('ROOFTOP')])
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.reason).toBe('api_error')
  })
})

describe('the public area label', () => {
  it('prefers the town', () => {
    expect(
      pickAreaLabel(
        components([
          ['Maynooth', 'locality'],
          ['County Kildare', 'administrative_area_level_2'],
        ]),
      ),
    ).toBe('Maynooth')
  })

  it('falls back to the county rather than anything street level', () => {
    expect(
      pickAreaLabel(components([['County Kildare', 'administrative_area_level_2']])),
    ).toBe('County Kildare')
  })

  it('never returns a street or a house number', () => {
    const label = pickAreaLabel(
      components([
        ['12', 'street_number'],
        ['Moyglare Road', 'route'],
      ]),
    )
    expect(label).toBe('Unknown area')
  })
})

describe('haversineKm', () => {
  it('is zero for the same point', () => {
    expect(haversineKm(MAYNOOTH, MAYNOOTH)).toBeCloseTo(0)
  })

  it('gets Maynooth to Kilcock about right (roughly 6km)', () => {
    const kilcock = { lat: 53.4022, lng: -6.6689 }
    expect(haversineKm(MAYNOOTH, kilcock)).toBeGreaterThan(4)
    expect(haversineKm(MAYNOOTH, kilcock)).toBeLessThan(8)
  })
})

describe('travel time parsing', () => {
  it('converts seconds to whole minutes', () => {
    expect(
      interpretMatrixResponse({
        status: 'OK',
        rows: [{ elements: [{ status: 'OK', duration: { value: 725 } }] }],
      }),
    ).toBe(12)
  })

  it('returns null when no route exists rather than guessing', () => {
    expect(
      interpretMatrixResponse({
        status: 'OK',
        rows: [{ elements: [{ status: 'ZERO_RESULTS' }] }],
      }),
    ).toBeNull()
  })

  it('returns null on a failed request', () => {
    expect(interpretMatrixResponse({ status: 'REQUEST_DENIED' })).toBeNull()
  })
})
