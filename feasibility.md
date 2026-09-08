# Feasibility study

Assessed Sept 2026. Covers legal, regulatory, ethical, technical and
commercial risk for a digs search app operating in Ireland.

**Not legal advice.** Two items below need a solicitor before launch and
are marked accordingly.

---

## Verdict

**Feasible. No absolute blocker found.** But there is one legal obligation
that must be designed in from the first line of code, not retrofitted, and
one claim we must never make.

Three things change how we build:

1. We will be **vicariously liable for discriminatory adverts** hosts write.
   Precedent is directly on point and went against a bigger company than us.
2. We **cannot Garda-vet hosts**. Not expensive — legally unavailable.
3. We are channelling students into an arrangement with **no legal
   protection whatsoever**. That is an ethical duty, not a legal one.

---

# 1. Hard gates

Things that stop us or force a redesign.

## Gate 1 — Discriminatory advertising. THE BIG ONE.

### The precedent

**IHREC v Daft Media Ltd (WRC, Aug 2019).** Daft was found **vicariously
liable** for discriminatory adverts placed by third parties on its site.

Daft argued it was a mere conduit, an Information Society Service Provider
protected under the E-Commerce Directive. **The WRC rejected that.** It held
the E-Commerce Directive does not displace Equal Status Act obligations, and
treated Daft as an agent of the advertisers.

Daft was ordered to build a methodology to identify, monitor and block
discriminatory advertising, against a trigger-word list supplied by IHREC.
Daft appealed, then **withdrew the appeal** in 2021.

### Why this hits us harder than Daft

Section 12 of the Equal Status Acts bans publishing an advert that indicates
an intention to discriminate, or that might reasonably be understood that way.

Nine protected grounds: gender, civil status, family status, age, disability,
race, religion, sexual orientation, Traveller community. Plus a tenth,
**housing assistance**.

Banned phrasings from the Daft case include professionals only, rent
allowance not accepted, would suit young professionals, suit family or
professionals only, and even reference required.

**Digs hosts write exactly this kind of copy naturally.** Female student
only. Quiet mature student. Suit a girl. No international students. It is a
room in their home, so they think in personal terms. Our listing form will
produce this text by default unless we prevent it.

### The unresolved tension — NEEDS A SOLICITOR

Section 6(2) of the Equal Status Act 2000 exempts accommodation that is
part of a person's home, where letting it affects their private or family
life, and where the room is not separate and self-contained. **Digs sits
squarely inside that exemption.** A host lawfully may prefer a female
lodger in their own home.

But **section 12 on advertising is a separate provision**, and Daft's
conduit defence failed.

So the host's choice may be lawful while the advert is not, and we as
publisher carry the risk either way. I could not resolve this from public
sources. **This is legal question number one and it must be answered before
we publish a single host-written listing.**

### What we build regardless

- Structured fields instead of free text wherever possible.
- Trigger-word screening on any free text, blocking at submission with an
  explanation, not silent rejection.
- A documented moderation process and an audit log.
- Preference captured as private matching criteria, never as public advert
  copy — **subject to the legal opinion above.**
- A reporting route, and IHREC's own reporting page linked.

**Verdict: not a blocker, but a day-one build requirement.** Retrofitting
this after launch is how we get a WRC referral.

## Gate 2 — We cannot Garda-vet hosts

Confirmed with the National Vetting Bureau. Vetting is conducted **only on
behalf of registered relevant organisations**, defined as bodies whose work
involves regular contact with **children or vulnerable adults**. It is
**not conducted for individual persons on a personal basis.**

An ordinary student over 18 is neither. So there is no lawful route for us
to vet a digs host.

This explains the two-tier system found in the research. ISI and university
host family programmes vet because those students are often **under 18**.

**Consequence.** Never say Garda vetted, vetted hosts, background checked,
or anything a reasonable person reads that way. That would be a misleading
commercial practice and the CCPC enforces against exactly this.

