# Safety and trust

How we protect students, how we deal with malicious hosts, and what we can
and cannot claim. Written Sept 2026.

Legal background is in `feasibility.md`. **Not legal advice.**

---

## Position

**We are a noticeboard that is deliberately hostile to the specific crimes
known to happen in this market.**

Not "we vet hosts". We legally cannot vet hosts, and claiming it would be a
misleading commercial practice. What we do instead is state exactly what we
check, design the known scams out of the product, and act fast on reports.

Three commitments that shape everything below:

1. **We never handle money.** No deposits, no rent, no fees, no escrow.
2. **We say precisely what we verified.** Never more.
3. **We tell students what digs actually is** before they commit.

---

## 1. The legal frame

Worth understanding, because it explains why a disclaimer alone is not a
strategy.

### What protects us

Article 6 of the Digital Services Act gives hosting providers a liability
shield for illegal content posted by users. Two conditions:

- We do not have **actual knowledge** of it, and
- Once we do, we **act expeditiously** to remove it.

There is also **no general monitoring obligation**. We are not required to
proactively scan everything, and indexing or offering search does not by
itself give us knowledge.

### What does not protect us

- **Our own statutory duties.** The Workplace Relations Commission held that
  the E-Commerce Directive does not displace Equal Status Act obligations.
  A discriminatory advert is our breach as publisher, not third-party
  content we merely host. No disclaimer reaches it.
- **Death or personal injury caused by our negligence.** Irish consumer law
  voids any term excluding this. Blanket clauses such as "to the fullest
  extent permitted by law" are themselves flagged as potentially unfair.
- **Misleading claims.** Consumer protection law applies to what we say
  about safety regardless of what our terms state.

### The knowledge trap

Once we know, the clock starts. If we build detection and then ignore what
it surfaces, we have given ourselves actual knowledge and lost the shield.

**The answer is not to stay ignorant. It is to act on what we find, and to
log that we acted.**

---

## 2. Stopping malicious hosts

Design the crime out rather than promising to catch it.

### Countering the three named Garda scam patterns

| Scam pattern | How it works | Our structural counter |
|---|---|---|
| **Absent landlord** | Claims to be abroad, cannot give access until payment | Address must geocode to a real building. Verified phone required. No payment path exists through us. |
| **Mass showings** | Shows one property to many, collects a deposit from each | We take no deposits. There is nothing to collect. Never-pay-before-viewing is permanent in the flow. |
| **Fake or unavailable property** | Property does not exist or is not for rent | One live listing per address. Weekly freshness confirmation must come from the verified phone. |

None of these are promises. They are properties of the system.

### Account friction

Cheap measures that raise the cost of being a bad actor.

- **Phone verification by SMS**, mandatory for hosts. Kills throwaway
  accounts more effectively than anything else at this cost.
- **Email verification** for all accounts.
- **One live listing per address.** Blocks the same fake room being posted
  repeatedly.
- **Address must geocode** to a real building. We already need this for walk
  time, so it is free.
- **Block the phone number and device, not just the account**, on removal.

Third-party ID verification is deliberately deferred. It adds real GDPR
storage risk, and if adopted it should be run by a provider who holds the
documents rather than us. **Open decision.**

### Money stays out

This is the strongest single decision in the product.

- No deposits, rent, fees or escrow through the app, ever.
- **We state plainly that we never ask for money.** That makes any request
  for payment in our name obviously fraudulent.
- Guidance on what a normal deposit looks like and what is a red flag.
- Keyword scanning on our own messaging for off-platform payment requests
  and attempts to move the conversation off the app early.

Airbnb polices off-platform payments precisely because it does take money.
Not taking money removes payment liability, chargebacks, and the entire
fraud surface in one decision. **Do not give it away later without a hard
think.**

### Freshness as fraud control

The freshness mechanic already in the product spec doubles as anti-fraud.
Scam listings are often stale reposts.

- Host confirms availability weekly, from the verified phone.
- Listing greys out when unconfirmed.
- Auto-expiry at 14 days with one reminder.

---

## 3. Protecting students

The part that is about them rather than about us.

### Tell them what digs is, before they commit

Digs is a licence, not a tenancy. That means:

- No Residential Tenancies Board access
- No minimum notice period
- No rent book, no rent controls
- No dispute resolution

Documented cases exist of students evicted with **under 24 hours' notice**.

