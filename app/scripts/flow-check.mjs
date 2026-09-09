/**
 * Signed-in flow check, local only.
 *
 * verify-v1.mjs covers everything reachable without an account. This covers
 * the rest: the pages and actions that only exist once someone has signed in,
 * which is most of the product's risk and none of its public surface.
 *
 * It drives a real browser through the real magic-link flow, reading the email
 * out of Mailpit exactly as a person would read it out of their inbox. Nothing
 * is stubbed and no session is forged, because a forged session would skip the
 * part most likely to be broken.
 *
 *   node scripts/flow-check.mjs
 */

import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const MAILPIT = 'http://127.0.0.1:54324'

/**
 * A token unique to this run, mixed into anything written to the database.
 *
 * Waiting for text that a previous run already left on the page returns
 * instantly, so the assertion reads the database before the new write lands
 * and fails for reasons that have nothing to do with the code. Ask for
 * something only this run could have produced.
 */
const RUN = Date.now().toString().slice(-6)

const results = []
const record = (name, ok, note = '') => {
  results.push({ name, ok, note })
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${note ? ` — ${note}` : ''}`)
}

/** The newest message for an address, and the sign-in link inside it. */
async function magicLinkFor(email, since) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(`${MAILPIT}/api/v1/messages?limit=30`)
    const { messages = [] } = await res.json()

    const mail = messages.find(
      (m) =>
        m.To?.some((t) => t.Address === email) &&
        new Date(m.Created).getTime() >= since,
    )

    if (mail) {
      const body = await (
        await fetch(`${MAILPIT}/api/v1/message/${mail.ID}`)
      ).json()
      const text = `${body.Text ?? ''} ${body.HTML ?? ''}`
      const match = text.match(/https?:\/\/[^\s"'<>]+/g)
      const link = match?.find((u) => /token|verify|callback/i.test(u))
      if (link) return link.replace(/&amp;/g, '&')
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return null
}

async function signIn(page, email, role) {
  const since = Date.now() - 2000
  await page.goto(`${BASE}/sign-in${role === 'host' ? '?role=host' : ''}`)
  await page.fill('input[name="email"]', email)
  await page.click('button[type="submit"]')

  const link = await magicLinkFor(email, since)
  if (!link) throw new Error('no sign-in email arrived')

  await page.goto(link)
  await page.waitForLoadState('networkidle')
}

const browser = await chromium.launch()

// ------------------------------------------------------------------ admin

console.log('\nAdmin')
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  try {
    // Give the queue something of this run's own to act on. Depending on
    // leftovers means the check passes until the day someone has cleared the
    // queue, and then reports a failure that is really an empty inbox.
    const { createClient } = await import('@supabase/supabase-js')
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
    const { data: theHost } = await db
      .from('hosts')
      .select('id')
      .eq('email', 'host@digs.test')
      .single()
    const { data: aListing } = await db
      .from('listings')
      .select('id')
      .eq('host_id', theHost.id)
      .limit(1)
      .single()

    await db.from('reports').insert({
      host_id: theHost.id,
      listing_id: aListing.id,
      reason: 'already_gone',
      details: `Room was taken weeks ago. Run ${RUN}`,
      reporter_email: 'reporter@digs.test',
    })

    await signIn(page, 'admin@digs.test', 'host')
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })

    const body = await page.content()
    record('An admin can open /admin', /Reports waiting/.test(body))

    await page.goto(`${BASE}/admin/reports`, { waitUntil: 'networkidle' })
    const reports = await page.content()
    record(
      'The reports queue lists real reports',
      /looks like a scam|already taken|scam/i.test(reports),
    )

    await page.screenshot({
      path: '.ui-review/flow-admin-reports.png',
      fullPage: true,
    })

    // Act on a report for real, and check the decision sticks.
    const reasonBox = page.locator('textarea[name="decisionReason"]').first()
    if (await reasonBox.count()) {
      const removedReason = `Checked with the host, the room is gone. Run ${RUN}`
      await reasonBox.fill(removedReason)
      await page
        .locator('button[name="decision"][value="removed"]')
        .first()
        .click()
      // A Server Action is not a navigation, so waiting for the network to go
      // quiet proves nothing. Wait for the decision itself to appear.
      await page.locator(`text=Run ${RUN}`).first().waitFor({ timeout: 15000 })
      record('A decision is recorded with its reason', true)
    } else {
      record('A decision is recorded with its reason', false, 'no open report')
    }
  } catch (error) {
    record('Admin flow', false, error.message)
  }
  await ctx.close()
}

// ------------------------------------------------------------------- host

console.log('\nHost')
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  try {
    await signIn(page, 'host@digs.test', 'host')
    await page.goto(`${BASE}/host/listings`, { waitUntil: 'networkidle' })

    const body = await page.content()
    record('A host sees their own listings', /Maynooth|Kilcock/.test(body))

    await page.screenshot({
      path: '.ui-review/flow-host-listings.png',
      fullPage: true,
    })

    const confirm = page.locator('button:has-text("Still available")').first()
    if (await confirm.count()) {
      await confirm.click()
      await page.locator('text=Confirmed today').first().waitFor({ timeout: 15000 })
      record('Confirming resets the freshness clock', true)
    } else {
      record('Confirming resets the freshness clock', false, 'no confirm button')
    }

    // Upload a real file through the real uploader. This is the only check
    // that exercises the browser-side redraw that strips EXIF, the direct
    // upload to Storage, and the subject picker that becomes alt text.
    await page.goto(`${BASE}/host/new`, { waitUntil: 'networkidle' })
    await page.setInputFiles('input[type="file"]', 'public/sample/bedroom-01.jpg')
    await page.locator('select[id^="subject-"]').first().waitFor({ timeout: 30000 })
    record('A photo uploads from the form', true)

    await page.locator('select[id^="subject-"]').first().selectOption('room')
    const hidden = await page
      .locator('input[name="photoPaths"]')
      .inputValue()
    record(
      'The subject picker reaches the form data',
      hidden.includes('"subject":"room"'),
    )
    await page.screenshot({
      path: '.ui-review/flow-uploader.png',
      fullPage: true,
    })

    // The uploaded file must be a stripped JPEG, not the original bytes.
    const { createClient: sbClient } = await import('@supabase/supabase-js')
    const store = sbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )
    const uploadedPath = JSON.parse(hidden)[0].path
    const { data: blob } = await store.storage
      .from('listing-photos')
      .download(uploadedPath)
    const bytes = Buffer.from(await blob.arrayBuffer())
    record('It is stored as a JPEG with no GPS tags', !bytes.includes(Buffer.from('GPS')))

    // The form must refuse to publish a discriminatory advert. This is the
    // one screening that cannot be deferred, so it is checked through the
    // real form rather than only in unit tests.
    await page.goto(`${BASE}/host/new`, { waitUntil: 'networkidle' })
    await page.fill('input[name="addressLine"]', '7 Rail Park')
    await page.fill('input[name="eircode"]', 'W23 X9Y8')
    await page.selectOption('select[name="roomType"]', 'single')
    await page.fill('input[name="pricePerWeek"]', '120')
    await page.selectOption('select[name="schedule"]', 'mon_fri')
    await page.selectOption('select[name="meals"]', 'none')
    await page.fill('#description', 'Room to let, would suit a professional girl.')
    await page.click('button[type="submit"]')
    await page
      .locator('text=not allowed in a published advert')
      .first()
      .waitFor({ timeout: 20000 })
    const refused = await page.content()
    record(
      'The form refuses a discriminatory advert',
      /not allowed in a published advert|before posting/i.test(refused),
    )
    await page.screenshot({
      path: '.ui-review/flow-blocklist-refusal.png',
      fullPage: true,
    })
  } catch (error) {
    record('Host flow', false, error.message)
  }
  await ctx.close()
}

// ---------------------------------------------------------------- student

console.log('\nStudent')
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  try {
    await signIn(page, 'student@digs.test', 'student')

    await page.goto(BASE, { waitUntil: 'networkidle' })
    const href = await page.locator('a[href^="/listing/"]').first().getAttribute('href')
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' })

    const before = await page.content()
    record(
      'Contact is hidden until the notice is accepted',
      !/\+353\d/.test(before),
    )

    await page.locator('input[type="checkbox"]').first().check()
    await page.locator('button:has-text("contact details")').first().click()
    // The reveal is a Server Action, so the network going quiet means nothing.
    // Wait for the number itself.
    await page.locator('text=+353').first().waitFor({ timeout: 20000 })

    const after = await page.content()
    record('Accepting the notice reveals the contact', /\+353\d/.test(after))

    await page.screenshot({
      path: '.ui-review/flow-contact-revealed.png',
      fullPage: true,
    })
  } catch (error) {
    record('Student flow', false, error.message)
  }
  await ctx.close()
}

// ------------------------------------------------- one-click confirm by email

console.log('\nReminder link')
{
  const { createClient } = await import('@supabase/supabase-js')
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()

  try {
    // Put a listing into the state the reminder is sent about, rather than
    // hoping one is in it. Without this the check depends on run order: a
    // listing confirmed by an earlier run shows the "already done" page, which
    // has no button, and the failure looks like a bug in the page.
    const { data: showing } = await db
      .from('listings')
      .select('confirm_token')
      .in('status', ['live', 'stale'])
      .limit(1)
      .single()

    await db
      .from('listings')
      .update({
        status: 'stale',
        last_confirmed_at: new Date(Date.now() - 8 * 86_400_000).toISOString(),
      })
      .eq('confirm_token', showing.confirm_token)

    await page.goto(`${BASE}/confirm/${showing.confirm_token}`, {
      waitUntil: 'networkidle',
    })
    const asked = await page.content()
    record('The reminder link asks without a sign-in', /still free\?/i.test(asked))

    await page.locator('button[type="submit"]').first().click()
    await page.locator('text=that is confirmed').first().waitFor({ timeout: 15000 })

    const { data: after } = await db
      .from('listings')
      .select('status, last_confirmed_at')
      .eq('confirm_token', showing.confirm_token)
      .single()

    record('One click really resets the clock', after.status === 'live' &&
      after.last_confirmed_at.slice(0, 10) === new Date().toISOString().slice(0, 10))

    // The link must not resurrect something already taken down. An old email
    // sitting in an inbox cannot undo a host's or an admin's decision.
    const { data: gone } = await db
      .from('listings')
      .select('confirm_token')
      .in('status', ['expired', 'removed'])
      .limit(1)
      .maybeSingle()

    if (gone) {
      await page.goto(`${BASE}/confirm/${gone.confirm_token}`, {
        waitUntil: 'networkidle',
      })
      const body = await page.content()
      const noButton = (await page.locator('button[type="submit"]').count()) === 0
      record(
        'An old link cannot revive a listing that is off the site',
        /off the site/i.test(body) && noButton,
      )
    } else {
      record('An old link cannot revive a listing that is off the site', false,
        'no expired listing to test with')
    }

    const res = await page.goto(`${BASE}/confirm/11111111-2222-3333-4444-555555555555`)
    record('An unknown token reveals nothing', res.status() === 404)
  } catch (error) {
    record('Reminder link flow', false, error.message)
  }
  await ctx.close()
}

// ------------------------------------------------- blocking, and undoing it

console.log('\nBlocking a host')
{
  const { createClient } = await import('@supabase/supabase-js')
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()

  // Blocking pulls every listing the host has, so this runs last and puts the
  // statuses back afterwards. A check that leaves the database unusable for
  // the next run is a check people stop running.
  const { data: before } = await db
    .from('listings')
    .select('id, status')
    .eq('host_id', (await db.from('hosts').select('id').eq('email', 'host@digs.test').single()).data.id)

  try {
    await signIn(page, 'admin@digs.test', 'host')

    // Give the queue something to act on.
    const { data: host } = await db
      .from('hosts')
      .select('id, phone')
      .eq('email', 'host@digs.test')
      .single()

    await db.from('reports').insert({
      host_id: host.id,
      listing_id: before[0].id,
      reason: 'scam',
      details: 'Asked for a deposit before any viewing.',
    })

    await page.goto(`${BASE}/admin/reports`, { waitUntil: 'networkidle' })
    await page
      .locator('textarea[name="decisionReason"]')
      .first()
      .fill(`Third report of the same deposit scam. Blocking. Block-${RUN}`)
    await page
      .locator('button[name="decision"][value="host_blocked"]')
      .first()
      .click()
    // A distinct marker: the admin section above already left "Run <id>" on
    // this page, so waiting for that would return before this decision lands.
    await page.locator(`text=Block-${RUN}`).first().waitFor({ timeout: 15000 })

    const { data: blocked } = await db
      .from('hosts')
      .select('blocked_at')
      .eq('id', host.id)
      .single()
    const { data: phone } = await db
      .from('blocked_phones')
      .select('phone')
      .eq('phone', host.phone)
      .maybeSingle()

    record('Blocking sets the flag and blocks the phone',
      Boolean(blocked.blocked_at) && Boolean(phone))

    const { data: pulled } = await db
      .from('listings')
      .select('status')
      .eq('host_id', host.id)
    record('Every listing they had comes down',
      pulled.every((l) => l.status === 'removed'))

    // The whole point of the page: the case is reviewable afterwards.
    await page.goto(`${BASE}/admin/hosts/${host.id}`, { waitUntil: 'networkidle' })
    const history = await page.content()
    record('The history page shows why they were blocked',
      /Blocked/.test(history) && history.includes(`Block-${RUN}`))
    record('It shows what they tried to publish',
      /Adverts refused/.test(history))
    await page.screenshot({ path: '.ui-review/flow-host-history.png', fullPage: true })

    await page.locator('textarea[name="note"]').fill('Appeal upheld — it was a different host.')
    await page.locator('button:has-text("Unblock")').click()
    await page.locator('text=Not blocked').first().waitFor({ timeout: 15000 })

    const { data: after } = await db
      .from('hosts')
      .select('blocked_at')
      .eq('id', host.id)
      .single()
    const { data: phoneAfter } = await db
      .from('blocked_phones')
      .select('phone')
      .eq('phone', host.phone)
      .maybeSingle()

    record('Unblocking lifts the flag and the phone block',
      after.blocked_at === null && phoneAfter === null)
  } catch (error) {
    record('Blocking flow', false, error.message)
  }

  // Put the listings back exactly as they were.
  for (const listing of before ?? []) {
    await db
      .from('listings')
      .update({ status: listing.status, removed_at: null, removed_reason: null })
      .eq('id', listing.id)
  }

  await ctx.close()
}

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(
  `\n${results.length - failed.length}/${results.length} passed, ${failed.length} failure(s).`,
)
if (failed.length) process.exit(1)
