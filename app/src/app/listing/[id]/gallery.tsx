import Image from 'next/image'
import { ViewTransition } from 'react'
import { photoUrl, type PhotoRef } from '@/lib/photos'

/**
 * The photos, as one lead image and a rail of the rest.
 *
 * No lightbox and no JavaScript. A rail that scrolls with a snap is native
 * behaviour on every phone, works on a bad connection, and keeps the page
 * free of the modal-over-modal pattern that makes property sites tiring.
 *
 * The lead image carries the same view transition name as the thumbnail on
 * the search row, so it grows out of the row you clicked instead of appearing.
 *
 * Alt text is positional rather than descriptive. Hosts write no caption, so
 * anything else would be invented. Host-written alt text is the right fix and
 * is not built yet.
 */
export function Gallery({
  listingId,
  photos,
}: {
  listingId: string
  photos: PhotoRef[]
}) {
  if (photos.length === 0) return null

  const [lead, ...rest] = photos

  return (
    <section
      className="mt-8"
      aria-label={`Photos of this room, ${photos.length} in total`}
    >
      <ViewTransition name={`photo-${listingId}`}>
        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-rule">
          <Image
            src={photoUrl(lead.storage_path)}
            alt={`Photo 1 of ${photos.length}`}
            fill
            priority
            sizes="(min-width: 1024px) 44rem, 100vw"
            className="object-cover"
          />
        </div>
      </ViewTransition>

      {rest.length > 0 && (
        // A scrollable region has to be reachable by keyboard, or someone who
        // cannot use a pointer cannot see past the second photo.
        <ul
          tabIndex={0}
          aria-label="More photos"
          className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-lg pb-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {rest.map((photo, i) => (
            <li
              key={photo.storage_path}
              className="relative aspect-[3/2] w-[58%] shrink-0 snap-start overflow-hidden rounded-lg bg-rule sm:w-[31%]"
            >
              <Image
                src={photoUrl(photo.storage_path)}
                alt={`Photo ${i + 2} of ${photos.length}`}
                fill
                sizes="(min-width: 640px) 14rem, 58vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
