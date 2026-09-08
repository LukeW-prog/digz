import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Staying safe',
  description:
    'How accommodation scams work, how to avoid them, and what Digs does and does not check.',
}

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Staying safe</h1>

      <div className="surface mt-6 border-accent bg-accent-wash p-5">
        <h2 className="text-lg font-semibold">The one rule</h2>
        <p className="mt-2 text-lg">
          <strong>Never pay anything before you have seen the room.</strong>
        </p>
        <p className="mt-2 text-sm text-soft">
          No deposit, no holding fee, no first month, no &ldquo;admin
          fee&rdquo;. Every common accommodation scam depends on getting money
          out of you before you have stood in the room. If you follow this one
          rule you avoid nearly all of them.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold">How the scams actually work</h2>
      <p className="mt-2 text-soft">
        Gardaí recorded 230 accommodation scam reports and €400,000 lost in the
        first seven months of 2026, with the spike running from August to
        October. Three patterns account for most of it.
      </p>

      <div className="mt-4 space-y-4">
        <Scam title="The absent landlord">
          They say they are abroad and cannot show you the property, but will
          post the keys once you transfer a deposit. There are no keys.
        </Scam>
        <Scam title="Mass showings">
          A real property is shown to many people in one day and a deposit is
          taken from each of them. Only one of you, at most, was ever getting
          the room.
        </Scam>
        <Scam title="The property that is not for rent">
          The most common one. Photos are lifted from another advert. The
          property does not exist, or it exists and the person advertising it
          has nothing to do with it.
        </Scam>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Warning signs</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        <li>Any pressure to pay before viewing</li>
        <li>A reason the viewing cannot happen: they are abroad, working away, ill</li>
        <li>Pressure to decide immediately because &ldquo;others are interested&rdquo;</li>
        <li>A price well below everything else nearby</li>
        <li>A request to move the conversation to WhatsApp straight away</li>
        <li>Asking for your passport, PPS number or bank details to hold a room</li>
        <li>Payment by bank transfer to a name that does not match the host</li>
        <li>Photos that look like a hotel or an estate agent&rsquo;s brochure</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">At the viewing</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        <li>Bring someone with you</li>
        <li>Tell someone where you are going and when you expect to be back</li>
        <li>Go in daylight</li>
        <li>Check there are smoke alarms, a carbon monoxide alarm and a fire blanket</li>
        <li>Ask which nights the room is yours, and what happens at the breaks</li>
        <li>Take photos and take your time. Do not let anyone rush you</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">
        What Digs checks, and what it does not
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="surface p-4">
          <h3 className="font-semibold">We do check</h3>
          <ul className="mt-2 space-y-1 text-sm text-soft">
            <li>The host&rsquo;s phone number, by text message</li>
            <li>That the address is a real building</li>
            <li>That only one live listing exists per address</li>
            <li>Every listing for unlawful wording, automatically</li>
            <li>Reports, and we take listings down</li>
          </ul>
        </div>
        <div className="surface p-4">
          <h3 className="font-semibold">We do not</h3>
          <ul className="mt-2 space-y-1 text-sm text-soft">
            <li>Garda vet hosts. We legally cannot</li>
            <li>Visit or inspect any property</li>
            <li>Check that photos match the room</li>
            <li>Verify anyone&rsquo;s identity documents</li>
            <li>Handle money, ever</li>
          </ul>
        </div>
      </div>
      <p className="mt-4 text-sm text-soft">
        We say precisely what we did and nothing more. If any site tells you its
        hosts are &ldquo;vetted&rdquo; or &ldquo;approved&rdquo;, ask them what
        they actually checked.
      </p>

      <h2 className="mt-10 text-xl font-semibold">
        Digs will never ask you for money
      </h2>
      <p className="mt-2">
        Not for a deposit, not for a booking fee, not for a &ldquo;verification
        charge&rdquo;. There is no way to pay us. If anyone asks you to pay Digs,
        it is a scam, and we would like to know about it.
      </p>

      <h2 className="mt-10 text-xl font-semibold">If something goes wrong</h2>
      <ul className="mt-3 space-y-2">
        <li>
          <Link href="/report" className="font-medium underline">
            Report a listing to us
          </Link>{' '}
          — we look at reports daily
        </li>
        <li>
          <strong>An Garda Síochána</strong> — for fraud or anything criminal.
          Report it even if you feel foolish. It is common and they expect it
        </li>
        <li>
          <a
            className="font-medium underline"
            href="https://www.threshold.ie"
            rel="noopener noreferrer"
            target="_blank"
          >
            Threshold
          </a>{' '}
          — free advice on your rights
        </li>
        <li>Your students&rsquo; union welfare officer</li>
      </ul>

      <p className="mt-8">
        <Link href="/what-digs-is" className="btn-secondary">
          What digs is, and what rights you have
        </Link>
      </p>
    </div>
  )
}

function Scam({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="surface p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-soft">{children}</p>
    </div>
  )
}
