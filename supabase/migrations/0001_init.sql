-- Digs MVP schema
-- Mirrors data-model.md. Postgres on Supabase.
--
-- Conventions:
--   price is per WEEK, euro, whole numbers
--   address, eircode, lat, lng are PRIVATE (never selected by public policies)
--   every listing is digs (owner-occupied). That is a listing condition, not a column.

-- ---------------------------------------------------------------- enums

create type listing_status  as enum ('live', 'stale', 'expired', 'removed');
create type room_type       as enum ('single', 'double', 'twin');
create type schedule_type   as enum ('mon_fri', 'full_week', 'either');
create type meals_type      as enum ('none', 'weekday_dinner', 'weekday_dinner_and_weekend', 'all_meals');
create type report_reason   as enum ('scam', 'discriminatory', 'not_real', 'already_gone', 'unsafe', 'other');
create type report_decision as enum ('removed', 'kept', 'host_blocked');
create type outcome_answer  as enum ('matched_here', 'matched_elsewhere', 'still_looking', 'no_reply');

-- ---------------------------------------------------------------- hosts

create table hosts (
  id                 uuid primary key references auth.users on delete cascade,
  display_name       text not null,
  phone              text not null,
  phone_verified_at  timestamptz,
  email              text not null,
  email_verified_at  timestamptz,
  blocked_at         timestamptz,
  created_at         timestamptz not null default now()
);

comment on column hosts.phone_verified_at is
  'Null until the Twilio Verify code is confirmed. A host cannot publish a listing until this is set.';

-- ---------------------------------------------------------------- students

create table students (
  id                   uuid primary key references auth.users on delete cascade,
  email                text not null,
  email_verified_at    timestamptz,
  over_18_confirmed_at timestamptz,
  created_at           timestamptz not null default now()
);

comment on table students is
  'Only needed to reveal a host contact. Browsing and searching need no account.';

-- ---------------------------------------------------------------- listings

create table listings (
  id                uuid primary key default gen_random_uuid(),
  host_id           uuid not null references hosts on delete cascade,
  status            listing_status not null default 'live',

  -- location: private except area_label and the travel times
  address_line      text not null,
  eircode           text not null,
  lat               double precision,
  lng               double precision,
  area_label        text not null,
  walk_minutes      int,
  cycle_minutes     int,

  -- room
  room_type         room_type not null,
  price_per_week    int not null check (price_per_week between 40 and 500),
  bills_included    boolean not null default false,

  -- digs specifics
  schedule          schedule_type not null,
  meals             meals_type not null default 'none',
  term_start        date,
  term_end          date,

  -- house rules: lifestyle only, never identity
  smoking_allowed   boolean not null default false,
  pets_in_house     boolean not null default false,
  quiet_hours       boolean not null default false,

  -- copy
  description       text check (char_length(description) <= 300),

  -- freshness
  posted_at         timestamptz not null default now(),
  last_confirmed_at timestamptz not null default now(),
  expires_at        timestamptz not null default now() + interval '14 days',
  removed_at        timestamptz,
  removed_reason    text,

  check (term_end is null or term_start is null or term_end > term_start)
);

-- one live listing per address, per data-model.md and safety.md anti-fraud
create unique index listings_one_live_per_eircode
  on listings (lower(eircode))
  where status in ('live', 'stale');

create index listings_search on listings (status, price_per_week, walk_minutes);
create index listings_host   on listings (host_id);

comment on column listings.price_per_week is 'Euro per week, whole numbers. Never monthly.';
comment on column listings.description    is 'Free text, 300 char cap, blocklist-screened on submit.';

-- ---------------------------------------------------------------- photos

