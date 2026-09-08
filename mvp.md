# MVP — one person, one town, one season

Supersedes the open questions in `scope.md`. Decisions recorded here.

**The point of this document is to make the thing small enough to actually
ship.** Everything in `feasibility.md` and `safety.md` still applies, but
most of it is a scale problem. At MVP scale it collapses into one small
build: **an automated blocklist on the listing form.**

---

## The MVP in one paragraph

A responsive website for finding digs near Maynooth University. Digs only,
owner-occupied, no house-shares. Free for everyone. No money touches the
site. Hosts submit a listing, an automated blocklist screens the text, and
it publishes immediately.
Students search with filters that fit digs and see walk time to campus in
minutes. Every listing shows when it was posted and when the host last
confirmed it. No native app. No payments. No reviews. No roommate matching.

---

## Why this is much less work than it looked

Five things drop out entirely at this size.

| Burden | Why it drops out |
|---|---|
| **Discriminatory advert liability** | Daft's problem was thousands of adverts and **no screening at all**. The WRC's actual remedy was to make them build a trigger-word blocklist. **So build the blocklist.** It runs itself. |
| **The 24-hour report rule** | That is an *Apple App Store* requirement, not a law. **Web-first means it does not apply yet.** The DSA only requires "expeditious" action, which is undefined. Checking daily is fine. |
| **Accessibility enforcement** | Micro-enterprise exemption applies, under 10 staff and under €2m. Build sensibly, don't audit. |
| **DSA trader verification** | Article 30 applies to traders. A homeowner letting one room is not one. |
| **Solicitor on section 6 / 12** | Only bites when you publish host-written text at volume. The blocklist keeps the question theoretical until you can afford advice. |

**The blocklist is the MVP compliance strategy.** It is an array of phrases
checked on submit. Build it once, and the ongoing effort is zero.

Crucially, **having a documented automated system is itself the defence.**
Daft was not punished for one bad advert. It was punished for having no
system, then arguing it had no responsibility. A small site with a working
blocklist and a report button is in a completely different position.

---

## Your questions, answered

### Age range — what is easiest to market?

**18+ only.** One line in the terms.

Under-18s trigger the Data Protection Commission's children's data regime,
parental consent, and safeguarding duties. Blocking them costs almost
nothing in reality, because most first-years turn 18 during the year, and a
17-year-old's parent can make the account and do the searching, which is
what happens anyway.

### International students booking before arrival — anything bad?

Real risks, but manageable, because **you never touch money**.

- They are the most scam-targeted group.
- They cannot view in person, which breaks the single best protection we
  have.
- If it goes wrong they are stranded in a foreign country.

**Do this:** let them browse and message freely. Do **not** market it as
"book from abroad". Keep never-pay-before-viewing prominent. Add one line
suggesting a video call with the host if an in-person viewing is impossible.
Costs nothing, removes most of the risk.

### Mon–Fri workers — any risks?

**Almost none. Allow them.** Rent-a-room relief is about the host's home,
not the occupant's job, so the host's tax position is unaffected.

Do not build a separate flow. Just do not restrict by occupation. It adds
demand outside the September spike, which smooths the whole year.

### House-share versus digs — what's the difference?

This matters more than it sounds.

| | **Digs** | **House-share** |
|---|---|---|
| Owner lives there | **Yes** | No |
| Legal status | Licence | Usually a tenancy |
| RTB rights | None | Yes, registration required |
| Equal Status exemption | Applies | Does **not** apply |
| Typical setup | Room in a family home, often meals, often Mon–Fri | Room in a rented house with other renters |

**MVP: digs only.** Three reasons. It is the entire differentiation.
House-shares drag us into tenancy law and RTB registration. And the Equal
Status exemption that protects the host only exists for owner-occupied
homes.

Daft already does house-shares badly but adequately. Nobody does digs.

### Free text — DoneDeal and Adverts do it, so why not?

Fair challenge, and the honest answer is that they are in the **same legal
position and simply have not been targeted yet.** Daft was targeted and lost,
and its "we're just a platform" defence was rejected.

**Decision: allow free text, and screen it automatically.**

- **Structured fields carry most of the information.** Meals, weekends,
  term dates, bills, room type, house rules. A student mostly needs facts,
  not prose.
- **One free-text box, capped at about 300 characters.** Enough to describe
  the house. Not enough to write an essay about who they want.
- **Blocklist checked on submit.** If it trips, the form refuses and says
  which phrase and why. The host edits and resubmits. No human involved.
