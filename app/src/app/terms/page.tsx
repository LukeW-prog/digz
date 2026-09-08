import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'The rules for using Digs, what we are responsible for, and what we are not.',
}

const LAST_REVIEWED = '8 September 2026'

/**
 * Drafted against safety.md section 7, which sets out what terms can and
 * cannot do. They cannot excuse a discriminatory advert we published, cannot
 * exclude liability for injury caused by our own negligence, and cannot
 * substitute for acting on reports. So none of that is attempted here.
 */
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="label">Legal</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Terms
      </h1>
      <p className="mt-5 leading-relaxed text-soft">
        Short, and written to be read. If something here is unclear, that is our
        fault and we would like to know.
      </p>

      <p className="mt-8 border-l-2 border-alert-rule bg-alert-wash px-4 py-3 text-sm leading-relaxed">
        <strong className="font-semibold">Draft.</strong> Accurate about how the
        site works, but not yet reviewed by a solicitor.
      </p>

      <Section title="What Digs is">
        <p>
          Digs is a noticeboard for rooms in people&rsquo;s homes near Maynooth
          University. Hosts write the listings. We publish them and let students
          search them.
        </p>
        <p className="mt-3">
          <strong className="font-semibold">
            We are not a party to any agreement between a host and a student.
          </strong>{' '}
          We do not own, inspect, manage or control any property. We do not
          guarantee that a listing is accurate, or that the room is still
          available.
        </p>
      </Section>

      <Section title="We never handle money">
        <p>
          There is no way to pay through this site, and{' '}
          <strong className="font-semibold">we will never ask you for money</strong>
          . Rent and any deposit are entirely between the host and the student.
        </p>
        <p className="mt-3">
          If anyone asks you to pay Digs, it is a fraud. Please{' '}
          <Link href="/report" className="underline">
            tell us
          </Link>
          .
        </p>
      </Section>

      <Section title="What we check, and what we do not">
        <p>We verify a host&rsquo;s mobile number and that the address resolves to a real building. We screen every listing for unlawful wording. That is all.</p>
        <p className="mt-3">
          <strong className="font-semibold">
            We do not vet hosts and we cannot.
          </strong>{' '}
          Garda vetting is only available to organisations working with children
          or vulnerable adults, which we are not. Nobody on this site is
          &ldquo;vetted&rdquo;, &ldquo;approved&rdquo; or
          &ldquo;background checked&rdquo;, and we will never say otherwise.
        </p>
      </Section>

      <Section title="You must be 18 or over">
        <p>
          Digs is for adults. If you are 17 and starting college, a parent or
          guardian can use the site on your behalf.
        </p>
      </Section>

      <Section title="Rules for hosts">
        <ul className="list-disc space-y-2 pl-5">
          <li>The room must be in a home you live in yourself.</li>
          <li>One live listing per address.</li>
          <li>The listing must be true, and the photos must be of that room.</li>
          <li>
            You must not state a preference about gender, nationality, race,
            religion, age, family status, disability, sexual orientation, civil
            status, membership of the Traveller community, or receipt of housing
            assistance. This is the law, not our preference, and the form will
            refuse it.
          </li>
          <li>Confirm weekly that the room is still available, or it expires.</li>
          <li>Take the listing down once the room is taken.</li>
        </ul>
      </Section>

      <Section title="Rules for everyone">
        <ul className="list-disc space-y-2 pl-5">
          <li>Do not post anything false, threatening, or unlawful.</li>
          <li>Do not use the site to defraud anyone.</li>
          <li>Do not scrape or bulk-copy listings.</li>
          <li>Do not impersonate anyone.</li>
        </ul>
      </Section>

      <Section title="Reports, removals and appeals">
        <p>
          Anyone can report a listing, with or without an account. We look at
          reports daily. Anything alleging a safety threat or fraud is handled
          the same day, and the listing comes down first while we look.
        </p>
        <p className="mt-3">
          If we remove something, we tell the host why. If you think we got it
          wrong, reply and we will look again.
        </p>
      </Section>

      <Section title="What we are responsible for">
        <p>
          We are responsible for running this site properly, for acting on
          reports, and for what we ourselves publish.
        </p>
        <p className="mt-3">
          We are not responsible for the conduct of a host or a student, for the
          condition of any property, or for any agreement made between them.
        </p>
        <p className="mt-3">
          <strong className="font-semibold">
            Nothing in these terms excludes our liability for death or personal
            injury caused by our negligence, or for fraud.
          </strong>{' '}
          Irish law does not allow that, and we would not want it.
        </p>
      </Section>

      <Section title="Ending your account">
        <p>
          You can delete your account whenever you like. We can suspend an
          account that breaks these rules, and we will say why.
        </p>
      </Section>

      <Section title="Law">
        <p>
          These terms are governed by Irish law, and the Irish courts have
          jurisdiction.
        </p>
      </Section>

      <p className="mt-14 border-t border-rule pt-6 text-sm text-soft">
        Last reviewed {LAST_REVIEWED}. See also our{' '}
        <Link href="/privacy" className="underline">
          privacy notice
        </Link>
        .
      </p>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="mt-4 leading-relaxed">{children}</div>
    </section>
  )
}