Permitted instead: identity confirmed, phone verified, address confirmed,
listing reviewed. Say precisely what we did and nothing more.

**Verdict: kills the vetting avenue permanently. Not a blocker to the search
app, but it removes the differentiator that looked strongest.**

## Gate 3 — Aggregation by scraping

Ruled out earlier and confirmed here. Three independent problems:

- **EU sui generis database right.** Listing portals are the textbook
  protected case. Systematic harvesting of even insubstantial parts counts.
- **Contract.** Ryanair v PR Aviation — a site's terms of use bind users and
  are enforceable even where no copyright or database right applies.
- **GDPR.** Host names and phone numbers are personal data. Scraping them
  makes us a data controller with transparency duties we cannot discharge.

**Verdict: hard no on scraping. Consented import and manual outreach only.**

---

# 2. Legal and regulatory compliance

Everything here is mandatory, not optional.

## Digital Services Act

We are an intermediary hosting user content, so the DSA applies. Ireland's
Digital Services Coordinator is **Coimisiún na Meán**. The **CCPC** is the
competent authority for Articles 30 to 32.

| Article | Requirement |
|---|---|
| 16 | Notice-and-action. A working report mechanism, decisions with reasons. |
| 25 | No dark patterns. Rules out fake urgency and manipulative UI. |
| 26 | Advertising transparency, if we ever run promoted listings. |
| 30 | Know Your Business Customer, trader traceability, **if hosts are traders**. |
| 31–32 | Compliance by design, right to information. |

Clear terms and conditions, easy-to-find reporting, and an appeals process
with reasons are required.

**Small and micro enterprises are exempt from some of the heavier duties**,
but not from notice-and-action.

**Open question:** is a rent-a-room host a trader for Article 30? A homeowner
letting one room for tax-free income probably is not. Worth confirming,
because Article 30 verification would add real friction.

Penalties run to 6% of annual turnover.

## GDPR and children's data

We are a data controller. Irish regulator is the Data Protection Commission.

- **Age of digital consent in Ireland is 16.** Most students clear this.
- **But a child is anyone under 18** under the Data Protection Act 2018, and
  a meaningful number of first-years are 17.
- The DPC's Children Front and Centre guidance sets 14 principles for
  child-oriented processing. If under-18s can use the app, those apply.

Practical requirements: lawful basis mapped per data type, a DPIA (justified
given the risk profile and minors), privacy notice in plain language, data
minimisation on listings, retention limits, a breach process, and hosts told
plainly what of theirs becomes public.

**Design decision needed:** do we allow under-18 accounts at all? Blocking
them is simpler legally but excludes real first-years who need digs most.

## European Accessibility Act

In force since **28 June 2025**. Covers e-commerce services. Standard is
EN 301 549, in practice **WCAG 2.1 level AA**.

Irish penalties are unusually serious. Reported sanctions include fines and,
on conviction, imprisonment of up to 18 months.

**Micro-enterprise exemption:** fewer than 10 employees **and** under €2m
balance sheet. We would likely qualify at launch.

**Recommendation: build to WCAG 2.1 AA anyway.** The exemption disappears
the moment we hire, retrofitting accessibility is expensive, and a share of
our users have disabilities that make the existing alternatives worse.

## App store requirements

Apple **Guideline 1.2, user-generated content**, is the gate. Apple tests
this manually before approval and rejects on it routinely. Required:

- Terms with explicit no-tolerance for objectionable content
- A filtering method for objectionable content
- An in-app flag mechanism on every listing and message
- Ability to block abusive users
- **Action on reports within 24 hours**
- Published support contact

Google Play requires the same outcomes but enforces after launch.

**The 24-hour rule is an operational commitment, not a feature.** Someone
has to be reachable every day, including August.

## Consumer protection

The CCPC issued 31 enforcement actions against 18 traders in July 2026
alone. Adverts must be legal, honest, decent and truthful.

