# Stack

Confirmed 8 Sept 2026. One person, near-zero running cost, everything on
free tiers until there is real traffic.

| Layer | Choice | Free tier covers |
|---|---|---|
| App | **Next.js 16**, App Router, TypeScript | — |
| Database, auth, file storage | **Supabase** | 500MB DB, 1GB storage, 50k auth users |
| Hosting | **Vercel** | Hobby tier, deploys on push to `main` |
| SMS for host phone verification | **Twilio Verify** | Pay per SMS, ~€0.07 each in Ireland |
| Geocoding + walk time | **Google Maps Platform** — Geocoding API + Distance Matrix API | 10,000 calls/month per API |
| Transactional email | **Resend** | 3,000 emails/month |
| Styling | **Tailwind CSS** | — |

At 25 listings and a few hundred students, monthly cost is the SMS bill.
Roughly €2.

---

## Why these

- **Next.js** — one repo, one deploy, frontend and API together. No
  separate server to keep alive.
- **Supabase** — Postgres you can query directly, plus auth and storage
  in the same dashboard. Row-level security means the DB enforces "hosts
  only see their own listings" without app code.
- **Vercel** — made by the Next.js team. Git push, it's live.
- **Twilio Verify** rather than raw SMS — it handles code generation,
  expiry and retry limits. Less to get wrong.
- **Google** rather than self-hosted Valhalla — feasibility.md already
  settled this. Free tier is 300× what we need.
- **Resend** — simplest email API that isn't SendGrid.

## Accounts to create

In this order. All free to open.

1. **GitHub** — already have.
2. **Supabase** — supabase.com. New project, region `eu-west-1` (Ireland).
   Note the project URL and anon key.
3. **Vercel** — vercel.com. Sign in with GitHub, import the repo.
4. **Google Cloud** — console.cloud.google.com. New project, enable
   Geocoding API and Distance Matrix API, create one API key restricted
   to those two. **Set a billing alert at €5.** The free tier needs a
   card on file.
5. **Twilio** — twilio.com. Create a Verify service. Note the service SID.
6. **Resend** — resend.com. Add the domain once you have one; until then
   use their test sender.
7. **Storage bucket** — created by `supabase/migrations/0002_listing_photo_storage.sql`.
   Run the migrations before the first host tries to post, or photo upload
   fails with no obvious cause.
8. **Cron secret** — set `CRON_SECRET` in the Vercel project to any long
   random string. The nightly freshness job at `/api/cron/freshness` refuses
   every request without it, and without the variable it refuses all of them,
   so listings would never age and no host would ever be asked to confirm.
   The schedule itself is in `app/vercel.json`.

## Environment variables

See `.env.example` in the app. Never commit `.env.local`.

## Local dev

```
cd app
npm install
cp .env.example .env.local   # fill in keys
npm run dev                  # http://localhost:3000
```

## Deploy

Push to `main`. Vercel builds it. Set the same env vars in the Vercel
project settings.

## What is deliberately not in the stack

- No ORM beyond Supabase's client. Schema lives in SQL migrations.
- No auth library. Supabase Auth does it.
- No state management library. Not needed at this size.
- No CMS, no analytics SaaS. Count things in Postgres.
- No native app. See mvp.md.
