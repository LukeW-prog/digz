/**
 * Seed a local Supabase with enough real data to exercise the whole site.
 *
 * Local development only. It refuses to run against anything that is not
 * localhost, because it creates confirmed accounts and pre-verified phone
 * numbers, which is exactly the thing the live site must never do.
 *
 * Why seed rather than post through the form: the listing form geocodes the
 * address and works out walk times through Google, and verifying a host's
 * phone goes through Twilio. Neither is configured locally, so the form stops
 * at a clean "not configured" message. Everything downstream of a listing
 * existing — search, the listing page, contact reveal, reports, the admin
 * queue, both cron jobs — is real and worth testing, so this puts the rows in
 * directly and leaves the two external calls as the only untested step.
 *
 *   node scripts/seed-local.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !SERVICE_KEY) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(URL)) {
  throw new Error(
    `Refusing to seed ${URL}. This script only ever runs against a local Supabase.`,
  )
}

const db = createClient(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const day = 86_400_000
const ago = (n) => new Date(Date.now() - n * day).toISOString()

/** Create the account, or reuse it if the seed has been run before. */
async function upsertUser(email) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
  })
  if (!error) return data.user.id

  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 })
  const existing = list.users.find((u) => u.email === email)
  if (!existing) throw error
  return existing.id
}

console.log('Creating accounts…')
const hostId = await upsertUser('host@digs.test')
const adminId = await upsertUser('admin@digs.test')
const studentId = await upsertUser('student@digs.test')

await db.from('hosts').upsert({
  id: hostId,
  display_name: 'Mary',
  phone: '+353871234567',
  // Pre-verified. The real path is a Twilio code, which is not configured
  // locally; everything after verification is what this seed exists to test.
  phone_verified_at: ago(30),
  email: 'host@digs.test',
  email_verified_at: ago(30),
})

await db.from('hosts').upsert({
  id: adminId,
  display_name: 'Ops',
  phone: '+353871234568',
  phone_verified_at: ago(30),
  email: 'admin@digs.test',
  email_verified_at: ago(30),
})

await db.from('students').upsert({
  id: studentId,
  email: 'student@digs.test',
  email_verified_at: ago(20),
  over_18_confirmed_at: ago(20),
})

/**
 * Confirmation ages are chosen to put one listing in each state the freshness
 * sweep can act on, so a single run of the job has something to do in every
 * branch rather than only the common one.
 */
const LISTINGS = [
  {
    key: 'fresh',
    address_line: '12 Moyglare Road',
    eircode: 'W23 A1B2',
    area_label: 'Maynooth',
    lat: 53.3845,
    lng: -6.5992,
    walk_minutes: 12,
    cycle_minutes: 5,
    room_type: 'single',
    price_per_week: 130,
    schedule: 'mon_fri',
    meals: 'weekday_dinner',
    bills_included: true,
    quiet_hours: true,
    pets_in_house: true,
    description:
      'Quiet house on the Moyglare Road, twelve minutes from the front gate. Own desk, fast broadband. Dinner Monday to Thursday. We have an old labrador.',
    confirmed: 1,
    photos: ['bedroom-01', 'sitting-05', 'kitchen-01', 'bathroom-01', 'dining-01'],
  },
  {
    key: 'due-a-prompt',
    address_line: '4 Straffan Road',
    eircode: 'W23 C3D4',
    area_label: 'Maynooth',
    lat: 53.3792,
    lng: -6.6041,
    walk_minutes: 8,
    cycle_minutes: 3,
    room_type: 'double',
    price_per_week: 150,
    schedule: 'full_week',
    meals: 'weekday_dinner_and_weekend',
    bills_included: true,
    description:
      'Double room in a family home just off Straffan Road. All meals included. Washing machine use any time.',
    confirmed: 6,
    photos: ['bedroom-04', 'sitting-04', 'sitting-01', 'kitchen-01', 'bathroom-01'],
  },
  {
    key: 'about-to-go-stale',
    address_line: '9 Harbour View',
    eircode: 'W23 E5F6',
    area_label: 'Maynooth',
    lat: 53.3771,
    lng: -6.5934,
    walk_minutes: 18,
    cycle_minutes: 7,
    room_type: 'twin',
    price_per_week: 95,
    schedule: 'full_week',
    meals: 'none',
    quiet_hours: true,
    description:
      'Twin room, suits two people sharing who already know each other. Quiet estate near the Harbour.',
    confirmed: 8,
    photos: ['bedroom-03', 'sitting-07', 'sitting-02', 'kitchen-01', 'bathroom-01'],
  },
  {
    key: 'expiring',
    address_line: '21 Church Street',
    eircode: 'W23 G7H8',
    area_label: 'Kilcock',
    lat: 53.4021,
    lng: -6.7112,
    walk_minutes: 62,
    cycle_minutes: 21,
    room_type: 'single',
    price_per_week: 110,
    schedule: 'mon_fri',
    meals: 'none',
    description:
      'Single room in Kilcock, five minutes walk to the bus and the train. Kitchen use, no meals. Bills split.',
    confirmed: 15,
    photos: ['bedroom-02', 'sitting-03', 'room-01', 'sitting-06', 'bathroom-01'],
  },
]