Applies to us on verified claims, price display, availability claims, and
any implication of safety we cannot substantiate.

## Tax and legal information

We will publish rent-a-room and licence-agreement information. **We must
signpost, not advise.** Link Revenue and Citizens Information, use their
wording, date every page, and disclaim.

One trap worth knowing. Rent-a-room relief does **not** apply to lettings
under 28 consecutive days **except** where the arrangement is not for
leisure or commercial use. Revenue explicitly names Monday-to-Thursday
student digs as qualifying. So our Mon–Fri filter is safe, **but only
because of that carve-out.** Get the wording right or we cost a host
€14,000 of relief.

---

# 3. Ethical assessment

The legal work is defined. This part is judgement.

## We are routing students into an unprotected arrangement

Digs is a licence. That means **no RTB access, no minimum notice, no rent
book, no rent controls and no dispute resolution.** Documented cases exist
of students being **evicted with under 24 hours' notice**.

We would be making that arrangement easier to enter and more attractive.

**Our obligation:** say so plainly, in the app, before a student commits.
Not buried in terms. A clear, calm explanation of what digs is and is not.
Threshold publishes a licensee toolkit we can link.

Doing this costs conversions. Do it anyway. It is also our best defence if
something goes wrong.

## We cannot deliver the safety people will assume

Users will assume a polished app means vetted hosts. It does not, and it
legally cannot. The gap between perceived and actual safety is the single
biggest ethical risk in the product.

**Mitigation:** state the limits explicitly, never imply more, keep
never-pay-before-viewing prominent, and resist marketing language that
implies safety.

## Minors

Some first-years are 17, moving in with strangers, often far from home. Any
product decision touching under-18s needs deliberate thought rather than
default handling.

## We could systematise discrimination

Hosts may lawfully prefer certain lodgers in their own home. If we build
filters that let a host exclude by nationality, ethnicity or family status,
we make discrimination efficient and searchable even where each individual
choice is lawful.

**Position: we do not build those filters.** Lifestyle criteria only, such
as smoking, pets, quiet hours, meals and weekends. Not identity.

## Scam exposure

Peak scam season is August to October. 230 reports and €400,000 lost to
end-July 2026. If a student is defrauded through a listing on our app, that
is our reputation and possibly our liability.

**Mitigation:** never-pay-before-viewing in the flow, no off-platform
payment requests, fast takedown, and a direct report route.

---

# 4. Technical feasibility

Low risk. Nothing here is hard.

## Walk time to campus

Cheaper than expected, because **walk time is a property of the listing, not
of the search.** Compute once when a listing is created, store it, never
recompute at query time.

| Option | Cost | Note |
|---|---|---|
| Google Distance Matrix | ~$2.04 per 1,000 elements | 10,000 free per SKU monthly |
| Google Route Matrix | ~$5 per 1,000 elements | Billed per origin-destination pair |
| **Valhalla**, self-hosted | **Free** | Walking, cycling, isochrones, OSM data |
| GraphHopper | Free self-hosted, paid API | Has an isochrone API |
| OSRM | Free | **No isochrone support** |

At a few hundred listings, Google's free tier covers it outright. Valhalla
is the answer if we ever want isochrone map overlays.

**Risk: negligible.**

## Freshness mechanic

Trivial to build. The risk is behavioural, not technical. Hosts may ignore
confirmation prompts. Auto-expiry at 14 days with one reminder is the
fallback, which is how job boards solve the same problem.

## Moderation tooling

This is the real engineering cost, and it comes from Gate 1 and the app
store rules, not from the search features. Budget for it properly.

## Accessibility

WCAG 2.1 AA is cheap if designed in and expensive if bolted on. Decide now.

---

# 5. Commercial risk

- **Cold start.** Standard marketplace answer is to constrain to one town,
  seed supply by hand, and have the founder do early matches. Search gives
  single-player value from listing one, which is why this design fits.
