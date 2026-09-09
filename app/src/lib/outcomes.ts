/**
 * The two-week outcome check.
 *
 * feasibility.md sets a kill gate, and mvp.md counts contacts as the headline
 * number. Contacts are easy to count and mean very little: a student can
 * reveal ten phone numbers and sleep on a sofa. This is the only thing in the
 * system that says whether anyone got a room, so it is what the gate should
 * actually be read against.
 *
 * Kept pure so the wording and the routing can be tested without a database.
 */

export const OUTCOME_ANSWER = [
  'matched_here',
  'matched_elsewhere',
  'still_looking',
  'no_reply',
] as const

export type OutcomeAnswer = (typeof OUTCOME_ANSWER)[number]

/**
 * What each answer means to a student, in their words rather than ours.
 *
 * `no_reply` is deliberately offered. It is the least flattering answer and
 * the most useful one: hosts who never reply are the failure mode that makes a
 * digs site useless, and it cannot be fixed if nobody is asked about it.
 */
export const OUTCOME_ANSWER_LABEL: Record<OutcomeAnswer, string> = {
  matched_here: 'Yes, I moved into a room I found here',
  matched_elsewhere: 'I found somewhere, but not through Digs',
  still_looking: 'No, I am still looking',
  no_reply: 'The host never replied to me',
}

export function isOutcomeAnswer(value: unknown): value is OutcomeAnswer {
  return (
    typeof value === 'string' &&
    (OUTCOME_ANSWER as readonly string[]).includes(value)
  )
}

export function outcomeUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/$/, '')}/outcome/${token}`
}

/**
 * The email.
 *
 * One question, four answers, no marketing and no reason to keep the mail. It
 * says why we are asking, because a student who understands the answer is used
 * for something is more likely to give one, and it says we will not ask again.
 */
export function outcomeEmail(input: {
  roomLabel: string
  areaLabel: string
  siteUrl: string
  token: string
}): { subject: string; text: string } {
  return {
    subject: 'Did you find a place?',
    text: [
      'Hello,',
      '',
      `Two weeks ago you got the contact details for a ${input.roomLabel.toLowerCase()} in ${input.areaLabel}.`,
      '',
      'Did you find somewhere to live? One click, four options:',
      outcomeUrl(input.siteUrl, input.token),
      '',
      'We ask because it is the only way to tell whether this site is any use. Nobody sees your answer except us, it is not shown on the site, and we will not ask you about this room again.',
      '',
      'Digs',
    ].join('\n'),
  }
}
