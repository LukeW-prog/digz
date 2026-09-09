# Digs

**A polished app for finding digs for college in ireland.**

That's the whole vision. Not a marketplace play, not a host-activation
campaign, not a vetting service. A search that works properly, built well,
shipped to the app store.

---

## The bet

Nobody has built a decent digs search. Verified, not assumed:

- **Daft** lists 2,722 shares nationally with no Mon–Fri filter, no meals
  filter, no term dates, no owner-occupied filter, and no posting dates.
- **Studentpad** mixes digs with apartments and house shares, behind a login.
- **myroom, Digs.ie, CollegeCribs** are web only.
- **Nobody in Irish digs has a native mobile app.**

The bar to clear is low. The opportunity is to clear it properly.

---

## What we build

### Search that fits digs

Filters the others don't have:

- Monday–Friday or full week
- Meals included
- Term-time dates
- Owner-occupied — actual digs, not a house share
- Price, room type

### Distance measured in minutes

Not "within 5km". **"12 minutes' walk to campus."** Walk, cycle and bus
times. Standard on Zillow and OnTheMarket for years. No Irish site does it.

### Listings you can trust are real

- Posting date on every listing
- Host confirms "still available", prompted weekly
- Stale listings grey out, then expire at 14 days
- Never pay before viewing, said plainly in the flow
- Report button

---

## The quality bar

This is the actual differentiator, so it is not negotiable.

- Mobile first. Fast. Works on a bad connection.
- Search results in under a second.
- Photos that load properly.
- No login wall to browse.
- Listing flow under 5 minutes on a phone.

Every competitor is dated, web-only, or generalist. Polish is not
defensible long term. It does not need to be. It needs to be better than
a Facebook group.

---

## Out of scope

Payments and deposits. Roommate matching. Reviews and ratings.
Multi-city. Host vetting and assessor visits. Scraping other sites.

All are things to add once search is good. None are reasons to exist.

---

## Files

**Decide what to build**

- `mvp.md` — **what we actually build first. Start here.**
- `feasibility.md` — legal, ethical and technical risk. Read before building.
- `safety.md` — how we stop malicious hosts and protect students
- `research.md` — facts and figures, reference only
- `avenues.md` — other directions considered, parked
- `scope.md` — full scope and open questions, superseded by mvp.md

**Build it**

- `stack.md` — the stack, the accounts to open, how to run it locally
- `data-model.md` — every table and column, and what is deliberately absent
- `supabase/migrations/` — the schema as SQL
- `app/` — the Next.js application
- `app/src/lib/blocklist.json` — the discriminatory-advert phrase list
- `app/src/lib/blocklist.ts` — the matcher. **Must be live before the first
  listing publishes.**
- `app/src/lib/photos.ts` — where a listing photo lives and how its URL is built
- `app/public/sample/` — development-only photos, and where they came from
- `app/scripts/review-ui.mjs` — renders and audits every page; run it after any
  UI change and look at the screenshots
- `app/src/lib/freshness.ts` — when a listing goes stale and when the host is asked
- `app/src/lib/outcomes.ts` — the two-week "did you find a place?" check
- `app/src/app/admin/` — reports queue and blocklist log. Gated by `ADMIN_EMAILS`;
  an unset list admits nobody.

## Open before launch

One item is closer to a gate than it looks. The short-term letting register
opens **1 Dec 2026**, covers lets of 21 nights or fewer, and fines platforms
up to 2% of turnover for listing unregistered properties. Maynooth is in
scope. Mon–Fri digs is a four-night stay, which is ambiguous, and Mon–Fri is
a headline feature. **One call to Fáilte Ireland settles it.** Make it before
the January intake, not after.
