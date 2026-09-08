import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy notice',
  description:
    'What Digs collects, why, how long it is kept, and what you can ask us to do about it.',
}

const LAST_REVIEWED = '8 September 2026'

/**
 * Drafted from data-model.md so that it describes what is actually stored,
 * rather than what a template guesses. Every row here maps to a real column.
 *
 * mvp.md: a privacy notice that is actually true is a genuine legal duty and
 * one of the few things that cannot wait. It still needs a solicitor's eye
 * before there is real traffic.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="label">Legal</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Privacy notice
      </h1>
      <p className="mt-5 leading-relaxed text-soft">
        What we collect, why, and how long we keep it. In plain English,
        because a privacy notice nobody can read is not a privacy notice.
      </p>

      <Draft />

      <Section title="Who we are">
        <p>
          Digs is run by a sole trader based in Ireland. We are the data
          controller for everything described here. To contact us about your
          data, use the{' '}
          <Link href="/report" className="underline">
            contact form
          </Link>
          .
        </p>
      </Section>

      <Section title="If you are only searching">
        <p>
          We collect <strong className="font-semibold">nothing about you</strong>.
          No account, no cookie for tracking, no profile. You can browse every
          listing and use every filter without telling us anything.
        </p>
      </Section>

      <Section title="If you make a student account">
        <Table
          rows={[
            ['Email address', 'To sign you in and to ask, once, whether you found a place', 'Until you delete the account'],
            ['That you confirmed you are 18 or over', 'Digs is adults only', 'Until you delete the account'],
            ['Which listings you asked to see contact details for', 'To count how many students actually reach a host, and to ask about the outcome', '12 months'],
            ['Which version of the safety notice you accepted', 'So we can always say exactly what you were shown', '12 months'],
          ]}
        />
        <p className="mt-4">
          We do not collect your name, age, gender, nationality, course or year.
          We do not need them, so we do not ask.
        </p>
      </Section>

      <Section title="If you list a room">
        <Table
          rows={[
            ['Email address', 'To sign you in and send the weekly still-available check', 'Until you delete the account'],
            ['Mobile number', 'Verification by text, and shown to a student once they accept the safety notice', 'Until you delete the account'],
            ['Your first name', 'Shown to a student with your contact details', 'Until you delete the account'],
            ['The property address and Eircode', 'To work out walking time, to confirm the building is real, and to stop the same room being listed twice. Never shown publicly', '12 months after the listing ends'],
            ['The listing itself', 'To publish it', '12 months after it ends, then the address and photos are deleted'],
            ['Any wording our screening refused', 'Evidence that the screening works, and to improve it', '3 years'],
          ]}
        />
      </Section>

      <Section title="If you report a listing">
        <p>
          You can report anonymously. If you give an email address we use it
          once, to tell you what we decided and why. Reports and the decisions
          we make on them are kept for{' '}
          <strong className="font-semibold">three years</strong>, because we may
          need to show what we did and when.
        </p>
      </Section>

      <Section title="Who else sees it">
        <ul className="space-y-2">
          <li>
            <strong className="font-semibold">Supabase</strong> — hosts the
            database and files, in the EU.
          </li>
          <li>
            <strong className="font-semibold">Vercel</strong> — serves the site.
          </li>
          <li>
            <strong className="font-semibold">Twilio</strong> — sends the
            verification text. Receives the mobile number only.
          </li>
          <li>
            <strong className="font-semibold">Google Maps</strong> — receives a
            property address to turn into coordinates and travel times.
          </li>
          <li>
            <strong className="font-semibold">Resend</strong> — sends our
            emails. Receives the email address only.
          </li>
        </ul>
        <p className="mt-4">
          We do not sell anything to anyone. We do not run advertising. There is
          no analytics service watching you.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask us for a copy of your data, ask us to correct it, or ask
          us to delete it. Ask through the{' '}
          <Link href="/report" className="underline">
            contact form
          </Link>{' '}
          and we will act within one month.
        </p>
        <p className="mt-3">
          One limit worth stating plainly: we keep records of reports and
          removals even after an account is deleted, because we may need them to
          answer a complaint or to help An Garda Síochána. They are kept for
          three years and nothing else.
        </p>
        <p className="mt-3">
          If you think we have got this wrong you can complain to the{' '}
          <a
            className="underline"
            href="https://www.dataprotection.ie"
            rel="noopener noreferrer"
            target="_blank"
          >
            Data Protection Commission
          </a>
          .
        </p>
      </Section>

      <p className="mt-14 border-t border-rule pt-6 text-sm text-soft">
        Last reviewed {LAST_REVIEWED}.
      </p>
    </div>
  )
}

function Draft() {
  return (
    <p className="mt-8 border-l-2 border-alert-rule bg-alert-wash px-4 py-3 text-sm leading-relaxed">
      <strong className="font-semibold">Draft.</strong> This describes what the
      site actually does today and is accurate, but it has not been reviewed by
      a solicitor. That needs doing before real traffic.
    </p>
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

function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <dl className="divide-y divide-rule border-y border-rule">
      {rows.map(([what, why, howLong]) => (
        <div key={what} className="py-4">
          <dt className="font-semibold">{what}</dt>
          <dd className="mt-1 text-soft">{why}</dd>
          <dd className="label mt-2">Kept: {howLong}</dd>
        </div>
      ))}
    </dl>
  )
}
