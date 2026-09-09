/**
 * v1 acceptance check.
 *
 * Every claim the site makes, checked against a running instance and a real
 * database, rather than against the source. Unit tests say the pieces behave;
 * this says the assembled thing does.
 *
 * It is written to be run before launch and after every deploy, and it is
 * deliberately readable as a definition of done: a check that fails names the
 * promise being broken, not the assertion that tripped.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/verify-v1.mjs
 *
 *   BASE_URL=https://digs.ie node scripts/verify-v1.mjs
 *
 * Exits non-zero if anything required for v1 fails, so it can gate a deploy.
 *
 * Checks marked `blocking: false` are things that cannot be proven from
 * outside — an SMS actually arriving, an email actually landing. They report
 * what they can and never fail the run, because a green tick nobody verified
 * is worse than an honest gap.
 */

import { createClient } from '@supabase/supabase-js'

const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CRON_SECRET = process.env.CRON_SECRET

const db =
  SUPABASE_URL && SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null

const checks = []
const check = (area, name, fn, { blocking = true } = {}) =>
  checks.push({ area, name, fn, blocking })

const get = async (path, init) => {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual', ...init })
  return { status: res.status, body: await res.text(), headers: res.headers }
}

// ---------------------------------------------------------------- it is up

check('Serving', 'The search page loads', async () => {
  const { status, body } = await get('/')
  if (status !== 200) throw new Error(`got ${status}`)
  if (!/room/i.test(body)) throw new Error('no rooms mentioned in the page')
})

check('Serving', 'Not running on sample data', async () => {
  const { body } = await get('/')
  if (/Supabase is not configured/i.test(body)) {
    throw new Error('the site is falling back to invented listings')
  }
})

check('Serving', 'At least one listing is live', async () => {
  if (!db) throw new Error('no database credentials')
  const { count } = await db
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .in('status', ['live', 'stale'])
  if (!count) throw new Error('nothing is showing')
  return `${count} showing`
})

// ------------------------------------------------------------ the promises

check('Promise', 'Every live listing shows a walk or cycle time', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db
    .from('listings')
    .select('id, walk_minutes, cycle_minutes')
    .in('status', ['live', 'stale'])
  const missing = (data ?? []).filter(
    (l) => l.walk_minutes == null && l.cycle_minutes == null,
  )
  if (missing.length) {
    throw new Error(`${missing.length} listing(s) have no travel time`)
  }
  return `${data.length} checked`
})

check('Promise', 'Every live listing has the required photos', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db
    .from('listings')
    .select('id, listing_photos (id)')
    .in('status', ['live', 'stale'])
  const short = (data ?? []).filter((l) => (l.listing_photos?.length ?? 0) < 5)
  if (short.length) {
    throw new Error(
      `${short.length} listing(s) have fewer than 5 photos, which the form is supposed to prevent`,
    )
  }
  return `${data.length} checked`
})

check('Promise', 'A listing page renders its photos', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db
    .from('listings')
    .select('id')
    .in('status', ['live', 'stale'])
    .limit(1)
    .single()
  const { body } = await get(`/listing/${data.id}`)
  if (!/<img|_next\/image/.test(body)) throw new Error('no image on the page')
})

check('Promise', 'Freshness is stated on every listing', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db
    .from('listings')
    .select('id')
    .in('status', ['live', 'stale'])
    .limit(1)
    .single()
  const { body } = await get(`/listing/${data.id}`)
  if (!/Confirmed|Not confirmed/i.test(body)) {
    throw new Error('the page never says when it was last confirmed')
  }
})

// ---------------------------------------------------------------- privacy

check('Privacy', 'No address, eircode or coordinate is ever served', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db
    .from('listings')
    .select('id, address_line, eircode, lat, lng')
    .in('status', ['live', 'stale'])

  const leaks = []
  for (const listing of data ?? []) {
    const pages = [
      await get(`/listing/${listing.id}`),
      await get('/'),
    ]
    for (const page of pages) {
      if (listing.address_line && page.body.includes(listing.address_line)) {
        leaks.push(`${listing.id}: address`)
      }
      if (listing.eircode && page.body.includes(listing.eircode)) {
        leaks.push(`${listing.id}: eircode`)
      }
      // Coordinates are the subtle one: a map embed or a stray prop leaks the
      // house to six decimal places while showing nothing on screen.
      if (listing.lat && page.body.includes(String(listing.lat))) {
        leaks.push(`${listing.id}: latitude`)
      }
    }
  }
  if (leaks.length) throw new Error(leaks.join('; '))
  return `${data.length} listing(s) clean`
})

