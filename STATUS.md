# Status

**73% to a working v1.**

Last updated: 9 September 2026.

The build is essentially done. What remains is the part where a project finds
out whether it works: running against a real database, turning on the three
paid services, and putting it somewhere students can reach. Expect surprises
in that last quarter — that is where they live.

---

## How the number is worked out

Each area is weighted by how much of a *working site* it represents, not by
how much code it took. Scored honestly: an area only counts as done when it
has been seen working, not when it has been written.

| # | Area | Weight | Scored | Why not full marks |
|---|---|---|---|---|
| 1 | Product decided and documented | 5 | 5 | — |
| 2 | Schema and data model | 8 | 7 | Four migrations written; never applied to a hosted project |
| 3 | Student side: search, listing page, contact reveal | 12 | 12 | — |
| 4 | Host side: sign in, verify, post, manage | 12 | 10 | Posting depends on Google and Twilio, neither exercised |
| 5 | Photos: upload, storage, display | 8 | 8 | — |
| 6 | Compliance: blocklist, reports, admin queue, DSA reasons | 10 | 9 | Queue never used against real reports |
| 7 | Freshness and measurement loops | 8 | 7 | No email has actually been sent |
| 8 | Design, accessibility, mobile | 10 | 10 | — |
| 9 | Automated checks | 5 | 5 | — |
| 10 | Runs against a real database | 8 | 0 | In progress |
| 11 | External services live | 8 | 0 | No Maps, Twilio or Resend keys |
| 12 | Deployed and reachable | 4 | 0 | — |
| 13 | Launch gates cleared | 2 | 0 | STL register question unanswered |
| | **Total** | **100** | **73** | |

---

## Done

- [x] Docs settled and contradictions fixed — `mvp.md`, `data-model.md`, `stack.md`
- [x] Schema: listings, hosts, students, photos, reveals, outcomes, reports, blocklist hits, blocked phones
- [x] Row level security policies on every table
- [x] Search with filters, no JavaScript required, every search a shareable URL
- [x] Walk and cycle time on every listing, and an honest "quickest to campus" sort
- [x] Listing page with photo gallery and scroll-snap rail
- [x] Freshness shown publicly — "confirmed yesterday", stale flagged not dimmed
- [x] Passwordless sign in, host phone verification flow, host listing management
- [x] Discriminatory advert blocklist, 253 phrases, with the spaced-out dodge closed
- [x] Every refusal logged as evidence
- [x] Geocoding that rejects approximate matches, as anti-fraud
- [x] Photo upload straight to Storage, with EXIF stripped before a byte leaves the browser
- [x] Report route, DSA Article 16 shaped
- [x] Admin: reports queue with mandatory reasons, blocklist hit log
- [x] Nightly freshness sweep, idempotent, with host reminders
- [x] Two-week outcome check, answerable without an account
- [x] Design system, light and dark, WCAG 2.1 AA verified by axe on every page
- [x] 129 unit tests, a UI review harness, and `scripts/verify-v1.mjs`

## Outstanding

### Blocking v1

- [ ] **Run against a real database.** Migrations 0001–0004 have never been
      applied anywhere. Local Supabase is coming up now; a hosted project still
      needs your account.
- [ ] **Google Maps key.** Without it a host cannot post at all: the form stops
      at address lookup. This is the single biggest untested path.
- [ ] **Twilio Verify.** Phone verification is the main thing keeping fake
      listings off the site, and no code has ever been sent.
- [ ] **Resend key and a sending domain.** No reminder or outcome email has ever
      been delivered, so both loops are unproven end to end.
- [ ] **Deploy to Vercel** with `CRON_SECRET` and `ADMIN_EMAILS` set. Without
      `CRON_SECRET` nothing ages and no host is ever asked to confirm.
- [ ] **Apply the storage bucket migration before the first host posts**, or
      photo upload fails with no obvious cause.
- [ ] **Fáilte Ireland call** about the short-term letting register. Opens
      1 Dec 2026, Maynooth is in scope, Mon–Fri digs is a four-night stay and
      therefore ambiguous, and the fine is up to 2% of turnover. One call
      settles it. This is a launch gate, not a nice-to-have.

### Should fix before real users

- [ ] **One-click confirm from the reminder email.** It currently links to a
      sign-in page. Friction here directly reduces the confirmation rate, and
      the confirmation rate is what makes "confirmed yesterday" mean anything.
- [ ] **Sweep orphaned photos.** A host who uploads and abandons the form leaves
      unreferenced objects in the bucket forever.
- [ ] **Host-written alt text for photos.** Alt text is positional today
      ("Photo 2 of 5"), which is honest but tells a screen reader user nothing
      about the room.
- [ ] **Admin view of a blocked host's history**, so a block can be reviewed or
      undone.

### Known limitations, accepted for now

- [ ] Admin access is an env var, so revoking it needs a redeploy. Move it to a
      table before there is a second admin.
- [ ] The photo bucket is public. Paths are random UUIDs and objects are deleted
      with their listing, but a leaked URL stays valid.
- [ ] Fully spelled-out discriminatory wording can still evade the blocklist.
      The hit log exists so the list can be extended from what hosts actually
      write.
- [ ] Glass surfaces are `backdrop-filter`, not true refraction. Real
      displacement is Chromium-only and costs rasterisation performance.

---

## How to check

```
cd app
npm test                 # unit tests
npm run review:ui        # renders and audits every page, light and dark
node scripts/verify-v1.mjs   # the acceptance check, against a running site
```

`verify-v1.mjs` is the definition of done. It exits non-zero while anything
required for v1 is failing, so it can gate a deploy. Checks it cannot prove
from outside — an SMS arriving, an email landing — are reported as SKIP rather
than passed, because a green tick nobody verified is worse than an honest gap.
