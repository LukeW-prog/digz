import { NextResponse } from 'next/server'
import { PHOTO_BUCKET } from '@/lib/photos'
import {
  cutoffForContactReveals,
  cutoffForListingContent,
  orphanedObjects,
} from '@/lib/retention'
import { createAdminClient } from '@/lib/supabase/server'

type Supabase = ReturnType<typeof createAdminClient>

/**
 * Retention and cleanup.
 *
 * Enforces the retention table in data-model.md, which until now was a
 * published promise with nothing behind it. Three jobs:
 *
 *   1. Listings gone for over a year lose their photos and their address.
 *      The row stays, because reports and outcome checks point at it.
 *   2. Contact reveals older than a year go entirely.
 *   3. Uploaded photos that no listing references are deleted, which is the
 *      only thing that will ever find the ones left behind by an abandoned
 *      listing form.
 *
 * Deliberately conservative. Everything is scoped by an explicit date or by
 * "nothing references this", and the orphan sweep ignores anything uploaded in
 * the last day so a form still being filled in is never pulled out from under
 * the host.
 */

export const maxDuration = 60

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not set' }, { status: 503 })
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  const now = new Date()
  const supabase = createAdminClient()

  const aged = await forgetOldListings(supabase, now)
  const reveals = await forgetOldReveals(supabase, now)
  const orphans = await sweepOrphanPhotos(supabase, now)

  return NextResponse.json({ ...aged, ...reveals, ...orphans })
}

/** Listings gone for over a year: drop the photos and the address, keep the row. */
async function forgetOldListings(supabase: Supabase, now: Date) {
  const cutoff = cutoffForListingContent(now).toISOString()

  const { data } = await supabase
    .from('listings')
    .select('id, listing_photos (storage_path)')
    .in('status', ['expired', 'removed'])
    .lt('removed_at', cutoff)
    .not('address_line', 'is', null)

  const listings = (data ?? []) as unknown as {
    id: string
    listing_photos: { storage_path: string }[]
  }[]

  if (listings.length === 0) return { listingsForgotten: 0 }

  const paths = listings.flatMap((l) =>
    l.listing_photos.map((p) => p.storage_path),
  )
  if (paths.length > 0) {
    await supabase.storage.from(PHOTO_BUCKET).remove(paths)
  }

  const ids = listings.map((l) => l.id)
  await supabase.from('listing_photos').delete().in('listing_id', ids)

  // The address columns are the personal part. Null rather than delete, so the
  // row still counts towards "how many listings were there" without saying
  // whose house it was.
  await supabase
    .from('listings')
    .update({
      address_line: null,
      eircode: null,
      lat: null,
      lng: null,
    })
    .in('id', ids)

  return { listingsForgotten: ids.length }
}

async function forgetOldReveals(supabase: Supabase, now: Date) {
  const cutoff = cutoffForContactReveals(now).toISOString()

  const { data } = await supabase
    .from('contact_reveals')
    .delete()
    .lt('created_at', cutoff)
    .select('id')

  return { revealsForgotten: data?.length ?? 0 }
}

/**
 * Photos in the bucket that no listing points at.
 *
 * Objects live under a folder per host, so this walks one level: the host
 * folders, then the files inside each. At MVP scale that is a handful of
 * requests; if the bucket ever grows past a few thousand hosts this wants
 * replacing with a database-side reconciliation.
 */
async function sweepOrphanPhotos(supabase: Supabase, now: Date) {
  const { data: rows } = await supabase
    .from('listing_photos')
    .select('storage_path')

  const referenced = new Set((rows ?? []).map((r) => r.storage_path))

  const { data: folders } = await supabase.storage
    .from(PHOTO_BUCKET)
    .list('', { limit: 1000 })

  const objects: { path: string; createdAt: string }[] = []

  for (const folder of folders ?? []) {
    // A file at the root has an id; a folder does not. Only folders hold
    // photos, since every path is `<host uuid>/<file>`.
    if (folder.id) continue

    const { data: files } = await supabase.storage
      .from(PHOTO_BUCKET)
      .list(folder.name, { limit: 1000 })

    for (const file of files ?? []) {
      objects.push({
        path: `${folder.name}/${file.name}`,
        createdAt: file.created_at ?? new Date().toISOString(),
      })
    }
  }

  const orphans = orphanedObjects(objects, referenced, now)

  if (orphans.length > 0) {
    await supabase.storage.from(PHOTO_BUCKET).remove(orphans)
  }

  return { photosScanned: objects.length, orphansDeleted: orphans.length }
}