console.log('Creating listings…')
const ids = {}

for (const listing of LISTINGS) {
  const { photos, confirmed, key, ...columns } = listing

  // Idempotent: the one-live-listing-per-eircode index would refuse a second
  // run otherwise, and a seed you cannot re-run is a seed you stop trusting.
  await db.from('listings').delete().eq('eircode', columns.eircode)

  const { data, error } = await db
    .from('listings')
    .insert({
      ...columns,
      host_id: hostId,
      status: 'live',
      posted_at: ago(confirmed + 2),
      last_confirmed_at: ago(confirmed),
      expires_at: new Date(Date.now() + (14 - confirmed) * day).toISOString(),
    })
    .select('id')
    .single()

  if (error) throw error
  ids[key] = data.id

  // Five each, because that is what the listing form requires and a seed
  // that breaks the site's own rule makes the acceptance check lie. There are
  // sixteen sample photos and twenty slots, so the shared rooms repeat across
  // listings. Real listings never would.
  // Real uploads to the real bucket, so the Storage policies and the public
  // URL shape are exercised rather than assumed.
  const rows = []
  for (const [i, name] of photos.entries()) {
    const file = await readFile(join('public', 'sample', `${name}.jpg`))
    const path = `${hostId}/${data.id}-${i}.jpg`

    const { error: uploadError } = await db.storage
      .from('listing-photos')
      .upload(path, file, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) throw uploadError
    rows.push({ listing_id: data.id, storage_path: path, sort_order: i })
  }

  const { error: photoError } = await db.from('listing_photos').insert(rows)
  if (photoError) throw photoError

  console.log(`  ${key}: ${data.id} (${rows.length} photos)`)
}

console.log('Creating a reveal old enough for the outcome check…')
await db.from('contact_reveals').upsert(
  {
    listing_id: ids.fresh,
    student_id: studentId,
    safety_notice_version: '2026-09-08',
    created_at: ago(20),
  },
  { onConflict: 'listing_id,student_id' },
)

console.log('Creating reports…')
await db.from('reports').delete().eq('reporter_email', 'reporter@digs.test')
await db.from('reports').insert([
  {
    listing_id: ids['about-to-go-stale'],
    host_id: hostId,
    reason: 'scam',
    details:
      'Asked me for a 300 euro deposit over WhatsApp before letting me see the room.',
    reporter_email: 'reporter@digs.test',
  },
  {
    listing_id: ids.expiring,
    host_id: hostId,
    reason: 'already_gone',
    details: 'Room was taken three weeks ago.',
    reporter_email: 'reporter@digs.test',
  },
])

console.log('\nSeeded.')
console.log('  host    host@digs.test')
console.log('  admin   admin@digs.test')
console.log('  student student@digs.test')
console.log('\nSign in at /sign-in — the magic link appears in Inbucket.')
