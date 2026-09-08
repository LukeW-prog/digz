import { describe, expect, it } from 'vitest'
import { maskPhone, normalisePhone } from './phone'

const ok = (raw: string) => {
  const out = normalisePhone(raw)
  return out.ok ? out.e164 : `REJECTED: ${out.message}`
}

describe('Irish mobile numbers', () => {
  it.each([
    ['087 123 4567', '+353871234567'],
    ['0871234567', '+353871234567'],
    ['+353 87 123 4567', '+353871234567'],
    ['00353871234567', '+353871234567'],
    ['353871234567', '+353871234567'],
    ['(087) 123-4567', '+353871234567'],
    ['871234567', '+353871234567'],
  ])('normalises %s', (input, expected) => {
    expect(ok(input)).toBe(expected)
  })

  it('handles the trunk zero left in after the country code', () => {
    // +353 087 ... is wrong but extremely common.
    expect(ok('+3530871234567')).toBe('+353871234567')
  })

  it.each(['82', '83', '84', '85', '86', '87', '88', '89'])(
    'accepts the 0%s prefix',
    (prefix) => {
      expect(ok(`0${prefix}1234567`)).toBe(`+353${prefix}1234567`)
    },
  )
})

describe('rejections', () => {
  it('rejects a landline, because we need to text a code', () => {
    const out = normalisePhone('01 234 5678')
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.message).toMatch(/mobile/i)
  })

  it('rejects a number that is too short', () => {
    const out = normalisePhone('087 123')
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.message).toMatch(/nine digits/i)
  })

  it('rejects a number that is too long', () => {
    expect(normalisePhone('087 123 45678').ok).toBe(false)
  })

  it('rejects a non-Irish international number', () => {
    const out = normalisePhone('+44 7700 900000')
    expect(out.ok).toBe(false)
    if (!out.ok) expect(out.message).toMatch(/Irish mobile/i)
  })

  it('rejects empty input', () => {
    expect(normalisePhone('   ').ok).toBe(false)
  })

  it('rejects letters', () => {
    expect(normalisePhone('not a phone').ok).toBe(false)
  })
})

describe('display', () => {
  it('formats the way an Irish person would say it', () => {
    const out = normalisePhone('+353871234567')
    expect(out.ok && out.display).toBe('087 123 4567')
  })

  it('masks all but the last four digits', () => {
    expect(maskPhone('+353871234567')).toBe('••••••4567')
  })
})
