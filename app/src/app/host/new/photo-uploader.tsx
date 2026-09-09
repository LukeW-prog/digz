'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { LISTING } from '@/lib/constants'
import { PHOTO_BUCKET, PHOTO_UPLOAD } from '@/lib/photos'
import { createClient } from '@/lib/supabase/client'

/**
 * Photo upload for the listing form.
 *
 * Files go from the browser straight to Supabase Storage, and only the
 * resulting object paths travel through the Server Action. See
 * 0002_listing_photo_storage.sql for why: a Server Action body is capped at a
 * few megabytes in production, which ten phone photos would exceed.
 *
 * Each file uploads the moment it is chosen rather than on submit. A host on a
 * phone connection should not discover a failed upload after filling in the
 * whole form, and they can carry on typing while the bytes move.
 *
 * Abandoned uploads leave objects behind. They are unreferenced and invisible,
 * and sweeping them is a scheduled job that is not built yet.
 */

type Item = {
  /** Stable across renders; the storage path is not known until upload ends. */
  key: string
  name: string
  previewUrl: string
  path?: string
  error?: string
  status: 'uploading' | 'done' | 'error'
}

const CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

export function PhotoUploader({ error }: { error?: string }) {
  const [items, setItems] = useState<Item[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const counterId = useId()

  const done = items.filter((i) => i.status === 'done')
  const remaining = LISTING.maxPhotos - items.length

  const update = useCallback((key: string, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, ...patch } : i)),
    )
  }, [])

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return

    const picked = Array.from(files).slice(0, Math.max(remaining, 0))
    // The same file can be picked twice; reset so re-picking always fires.
    if (inputRef.current) inputRef.current.value = ''

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    for (const file of picked) {
      const key = crypto.randomUUID()
      const previewUrl = URL.createObjectURL(file)

      const local = validate(file)
      if (local || !user) {
        setItems((prev) => [
          ...prev,
          {
            key,
            name: file.name,
            previewUrl,
            status: 'error',
            error: local ?? 'Sign in again to upload photos.',
          },
        ])
        continue
      }

      setItems((prev) => [
        ...prev,
        { key, name: file.name, previewUrl, status: 'uploading' },
      ])

      // Strip EXIF and shrink before a byte leaves the browser. If this fails
      // the photo is not uploaded at all: the original would publish the GPS
      // coordinates of the host's house to a public bucket, and a rare browser
      // failure is a better outcome than that.
      const prepared = await prepareImage(file)
      if (!prepared) {
        update(key, {
          status: 'error',
          error: 'Could not process this photo. Try a different one.',
        })
        continue
      }

      // The host id prefix is not decoration. The Storage policy checks it,
      // so a path built any other way is rejected by the server.
      const path = `${user.id}/${crypto.randomUUID()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, prepared, { contentType: 'image/jpeg', upsert: false })

      if (uploadError) {
        update(key, { status: 'error', error: 'Upload failed. Try again.' })
      } else {
        update(key, { status: 'done', path })
      }
    }
  }

  async function remove(item: Item) {
    setItems((prev) => prev.filter((i) => i.key !== item.key))
    URL.revokeObjectURL(item.previewUrl)
    if (item.path) {
      await createClient().storage.from(PHOTO_BUCKET).remove([item.path])
    }
  }

  if (!CONFIGURED) {
    return (
      <div className="rounded-md bg-alert-wash px-4 py-3 text-sm leading-relaxed">
        <strong className="font-semibold">Photo upload is off.</strong> Supabase
        is not configured, so there is nowhere to put the files. See stack.md.
      </div>
    )
  }

  return (
    <div>
      {/* The section heading already says "Photos", so a second visible label
          would only repeat it. The input still needs one. */}
      <label className="sr-only" htmlFor={inputId}>
        Choose photos
      </label>

      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-soft">
          The room itself, and the shared spaces a student would use.
        </p>
        <p id={counterId} className="label shrink-0" aria-live="polite">
          {done.length} of {LISTING.minPhotos}–{LISTING.maxPhotos}
        </p>
      </div>

      {items.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.key}
              className="relative aspect-square overflow-hidden rounded-md bg-rule"
            >
              {/* eslint-disable-next-line @next/next/no-img-element --
                  the source is a local blob URL, which next/image cannot
                  optimise and must not be handed a remote loader for. */}
              <img
                src={item.previewUrl}
                alt=""
                className="size-full object-cover"
              />

              {item.status !== 'done' && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/65 px-2 text-center text-xs font-medium text-paper">
                  {item.status === 'uploading' ? 'Uploading…' : item.error}
                </span>
              )}

              <button
                type="button"
                onClick={() => remove(item)}
                className="absolute top-1 right-1 rounded-full bg-ink/75 px-2 py-0.5 text-xs font-medium text-paper transition-colors hover:bg-ink"
              >
                Remove
                <span className="sr-only"> {item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={PHOTO_UPLOAD.accept.join(',')}
        aria-describedby={counterId}
        onChange={(e) => onPick(e.target.files)}
        disabled={remaining <= 0}
        className="mt-4 block w-full text-sm text-soft file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-on-accent hover:file:bg-accent-hover disabled:opacity-60"
      />

      {/* What the Server Action actually receives. The paths are re-checked
          there; nothing here is trusted. */}
      <input
        type="hidden"
        name="photoPaths"
        value={JSON.stringify(done.map((i) => i.path))}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function validate(file: File): string | null {
  if (!PHOTO_UPLOAD.accept.includes(file.type as never)) {
    return 'JPEG, PNG or WebP only.'
  }
  if (file.size > PHOTO_UPLOAD.maxBytes) {
    return `Too big. Keep photos under ${PHOTO_UPLOAD.maxBytes / 1024 / 1024} MB.`
  }
  return null
}

/**
 * Redraw the photo at a sane size and re-encode it as JPEG.
 *
 * The point is the redraw. A canvas keeps the pixels and nothing else, so the
 * EXIF block — including the GPS tags a phone writes by default — does not
 * survive. `imageOrientation: 'from-image'` applies the rotation tag while it
 * still exists, otherwise stripping EXIF would leave photos on their side.
 *
 * Returns null rather than the original on failure. See the caller.
 */
async function prepareImage(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    })

    const scale = Math.min(
      1,
      PHOTO_UPLOAD.maxDimension / Math.max(bitmap.width, bitmap.height),
    )
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', PHOTO_UPLOAD.quality),
    )
  } catch {
    return null
  }
}
