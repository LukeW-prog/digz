import { afterEach, describe, expect, it } from 'vitest'
import { leadPhoto, parsePhotoPaths, photoAlt, photoUrl } from './photos'

const ORIGINAL = process.env.NEXT_PUBLIC_SUPABASE_URL

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
  else process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL
})

describe('photoUrl', () => {
  it('passes a local fixture through untouched', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co'
    expect(photoUrl('/sample/bedroom-01.jpg')).toBe('/sample/bedroom-01.jpg')
  })

  it('builds a public storage URL for a stored object', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co'
    expect(photoUrl('host-id/photo-id.jpg')).toBe(
      'https://abc.supabase.co/storage/v1/object/public/listing-photos/host-id/photo-id.jpg',
    )
  })

  it('does not double the slash when the base URL has a trailing one', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co/'
    expect(photoUrl('a/b.jpg')).not.toContain('.co//storage')
  })

  it('returns the raw path when Supabase is not configured', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    expect(photoUrl('a/b.jpg')).toBe('a/b.jpg')
  })
})

describe('leadPhoto', () => {
  it('is null for a listing with no photos, which must still render', () => {
    expect(leadPhoto([])).toBeNull()
  })

  it('takes the first, since sort_order decides the order upstream', () => {
    expect(
      leadPhoto([
        { storage_path: '/sample/a.jpg' },
        { storage_path: '/sample/b.jpg' },
      ]),
    ).toBe('/sample/a.jpg')
  })
})

describe('parsePhotoPaths', () => {
  it('reads the list the uploader writes', () => {
    expect(
      parsePhotoPaths('[{"path":"h/1.jpg","subject":"room"},{"path":"h/2.jpg","subject":null}]'),
    ).toEqual([
      { path: 'h/1.jpg', subject: 'room' },
      { path: 'h/2.jpg', subject: null },
    ])
  })

  // A form left open in a tab across a deploy still submits the old shape.
  // Losing a host's photos to that would be a miserable way to fail.
  it('still accepts the older bare-path form', () => {
    expect(parsePhotoPaths('["h/1.jpg","h/2.jpg"]')).toEqual([
      { path: 'h/1.jpg', subject: null },
      { path: 'h/2.jpg', subject: null },
    ])
  })

  // The subject becomes alt text, so it must never carry text a host chose.
  it('drops a subject that is not on the list', () => {
    expect(parsePhotoPaths('[{"path":"h/1.jpg","subject":"<script>"}]')).toEqual([
      { path: 'h/1.jpg', subject: null },
    ])
    expect(parsePhotoPaths('[{"path":"h/1.jpg","subject":42}]')).toEqual([
      { path: 'h/1.jpg', subject: null },
    ])
  })

  it('treats an empty or missing field as no photos', () => {
    expect(parsePhotoPaths('')).toEqual([])
    expect(parsePhotoPaths(null)).toEqual([])
    expect(parsePhotoPaths(undefined)).toEqual([])
  })

  // The field is client controlled, so none of these may throw. Each one
  // should fall through to the minimum-photo error instead of a 500.
  it('survives anything that is not a JSON array', () => {
    expect(parsePhotoPaths('not json')).toEqual([])
    expect(parsePhotoPaths('{"a":1}')).toEqual([])
    expect(parsePhotoPaths('"a string"')).toEqual([])
    expect(parsePhotoPaths('[1,2,3]')).toEqual([])
    expect(parsePhotoPaths(42)).toEqual([])
  })

  it('drops entries with no usable path but keeps the rest', () => {
    expect(
      parsePhotoPaths('[{"path":"h/1.jpg"},null,{"path":""},3,"h/2.jpg"]'),
    ).toEqual([
      { path: 'h/1.jpg', subject: null },
      { path: 'h/2.jpg', subject: null },
    ])
  })

  // A path outside the host's own folder is rejected by the action, not here.
  it('does not itself filter by folder', () => {
    expect(parsePhotoPaths('[{"path":"someone-else/1.jpg"}]')).toEqual([
      { path: 'someone-else/1.jpg', subject: null },
    ])
  })
})

describe('photoAlt', () => {
  it('says what the photo shows when the host picked', () => {
    expect(photoAlt('room', 0, 5)).toBe('The room. Photo 1 of 5')
    expect(photoAlt('bathroom', 2, 5)).toBe('The bathroom. Photo 3 of 5')
  })

  // Never invent a description. Position is not one, but it is true.
  it('falls back to position when the host said nothing', () => {
    expect(photoAlt(null, 0, 5)).toBe('Photo 1 of 5')
    expect(photoAlt(undefined, 1, 5)).toBe('Photo 2 of 5')
  })

  it('ignores a subject that is not on the list', () => {
    expect(photoAlt('whatever', 0, 3)).toBe('Photo 1 of 3')
  })
})
