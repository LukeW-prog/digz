# Data model

The tables behind the MVP. Postgres on Supabase. Every field here is
deliberate — if it is not listed, it is not stored.

Rules that shaped this:

- **Price is per week, in euro, whole numbers.** Digs is quoted weekly
  (research.md: €120–€150/wk). Never mix in monthly figures.
- **Address is private.** Students see walk time and a rough area, never
  the door number, until the host reveals contact.
- **Owner-occupied is not a field.** Every listing is digs. It is a
  condition of listing, stated in the form and the terms.
- **Free text is one box, 300 chars, blocklist-screened on submit.**

---

## `hosts`

One row per host account. Supabase Auth holds the credentials; this table
holds the profile.

| Column | Type | Notes |
|---|---|---|
| id | uuid, pk | Matches `auth.users.id` |
| display_name | text | First name is enough. Shown to students. |
| phone | text | E.164 format. Required. |
| phone_verified_at | timestamptz | Null until SMS code confirmed. **Cannot list until set.** |
| email | text | From auth |
| email_verified_at | timestamptz | From auth |
| blocked_at | timestamptz | Null unless removed. Phone stays blocked too, see `blocked_phones`. |
| created_at | timestamptz | |

## `students`

Only needed to reveal a host's contact. Browsing needs no account.

| Column | Type | Notes |
|---|---|---|
| id | uuid, pk | Matches `auth.users.id` |
| email | text | |
| email_verified_at | timestamptz | Must be set before contact reveal |
| over_18_confirmed_at | timestamptz | Checkbox at signup. 18+ only. |
| created_at | timestamptz | |

## `listings`

| Column | Type | Notes |
|---|---|---|
| id | uuid, pk | |
| host_id | uuid, fk hosts | |
| status | enum | `live`, `stale`, `expired`, `removed` — see lifecycle |
| **Location** | | |
| address_line | text | Private. Host only, admin only. |
| eircode | text | Private. Used to geocode. |
| lat, lng | double | From geocoding on submit. Private. |
| area_label | text | Public. "Maynooth town", "Kilcock", etc. Derived from geocode. |
| walk_minutes | int | To MU campus. From Google Distance Matrix on submit. |
| cycle_minutes | int | Same call. |
| **Room** | | |
| room_type | enum | `single`, `double`, `twin` |
| price_per_week | int | Euro, whole number |
| bills_included | bool | |
| **Digs specifics** | | |
| schedule | enum | `mon_fri`, `full_week`, `either` |
| meals | enum | `none`, `weekday_dinner`, `weekday_dinner_and_weekend`, `all_meals` |
| term_start | date | Nullable. Null means "flexible" |
| term_end | date | Nullable |
| **House rules** — lifestyle only, never identity | | |
| smoking_allowed | bool | |
| pets_in_house | bool | Informational — "we have a dog" |
| quiet_hours | bool | |
| **Copy** | | |
| description | text, max 300 | Free text. Blocklist-screened. |
| **Freshness** | | |
| posted_at | timestamptz | Shown publicly |
| last_confirmed_at | timestamptz | Shown publicly. Set on create, then by weekly email click. |
| expires_at | timestamptz | `last_confirmed_at + 14 days` |
| last_prompted_at | timestamptz, null | Last reminder sent. Null means never asked. Compared against `last_confirmed_at`, so confirming resets the cycle with no extra write. |
| removed_at | timestamptz | |
| removed_reason | text | Admin note |

One live listing per `eircode` per host. Enforce with a partial unique
index where `status in ('live','stale')`.

### Listing lifecycle

```
submit → blocklist check → geocode + walk time → live
live    → 7 days without confirm → stale   (greyed out, still shown)
stale   → 14 days without confirm → expired (hidden)
any     → admin or report → removed
```

The ageing is done by a nightly job, `/api/cron/freshness`, scheduled in
`app/vercel.json` and authorised by `CRON_SECRET`. It marks listings stale
and expired and emails hosts to confirm, at most once every three days from
day 6. It is idempotent: every decision comes from timestamps on the row, so
running it twice, or once after an outage, gives the same result. The rules
are in `app/src/lib/freshness.ts` and are unit tested across a full lapse.

