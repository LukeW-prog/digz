import { afterEach, describe, expect, it } from 'vitest'
import { isAdminEmail } from './admin'

const ORIGINAL = process.env.ADMIN_EMAILS

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.ADMIN_EMAILS
  else process.env.ADMIN_EMAILS = ORIGINAL
})

describe('isAdminEmail', () => {
  // The important one. An unset env var must lock everyone out, not let
  // everyone in, and this is the sort of thing that is only ever noticed in
  // production if it is not tested here.
  it('admits nobody when the list is unset or empty', () => {
    delete process.env.ADMIN_EMAILS
    expect(isAdminEmail('anyone@example.com')).toBe(false)

    process.env.ADMIN_EMAILS = ''
    expect(isAdminEmail('anyone@example.com')).toBe(false)

    process.env.ADMIN_EMAILS = '   ,  ,'
    expect(isAdminEmail('anyone@example.com')).toBe(false)
  })

  it('admits an address on the list', () => {
    process.env.ADMIN_EMAILS = 'ops@digs.ie'
    expect(isAdminEmail('ops@digs.ie')).toBe(true)
  })

  it('ignores case and surrounding space in the list and the address', () => {
    process.env.ADMIN_EMAILS = ' Ops@Digs.ie , second@digs.ie '
    expect(isAdminEmail('OPS@digs.IE')).toBe(true)
    expect(isAdminEmail('second@digs.ie')).toBe(true)
  })

  it('refuses anyone not on it', () => {
    process.env.ADMIN_EMAILS = 'ops@digs.ie'
    expect(isAdminEmail('someone@digs.ie')).toBe(false)
    expect(isAdminEmail('ops@digs.ie.attacker.com')).toBe(false)
    expect(isAdminEmail('')).toBe(false)
    expect(isAdminEmail(null)).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
  })
})
