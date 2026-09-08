import raw from './blocklist.json'

/**
 * Discriminatory-advert screening for host-written free text.
 *
 * This is the MVP compliance strategy (see mvp.md). IHREC v Daft (WRC 2019)
 * found the platform vicariously liable for adverts its users wrote, and the
 * remedy was to build exactly this. Having a documented automated system that
 * refuses on submit, and a log of what it refused, is the defence.
 *
 * It must be live before the first listing publishes.
 */

export type BlocklistCategory = {
  category: string
  ground: string
  message: string
  phrases: string[]
}

export type BlocklistHit = {
  phrase: string
  category: string
  ground: string
  message: string
}

export type BlocklistResult =
  | { ok: true; hits: [] }
  | { ok: false; hits: BlocklistHit[] }

const categories = raw.categories as BlocklistCategory[]

export const blocklistVersion: string = raw.version

/**
 * Lowercase, replace every non-alphanumeric character with a space, then
 * collapse runs of whitespace. This folds spacing and punctuation variants
 * together, so "Female-Only", "female  only" and "FEMALE ONLY!" all normalise
 * to "female only".
 *
 * It then rejoins runs of two or more isolated single letters, so the
 * initialism dodge "no H.A.P." ("no h a p") becomes "no hap". Two is the
 * threshold on purpose: a lone "a" is the English article, and collapsing it
 * would break real phrases like "suit a girl".
 *
 * Known limit: fully spelled-out text ("f e m a l e  o n l y") collapses to
 * one word and will not match. Chasing that costs more in false positives
 * than it is worth. The report button is the backstop.
 */
function normalise(text: string): string {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)

  const out: string[] = []
  let run: string[] = []

  const flush = () => {
    if (run.length >= 2) out.push(run.join(''))
    else out.push(...run)
    run = []
  }

  for (const token of tokens) {
    if (/^[a-z]$/.test(token)) run.push(token)
    else {
      flush()
      out.push(token)
    }
  }
  flush()

  return out.join(' ')
}

/**
 * Word-boundary containment on already-normalised strings.
 *
 * Padding both sides with spaces means a phrase only matches whole words:
 * "no kids" hits "no kids allowed" but not "no kidding".
 */
function containsPhrase(haystack: string, phrase: string): boolean {
  return ` ${haystack} `.includes(` ${phrase} `)
}

/**
 * Screen a piece of host-written text.
 *
 * Returns every phrase that tripped, not just the first, so the form can show
 * the host the full list and they only have to resubmit once.
 */
export function checkText(text: string): BlocklistResult {
  const haystack = normalise(text)
  if (!haystack) return { ok: true, hits: [] }

  const hits: BlocklistHit[] = []
  const seen = new Set<string>()

  for (const cat of categories) {
    for (const phrase of cat.phrases) {
      const needle = normalise(phrase)
      if (seen.has(needle)) continue
      if (containsPhrase(haystack, needle)) {
        seen.add(needle)
        hits.push({
          phrase,
          category: cat.category,
          ground: cat.ground,
          message: cat.message,
        })
      }
    }
  }

  return hits.length === 0
    ? { ok: true, hits: [] }
    : { ok: false, hits }
}

/** Every phrase in the list, for the admin screen. */
export function allPhrases(): { phrase: string; category: string }[] {
  return categories.flatMap((c) =>
    c.phrases.map((phrase) => ({ phrase, category: c.category })),
  )
}
