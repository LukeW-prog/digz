# Student Digs App — Validation to Launch Plan

**Premise:** The bottleneck in this market is not product quality. It is supply
acquisition. myroom.ie has good content, good positioning, a functioning platform,
and roughly 60 live listings after nine months. Any plan that starts with building
repeats their mistake.

This plan is therefore sequenced so that the expensive work (building) only
happens after the cheap work (proving supply is reachable) succeeds.

---

## Stage 0 — Sharpen the problem (Week 1)

**Goal:** Replace assumptions with a written, falsifiable problem statement.

**Do:**
- Write down the specific pain you believe exists, for a specific person, in one
  sentence. Not "finding digs is hard." Something like: *"A homeowner near ATU
  Sligo with a spare room would host a student but doesn't know how to find a
  safe one and won't post on Daft."*
- List every assumption baked into that sentence. Mark each as KNOWN or GUESS.
- Pick the single riskiest GUESS. That is what Stage 1 tests.

**Output:** One page. Problem statement + ranked assumption list.

**Gate:** Can you state the pain without using the words "platform" or "app"?
If not, you have a solution looking for a problem.

---

## Stage 1 — Customer discovery, supply side (Weeks 2–4)

This is the make-or-break stage. Do not skip it. Do not shorten it.

**Who to talk to (target: 25 conversations):**
| Segment | Where to find them | Target |
|---|---|---|
| Current digs hosts | Studentpad listings (DCU, ATU, UL, UCC), SU digs lists | 10 |
| Lapsed hosts | Ask current hosts for referrals to people who stopped | 5 |
| Never-hosted homeowners with spare rooms | Local Facebook groups, parish networks, empty-nester contacts | 10 |

**What to ask (never pitch, only ask about past behaviour):**
- Walk me through the last time you filled the room. What did you actually do?
- How long did it take? What was the worst part?
- How many people contacted you? How did you decide?
- What made you nervous? What would have stopped you entirely?
- What did you do about tax? Did that affect your decision?
- (Lapsed hosts) Why did you stop?

**Rules:**
- Do not describe your idea until the end, if at all.
- Ask about what they *did*, not what they *would* do.
- Record or take verbatim notes. Patterns live in the phrasing.

**Output:** Notes doc + a one-page synthesis of the top 3 recurring pains,
each with supporting quotes.

### KILL GATE 1
Stop or pivot if:
- Most hosts filled the room in under a week through word-of-mouth and describe
  the process as easy. (No pain to solve.)
- The dominant blocker is fear/tax/privacy rather than discovery. (That is a
  trust and education problem, not a marketplace problem — and much harder.)
- You cannot get 25 conversations. If homeowners won't take a phone call, they
  will not download an app.

---

## Stage 2 — Customer discovery, demand side (Weeks 3–5, parallel)

**Who:** 20 students who searched for accommodation in the last 12 months.
Skew toward first-years and international students — the two groups most likely
to accept digs.

**Where:** SU welfare officers, course WhatsApp groups, Reddit, campus in person
during orientation.

**What to ask:**
- Where did you look? In what order? How many applications did you send?
- How many replies did you get?
- Would you have considered digs? Why or why not?
- What would make digs acceptable vs. a dealbreaker? (Curfews, weekends,
  sharing a family kitchen, meals.)

**Note:** Student demand is almost certainly real — the shortfall data supports
it. The real question is *digs acceptance*, not demand for rooms. Test that
specifically.

**Output:** One page on digs acceptance rate and the conditions attached to it.

### KILL GATE 2
Stop or pivot if fewer than a third of students would seriously consider digs
even at a meaningful discount. Then you are building a marketplace where one
side does not want the product.

---

## Stage 3 — Distribution test (Weeks 5–7)

**The most important experiment in this plan.** The research flagged that
Letterkenny had disproportionate listings, possibly from an SU relationship.
Test whether institutional distribution actually works.

**Do:**
- Approach 3–5 SUs or accommodation offices. Prioritise mid-size campuses with
  low PBSA supply (ATU campuses, UL, MTU, DCU) over Dublin — less competition,
  more receptive, tighter community.
- Pitch: not a product. Offer to help them source digs hosts for September.
- Ask directly: would you promote a digs tool to your local homeowners? What
  would you need to see first? Who owns that decision?

**Also test one cold channel:** run a small local campaign (parish newsletter,
local radio, community Facebook, GAA club) in ONE town. Measure how many
homeowners respond to a simple "earn €14,000 tax-free hosting a student" message
with nothing but a form behind it.

**Output:** Cost per homeowner lead, by channel. Named institutional contacts
and their stated conditions.