Confirmation from the weekly email resets `last_confirmed_at` and moves
`stale` back to `live`.

## `listing_photos`

| Column | Type | Notes |
|---|---|---|
| id | uuid, pk | |
| listing_id | uuid, fk | |
| storage_path | text | Supabase Storage |
| sort_order | int | |
| created_at | timestamptz | |

Min 5, max 10 per listing. Enforced in the form and again in the Server Action,
because the action is reachable by direct POST.

### Where the files live

Bucket `listing-photos`, public, 8 MB an object, JPEG/PNG/WebP only. Paths are
`<host uuid>/<random uuid>.<ext>`.

The browser uploads straight to Storage; the files never pass through a Server
Action, whose request body is capped at a few megabytes in production. The
Action receives only the resulting paths, and re-checks that each one sits
inside the uploading host's own folder — otherwise a host could claim another
host's photos by posting their paths.

The bucket is public rather than signed. Signed URLs would expire, which is
better for privacy, but they cost a signing round trip on every search render
and break in a cached or shared page. The mitigations are that paths are random
uuids, so they cannot be guessed or enumerated, and that objects are deleted
with their listing.

Known gap: a host who uploads photos and then abandons the form leaves
unreferenced objects behind. They are invisible and cost only storage. Sweeping
them is a scheduled job that is not built yet.

## `contact_reveals`

Records that a student accepted the safety notice and saw a host's contact.
This is the "contact" metric in the success criteria.

| Column | Type | Notes |
|---|---|---|
| id | uuid, pk | |
| listing_id | uuid, fk | |
| student_id | uuid, fk | |
| safety_notice_version | text | Which wording they accepted |
| created_at | timestamptz | |

Unique on `(listing_id, student_id)`.

## `outcome_checks`

Fixes the unmeasurable-kill-gate problem. Two weeks after a reveal, email
the student: "did you find a place?" Store the answer. When a host removes
a listing, ask why.

| Column | Type | Notes |
|---|---|---|
| id | uuid, pk | |
| reveal_id | uuid, fk contact_reveals | |
| asked_at | timestamptz | |
| answer | enum | `matched_here`, `matched_elsewhere`, `still_looking`, `no_reply` |
| answered_at | timestamptz | |

## `reports`

| Column | Type | Notes |
|---|---|---|
| id | uuid, pk | |
| listing_id | uuid, fk | Nullable if reporting a host directly |
| host_id | uuid, fk | |
| reporter_email | text | Optional. Anonymous reports allowed. |
| reason | enum | `scam`, `discriminatory`, `not_real`, `already_gone`, `unsafe`, `other` |
| details | text | |
| created_at | timestamptz | |
| reviewed_at | timestamptz | |
| decision | enum | `removed`, `kept`, `host_blocked` |
| decision_reason | text | **Required.** DSA Article 16 needs reasons. Sent to reporter if email given. |
| appeal_received_at | timestamptz | |
| appeal_outcome | text | |

## `blocklist_hits`

Every time the listing form refuses a submission.

| Column | Type | Notes |
|---|---|---|
| id | uuid, pk | |
| host_id | uuid, fk | |
| phrase | text | Which entry tripped |
| category | text | From blocklist.json |
| submitted_text | text | Full description they tried |
| created_at | timestamptz | |

This is how you extend the blocklist — read what hosts actually try to
write.

## `blocked_phones`

| Column | Type | Notes |
|---|---|---|
| phone | text, pk | E.164 |
| reason | text | |
| blocked_at | timestamptz | |

Checked at signup. Blocks the number, not just the account.

---

## What is deliberately not here

- Messages. Contact reveal instead, see mvp.md.
- Reviews, ratings.
- Any identity field on the host beyond first name and phone.
- Student age, gender, nationality, course. Not collected.
- Payment anything.
- Host's house-rule preferences about **who** they want. Only lifestyle
  rules about the house.

## Retention

| Data | Keep for |
|---|---|
| Live listing | Until expired or removed |
| Expired/removed listing | 12 months, then delete photos and address, keep the row |
| Reports and decisions | 3 years — legal defence |
| Blocklist hits | 3 years — evidence of the screening system working |
| Contact reveals | 12 months |
| Blocked phones | Indefinite |

Write this into the privacy notice.
