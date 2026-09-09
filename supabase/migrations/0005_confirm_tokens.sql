-- Lets a host confirm a room is still free straight from the reminder email.
--
-- The reminder used to link to /host/listings, which means signing in before
-- you can answer a yes/no question. Every step between the email and the
-- answer costs confirmations, and the confirmation rate is the only thing that
-- makes "confirmed yesterday" worth showing — the single claim no other Irish
-- site makes.
--
-- What the token can do is deliberately narrow: mark one listing as still
-- available. It cannot take a listing down, edit it, or reveal anything. That
-- asymmetry is the point. A leaked confirm link can at worst keep a room
-- showing that should have aged out, which is the ordinary failure the system
-- already tolerates for two weeks. A leaked link that could remove a listing
-- would let a stranger delete a host's advert, so taking a room down stays
-- behind a sign-in.
--
-- The token is stable rather than rotated on use. Reminders go out every three
-- days, so rotating would break the older email in someone's inbox — and a
-- host clicking last week's link and being told it is invalid is exactly the
-- friction this removes.

alter table listings
  add column confirm_token uuid not null default gen_random_uuid();

create unique index listings_confirm_token on listings (confirm_token);

comment on column listings.confirm_token is
  'Unguessable id in the reminder email. Grants only "this room is still free" for this one listing.';