### KILL GATE 3
This is the hardest gate. Stop if:
- No SU or accommodation office will engage, and
- Cold local outreach costs more per host lead than a host is worth to you.

If you cannot reach homeowners cheaply, no product fixes it.

---

## Stage 4 — Concierge MVP (Weeks 7–12, targeting September)

**Do not build an app yet.** Run the marketplace manually in one town.

**How:**
- Landing page + two forms (host, seeker). Nothing else.
- You personally collect host listings by phone and in person.
- You personally vet students (enrollment check, call, references).
- You personally make the matches and introduce them over email/WhatsApp.
- Charge nothing. You are buying evidence, not revenue.

**Why:** This tests the actual product — matching and trust — without code. It
also produces the supply you would otherwise need to bootstrap.

**Target for one mid-size college town, one season:**
- 30 host listings
- 60 student seekers
- 15 completed matches

**Measure:**
- Time per match (yours). This tells you what must be automated first.
- Host drop-off points.
- Match success at 6 weeks (still living there?).
- What both sides asked you for that you didn't have.

### KILL GATE 4
Stop if you cannot reach 30 hosts in one town in a full season with direct
personal effort. An app will not outperform you doing it by hand.

---

## Stage 5 — Build the PoC (Months 4–6)

Only now. Build the narrowest thing that removes your manual bottleneck.

**Likely v1 scope (confirm against Stage 4 findings, don't assume):**
- Host listing flow, under 5 minutes, mobile-first, photo upload
- Student profile with verified college enrollment
- Radius-from-campus search with commute time
- In-app messaging (removes the WhatsApp mess hosts complained about)
- Term-length and Mon–Fri filters
- Host-side screening tools — this is likely your real differentiator

**Explicitly out of scope for v1:** payments, deposits, contracts, reviews,
roommate matching, multi-city, web SEO content.

**Platform decision:** Build mobile-first, but ship a responsive web app before
native. Hosts are 50+ and will not install an app to list once a year. Students
will. Consider: web for hosts, native for seekers, later.

**Tech:** Whatever you can ship fastest and change fastest. This is a
distribution business, not a technical one.

---

## Stage 6 — Launch (Month 6, timed to season)

**Timing is not optional.** Supply activity peaks May–June; demand peaks
August–September (CAO offers). Miss it and you wait a full year.

**Sequence:**
1. **March–May:** Host acquisition only. Seed listings before any student sees
   the app. Target 100+ listings in your chosen town before public launch.
2. **June–July:** SU partnership announcements, local press, warm student list.
3. **August:** Open to students. Expect a demand spike within days of CAO offers.
4. **September:** Firefight. Manual support. Fix what breaks.

**Launch in ONE town.** Own it completely before adding a second. A dense,
liquid market in Sligo beats 22 scattered listings in Dublin — which is exactly
the mistake visible in the competitor data.

**Pricing at launch:** Free both sides. You are buying liquidity. Monetise only
once matches are consistent — most likely host-side listing fees or premium
verification, not student fees.

---

## Metrics That Actually Matter

| Stage | Metric | Signal |
|---|---|---|
| Discovery | Conversations completed | Can you even reach hosts? |
| Distribution | Cost per host lead | Is acquisition viable? |
| Concierge | Matches completed | Does matching work at all? |
| PoC | Listings per town | Liquidity threshold |
| Launch | Match rate, time-to-fill | Product-market fit |

**The one number to obsess over:** listings per college town. Everything else is
downstream. A student market needs density in a small radius — 100 listings
around one campus is a working product; 100 listings spread across Ireland is
nothing.

---

## Standing Risks

- **Regulatory:** If Rent-a-Room is brought under RTB rules, supply evaporates.
  Monitor DFHERIS and RTB announcements. Non-diversifiable.
- **PBSA build-out:** If purpose-built supply closes the gap, digs shrink.
  Slower-moving; watch planning approvals.
- **Incumbent response:** If Daft adds a proper digs section, your feature edge
  disappears overnight. Your defence is institutional relationships and local
  density, not features.
- **Founder bottleneck:** Concierge stages do not scale. Have a plan for what
  gets automated first.

---

## Summary Sequence

```
Week 1      Problem statement
Weeks 2-5   45 customer conversations (25 supply, 20 demand)
Weeks 5-7   Distribution test — SUs + one cold channel
Weeks 7-12  Concierge MVP, one town, manual matching
Months 4-6  Build narrow PoC
Month 6+    Seeded launch, one town, timed to season
```

Four kill gates before you write meaningful code. That is deliberate. The
competitor evidence suggests the graveyard in this category is full of good
products with empty inventory.