- **Seasonality.** Miss a window and wait. Demand peaks Aug–Sept. **The
  January intake is the next real window** and is less contested.
- **Incumbent response.** Daft could add digs filters. Their incentive is
  low but not zero. Our answer is depth in one town, not features.
- **No revenue at launch.** Free both sides is fine, but it must be a
  decision with an end date, not a drift.
- **Founder bottleneck.** Manual supply work and 24-hour moderation do not
  scale. Know what gets automated first.

---

# 6. Watch list

Things that could change the picture. Check quarterly.

| What | Why it matters | Status |
|---|---|---|
| **Residential Tenancies (Amendment) Bill 2024** | Sinn Féin bill extending protections to digs and long-term lodgers. If enacted, hosts may exit rather than accept regulation. It would also remove our no-protection ethical problem. | Before Oireachtas Housing Committee |
| **STL register**, opens 1 Dec 2026 | Applies to stays of **21 consecutive nights or fewer**. Full-term digs is out of scope. **Mon–Fri digs is 4-night stays, which is ambiguous.** Needs checking with Fáilte Ireland. | Live from Dec 2026 |
| **Rent-a-room relief** | Any change to the €14,000 threshold or the 28-day carve-out changes host economics overnight. | Stable in 2026 |
| **DSA thresholds** | Micro-enterprise exemptions fall away as we grow. | Monitor at hiring |
| **EAA micro exemption** | Lost at 10 employees or €2m. | Monitor at hiring |
| **IHREC activity** | They actively pursue portals. Being small is not protection. | Ongoing |
| **PBSA delivery** | 42,000 beds by 2035, none new for Sept 2026. Long-term erosion of the digs market. | Slow |

---

# 7. Before writing production code

Ordered by what blocks what.

1. **Get the section 6 / section 12 legal opinion.** Can a digs host state a
   gender preference in a published advert? The answer determines the entire
   listing data model. **Everything else waits on this.**
2. **Decide on under-18 accounts.** Shapes signup, consent and the DPIA.
3. **Decide the moderation operating model.** Who answers reports within 24
   hours in August?
4. **Get IHREC's trigger-word list**, or rebuild it from the Daft case.
5. **Write the terms, privacy notice and DPIA** before collecting any data.
6. **Commit to WCAG 2.1 AA** as a build standard.
7. **Confirm whether rent-a-room hosts are DSA traders.**
8. **Check Mon–Fri digs against the STL register** with Fáilte Ireland.

Items 1 to 3 are decisions. Items 4 to 8 are tasks.

---

## Sources

IHREC v Daft: McCann FitzGerald analysis; RTÉ Aug 2019; Law Society Gazette;
Irish Times 2021 on the withdrawn appeal; Mercy Law Resource Centre.
Equal Status Acts: irishstatutebook.ie sections 6 and 12; IHREC guides;
Citizens Information on sharing accommodation with your landlord.
Vetting: National Vetting Bureau FAQ; Citizens Information.
DSA: Coimisiún na Meán; CCPC; William Fry; Mason Hayes Curran.
GDPR: Data Protection Commission, Children Front and Centre; Law Society
guidance; William Fry on the age of digital consent.
EAA: EN 301 549 and WCAG 2.1 AA compliance guides, 2026.
App stores: Apple App Store Review Guideline 1.2; Google Play UGC policy.
Scraping: Ryanair v PR Aviation; EU database right analyses; The Markup.
Digs protections: Threshold licensee toolkit; STAND; Sinn Féin Bill 2024.
Tax: Revenue rent-a-room qualifying conditions; Citizens Information.
STL: Fáilte Ireland register FAQs; Citizens Information.
Mapping: Google Maps Platform pricing 2026; Valhalla; GraphHopper; OSRM.
Marketplace practice: Andrew Chen, The Cold Start Problem; Lenny Rachitsky
on growing marketplace supply.
