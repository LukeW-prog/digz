import { afterEach, describe, expect, it } from 'vitest'
import { leadPhoto, parsePhotoPaths, photoUrl } from './photos'

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
    expect(parsePhotoPaths('["h/1.jpg","h/2.jpg"]')).toEqual([
      'h/1.jpg',
      'h/2.jpg',
    ])
  })

  it('treats an empty or missing field as no photos', () => {
    expect(parsePhotoPaths('')).toEqual([])
    expect(parsePhotoPaths(null)).toEqual([])
    expect(parsePhotoPaths(undefined)).toEqual([])
  })

  // The field is client controlled, so none of these may throw. Each one
  // should fall through to the minimum-photo error instead of a 500.
  it('survives anything that is not a JSON array of strings', () => {
    expect(parsePhotoPaths('not json')).toEqual([])
    expect(parsePhotoPaths('{"a":1}')).toEqual([])
    expect(parsePhotoPaths('"a string"')).toEqual([])
    expect(parsePhotoPaths('[1,2,3]')).toEqual([])
    expect(parsePhotoPaths(42)).toEqual([])
  })

  it('drops non-string and empty entries but keeps the rest', () => {
    expect(parsePhotoPaths('["h/1.jpg",null,"",3,"h/2.jpg"]')).toEqual([
      'h/1.jpg',
      'h/2.jpg',
    ])
  })

  // A path outside the host's own folder is rejected by the action, not here.
  // This only records that the parser passes it along to be checked.
  it('does not itself filter by folder', () => {
    expect(parsePhotoPaths('["someone-else/1.jpg"]')).toEqual([
      'someone-else/1.jpg',
    ])
  })
})
