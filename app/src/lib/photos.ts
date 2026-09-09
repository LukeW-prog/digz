/**
 * Where a listing photo actually lives.
 *
 * Two kinds of path reach this function and they resolve differently:
 *
 *   /sample/bedroom-01.jpg              a development fixture in public/
 *   9f3c.../a1b2....jpg                 an object in Supabase Storage
 *
 * The leading slash is the tell. Sample data is only ever used when Supabase
 * is not configured, so the two can never appear on the same page.
 */

/** The Storage bucket holding every listing photo. */
export const PHOTO_BUCKET = 'listing-photos'

/** What a host may upload. Checked in the browser and again on the server. */
export const PHOTO_UPLOAD = {
  /** Formats every phone camera produces, and nothing that can carry script. */
  accept: ['image/jpeg', 'image/png', 'image/webp'] as const,
  /** 8 MB. A modern phone photo is 2-5 MB, so this is generous but bounded. */
  maxBytes: 8 * 1024 * 1024,

  /**
   * Every photo is redrawn to at most this on its long edge and re-encoded as
   * JPEG before it is uploaded. Two reasons, and the first is the important
   * one.
   *
   * A phone photo carries EXIF, and EXIF carries GPS. The bucket is public, so
   * uploading the original bytes would publish the coordinates of the host's
   * house — the one thing data-model.md says never leaves the server. Drawing
   * the image to a canvas keeps the pixels and drops every tag.
   *
   * It also cuts a 4 MB photo to a few hundred kilobytes, which matters on the
   * free tier's 1 GB and matters more to a host uploading ten photos over a
   * phone connection.
   */
  maxDimension: 1600,
  quality: 0.82,
} as const

export type PhotoRef = { storage_path: string; subject?: string | null }

/**
 * What a photo can show.
 *
 * A fixed list rather than a free-text alt box, because this is answered and
 * that is not. One tap per photo at the end of a long form gets done; writing
 * a sentence about a picture you are looking at does not, and what comes back
 * when it is forced is "room" ten times, which is worse than nothing because
 * it sounds like a description.
 *
 * The room itself comes first: it is the one photo every student looks for.
 */
export const PHOTO_SUBJECT = [
  'room',
  'kitchen',
  'bathroom',
  'sitting_room',
  'dining_room',
  'outside',
  'other',
] as const

export type PhotoSubject = (typeof PHOTO_SUBJECT)[number]

export const PHOTO_SUBJECT_LABEL: Record<PhotoSubject, string> = {
  room: 'The room',
  kitchen: 'The kitchen',
  bathroom: 'The bathroom',
  sitting_room: 'The sitting room',
  dining_room: 'The dining room',
  outside: 'Outside the house',
  other: 'Somewhere else in the house',
}

export function isPhotoSubject(value: unknown): value is PhotoSubject {
  return (
    typeof value === 'string' &&
    (PHOTO_SUBJECT as readonly string[]).includes(value)
  )
}

/**
 * The alt text for one photo.
 *
 * Falls back to position when the host said nothing. Position is not a
 * description, but it is true, and it at least tells someone how many photos
 * they are moving through.
 */
export function photoAlt(
  subject: string | null | undefined,
  index: number,
  total: number,
): string {
  const position = `Photo ${index + 1} of ${total}`
  if (!isPhotoSubject(subject)) return position
  return `${PHOTO_SUBJECT_LABEL[subject]}. ${position}`
}

/**
 * Resolve a stored path to something an `<img>` can load.
 *
 * Storage objects are served from the public bucket rather than through signed
 * URLs. That is a deliberate trade: signed URLs would expire, which is better
 * for privacy, but it costs an API round trip on every search render and the
 * links break in a shared or cached page. The mitigation is that object paths
 * are random UUIDs, so they cannot be guessed or enumerated.
 *
 * Be precise about the rest: objects are not deleted the moment a listing goes.
 * They are deleted a year after it is removed or expires, by the nightly job in
 * api/cron/retention, along with the address. Until then a URL somebody already
 * has keeps working. See the retention table in data-model.md.
 */
export function photoUrl(storagePath: string): string {
  if (storagePath.startsWith('/')) return storagePath

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return storagePath

  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${PHOTO_BUCKET}/${storagePath}`
}

/**
 * The photo to lead with, or null when a listing has none.
 *
 * Listings without photos still show. mvp.md requires five before a host can
 * post, but that rule is enforced at the form and older rows may predate it,
 * so nothing downstream may assume a photo exists.
 */
export function leadPhoto(photos: PhotoRef[]): string | null {
  return photos.length > 0 ? photoUrl(photos[0].storage_path) : null
}

/**
 * Read the hidden field the uploader writes.
 *
 * It is a JSON array of strings arriving from a form field, which is to say it
 * is whatever the client felt like sending. Anything unexpected becomes an
 * empty list rather than an exception, so a malformed submission fails the
 * minimum-photo check with a message a host can act on instead of a 500.
 *
 * Lives here rather than in the action because a 'use server' module may only
 * export async functions, and this needs to be directly testable.
 */
export function parsePhotoPaths(value: unknown): SubmittedPhoto[] {
  if (typeof value !== 'string' || value === '') return []

  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((entry): SubmittedPhoto[] => {
      // Older submissions sent a bare array of paths. Accept both, so a form
      // open in a tab across a deploy does not lose the host's photos.
      if (typeof entry === 'string' && entry !== '') {
        return [{ path: entry, subject: null }]
      }

      if (
        entry &&
        typeof entry === 'object' &&
        'path' in entry &&
        typeof (entry as { path: unknown }).path === 'string' &&
        (entry as { path: string }).path !== ''
      ) {
        const subject = (entry as { subject?: unknown }).subject
        return [
          {
            path: (entry as { path: string }).path,
            // Anything not on the list becomes null rather than being stored.
            // The column feeds alt text, so it must never carry text a host
            // chose freely.
            subject: isPhotoSubject(subject) ? subject : null,
          },
        ]
      }

      return []
    })
  } catch {
    return []
  }
}

export type SubmittedPhoto = { path: string; subject: PhotoSubject | null }