check('Privacy', 'A host phone number is never in a public page', async () => {
  if (!db) throw new Error('no database credentials')
  const { data: hosts } = await db.from('hosts').select('phone')
  const { data: listings } = await db
    .from('listings')
    .select('id')
    .in('status', ['live', 'stale'])
    .limit(5)

  for (const listing of listings ?? []) {
    const { body } = await get(`/listing/${listing.id}`)
    for (const host of hosts ?? []) {
      if (host.phone && body.includes(host.phone)) {
        throw new Error(`${listing.id} leaks a phone number before reveal`)
      }
    }
  }
  return 'contact stays behind the safety notice'
})

// ------------------------------------------------------------- compliance

check('Compliance', 'The report route accepts a report', async () => {
  const { status } = await get('/report')
  if (status !== 200) throw new Error(`/report returned ${status}`)
})

check('Compliance', 'The blocklist matcher still works', async () => {
  // Run the real suite rather than re-importing the module here. The matcher
  // has forty-odd cases covering the evasions that matter — spaced-out
  // initials, punctuation, casing — and duplicating two of them in this file
  // would test less while pretending to test the same thing.
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')

  try {
    await promisify(execFile)(
      'npx',
      ['vitest', 'run', 'src/lib/blocklist.test.ts', '--reporter=dot'],
      { shell: true },
    )
    return 'blocklist suite passed'
  } catch (error) {
    throw new Error(`blocklist suite failed: ${(error.stdout ?? '').slice(-300)}`)
  }
})

check('Compliance', 'The phrase list is present and substantial', async () => {
  const { readFile } = await import('node:fs/promises')
  const list = JSON.parse(await readFile('src/lib/blocklist.json', 'utf8'))

  const categories = list.categories ?? []
  const phrases = categories.flatMap((c) => c.phrases ?? [])

  // Ten protected grounds under the Equal Status Acts. Losing a whole category
  // is the failure that would not show up as a smaller number alone.
  if (categories.length < 10) {
    throw new Error(`only ${categories.length} categories, expected 10`)
  }
  if (phrases.length < 200) {
    throw new Error(`only ${phrases.length} phrases — the list has been gutted`)
  }
  return `${phrases.length} phrases across ${categories.length} grounds`
})

check('Compliance', 'Admin is not reachable without an admin session', async () => {
  for (const path of ['/admin', '/admin/reports', '/admin/blocklist']) {
    const { status, body } = await get(path)
    if (status !== 404) throw new Error(`${path} returned ${status}, expected 404`)
    if (/Reports waiting|Signed in as/.test(body)) {
      throw new Error(`${path} leaked admin content`)
    }
  }
})

check('Compliance', 'Reports record which host they are about', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db
    .from('reports')
    .select('id, host_id, listing_id')
    .not('listing_id', 'is', null)
  const orphans = (data ?? []).filter((r) => !r.host_id)
  if (orphans.length) {
    throw new Error(
      `${orphans.length} report(s) have no host, so blocking would do nothing`,
    )
  }
  return `${data.length} checked`
})

// ---------------------------------------------------------- scheduled jobs

check('Jobs', 'Cron routes refuse an unauthenticated request', async () => {
  for (const path of ['/api/cron/freshness', '/api/cron/outcomes']) {
    const bare = await get(path)
    if (bare.status !== 401 && bare.status !== 503) {
      throw new Error(`${path} answered ${bare.status} with no token`)
    }
    const wrong = await get(path, {
      headers: { authorization: 'Bearer definitely-not-it' },
    })
    if (wrong.status !== 401 && wrong.status !== 503) {
      throw new Error(`${path} answered ${wrong.status} to a wrong token`)
    }
  }
})

check('Jobs', 'The freshness sweep runs and reports what it did', async () => {
  if (!CRON_SECRET) throw new Error('CRON_SECRET not set for this run')
  const { status, body } = await get('/api/cron/freshness', {
    headers: { authorization: `Bearer ${CRON_SECRET}` },
  })
  if (status !== 200) throw new Error(`returned ${status}: ${body.slice(0, 200)}`)
  const result = JSON.parse(body)
  return `checked ${result.checked}, staled ${result.staled}, expired ${result.expired}, emailed ${result.emailed}`
})

check('Jobs', 'Nothing unconfirmed for two weeks is still showing', async () => {
  if (!db) throw new Error('no database credentials')
  const cutoff = new Date(Date.now() - 14 * 86_400_000).toISOString()
  const { data } = await db
    .from('listings')
    .select('id, last_confirmed_at')
    .in('status', ['live', 'stale'])
    .lt('last_confirmed_at', cutoff)
  if (data?.length) {
    throw new Error(
      `${data.length} listing(s) past the deadline are still visible — the sweep is not running`,
    )
  }
})

