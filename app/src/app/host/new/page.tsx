import type { Metadata } from 'next'
import Link from 'next/link'
import { ListingForm } from './listing-form'
import { getHostStatus } from '@/lib/host'

/**
 * Depends on who is signed in, so it must never be prerendered. Without this
 * a signed-in host can be served a cached "sign in first" gate.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'List a room',
  description:
    'Post a digs listing near Maynooth University. Free, and it goes live straight away.',
}

export default async function NewListingPage() {
  const host = await getHostStatus()

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="label">For hosts</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        List a room
      </h1>
      <p className="mt-5 max-w-lg leading-relaxed text-soft">
        Free to post, and it goes live straight away. Most hosts finish this in
        under five minutes.
      </p>

      {host.state === 'signed_out' && (
        <Gate
          title="Sign in first"
          body="You need an account to post a listing. It is an email address and nothing else."
          href="/sign-in?role=host&next=/host/new"
          cta="Sign in"
        />
      )}

      {host.state === 'needs_phone' && (
        <Gate
          title="Verify your number"
          body="One text message, once. It is the main thing keeping fake listings off the site."
          href="/host/verify"
          cta="Verify my number"
        />
      )}

      {host.state === 'blocked' && (
        <Gate
          title="This account cannot post"
          body="If you think that is wrong, get in touch through the report page and we will look again."
          href="/report"
          cta="Get in touch"
        />
      )}

      {(host.state === 'ready' || host.state === 'unconfigured') && (
        <>
          {host.state === 'unconfigured' && (
            <p className="mt-8 border-l-2 border-alert-rule bg-alert-wash px-4 py-3 text-sm">
              <strong className="font-semibold">Not configured.</strong>{' '}
              Supabase is not set up, so this form will not save. The blocklist
              still runs, so it is worth trying a phrase to see what happens.
            </p>
          )}

          <div className="mt-10 border-t border-rule pt-8">
            <h2 className="label">Before you start</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-soft">
              <li>
                This is for a room in a home you live in yourself. Not a whole
                property, and not a house share.
              </li>
              <li>
                Rent-a-room relief lets you earn up to €14,000 a year tax free.
                Going even €1 over makes the whole amount taxable, so check
                Revenue&rsquo;s conditions.
              </li>
              <li>
                We never handle money. Rent and any deposit are between you and
                the student.
              </li>
            </ul>
          </div>

          <div className="mt-10">
            <ListingForm />
          </div>
        </>
      )}
    </div>
  )
}

function Gate({
  title,
  body,
  href,
  cta,
}: {
  title: string
  body: string
  href: string
  cta: string
}) {
  return (
    <div className="mt-10 border-t border-rule pt-8">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-md leading-relaxed text-soft">{body}</p>
      <Link href={href} className="btn-primary mt-6">
        {cta}
      </Link>
    </div>
  )
}
