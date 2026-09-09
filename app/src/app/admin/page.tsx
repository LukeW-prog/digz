import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { currentAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * The admin index. Counts first, because the only question worth answering on
 * opening this page is whether anything needs doing.
 */

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = await currentAdmin()
  if (!admin) notFound()

  const supabase = createAdminClient()

  const [openReports, hits, liveListings, outcomes] = await Promise.all([
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .is('reviewed_at', null),
    supabase.from('blocklist_hits').select('id', { count: 'exact', head: true }),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .in('status', ['live', 'stale']),
    supabase
      .from('outcome_checks')
      .select('id', { count: 'exact', head: true })
      .eq('answer', 'matched_here'),
  ])

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Admin
      </h1>
      <p className="mt-3 text-soft">Signed in as {admin.email}.</p>

      <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="Reports waiting" value={openReports.count} urgent />
        <Stat label="Rooms showing" value={liveListings.count} />
        <Stat label="Adverts refused" value={hits.count} />
        <Stat label="Housed here" value={outcomes.count} />
      </dl>

      <nav className="mt-12 space-y-3">
        <Row
          href="/admin/reports"
          title="Reports"
          hint="Act on what people have reported. Every decision needs a reason."
        />
        <Row
          href="/admin/blocklist"
          title="Blocklist hits"
          hint="What hosts tried to write. Read it to extend the list."
        />
        <Row
          href="/admin/hosts"
          title="Hosts"
          hint="Who is blocked, why, and how to undo it."
        />
      </nav>
    </div>
  )
}

function Stat({
  label,
  value,
  urgent = false,
}: {
  label: string
  value: number | null
  urgent?: boolean
}) {
  return (
    <div>
      <dd
        className={`font-display text-4xl leading-none font-semibold ${
          urgent && (value ?? 0) > 0 ? 'text-danger' : 'text-accent'
        }`}
      >
        {value ?? '—'}
      </dd>
      <dt className="label mt-2">{label}</dt>
    </div>
  )
}

function Row({
  href,
  title,
  hint,
}: {
  href: '/admin/reports' | '/admin/blocklist' | '/admin/hosts'
  title: string
  hint: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-rule px-5 py-4 transition-colors duration-300 hover:border-accent hover:bg-accent-wash"
    >
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-soft">{hint}</p>
    </Link>
  )
}
