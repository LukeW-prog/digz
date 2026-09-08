import { describe, expect, it } from 'vitest'
import { listingSchema, listingFromFormData, fieldErrors } from './listing-schema'

const valid = {
  addressLine: '12 Moyglare Road',
  eircode: 'W23 F6D8',
  roomType: 'single',
  pricePerWeek: '130',
  billsIncluded: true,
  schedule: 'mon_fri',
  meals: 'weekday_dinner',
  termStart: '',
  termEnd: '',
  smokingAllowed: false,
  petsInHouse: false,
  quietHours: true,
  description: 'Quiet house, ten minutes from the front gate.',
}

const parse = (overrides: Partial<typeof valid> = {}) =>
  listingSchema.safeParse({ ...valid, ...overrides })

describe('listing validation', () => {
  it('accepts a normal listing', () => {
    const out = parse()
    expect(out.success).toBe(true)
    if (out.success) {
      expect(out.data.pricePerWeek).toBe(130)
      expect(out.data.termStart).toBeUndefined()
    }
  })

  it.each(['W23 F6D8', 'w23f6d8', 'D02 X285'])(
    'accepts the Eircode %s',
    (eircode) => {
      expect(parse({ eircode }).success).toBe(true)
    },
  )

  it.each(['', 'NOT AN EIRCODE', '123456'])(
    'rejects %s as an Eircode',
    (eircode) => {
      expect(parse({ eircode }).success).toBe(false)
    },
  )

  it('rejects a price below the sanity floor', () => {
    expect(parse({ pricePerWeek: '10' }).success).toBe(false)
  })

  it('rejects a price that is really a monthly figure', () => {
    // The commonest data-entry error: typing 600 for a month, not a week.
    expect(parse({ pricePerWeek: '600' }).success).toBe(false)
  })

  it('rejects an end date before the start date', () => {
    const out = parse({ termStart: '2027-05-01', termEnd: '2027-01-01' })
    expect(out.success).toBe(false)
    if (!out.success) {
      expect(fieldErrors(out.error).termEnd).toMatch(/after the start date/i)
    }
  })

  it('accepts a listing with no description at all', () => {
    const out = parse({ description: '' })
    expect(out.success).toBe(true)
    if (out.success) expect(out.data.description).toBeUndefined()
  })

  it('rejects a description over the cap', () => {
    expect(parse({ description: 'x'.repeat(301) }).success).toBe(false)
  })
})

describe('reading the form', () => {
  it('maps checkboxes and text fields off FormData', () => {
    const form = new FormData()
    form.set('addressLine', '12 Moyglare Road')
    form.set('eircode', 'W23 F6D8')
    form.set('roomType', 'double')
    form.set('pricePerWeek', '150')
    form.set('schedule', 'full_week')
    form.set('billsIncluded', 'on')

    const out = listingFromFormData(form)
    expect(out.billsIncluded).toBe(true)
    expect(out.smokingAllowed).toBe(false)
    expect(out.meals).toBe('none')
    expect(out.description).toBe('')
  })
})
