import { FRESHNESS } from './constants'
import type { ListingStatus } from './types'

/**
 * What the nightly sweep should do to one listing.
 *
 * This is the freshness mechanic from avenues.md, and it is the only reason
 * "confirmed yesterday" means anything. The host-facing confirm button already
 * existed; nothing ever asked anyone to press it, and nothing aged a listing
 * that went quiet, so every listing read as fresh forever.
 *
 * Kept pure and separate from the route so the rules can be tested at a range
 * of dates without a database or a mail provider. The route does the reading,
 * writing and sending; this decides.
 */

export type SweepRow = {
  id: string
  status: ListingStatus
  last_confirmed_at: string
  last_prompted_at: string | null
}

export type SweepAction = {
  id: string
  /** Set when the status must change. Absent means leave it alone. */
  nextStatus?: Extract<ListingStatus, 'stale' | 'expired'>
  /** Whether to email the host asking them to confirm. */
  prompt: boolean
}

const DAY = 86_400_000

export function daysBetween(from: string, to: Date): number {
  return Math.floor((to.getTime() - new Date(from).getTime()) / DAY)
}

/**
 * Returns null when there is nothing to do, so the caller can filter and see
 * at a glance how much work a run actually is.
 */
export function sweepAction(row: SweepRow, now: Date): SweepAction | null {
  // Removed and already-expired listings are done. Re-expiring an expired
  // listing would rewrite rows every night for nothing.
  if (row.status !== 'live' && row.status !== 'stale') return null

  const days = daysBetween(row.last_confirmed_at, now)

  // Past the deadline it disappears, and there is no point asking: a host who
  // has ignored three emails over two weeks is not reading a fourth.
  if (days >= FRESHNESS.expiresAfterDays) {
    return { id: row.id, nextStatus: 'expired', prompt: false }
  }

  const nextStatus =
    days >= FRESHNESS.staleAfterDays && row.status === 'live'
      ? ('stale' as const)
      : undefined

  const prompt = shouldPrompt(row, now, days)

  if (!nextStatus && !prompt) return null
  return { id: row.id, nextStatus, prompt }
}

function shouldPrompt(row: SweepRow, now: Date, days: number): boolean {
  if (days < FRESHNESS.promptAfterDays) return false
  if (!row.last_prompted_at) return true

  // Confirmed since we last asked, so this is a fresh lapse and the first
  // reminder of the new cycle is due.
  if (new Date(row.last_prompted_at) < new Date(row.last_confirmed_at)) {
    return true
  }

  return daysBetween(row.last_prompted_at, now) >= FRESHNESS.promptEveryDays
}

/**
 * The reminder email.
 *
 * Plain text, addressed to someone who is doing us a favour by keeping their
 * listing honest. It says what happens if they ignore it, because that is the
 * useful part, and it does not pretend a student is waiting when we do not
 * know that.
 */
export function promptEmail(input: {
  displayName: string
  areaLabel: string
  roomLabel: string
  daysSinceConfirmed: number
  stale: boolean
  siteUrl: string
}): { subject: string; text: string } {
  const { displayName, areaLabel, roomLabel, daysSinceConfirmed, stale } = input
  const link = `${input.siteUrl.replace(/\/$/, '')}/host/listings`
  const daysLeft = FRESHNESS.expiresAfterDays - daysSinceConfirmed

  const subject = stale
    ? `Your ${roomLabel.toLowerCase()} in ${areaLabel} is greyed out`
    : `Is your ${roomLabel.toLowerCase()} in ${areaLabel} still free?`

  const state = stale
    ? `It is showing to students with a note saying it may be gone, because it has not been confirmed for ${daysSinceConfirmed} days.`
    : `You last confirmed it ${daysSinceConfirmed} days ago.`

  const deadline =
    daysLeft <= 1
      ? 'It comes off the site tomorrow if nobody confirms it.'
      : `It comes off the site in ${daysLeft} days if nobody confirms it.`

  return {
    subject,
    text: [
      `Hello ${displayName},`,
      '',
      state,
      '',
      'One click either way:',
      link,
      '',
      deadline,
      '',
      'If it is taken, take it down there too. That is more useful to students than leaving it up, and it is the whole point of the site.',
      '',
      'Digs',
    ].join('\n'),
  }
}
