-- What each listing photo actually shows.
--
-- Alt text was positional — "Photo 2 of 5" — which is honest and tells a blind
-- student nothing. A room they cannot see is the entire thing they are trying
-- to judge.
--
-- Stored as a key from a fixed list rather than free text, and the reason is
-- completion rather than tidiness. A free-text alt box on a listing form gets
-- skipped, or filled with "room", or filled with the same sentence ten times;
-- asking a host to describe a photo they are looking at is work, and work at
-- the end of a long form does not get done. A one-tap picker is answered.
--
-- Null is allowed and means the host did not say. The gallery falls back to
-- the positional wording, so nothing regresses when it is missing.

alter table listing_photos add column subject text;

comment on column listing_photos.subject is
  'What the photo shows, from the fixed list in lib/photos.ts. Null means the host did not say; the gallery falls back to positional alt text.';
