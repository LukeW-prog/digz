-- Listing photos live in Supabase Storage, not in the database.
--
-- Photos are uploaded straight from the host's browser to Storage, never
-- through a Server Action. A Server Action body is capped at a few megabytes
-- on Vercel, and ten phone photos is comfortably more than that, so routing
-- them through the server would fail in production while working locally.
--
-- The trade that buys is that the browser holds the write, so the rules below
-- are the only thing standing between a host and someone else's folder. Every
-- object path is `<host uuid>/<random uuid>.<ext>`, and the policies pin the
-- first folder segment to the uploader's own id.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  8388608, -- 8 MB, matching PHOTO_UPLOAD.maxBytes in lib/photos.ts
  -- JPEG only. A host may choose a PNG or a WebP, but the browser redraws
  -- every photo to a canvas and re-encodes it before upload, so JPEG is the
  -- only thing that ever arrives. See PHOTO_UPLOAD in lib/photos.ts for why
  -- that redraw exists: it is what strips the GPS tags out of EXIF.
  array['image/jpeg']
)
on conflict (id) do nothing;

-- Read: anyone. The bucket is public so photos survive page caching and cost
-- no signing round trip. Paths are random uuids, so they cannot be guessed,
-- and objects are removed when their listing is. See lib/photos.ts on why
-- signed URLs were not used.
create policy listing_photos_public_read on storage.objects
  for select using (bucket_id = 'listing-photos');

-- Write: a signed-in host, into their own folder only.
create policy listing_photos_host_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy listing_photos_host_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy listing_photos_host_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
