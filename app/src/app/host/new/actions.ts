'use server'

import { redirect } from 'next/navigation'
import { checkText, type BlocklistHit } from '@/lib/blocklist'
import { geocodeAddress, travelTimesToCampus } from '@/lib/geocode'
import { fieldErrors, listingFromFormData, listingSchema } from '@/lib/listing-schema'
import { LISTING } from '@/lib/constants'
import { parsePhotoPaths } from '@/lib/photos'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export type ListingFormState = {
  /** Keyed by form field name, rendered beside the input. */
  errors?: Record<string, string>
  /** Blocklist matches, shown with the reason and the ground they breach. */
  blocklistHits?: BlocklistHit[]
  /** Anything that is not tied to one field. */
  message?: string
}

/**
 * Create a listing.
 *
 * Order matters. Screening runs before anything is written and before we
 * spend a Google call, so a refused submission costs nothing and leaves no
 * listing row behind — only a blocklist_hits row, which is the evidence that
 * the system works.
 *
 * Listings publish on submit. There is no approval queue. See mvp.md.
 */
export async function createListing(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const supabase = await createClient()

  // 1. Authorisation. Server Actions are reachable by direct POST, so this
  //    check cannot live in the UI.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { message: 'Sign in as a host to post a listing.' }
  }

  const { data: host } = await supabase
    .from('hosts')
    .select('id, phone_verified_at, blocked_at')
    .eq('id', user.id)
    .single()

  if (!host || host.blocked_at) {
    return { message: 'This account cannot post listings.' }
  }

  if (!host.phone_verified_at) {
    return {
      message:
        'Verify your phone number before posting. It is the main thing that keeps fake listings off the site.',
    }
  }

  // 2. Shape and bounds.
  const parsed = listingSchema.safeParse(listingFromFormData(formData))
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) }
  }
  const input = parsed.data

  // 3. Discriminatory advert screening.
  //
  //    Runs before the photo count, and the order is deliberate. It used to
  //    run after, which meant a host who wrote a discriminatory advert but had
  //    not finished adding photos was told about the photos and nothing else:
  //    the wording was never screened and no blocklist_hits row was written.
  //    That log is the evidence the screening works and the only source for
  //    extending the list, so it must not depend on how far through the form
  //    someone got.
  if (input.description) {
    const screening = checkText(input.description)

    if (!screening.ok) {
      // Log every refusal. This is both the audit trail and the source for
      // extending the list. Admin client: hosts must not be able to read or
      // alter their own hit history.
      const admin = createAdminClient()
      await admin.from('blocklist_hits').insert(
        screening.hits.map((hit) => ({
          host_id: host.id,
          phrase: hit.phrase,
          category: hit.category,
          submitted_text: input.description!,
        })),
      )

      return {
        blocklistHits: screening.hits,
        errors: {
          description:
            'This wording is not allowed in a published advert. Details below.',
        },
      }
    }
  }

  // 4. Photos. The files are already in Storage, uploaded by the browser, so
  //    what arrives here is a list of object paths. None of it is trusted: the
  //    count is re-checked, and every path must sit inside this host's own
  //    folder. The Storage policy enforces the same prefix on write, so a
  //    forged path could not have been uploaded, but a host could still post
  //    one pointing at another host's object and claim their photos.
  const photoPaths = parsePhotoPaths(formData.get('photoPaths'))

  if (photoPaths.length < LISTING.minPhotos) {
    return {
      errors: {
        photos: `Add at least ${LISTING.minPhotos} photos. You have ${photoPaths.length}.`,
      },
    }
  }

  if (photoPaths.length > LISTING.maxPhotos) {
    return {
      errors: { photos: `That is more than ${LISTING.maxPhotos} photos.` },
    }
  }

  if (photoPaths.some((path) => !path.startsWith(`${host.id}/`))) {
    return {
      errors: {
        photos: 'Those photos could not be verified. Remove them and add them again.',
      },
    }
  }

  // 5. Address must resolve to a real building. Anti-fraud, per safety.md.
  const geo = await geocodeAddress(input.addressLine, input.eircode)
  if (!geo.ok) {
    return { errors: { addressLine: geo.message } }
  }

  // 6. Travel times. Null on failure rather than blocking the host.
  const travel = await travelTimesToCampus({ lat: geo.lat, lng: geo.lng })

  // 7. Publish.
  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      host_id: host.id,
      status: 'live',
      address_line: input.addressLine,
      eircode: input.eircode.toUpperCase().replace(/\s+/g, ' '),
      lat: geo.lat,
      lng: geo.lng,
      area_label: geo.areaLabel,
      walk_minutes: travel.walkMinutes,
      cycle_minutes: travel.cycleMinutes,
      room_type: input.roomType,
      price_per_week: input.pricePerWeek,
      bills_included: input.billsIncluded,
      schedule: input.schedule,
      meals: input.meals,
      term_start: input.termStart ?? null,
      term_end: input.termEnd ?? null,
      smoking_allowed: input.smokingAllowed,
      pets_in_house: input.petsInHouse,
      quiet_hours: input.quietHours,
      description: input.description ?? null,
    })
    .select('id')
    .single()

  if (error) {
    // 23505 is the one-live-listing-per-address index doing its job.
    if (error.code === '23505') {
      return {
        errors: {
          addressLine:
            'There is already a live listing at this address. Take that one down before posting a new one.',
        },
      }
    }
    return { message: 'Could not save the listing. Try again shortly.' }
  }

  // 8. Attach the photos. A listing with none breaks the rule the form just
  //    enforced, so if this fails the listing goes with it rather than being
  //    left published and empty.
  const { error: photoError } = await supabase.from('listing_photos').insert(
    photoPaths.map((storage_path, i) => ({
      listing_id: listing.id,
      storage_path,
      sort_order: i,
    })),
  )

  if (photoError) {
    await supabase.from('listings').delete().eq('id', listing.id)
    return { message: 'Could not save the photos. Try again shortly.' }
  }

  redirect(`/host/listings?posted=${listing.id}`)
}
