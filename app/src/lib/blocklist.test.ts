import { describe, expect, it } from 'vitest'
import { checkText } from './blocklist'

/**
 * The blocklist is the one piece of compliance that cannot be deferred, so it
 * gets the one test suite in the MVP. Cases come from the Daft case, the ten
 * protected grounds, and the false-positive notes in blocklist.json.
 */

const blocked = (text: string) => checkText(text).ok === false
const allowed = (text: string) => checkText(text).ok === true

describe('blocks the protected grounds', () => {
  it.each([
    ['gender', 'Bright room, would suit a girl'],
    ['gender, plain', 'Female students only please'],
    ['race', 'Irish only, no international students'],
    ['family status', 'Lovely home, no children'],
    ['family status, Daft wording', 'Would suit young professionals'],
    ['civil status', 'Single person only'],
    ['age', 'Mature student only'],
    ['religion', 'Christian home only'],
    ['disability', 'Must be healthy, no mental health issues'],
    ['sexual orientation', 'Straight only'],
    ['housing assistance', 'Rent is 150 a week, no HAP'],
    ['the reference trap', 'References required before viewing'],
  ])('blocks %s', (_label, text) => {
    expect(blocked(text)).toBe(true)
  })
})

describe('allows honest descriptions of the house', () => {
  it.each([
    'Quiet family home a short walk from campus.',
    'We have a dog and two cats. No pets of your own, sorry.',
    'No smoking anywhere in the house.',
    'The room is upstairs at the back, very bright.',
    'Dinner included Monday to Thursday. No parking on site.',
    'Newly decorated double room, own desk, fast broadband.',
  ])('allows: %s', (text) => {
    expect(allowed(text)).toBe(true)
  })
})

describe('matching rules', () => {
  it('is case insensitive', () => {
    expect(blocked('FEMALE ONLY')).toBe(true)
  })

  it('folds punctuation and spacing variants', () => {
    expect(blocked('Female-only room')).toBe(true)
    expect(blocked('female   only')).toBe(true)
    expect(blocked('No H.A.P.')).toBe(true)
  })

  it('respects word boundaries', () => {
    // "no kids" must not fire on "no kidding"
    expect(allowed('No kidding, it is a great room')).toBe(true)
  })

  it('treats empty and whitespace text as clean', () => {
    expect(allowed('')).toBe(true)
    expect(allowed('   ')).toBe(true)
  })

  it('reports every phrase that tripped, not just the first', () => {
    const result = checkText('Irish only, no children, references required')
    expect(result.ok).toBe(false)
    expect(result.hits.length).toBeGreaterThanOrEqual(3)
    expect(result.hits.map((h) => h.category)).toEqual(
      expect.arrayContaining(['race_nationality', 'family_status', 'daft_case']),
    )
  })

  it('gives the host a reason they can act on', () => {
    const result = checkText('female only')
    expect(result.ok).toBe(false)
    expect(result.hits[0].message).toMatch(/cannot state a gender preference/i)
    expect(result.hits[0].ground).toMatch(/Equal Status Acts/i)
  })
})
