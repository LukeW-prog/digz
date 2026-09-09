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
      await reasonBox.fill('Checked with the host. The room is genuinely gone.')
      await page
        .locator('button[name="decision"][value="removed"]')
        .first()
        .click()
      // A Server Action is not a navigation, so waiting for the network to go
      // quiet proves nothing. Wait for the decision itself to appear.
      await page
        .locator('text=Checked with the host')
        .first()
        .waitFor({ timeout: 15000 })
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

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(
  `\n${results.length - failed.length}/${results.length} passed, ${failed.length} failure(s).`,
)
if (failed.length) process.exit(1)
