import { describe, expect, it } from 'vitest'
import {
  RETENTION,
  cutoffForContactReveals,
  cutoffForListingContent,
  orphanedObjects,
} from './retention'

const NOW = new Date('2027-06-01T12:00:00Z')
const hoursAgo = (n: number) =>
  new Date(NOW.getTime() - n * 3_600_000).toISOString()

describe('cutoffs', () => {
  it('looks back about a year for listing content', () => {
    const months =
      (NOW.getTime() - cutoffForListingContent(NOW).getTime()) /
      (30 * 86_400_000)
    expect(Math.round(months)).toBe(RETENTION.listingContentMonths)
  })

  it('looks back about a year for contact reveals', () => {
    const months =
      (NOW.getTime() - cutoffForContactReveals(NOW).getTime()) /
      (30 * 86_400_000)
    expect(Math.round(months)).toBe(RETENTION.contactRevealMonths)
  })
})

describe('orphanedObjects', () => {
  const referenced = new Set(['host-a/kept.jpg'])

  it('leaves a photo a listing still points at', () => {
    const objects = [{ path: 'host-a/kept.jpg', createdAt: hoursAgo(500) }]
    expect(orphanedObjects(objects, referenced, NOW)).toEqual([])
  })

  it('deletes an old photo nothing references', () => {
    const objects = [{ path: 'host-a/lost.jpg', createdAt: hoursAgo(500) }]
    expect(orphanedObjects(objects, referenced, NOW)).toEqual(['host-a/lost.jpg'])
  })

  // The one that would hurt a real host. Photos upload before the listing row
  // exists, so during the minutes someone is still filling in the form their
  // uploads look exactly like orphans.
  it('spares a photo uploaded moments ago, mid-form', () => {
    const objects = [{ path: 'host-a/in-progress.jpg', createdAt: hoursAgo(1) }]
    expect(orphanedObjects(objects, referenced, NOW)).toEqual([])
  })

  it('spares anything inside the grace period', () => {
    const justInside = hoursAgo(RETENTION.orphanGraceHours - 1)
    const objects = [{ path: 'host-a/recent.jpg', createdAt: justInside }]
    expect(orphanedObjects(objects, referenced, NOW)).toEqual([])
  })

  it('takes one just outside it', () => {
    const justOutside = hoursAgo(RETENTION.orphanGraceHours + 1)
    const objects = [{ path: 'host-a/stale.jpg', createdAt: justOutside }]
    expect(orphanedObjects(objects, referenced, NOW)).toEqual(['host-a/stale.jpg'])
  })

  it('handles an empty bucket and an empty reference set', () => {
    expect(orphanedObjects([], referenced, NOW)).toEqual([])
    expect(
      orphanedObjects(
        [{ path: 'host-a/x.jpg', createdAt: hoursAgo(500) }],
        new Set(),
        NOW,
      ),
    ).toEqual(['host-a/x.jpg'])
  })

  it('keeps host folders apart, so a name collision cannot delete the wrong file', () => {
    const objects = [
      { path: 'host-a/photo.jpg', createdAt: hoursAgo(500) },
      { path: 'host-b/photo.jpg', createdAt: hoursAgo(500) },
    ]
    const kept = new Set(['host-a/photo.jpg'])
    expect(orphanedObjects(objects, kept, NOW)).toEqual(['host-b/photo.jpg'])
  })
})
