# Status

**84% to a working v1.**

Last updated: 9 September 2026.

The site now runs against a real database. Local Supabase in Docker — real
Postgres, real auth, real Storage, real row level security — with all four
migrations applied and every flow driven end to end through a real browser and
real magic-link emails.

That exercise found four bugs nothing else had: two that broke every photo, one
that silently broke sign-in, and one that lost blocklist evidence. None of them
could have been caught by a unit test or a build.

What remains is the three paid services and a deploy. Those are the parts that
need your accounts.

---

## How the number is worked out

Each area is weighted by how much of a *working site* it represents, not by
how much code it took. Scored honestly: an area only counts as done when it
has been seen working, not when it has been written.

| # | Area | Weight | Scored | Why not full marks |
|---|---|---|---|---|
| 1 | Product decided and documented | 5 | 5 | — |
| 2 | Schema and data model | 8 | 8 | All four migrations applied and exercised |
| 3 | Student side: search, listing page, contact reveal | 12 | 12 | — |
| 4 | Host side: sign in, verify, post, manage | 12 | 11 | Sign-in, listings, confirm and screening verified; Google and Twilio still unexercised |
| 5 | Photos: upload, storage, display | 8 | 8 | — |
| 6 | Compliance: blocklist, reports, admin queue, DSA reasons | 10 | 10 | Queue used on real reports; refusal logged as evidence |
| 7 | Freshness and measurement loops | 8 | 8 | One-click confirm verified end to end; only real delivery is untested |
| 8 | Design, accessibility, mobile | 10 | 10 | — |
| 9 | Automated checks | 5 | 5 | — |
| 10 | Runs against a real database | 8 | 7 | Verified locally; a hosted project still has its own config |
| 11 | External services live | 8 | 0 | No Maps, Twilio or Resend keys |
| 12 | Deployed and reachable | 4 | 0 | — |
| 13 | Launch gates cleared | 2 | 0 | STL register question unanswered |
| | **Total** | **100** | **84** | |

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
- [x] One-click confirm from the reminder email, no sign-in. The token can only
      say "still free" — taking a room down stays behind a sign-in, so a
      forwarded link can never remove someone's advert
- [x] Design system, light and dark, WCAG 2.1 AA verified by axe on every page
- [x] 129 unit tests, a UI review harness, and two acceptance scripts
- [x] **Verified against a real database**: RLS holds under the anon key, no
      address or coordinate reaches any page, the freshness sweep really does
      stale and expire, and the outcome job asked its first question
- [x] **Verified signed in, through a real browser and real magic links**: an
      admin decides a report and the reason is stored, a host confirms a room
      and the clock resets, a student accepts the notice and sees the number,
      and the form refuses a discriminatory advert and logs the evidence

## Outstanding

### Blocking v1

- [ ] **Create the hosted Supabase project.** The schema is proven locally, so
      this is now configuration rather than risk. Needs your account.
      **Add `https://<domain>/auth/callback` to the allowed redirect URLs** —
      without it sign-in silently fails with no error message.
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
node scripts/seed-local.mjs  # real rows and real photos, local only
node scripts/verify-v1.mjs   # the acceptance check, against a running site
node scripts/flow-check.mjs  # the signed-in flows, through a real browser
```

`verify-v1.mjs` is the definition of done. It exits non-zero while anything
required for v1 is failing, so it can gate a deploy. Checks it cannot prove
from outside — an SMS arriving, an email landing — are reported as SKIP rather
than passed, because a green tick nobody verified is worse than an honest gap.