- **Listings publish immediately.** No queue, no delay.
- **Report button as the backstop.** Students will flag what slips through.

### The blocklist

Build it from the Daft case and the protected grounds. Roughly:

| Ground | Example phrases to block |
|---|---|
| Gender | female only, male only, girls only, boys only, suit a girl |
| Race / nationality | Irish only, no foreigners, no international |
| Family status | no children, no families, professionals only |
| Age | young professional, mature student only, under 25 |
| Religion | any faith named as a requirement |
| Housing assistance | no HAP, rent allowance not accepted, no social welfare |
| From the case | would suit young professionals, reference required |

**"Reference required" is genuinely on the banned list.** That one surprises
people, so include it.

Match case-insensitively, allow for spacing variants, and keep the list in
one file so it is easy to extend when you spot something new.

### Verification — recommended approach for all

- **Under-18 accounts:** blocked.
- **Phone verification for hosts:** **yes.** Costs cents per SMS and is the
  single highest-value anti-fraud measure there is. Do not skip this one.
- **Phone verification for students:** no. Email only. Do not add friction
  to the side that is already desperate.
- **Third-party ID verification:** no. Not now, maybe never.
- **Email verification:** yes, standard, for accounts that message.

Students should be able to **browse without any account at all.** Account
only needed to send a message.

### Moderation — is auto-routing plus "we'll follow up" enough?

**For a web MVP, yes.** You are right that plenty of services do exactly
this.

The 24-hour clock is Apple's rule, and you are not shipping a native app.
The DSA asks for "expeditious", not a fixed number. An automatic
acknowledgement plus you checking reports once a day is proportionate and
defensible.

**One exception.** Anything alleging a safety threat or fraud with real
money lost gets handled same day, and the listing comes down first while you
look. That is judgement, not process.

### Best business model

**Free both sides for the MVP. No exceptions.** You are buying evidence.

For later, the realistic options ranked:

1. **Institutional licence — sell to the university.** Studentpad is
   licensed to over 100 institutions, so willingness to pay is proven, and
   Maynooth already outsources this. Best fit by far.
2. **Featured listings.** Only works at volume.
3. **Host listing fee.** myroom charges €4.99. **Bad idea** — it suppresses
   supply, which is the scarce side.
4. **Student fee.** Worst option. Broke users, desperate side, poor optics.

**Target the institutional licence.** Everything else is a distraction.

### Platform

**Web-first, agreed.** It is the right call and it defers the entire Apple
compliance layer. Native app only if the web version gets real traction.

### Brand

Not decided. Not blocking. Pick before the domain purchase, not before the
build.

---

## What actually gets built

Ruthlessly small. If it is not here, it is not in v1.

### Public, no account needed

- **Search page.** Maynooth, digs only.
- **Filters:** Mon–Fri or full week, meals included, price, room type.
- **Walk time to campus in minutes**, shown on every listing.
- **Listing page:** photos, price, what's included, term dates, walk time,
  posted date, last confirmed date.
- **Safety notice** before contacting a host: what digs is, no RTB
  protection, never pay before viewing, bring someone to the viewing.

### Host side

- **Listing form.** Under 5 minutes on a phone. Structured fields plus one
  free-text box with a warning.
- **Phone verification** by SMS.
- **Weekly confirmation email.** One click means still available. No click
  for 14 days means it expires.

### Student side

- **Email account** to send a message.
- **Simple messaging**, or a contact-reveal behind the safety notice. See
  below.

### Admin, meaning you

- **A list of all listings**, so you can edit or pull one down. Not an
  approval queue. Listings go live on submit.
- **A list of reports.**
- **A log of blocklist hits**, so you can see what hosts are trying to write
  and extend the list.

That is the whole build.

### The one thing to reconsider

You asked for **in-app messaging**. It is the single biggest item on this
list, probably a third of the build.

**The cheaper alternative:** reveal the host's phone or email after the
student accepts the safety notice. Ten percent of the work.

**The trade-off:** you lose the ability to scan for scam language, and you
lose visibility into whether hosts actually reply, which is one of the more
interesting things to measure.

**Recommendation: start with contact reveal.** Add messaging in v2 if hosts
complain about the volume of contacts, which is exactly what they complained
about in the research. Your call.

### Walk time — automate it, it is cheaper than doing it by hand