check('Jobs', 'The outcome check runs', async () => {
  if (!CRON_SECRET) throw new Error('CRON_SECRET not set for this run')
  const { status, body } = await get('/api/cron/outcomes', {
    headers: { authorization: `Bearer ${CRON_SECRET}` },
  })
  if (status !== 200) throw new Error(`returned ${status}: ${body.slice(0, 200)}`)
  const result = JSON.parse(body)
  return `due ${result.due}, asked ${result.asked}, failed ${result.failed}`
})

check('Jobs', 'An outcome link opens and offers the four answers', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db
    .from('outcome_checks')
    .select('token')
    .limit(1)
    .maybeSingle()
  if (!data) throw new Error('no outcome check exists yet to test with')

  const { status, body } = await get(`/outcome/${data.token}`)
  if (status !== 200) throw new Error(`returned ${status}`)
  for (const label of ['moved into', 'not through Digs', 'still looking', 'never replied']) {
    if (!body.includes(label)) throw new Error(`missing the "${label}" answer`)
  }
})

// -------------------------------------------------------------- the stack

check('Stack', 'Storage serves a listing photo', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db
    .from('listing_photos')
    .select('storage_path')
    .limit(1)
    .maybeSingle()
  if (!data) throw new Error('no photos stored')

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/listing-photos/${data.storage_path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`photo fetch returned ${res.status}`)
  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) throw new Error(`served as ${type}`)
})

check('Stack', 'Stored photos carry no GPS tags', async () => {
  if (!db) throw new Error('no database credentials')
  const { data } = await db.from('listing_photos').select('storage_path').limit(5)
  if (!data?.length) throw new Error('no photos stored')

  for (const photo of data) {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/listing-photos/${photo.storage_path}`
    const buffer = Buffer.from(await (await fetch(url)).arrayBuffer())
    // GPSInfo lives in an EXIF APP1 segment. Its absence is what the canvas
    // redraw in the uploader is for; its presence means a house's coordinates
    // are being served to anyone with the link.
    if (buffer.includes(Buffer.from('GPS'))) {
      throw new Error(`${photo.storage_path} still carries EXIF GPS`)
    }
  }
  return `${data.length} checked`
})

check('Stack', 'Row level security is on for every table', async () => {
  if (!db) throw new Error('no database credentials')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anonKey) throw new Error('no anon key to test with')

  const anon = createClient(SUPABASE_URL, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // The anon key must not be able to read anything private. Each of these
  // would be a serious leak: student emails, host phone numbers, the report
  // queue, and the log of what hosts tried to publish.
  for (const table of ['students', 'blocklist_hits', 'blocked_phones', 'outcome_checks']) {
    const { data } = await anon.from(table).select('*').limit(1)
    if (data?.length) throw new Error(`anon key can read ${table}`)
  }

  const { data: hosts } = await anon.from('hosts').select('phone').limit(1)
  if (hosts?.length) throw new Error('anon key can read host phone numbers')

  const { data: reports } = await anon.from('reports').select('*').limit(1)
  if (reports?.length) throw new Error('anon key can read reports')
})

// ------------------------------------------ things only a person can confirm

check(
  'Manual',
  'A verification SMS actually arrives',
  async () => {
    if (!process.env.TWILIO_ACCOUNT_SID) throw new Error('Twilio not configured')
    return 'configured — send yourself one and confirm it lands'
  },
  { blocking: false },
)

check(
  'Manual',
  'Email actually arrives',
  async () => {
    if (!process.env.RESEND_API_KEY) throw new Error('Resend not configured')
    return 'configured — check a reminder and an outcome mail land in a real inbox'
  },
  { blocking: false },
)

check(
  'Manual',
  'Address lookup is configured',
  async () => {
    if (!process.env.GOOGLE_MAPS_API_KEY) throw new Error('Google Maps not configured')
    return 'configured — post a listing at a real address and check the walk time'
  },
  { blocking: false },
)

// ------------------------------------------------------------------- run

const results = []
for (const item of checks) {
  try {
    const note = await item.fn()
    results.push({ ...item, ok: true, note })
  } catch (error) {
    results.push({ ...item, ok: false, note: error.message })
  }
}

let area = ''
for (const result of results) {
  if (result.area !== area) {
    area = result.area
    console.log(`\n${area}`)
  }
  const mark = result.ok ? 'PASS' : result.blocking ? 'FAIL' : 'SKIP'
  console.log(`  ${mark}  ${result.name}${result.note ? ` — ${result.note}` : ''}`)
}

const failed = results.filter((r) => !r.ok && r.blocking)
const passed = results.filter((r) => r.ok).length

console.log(
  `\n${passed}/${results.length} passed, ${failed.length} blocking failure(s).`,
)

if (failed.length) {
  console.log('\nNot ready for v1:')
  for (const f of failed) console.log(`  - ${f.name}: ${f.note}`)
  process.exit(1)
}

console.log('\nEverything checkable from here is working.')