create table listing_photos (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references listings on delete cascade,
  storage_path text not null,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create index listing_photos_listing on listing_photos (listing_id, sort_order);

comment on table listing_photos is 'Min 5, max 10 per listing. Enforced in the listing form.';

-- ---------------------------------------------------------------- contact reveals

create table contact_reveals (
  id                    uuid primary key default gen_random_uuid(),
  listing_id            uuid not null references listings on delete cascade,
  student_id            uuid not null references students on delete cascade,
  safety_notice_version text not null,
  created_at            timestamptz not null default now(),
  unique (listing_id, student_id)
);

comment on table contact_reveals is
  'A student accepted the safety notice and saw the host contact. This is the "contacted a host" success metric.';

-- ---------------------------------------------------------------- outcome checks

create table outcome_checks (
  id          uuid primary key default gen_random_uuid(),
  reveal_id   uuid not null references contact_reveals on delete cascade,
  asked_at    timestamptz not null default now(),
  answer      outcome_answer,
  answered_at timestamptz
);

comment on table outcome_checks is
  'Two weeks after a reveal, ask the student if they found a place. Without this the 10-matches kill gate cannot be measured.';

-- ---------------------------------------------------------------- reports

create table reports (
  id                 uuid primary key default gen_random_uuid(),
  listing_id         uuid references listings on delete set null,
  host_id            uuid references hosts on delete set null,
  reporter_email     text,
  reason             report_reason not null,
  details            text,
  created_at         timestamptz not null default now(),
  reviewed_at        timestamptz,
  decision           report_decision,
  decision_reason    text,
  appeal_received_at timestamptz,
  appeal_outcome     text
);

create index reports_open on reports (created_at) where reviewed_at is null;

comment on column reports.decision_reason is
  'Required whenever decision is set. DSA Article 16 requires a statement of reasons.';

-- ---------------------------------------------------------------- blocklist hits

create table blocklist_hits (
  id             uuid primary key default gen_random_uuid(),
  host_id        uuid references hosts on delete set null,
  phrase         text not null,
  category       text not null,
  submitted_text text not null,
  created_at     timestamptz not null default now()
);

comment on table blocklist_hits is
  'Every refused submission. This is both the evidence that screening works and the source for extending the list.';

-- ---------------------------------------------------------------- blocked phones

create table blocked_phones (
  phone      text primary key,
  reason     text,
  blocked_at timestamptz not null default now()
);

comment on table blocked_phones is 'Checked at host signup. Blocks the number, not just the account.';

-- ---------------------------------------------------------------- row level security

alter table hosts           enable row level security;
alter table students        enable row level security;
alter table listings        enable row level security;
alter table listing_photos  enable row level security;
alter table contact_reveals enable row level security;
alter table outcome_checks  enable row level security;
alter table reports         enable row level security;
alter table blocklist_hits  enable row level security;
alter table blocked_phones  enable row level security;

-- listings: anyone may read live and stale ones. No account needed to browse.
-- Address columns are excluded at the query layer, not here; see lib/listings.ts.
create policy listings_public_read on listings
  for select using (status in ('live', 'stale'));

create policy listings_host_read on listings
  for select using (host_id = auth.uid());

create policy listings_host_write on listings
  for insert with check (host_id = auth.uid());

create policy listings_host_update on listings
  for update using (host_id = auth.uid());

create policy photos_public_read on listing_photos
  for select using (
    exists (select 1 from listings l
            where l.id = listing_id and l.status in ('live', 'stale'))
  );

create policy photos_host_write on listing_photos
  for all using (
    exists (select 1 from listings l
            where l.id = listing_id and l.host_id = auth.uid())
  );

create policy hosts_self on hosts
  for all using (id = auth.uid());

create policy students_self on students
  for all using (id = auth.uid());

create policy reveals_self on contact_reveals
  for all using (student_id = auth.uid());

-- reports: anyone may file one, including anonymously. Nobody may read them back.
create policy reports_insert_anyone on reports
  for insert with check (true);

-- blocklist_hits, outcome_checks, blocked_phones: service role only.
-- No policies means no access under the anon or authenticated keys.
