-- When the host was last asked to confirm this listing is still free.
--
-- Without this the job could only email on an exact day, and a single missed
-- run would skip a listing's prompt entirely. Recording the send lets the job
-- be idempotent and catch up: it can run twice in an hour, or once after a
-- day's outage, and the host still gets one email.
--
-- Null means never asked. A value older than last_confirmed_at means the host
-- has confirmed since being asked, so the next lapse starts a fresh cycle.

alter table listings add column last_prompted_at timestamptz;

comment on column listings.last_prompted_at is
  'Last freshness reminder sent. Compared against last_confirmed_at, so a confirmation resets the cycle without a separate write.';

-- The job reads only listings that are still showing.
create index listings_freshness_sweep
  on listings (status, last_confirmed_at)
  where status in ('live', 'stale');
