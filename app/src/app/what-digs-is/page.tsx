import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'What digs is',
  description:
    'Digs is a licence, not a tenancy. What that means for your rights, in plain English.',
}

/**
 * The ethical centrepiece of the site.
 *
 * feasibility.md: we are making an unprotected arrangement easier to enter, so
 * we owe students a plain, calm account of what they are entering. This page
 * exists to be linked from the contact flow, not to be buried in terms.
 */
export default function WhatDigsIsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">What digs is</h1>

      <p className="mt-4 text-lg text-soft">
        Digs means renting a room in someone&rsquo;s home while they live there
        too. It is usually cheaper than a house share, often includes meals, and
        frequently runs Monday to Friday. It also comes with far fewer legal
        rights than renting a flat, and you should know that before you start.
      </p>

      <h2 className="mt-10 text-xl font-semibold">
        You are a licensee, not a tenant
      </h2>
      <p className="mt-3">
        Because the owner lives in the property, the arrangement is a licence
        rather than a tenancy. Residential tenancy law does not apply. In
        practice that means:
      </p>

      <ul className="mt-4 space-y-3">
        <Point title="No Residential Tenancies Board">
          You cannot bring a dispute to the RTB. There is no official body to
          adjudicate a disagreement about your room, your rent or your deposit.
        </Point>
        <Point title="No minimum notice">
          Notice is whatever you and the host agreed. There is no legal floor.
          There are documented cases of students being asked to leave with less
          than 24 hours&rsquo; notice.
        </Point>
        <Point title="No rent book, no rent controls">
          Rent Pressure Zone rules do not apply to digs.
        </Point>
        <Point title="No formal dispute resolution">
          If something goes wrong, you are relying on the agreement you made and
          on goodwill.
        </Point>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">What protects you instead</h2>
      <p className="mt-3">
        Mostly, a clear agreement made up front. The Department&rsquo;s own
        research found 88% of current digs hosts agree ground rules in advance,
        and 68% of those who did not wished they had.
      </p>
      <p className="mt-3">Agree these in writing before you move in:</p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>Rent, what it covers, and when it is paid</li>
        <li>Which nights the room is yours</li>
        <li>Which meals are included, if any</li>
        <li>How much notice either side gives to end the arrangement</li>
        <li>Guests, kitchen use, laundry, and quiet hours</li>
        <li>What happens over Christmas and Easter breaks</li>
      </ul>
      <p className="mt-3 text-soft">
        The Government publishes a free sample agreement at{' '}
        <a
          className="underline"
          href="https://www.gov.ie/roomforastudent"
          rel="noopener noreferrer"
          target="_blank"
        >
          gov.ie/roomforastudent
        </a>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold">The money side</h2>
      <p className="mt-3">
        You may be able to claim the{' '}
        <strong>Rent Tax Credit</strong>, worth up to €1,000 a year, and your
        parents can claim it if they pay your rent. Only 45% of digs students
        knew about it, so it is worth checking.
      </p>
      <p className="mt-3 text-soft">
        Your host may be using Rent-a-Room relief, which lets them earn up to
        €14,000 a year tax free. That is their affair, but it is why many hosts
        prefer Monday to Friday arrangements.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Where to get help</h2>
      <ul className="mt-3 space-y-2">
        <li>
          <a
            className="font-medium underline"
            href="https://www.threshold.ie"
            rel="noopener noreferrer"
            target="_blank"
          >
            Threshold
          </a>{' '}
          — free advice on licensee rights, including a licensee toolkit
        </li>
        <li>
          Your students&rsquo; union welfare officer
        </li>
        <li>
          <a
            className="font-medium underline"
            href="https://www.citizensinformation.ie"
            rel="noopener noreferrer"
            target="_blank"
          >
            Citizens Information
          </a>{' '}
          — on sharing accommodation with your landlord
        </li>
        <li>An Garda Síochána, for anything criminal</li>
      </ul>

      <p className="mt-10 rounded-lg border border-rule bg-raised p-4 text-sm text-soft">
        This page points you to official sources and explains them in plain
        English. It is not legal advice. Last reviewed 8 September 2026.
      </p>

      <p className="mt-6">
        <Link href="/safety" className="btn-secondary">
          Staying safe while you look
        </Link>
      </p>
    </div>
  )
}

function Point({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="surface p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-soft">{children}</p>
    </li>
  )
}
