/**
 * How long things are kept, from the retention table in data-model.md.
 *
 * That table was written and nothing enforced it, which is the worse of the
 * two states: a published privacy notice promising deletion that never
 * happens is a stronger claim against you than having no policy at all.
 *
 * The rules are here and pure so the dates can be tested without a database,
 * and so the numbers live in one place rather than being scattered as literals
 * through a cron route.
 */

export const RETENTION = {
  /**
   * Expired and removed listings: keep the row, drop the photos and the
   * address. The row stays because reports and outcome checks point at it and
   * because "how many listings did we ever have" is worth knowing. The address
   * and the photos are the personal part, and neither is needed after a year.
   */
  listingContentMonths: 12,

  /** Contact reveals. The success metric is counted long before this. */
  contactRevealMonths: 12,

  /**
   * An uploaded photo that no listing references. A host who fills in the form
   * and abandons it leaves these behind, and nothing else will ever find them.
   *
   * The grace period matters: photos upload before the listing row exists, so
   * anything younger than this may belong to a form somebody is still filling
   * in. Deleting those would break the upload as the host watched.
   */
  orphanGraceHours: 24,
} as const

const MONTH = 30 * 86_400_000

export function cutoffForListingContent(now: Date): Date {
  return new Date(now.getTime() - RETENTION.listingContentMonths * MONTH)
}

export function cutoffForContactReveals(now: Date): Date {
  return new Date(now.getTime() - RETENTION.contactRevealMonths * MONTH)
}

export function cutoffForOrphans(now: Date): Date {
  return new Date(now.getTime() - RETENTION.orphanGraceHours * 3_600_000)
}

/**
 * Which stored objects are safe to delete.
 *
 * Two conditions, and both matter. Referenced tells us a listing still points
 * at it. The age check covers the window between an upload finishing and the
 * listing row being written, which is exactly when a photo looks orphaned and
 * is not.
 */
export function orphanedObjects(
  objects: { path: string; createdAt: string }[],
  referenced: Set<string>,
  now: Date,
): string[] {
  const cutoff = cutoffForOrphans(now).getTime()

  return objects
    .filter((object) => !referenced.has(object.path))
    .filter((object) => new Date(object.createdAt).getTime() < cutoff)
    .map((object) => object.path)
}
