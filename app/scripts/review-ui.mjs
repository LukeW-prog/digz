/**
 * UI review harness.
 *
 * Screenshots every route at a phone and a desktop width, and runs an
 * accessibility audit against each one. Output goes to .ui-review/, which is
 * git ignored.
 *
 *   npm run review:ui              # needs the dev server already running
 *   npm run review:ui -- --dark    # same, in dark mode
 *
 * Two things are being checked, and they catch different problems.
 * Screenshots show whether a page reads well: hierarchy, spacing, whether the
 * important thing is the thing your eye lands on. The axe audit measures what
 * an eye cannot, notably colour contrast ratios against WCAG 2.1 AA, which
 * feasibility.md commits us to.
 */

import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const BASE = process.env.REVIEW_BASE_URL ?? 'http://localhost:3000'
const OUT = '.ui-review'
const DARK = process.argv.includes('--dark')

/**
 * A real listing id, found by asking the running site rather than hard coded.
 *
 * These used to be the sample-data ids, which quietly 404'd the moment the
 * site was pointed at a real database — so the two most important pages in the
 * review were being screenshotted as "not found" and counted as fine.
 */
async function findListingId() {
  const html = await (await fetch(BASE)).text()
  const match = html.match(/\/listing\/([a-zA-Z0-9-]+)/)
  return match ? match[1] : null
}

const LISTING_ID = await findListingId()
if (!LISTING_ID) {
  console.error('No listing on the home page. Start the site with data first.')
  process.exit(1)
}

const ROUTES = [
  ['home', '/'],
  ['home-filtered', '/?schedule=mon_fri&meals=1&maxWalk=20'],
  ['home-empty', '/?maxPrice=45'],
  ['listing', `/listing/${LISTING_ID}`],
  ['host-new', '/host/new'],
  ['report', '/report'],
  ['sign-in', '/sign-in'],
  ['sign-in-host', '/sign-in?role=host'],
  ['host-verify', '/host/verify'],
  ['host-listings', '/host/listings'],
  ['terms', '/terms'],
  ['privacy', '/privacy'],
  ['safety', '/safety'],
  ['what-digs-is', '/what-digs-is'],
]

/** A phone first, because mvp.md says the listing form must work on one. */
const VIEWPORTS = [
  ['mobile', { width: 390, height: 844 }],
  ['desktop', { width: 1280, height: 900 }],
]

const browser = await chromium.launch()
const findings = []

for (const [vpName, viewport] of VIEWPORTS) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    colorScheme: DARK ? 'dark' : 'light',
    reducedMotion: 'reduce',
  })

  for (const [name, path] of ROUTES) {
    const page = await context.newPage()

    const consoleErrors = []
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text())
    })

    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })

    /*
      Settle the scroll-driven reveals before capturing.

      A full-page screenshot can catch elements part way through their entry
      animation, so the picture shows content faded or blurred that a real
      visitor would never see that way. Forcing the end state means the
      screenshot shows what the page actually settles into. The animations
      themselves are checked separately, in the hover and scrolled captures.
    */
    await page.addStyleTag({
      content: `.reveal { animation: none !important; opacity: 1 !important;
                 transform: none !important; filter: none !important; }`,
    })
    await page.waitForTimeout(150)

    const dir = `${OUT}/${DARK ? 'dark' : 'light'}/${vpName}`
    await mkdir(dir, { recursive: true })
    await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true })

    /*
      Glass only shows itself over something. A full-page shot from the top
      catches the sticky header overlapping nothing at all, so the home page
      is also captured scrolled, and with a row hovered.
    */
    if (name === 'home') {
      await page.evaluate(() => window.scrollTo(0, 620))
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${dir}/${name}-scrolled.png` })

      const row = page.locator('article a').first()
      if (await row.count()) {
        await row.hover()
        await page.waitForTimeout(500)
        await page.screenshot({ path: `${dir}/${name}-hover.png` })
      }
      await page.evaluate(() => window.scrollTo(0, 0))
    }

    // Horizontal overflow is the single commonest mobile bug and is easy to
    // miss in a full-page screenshot, so measure it rather than look for it.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    findings.push({
      route: path,
      viewport: vpName,
      overflowPx: overflow,
      consoleErrors,
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.slice(0, 4).map((n) => ({
          target: n.target.join(' '),
          summary: n.failureSummary?.split('\n').slice(0, 3).join(' '),
        })),
      })),
    })

    await page.close()
  }

  await context.close()
}

await browser.close()
await writeFile(`${OUT}/findings.json`, JSON.stringify(findings, null, 2))

/* ------------------------------------------------------------ the report */

let problems = 0
for (const f of findings) {
  const lines = []

  if (f.overflowPx > 0) {
    lines.push(`  page scrolls sideways by ${f.overflowPx}px`)
  }
  for (const e of f.consoleErrors) {
    lines.push(`  console error: ${e}`)
  }
  for (const v of f.violations) {
    lines.push(`  [${v.impact}] ${v.id}: ${v.help}`)
    for (const n of v.nodes) lines.push(`      ${n.target}`)
  }

  if (lines.length) {
    problems += lines.length
    console.log(`\n${f.route}  (${f.viewport})`)
    console.log(lines.join('\n'))
  }
}

console.log(
  problems === 0
    ? `\nNo accessibility violations, overflow or console errors across ${findings.length} page renders.`
    : `\n${problems} things to look at. Screenshots in ${OUT}/`,
)
