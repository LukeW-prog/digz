import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { currentAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Blocked hosts first, because they are the only ones anyone opens this page
 * to find. Everyone else is listed underneath so a host can be looked up when
 * a report or an appeal names them.
 */

export const metadata: Metadata = {
  title: 'Hosts',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Host = {
  id: string
  display_name: string
  email: string
  blocked_at: string | null
  created_at: string
}

export default async function HostsPage() {
  if (!(await currentAdmin())) notFound()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('hosts')
    .select('id, display_name, email, blocked_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const hosts = (data ?? []) as Host[]
  const blocked = hosts.filter((h) => h.blocked_at)
  const active = hosts.filter((h) => !h.blocked_at)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/admin" className="label transition-colors hover:text-ink">
        ← Admin
      </Link>

      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">
        Hosts
      </h1>
      <p className="mt-3 text-soft">
        {blocked.length} blocked, {active.length} active.
      </p>

      <section className="mt-10">
        <h2 className="label border-b border-rule pb-3">Blocked</h2>
        {blocked.length === 0 ? (
          <p className="mt-6 text-soft">Nobody.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {blocked.map((host) => (
              <Row key={host.id} host={host} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="label border-b border-rule pb-3">Everyone else</h2>
        {active.length === 0 ? (
          <p className="mt-6 text-soft">Nobody yet.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {active.map((host) => (
              <Row key={host.id} host={host} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Row({ host }: { host: Host }) {
  return (
    <li>
      <Link
        href={`/admin/hosts/${host.id}`}
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3.5 transition-colors hover:text-accent"
      >
        <span className="font-medium">{host.display_name}</span>
        <span className="text-sm text-soft">{host.email}</span>
        {host.blocked_at && (
          <span className="label w-full text-danger">
            Blocked {new Date(host.blocked_at).toLocaleDateString('en-IE')}
          </span>
        )}
      </Link>
    </li>
  )
}
