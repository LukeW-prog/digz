import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { confirmByToken } from './actions'
import { freshnessLabel } from '@/lib/listings'
import { createAdminClient } from '@/lib/supabase/server'
import { ROOM_TYPE_LABEL, type ListingStatus, type RoomType } from '@/lib/types'

/**
 * The page behind the one-click confirm link in the reminder email.
 *
 * It is a button rather than a bare link because mail scanners and prefetchers
 * follow links. A GET that confirmed on load would mean a security appliance
 * silently marking rooms as still available on the host's behalf — which is
 * worse than no reminder at all, since the whole value of the date shown to
 * students is that a person actually looked.
 *
 * Same reasoning as the outcome page. Different consequence, same failure.
 */

export const metadata: Metadata = {
  title: 'Is your room still free?',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Listing = {
  id: string
  status: ListingStatus
  area_label: string
  room_type: RoomType
  price_per_week: number
  last_confirmed_at: string
}

export default async function ConfirmPage(props: PageProps<'/confirm/[token]'>) {
  const { token } = await props.params

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('listings')
    .select('id, status, area_label, room_type, price_per_week, last_confirmed_at')
    .eq('confirm_token', token)
    .maybeSingle()

  const listing = data as Listing | null
  if (!listing) notFound()

  const room = `${ROOM_TYPE_LABEL[listing.room_type].toLowerCase()} in ${listing.area_label}`
  const freshness = freshnessLabel(listing as never)

  // Confirmed within the last day: either they just pressed the button, or
  // they had already done it. Either way the answer is the same and there is
  // nothing left to ask.
  const justConfirmed = !freshness.stale && /today|yesterday/i.test(freshness.text)

  if (listing.status === 'removed' || listing.status === 'expired') {
    return (
      <Shell>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          This one is off the site.
        </h1>
        <p className="mt-4 text-lg leading-relaxed">
          Your {room} is no longer showing to students, so there is nothing to
          confirm. If that is wrong, sign in and post it again.
        </p>
        <p className="mt-6">
          <Link href="/host/listings" className="underline">
            Your listings
          </Link>
        </p>
      </Shell>
    )
  }

  if (justConfirmed) {
    return (
      <Shell>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Thanks — that is confirmed.
        </h1>
        <p className="mt-4 text-lg leading-relaxed">
          Your {room} shows as confirmed today. We will not ask again for
          another week.
        </p>
        <p className="mt-6 text-sm text-soft">
          If the room has actually gone,{' '}
          <Link href="/host/listings" className="underline">
            sign in and take it down
          </Link>
          . That is more useful to students than leaving it up.
        </p>
      </Shell>
    )
  }

  return (
    <Shell>
      <p className="label">Your listing</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Is your {room} still free?
      </h1>
      <p className="mt-4 text-lg leading-relaxed">
        €{listing.price_per_week} a week. {freshness.text}. Confirming keeps it
        showing to students and puts today&rsquo;s date on it.
      </p>

      <form action={confirmByToken} className="mt-8">
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="btn-primary w-full sm:w-auto">
          Yes, it is still free
        </button>
      </form>

      <p className="mt-8 text-sm text-soft">
        If it is taken,{' '}
        <Link href="/host/listings" className="underline">
          sign in and take it down
        </Link>
        . Taking a room down needs a sign-in on purpose, so that a forwarded
        link can never remove someone&rsquo;s listing.
      </p>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 sm:px-8 sm:py-24">
      {children}
    </div>
  )
}