**This must be shown plainly in the flow, not buried in terms.** It costs
conversions. Do it anyway. It is also our best defence if something goes
wrong.

Link Threshold's licensee toolkit.

### Safety brief before viewing

Short, calm, shown before a first viewing is arranged.

- Bring someone with you
- Tell someone where you are going and when you expect to be back
- View in daylight
- **Never pay anything before viewing**
- Never hand over a passport or PPS number to secure a room
- Take photos, ask questions, do not feel rushed

### Physical standards checklist

Legal minimums for rented accommodation, and a useful red-flag test:

- Two smoke alarms
- Carbon monoxide detector
- Fire blanket
- Fixed heater

Absence of these is a signal worth surfacing to the student.

### Where to turn when it goes wrong

- **Threshold** for licensee rights and advice
- **Students' union welfare officer** at their college
- **An Garda Síochána** for fraud or any criminal matter
- Our own report route, for anything on the app

---

## 4. Reporting and moderation

This is an operating commitment, not a feature. It needs a named person.

### Requirements we are held to

- **Apple Guideline 1.2** requires action on reports **within 24 hours**,
  and Apple tests this manually before approval.
- **DSA Article 16** requires a working notice-and-action mechanism, with
  decisions given **with reasons** and an appeals route.
- Article 6 safe harbour requires **expeditious** action once we know.

The 24-hour standard is the binding one. It applies in August too.

### The model

- **Report button on every listing, every message thread, every profile.**
  One tap, always visible.
- **Triage within 24 hours.** Every report, no exceptions.
- **Suspend first on credible safety reports.** Investigate afterwards. A
  wrongly suspended listing is recoverable. A harmed student is not.
- **Give reasons** for every removal, and offer an appeal.
- **Log everything.** What was reported, when, what we did, who decided.

### Incident response

For anything serious, meaning assault, threats, fraud with real loss, or a
safeguarding concern about a minor:

1. Preserve all data immediately. **Do not delete anything**, including the
   account and messages.
2. Suspend the account.
3. Cooperate fully with An Garda Síochána.
4. Contact the student and point them to support.
5. Record the whole timeline.

Retention needs care. GDPR pushes toward minimisation, but moderation and
incident records are needed for legal defence and for Garda cooperation.
**Set a documented retention policy rather than deciding case by case.**

---

## 5. Language rules

Every word here is a legal exposure. These are hard rules.

### Never say

- Garda vetted, vetted, background checked, police checked
- Safe, guaranteed, approved, certified
- Trusted host, verified host, screened

We legally cannot vet hosts, so these are false claims and the Competition
and Consumer Protection Commission enforces against exactly this.

### May say, when true

- Phone verified
- Email verified
- Address confirmed
- Listing reviewed
- Identity checked by [named provider], only if that is actually happening

**Rule: say precisely what we did, and nothing that implies more.**

---

## 6. What we deliberately do not build

- **Identity-based host filters.** A host may lawfully prefer certain
  lodgers in their own home, but if we build filters for nationality,
  ethnicity, religion or family status, we make discrimination efficient and
  searchable. Lifestyle criteria only, meaning smoking, pets, quiet hours,
  meals and weekends. Not identity.
- **Payments of any kind.**
- **Any safety claim we cannot substantiate.**
- **Ratings and reviews**, for now. In a market this thin, a single bad
  review destroys a host, and reviews of someone's home invite defamation
  risk. Revisit later.

---

## 7. What the terms can and cannot do

**They can say**, and should:

- We are not party to any agreement between host and student
- We do not own, inspect, manage or control any property
- Listings are provided by hosts and we do not guarantee accuracy or
  availability
- We never request payment

**They cannot:**

- Excuse discriminatory adverts we publish
- Exclude liability for injury caused by our own negligence
- Substitute for acting on reports quickly

Terms are the floor. They are not the strategy.

---

## 8. Open decisions

1. **Third-party ID verification.** Adopt, defer, or never? Weigh the trust
   gain against GDPR storage risk. Currently deferred.
2. **Under-18 accounts.** Some first-years are 17. Blocking them is simpler
   legally but excludes the students who most need digs. Ties to the DPIA.
3. **Who is on call for the 24-hour report window**, including August?
4. **Retention policy** for moderation and incident records.
5. **Do we surface the physical standards checklist as a host field**, a
   student prompt, or both?
