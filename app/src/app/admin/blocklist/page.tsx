import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { currentAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Every advert the blocklist refused.
 *
 * data-model.md says this is how the list gets extended: read what hosts
 * actually try to write, rather than guessing at phrasings. It is also the
 * evidence that the screening works, which matters given IHREC v Daft.
 *
 * The full submitted text is shown. It has to be — the point is to see the
 * wording that got through everything except the one phrase that tripped, and
 * a truncated version hides exactly the context needed to add the next entry.
 */

export const metadata: Metadata = {
  title: 'Blocklist hits',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Hit = {
  id: string
  phrase: string
  category: string
  submitted_text: string
  created_at: string
}

export default async function BlocklistPage() {
  if (!(await currentAdmin())) notFound()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('blocklist_hits')
    .select('id, phrase, category, submitted_text, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const hits = (data ?? []) as Hit[]
  const byCategory = new Map<string, number>()
  for (const hit of hits) {
    byCategory.set(hit.category, (byCategory.get(hit.category) ?? 0) + 1)
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/admin" className="label transition-colors hover:text-ink">
        ← Admin
      </Link>

      <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight">
        Blocklist hits
      </h1>
      <p className="mt-3 text-soft">
        Adverts the form refused. Read them to extend the list — the phrasings
        that matter are the ones hosts actually use.
      </p>

      {byCategory.size > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {[...byCategory.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => (
              <li
                key={category}
                className="rounded-full bg-signal-wash px-3 py-1 text-sm"
              >
                {category.replace(/_/g, ' ')} · {count}
              </li>
            ))}
        </ul>
      )}

      {hits.length === 0 ? (
        <p className="mt-10 text-soft">
          Nothing refused yet. That is either good news or a sign nobody has
          posted.
        </p>
      ) : (
        <ul className="mt-10">
          {hits.map((hit) => (
            <li key={hit.id} className="border-t border-rule py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-display text-lg font-semibold">
                  &ldquo;{hit.phrase}&rdquo;
                </p>
                <p className="label">
                  {hit.category.replace(/_/g, ' ')} ·{' '}
                  {formatDate(hit.created_at)}
                </p>
              </div>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-soft whitespace-pre-line">
                {hit.submitted_text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
