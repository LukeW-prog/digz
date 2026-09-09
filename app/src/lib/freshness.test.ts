import { describe, expect, it } from 'vitest'
import { FRESHNESS } from './constants'
import { daysBetween, promptEmail, sweepAction, type SweepRow } from './freshness'

const NOW = new Date('2027-02-01T08:00:00Z')

/** A listing confirmed `days` ago, never prompted, still live. */
function row(days: number, overrides: Partial<SweepRow> = {}): SweepRow {
  return {
    id: 'l1',
    status: 'live',
    last_confirmed_at: new Date(
      NOW.getTime() - days * 86_400_000,
    ).toISOString(),
    last_prompted_at: null,
    ...overrides,
  }
}

describe('sweepAction', () => {
  it('leaves a freshly confirmed listing alone', () => {
    expect(sweepAction(row(0), NOW)).toBeNull()
    expect(sweepAction(row(3), NOW)).toBeNull()
  })

  it('says nothing on day 5, the day before the first reminder', () => {
    expect(sweepAction(row(5), NOW)).toBeNull()
  })

  it('emails on day 6, before the listing greys out', () => {
    expect(sweepAction(row(6), NOW)).toEqual({
      id: 'l1',
      nextStatus: undefined,
      prompt: true,
    })
  })

  it('greys the listing out on day 7 and says so', () => {
    expect(sweepAction(row(7), NOW)).toEqual({
      id: 'l1',
      nextStatus: 'stale',
      prompt: true,
    })
  })

  it('does not re-stale a listing that is already stale', () => {
    const action = sweepAction(row(7, { status: 'stale' }), NOW)
    expect(action?.nextStatus).toBeUndefined()
  })

  it('expires on day 14 and stops emailing', () => {
    expect(sweepAction(row(14, { status: 'stale' }), NOW)).toEqual({
      id: 'l1',
      nextStatus: 'expired',
      prompt: false,
    })
  })

  it('ignores listings that are already expired or removed', () => {
    expect(sweepAction(row(30, { status: 'expired' }), NOW)).toBeNull()
    expect(sweepAction(row(30, { status: 'removed' }), NOW)).toBeNull()
  })

  // The point of last_prompted_at: running the job repeatedly must not send
  // repeatedly. This is the case a missed or doubled cron run exercises.
  it('does not email twice in the same window', () => {
    const prompted = row(7, {
      last_prompted_at: new Date(NOW.getTime() - 86_400_000).toISOString(),
      status: 'stale',
    })
    expect(sweepAction(prompted, NOW)).toBeNull()
  })

  it('emails again once the gap has passed', () => {
    const prompted = row(10, {
      status: 'stale',
      last_prompted_at: new Date(
        NOW.getTime() - FRESHNESS.promptEveryDays * 86_400_000,
      ).toISOString(),
    })
    expect(sweepAction(prompted, NOW)?.prompt).toBe(true)
  })

  // A host who confirms and then lapses again starts a new cycle, even though
  // last_prompted_at is set from the previous one.
  it('treats a confirmation since the last email as a fresh cycle', () => {
    const reconfirmed: SweepRow = {
      id: 'l1',
      status: 'live',
      last_confirmed_at: new Date(
        NOW.getTime() - 6 * 86_400_000,
      ).toISOString(),
      last_prompted_at: new Date(
        NOW.getTime() - 20 * 86_400_000,
      ).toISOString(),
    }
    expect(sweepAction(reconfirmed, NOW)?.prompt).toBe(true)
  })

  it('sends at most three emails across a full lapse', () => {
    let current = row(0)
    let sends = 0

    for (let day = 1; day <= FRESHNESS.expiresAfterDays; day++) {
      const at = new Date(NOW.getTime() + day * 86_400_000)
      const action = sweepAction(current, at)
      if (action?.prompt) {
        sends++
        current = { ...current, last_prompted_at: at.toISOString() }
      }
      if (action?.nextStatus) {
        current = { ...current, status: action.nextStatus }
      }
    }

    expect(sends).toBe(3)
    expect(current.status).toBe('expired')
  })
})

describe('daysBetween', () => {
  it('floors, so a listing is 1 day old until the next whole day passes', () => {
    const from = new Date(NOW.getTime() - 1.9 * 86_400_000).toISOString()
    expect(daysBetween(from, NOW)).toBe(1)
  })
})

describe('promptEmail', () => {
  const base = {
    displayName: 'Mary',
    areaLabel: 'Maynooth',
    roomLabel: 'Single room',
    siteUrl: 'https://digs.ie',
  }

  it('asks a question while the listing is still showing normally', () => {
    const mail = promptEmail({ ...base, daysSinceConfirmed: 6, stale: false })
    expect(mail.subject).toBe('Is your single room in Maynooth still free?')
    expect(mail.text).toContain('You last confirmed it 6 days ago.')
    expect(mail.text).toContain('comes off the site in 8 days')
  })

  it('states the consequence once it has greyed out', () => {
    const mail = promptEmail({ ...base, daysSinceConfirmed: 9, stale: true })
    expect(mail.subject).toContain('greyed out')
    expect(mail.text).toContain('may be gone')
  })

  it('says tomorrow rather than "in 1 days" on the last day', () => {
    const mail = promptEmail({ ...base, daysSinceConfirmed: 13, stale: true })
    expect(mail.text).toContain('comes off the site tomorrow')
    expect(mail.text).not.toContain('1 days')
  })

  it('links to the host page and never trails a double slash', () => {
    const mail = promptEmail({
      ...base,
      siteUrl: 'https://digs.ie/',
      daysSinceConfirmed: 6,
      stale: false,
    })
    expect(mail.text).toContain('https://digs.ie/host/listings')
    expect(mail.text).not.toContain('digs.ie//')
  })
})
