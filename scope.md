# Scope and ownership

What the app does, what we own versus what is still open. Answer what you
can inline — leave the rest blank and we'll close them as we go.

> **Decisions from this doc are recorded in `mvp.md`.** That is the live
> document. This one is kept for the questions it raises at full scale.

---

## 1. Locked scope

Carried over from `README.md`. Not open questions, stated for reference.

**In scope:**
- Search for digs to rent, for college
- Filters: Monday–Friday or full week, meals included, term-time dates,
  owner-occupied, price, room type
- Walk, cycle and bus time to campus, shown in minutes
- Posting date on every listing, host-confirmed weekly, auto-expiry at 14
  days
- Never-pay-before-viewing built into the flow
- Report button on every listing, message and profile

**Out of scope:**
- Payments, deposits, escrow — we never handle money
- Roommate matching
- Reviews and ratings
- Multi-city (single town at launch)
- Host vetting or assessor visits (legally unavailable to us, see
  `feasibility.md`)
- Scraping other sites (legal risk, see `feasibility.md`)
- Identity-based host filters — nationality, ethnicity, religion, family
  status (see `safety.md`)

---

## 2. Ownership map

Who is responsible for what, once built.

| Thing | Owned by | Notes |
|---|---|---|
| The listing text and photos | Host | Hosted content, we publish it |
| Accuracy of a listing | Host | We do not inspect or verify the property |
| The agreement between host and student | Host and student | We are not a party to it |
| Moderation decisions | Us | Report review, takedown, suspension |
| Data protection compliance | Us | Controller for all personal data collected |
| Discriminatory advert liability | **Us**, per the Daft precedent | See `feasibility.md` Gate 1 |
| Payment disputes | N/A | We never handle money, so this never arises |
| Physical safety at a viewing | Host and student | We provide guidance only |
| App store policy compliance | Us | Apple 1.2, Google Play UGC rules |
| Accessibility (WCAG 2.1 AA) | Us | Build standard regardless of exemption |

---

## 3. Open questions

Grouped by area. Leave blank what you don't know yet.

### Geography and audience

- Town at launch: initially target maynooth
- Second town, and when: assess based of uptake? but surrounding - was less targeting towns and more colleges
- Colleges covered in that town (just the main university, or every
  institution): maynooth university
- Age range we actively support — 18+ only, or do we support 17-year-old
  first years too: what is easiest to market decisionb here?
- Do we support international students booking before they arrive in
  Ireland, given the standard advice against it: Again anything bad that could come of this?
- Mon–Fri workers (non-students) — in scope at launch or later: again any risks but happy to if not on all

### Product boundaries

- Is a house-share (not owner-occupied) ever shown, or strictly digs only:
  what is diff
- Do we show listings the host hasn't confirmed as "still available", just
  greyed out, or hide them entirely: shown and users can msg until marked as occupied
- Minimum photo count to publish a listing: 5-10
- Do we allow free-text description at all, given the discrimination risk
  in `feasibility.md`, or structured fields only: I think free text like donedeal and adverts seem fine so why not 
- Messaging in-app, or do we hand off to phone/email once matched: in app
- If in-app messaging, do we scan it for off-platform payment requests
  (per `safety.md`): maybe yes just make users aware it will be scanned

### Legal entity and liability

- Do we have a solicitor answer on the section 6 / section 12 tension
  before any listing goes live (per `feasibility.md` item 1): no its just me
- What company structure — sole trader, limited company, before or after
  first listing: just 1 person
- Insurance — public liability, professional indemnity, cyber: do we have
  any, and from when: nothin
- Terms of service and privacy policy — drafted by a solicitor or a
  template to start: nothin

### Accounts and verification

- Under-18 accounts: allowed, blocked, or allowed with extra conditions:
  ______
- Phone verification mandatory for hosts — yes/no: ______
- Phone verification mandatory for students — yes/no: ______
- Third-party ID verification — adopt now, defer, or never (per
  `safety.md` open decision 1): ______
- Email verification only, or something stronger, at launch: ______

recommended approach for all

### Moderation operations

- Who is the named person answering reports within 24 hours: ______
- Backup if that person is unavailable, especially in August: ______
- Retention period for moderation and incident records: ______
- Do we pre-screen listings before they go live, or publish then review on
  report: ______

is an automatic routing and answer that a follow up will happen suffient? pl;enty of services healthcare and otherwise that dont seem to have tihs

### Money and business model

- Confirmed: no payments through the app at launch. Revisit date: ______
- Eventual monetisation direction — host listing fee, premium features,
  something else, or genuinely undecided: ______
- Free-both-sides end date, or is this permanent: ______

yeah what is best business model

### Platform and technical

- Native app (iOS/Android), responsive web, or both at launch: ______
- If native, one platform first or both simultaneously: ______
- Mapping/walk-time provider — Google (paid, simple) or Valhalla
  (free, self-hosted) per `feasibility.md`: ______
- Who builds this — you, a contractor, a co-founder, or AI-assisted
  solo build: ______
- Rough timeline to first working version: ______

web launches to app

### Brand

- Name — "Digz" (from the old prototype) or "Digs" (used in this doc) or
  something else: ______
- Domain and app store listing names secured: ______

not decided

### Success criteria

- What does "working" look like for a first version — a number of
  listings, a number of matches, something else: ______
- Decision point to go further or stop, and when: ______

i think this whole peice is being overcomplicated slightly and want to target mvp that a single person could launch to assess success
---

## 4. Dependencies between answers

Some questions block others. Worth answering in this rough order:

1. Town and age range — shapes almost everything else.
2. The section 6/12 legal question — shapes the listing data model.
3. Under-18 accounts — shapes signup, consent, and the data protection
   impact assessment.
4. Platform choice — shapes what gets built first.
5. Everything else can follow.
