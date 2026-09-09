import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { recordOutcome } from './actions'
import {
  OUTCOME_ANSWER,
  OUTCOME_ANSWER_LABEL,
  type OutcomeAnswer,
} from '@/lib/outcomes'
import { createAdminClient } from '@/lib/supabase/server'
import { ROOM_TYPE_LABEL, type RoomType } from '@/lib/types'

/**
 * The page behind the link in the outcome email.
 *
 * Answering is four buttons and no account. Making a student sign in to answer
 * would have cut the response rate to whoever could be bothered, and the whole
 * point of this number is that it is not a guess.
 *
 * The answers are buttons rather than four links because mail scanners and
 * prefetchers follow links. A GET-based answer would have recorded outcomes
 * that no student ever chose, which is worse than having no data at all.
 */

export const metadata: Metadata = {
  title: 'Did you find a place?',
  // A private one-question page. Nothing here belongs in a search index.
  robots: { index: false, follow: false },
}

type Check = {
  answer: OutcomeAnswer | null
  contact_reveals: {
    listings: { area_label: string; room_type: RoomType } | null
  } | null
}

export default async function OutcomePage(props: PageProps<'/outcome/[token]'>) {
  const { token } = await props.params

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('outcome_checks')
    .select('answer, contact_reveals (listings (area_label, room_type))')
    .eq('token', token)
    .single()

  const check = data as unknown as Check | null
  if (!check) notFound()

  const listing = check.contact_reveals?.listings
  const room = listing
    ? `${ROOM_TYPE_LABEL[listing.room_type].toLowerCase()} in ${listing.area_label}`
    : 'room you asked about'

  if (check.answer) {
    return (
      <Shell>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Thanks.
        </h1>
        <p className="mt-4 text-lg leading-relaxed">
          You said: {OUTCOME_ANSWER_LABEL[check.answer].toLowerCase()}. That is
          recorded and we will not ask again.
        </p>
        <p className="mt-6">
          <Link href="/" className="underline">
            Back to the rooms
          </Link>
        </p>
      </Shell>
    )
  }

  return (
    <Shell>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Did you find a place?
      </h1>
      <p className="mt-4 text-lg leading-relaxed">
        Two weeks ago you got the contact details for a {room}. One answer is
        all we need, and it is the only way to tell whether this site is any
        use.
      </p>

      <form action={recordOutcome} className="mt-8 space-y-3">
        <input type="hidden" name="token" value={token} />
        {OUTCOME_ANSWER.map((answer) => (
          <button
            key={answer}
            type="submit"
            name="answer"
            value={answer}
            className="block w-full rounded-lg border border-rule px-5 py-4 text-left text-base transition-colors duration-300 hover:border-accent hover:bg-accent-wash"
          >
            {OUTCOME_ANSWER_LABEL[answer]}
          </button>
        ))}
      </form>

      <p className="mt-8 text-sm text-soft">
        Nobody sees your answer except us. It is never shown on the site and it
        is not attached to your name anywhere a host can reach.
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
