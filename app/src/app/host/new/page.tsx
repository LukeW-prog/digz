import type { Metadata } from 'next'
import { ListingForm } from './listing-form'

export const metadata: Metadata = {
  title: 'List a room',
  description:
    'Post a digs listing near Maynooth University. Free, and it goes live straight away.',
}

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">List a room</h1>
      <p className="mt-3 text-soft">
        Free to post. It goes live straight away, and students can see it
        immediately. Most hosts finish this in under five minutes.
      </p>

      <div className="panel mt-6 p-4 text-sm">
        <h2 className="font-semibold">Before you start</h2>
        <ul className="mt-2 space-y-1.5 text-soft">
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
            We never handle money. Rent and any deposit are between you and the
            student.
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <ListingForm />
      </div>
    </div>
  )
}