**Superseded.** An earlier draft said to type the number in by hand. That
contradicted publish-on-submit: listings would go live missing the second
biggest differentiator until you got round to them.

Call the Google Geocoding and Distance Matrix APIs once when the listing is
submitted, store `walk_minutes` and `cycle_minutes` on the row, never
recompute. The free tier is 10,000 calls a month against a target of 25
listings. It is about twenty lines of code.

Geocoding also has to happen anyway, because two anti-fraud controls in
`safety.md` depend on it:

- **The address must resolve to a real building.** Counters the fake
  property scam.
- **One live listing per address.** Counters the mass showings scam.

Doing walk time by hand quietly deletes both. See `data-model.md`.

---

## The legal minimum, honestly

You said no solicitor, no insurance, no terms. Here is what is genuinely
needed versus what can wait.

**Do before launch, all cheap or free:**

- **Terms of service and privacy policy from a template.** Adapt one. Most
  early startups do exactly this. State plainly: we are not a party to any
  agreement, we do not inspect properties, we never request payment.
- **A privacy notice that is actually true.** List what you collect and why.
  This is a genuine legal duty and templates cover it.
- **A working report route.** An email address is enough.
- **Sole trader is fine.** A limited company matters when there is revenue
  or real liability exposure. Neither exists yet.

**Can wait:**

- Insurance. You handle no money and hold little data. Revisit before scale
  or before any revenue.
- Solicitor on the section 6/12 question. **The blocklist covers you**, not
  pre-moderation — nothing sits in a queue, listings publish on submit. What
  protects you is that every submission is screened automatically, every
  refusal is logged, and you spot-check weekly. Revisit when listings pass a
  few hundred, or if IHREC makes contact.
- Data protection impact assessment. Proportionate to do a short written one
  when you have real users.

**Non-negotiable even at MVP:**

- Never claim hosts are vetted, safe or background checked.
- **The blocklist must be live before the first listing goes up.** It is the
  one piece of compliance you cannot defer.
- Never publish a listing naming gender, nationality, race, religion,
  family status or age.
- Always show the never-pay-before-viewing notice.

---

## What one person does each week

Realistic ongoing load once live.

- **Skim new listings.** Five minutes, once a week, not per listing. You are
  spot-checking, not gatekeeping.
- **Check reports.** Five minutes, most weeks zero.
- **Chase host confirmations** that did not get clicked. Ten minutes.
- **Recruit hosts.** This is the actual job, and it is most of the time.

The build is a few weeks. The supply work is forever.

---

## Success criteria

The MVP exists to answer one question: **can one person get real digs
listings live in Maynooth, and do students use them?**

### The numbers to hit

| Measure | Target for one season |
|---|---|
| Live listings in Maynooth | **25** |
| Of those, hosts who never listed anywhere before | **8** |
| Students who searched | 150 |
| Students who contacted a host | 40 |
| Matches, self-reported | **10** |

**The one number that matters is 25 listings.** Everything else is
downstream. A student market needs density in a small radius.

### How the last two are actually measured

Contact reveal means you cannot see whether anyone replied, so these numbers
do not collect themselves. Two small pieces make them real, and both are in
`data-model.md`:

- **Contacts** = rows in `contact_reveals`, written when a student accepts
  the safety notice and sees the host's details.
- **Matches** = an automatic email two weeks after each reveal asking one
  question: did you find a place? Four possible answers, stored in
  `outcome_checks`. Ask the host the same thing when they take a listing
  down.

Without these the kill gate has no data behind it and the January decision
is a guess.

### The kill gate

**Decision point: end of the January intake.**

- **Go** if you hit 25 listings and 10 matches. The thing works, build v2.
- **Pivot** if listings came easily but students did not engage, or the
  reverse. One side is wrong, find out which.
- **Stop** if you cannot get 25 listings in one town in a full season with
  direct personal effort. **An app will not outperform you doing it by
  hand.**

---

## Deferred, with triggers

| Deferred | Pick it back up when |
|---|---|
| Native app | Web traction is real |
| In-app messaging | Hosts complain about contact volume |
| Automated walk time | Past a few hundred listings |
| Reviews and ratings | Never, until liquidity is solid |
| House-shares | Never, unless digs demonstrably fails |
| Second town | 25 listings held steady in Maynooth |
| Solicitor advice | Listings pass a few hundred, or IHREC makes contact |
| Limited company | First revenue, or first real liability |
| ID verification | A fraud incident makes it necessary |
| Payments | Genuinely, do not |
