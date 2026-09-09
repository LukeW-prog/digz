import { describe, expect, it } from 'vitest'
import {
  OUTCOME_ANSWER,
  OUTCOME_ANSWER_LABEL,
  isOutcomeAnswer,
  outcomeEmail,
  outcomeUrl,
} from './outcomes'

describe('isOutcomeAnswer', () => {
  // The answer arrives from a form on a page anyone with the link can open,
  // so this is the only thing standing between a stranger and a junk value in
  // the one table the kill gate is read from.
  it('accepts every real answer', () => {
    for (const answer of OUTCOME_ANSWER) {
      expect(isOutcomeAnswer(answer)).toBe(true)
    }
  })

  it('rejects anything else', () => {
    expect(isOutcomeAnswer('matched')).toBe(false)
    expect(isOutcomeAnswer('')).toBe(false)
    expect(isOutcomeAnswer(null)).toBe(false)
    expect(isOutcomeAnswer(undefined)).toBe(false)
    expect(isOutcomeAnswer(1)).toBe(false)
    expect(isOutcomeAnswer(['matched_here'])).toBe(false)
  })
})

describe('OUTCOME_ANSWER_LABEL', () => {
  it('has wording for every answer, so the page cannot render a blank button', () => {
    for (const answer of OUTCOME_ANSWER) {
      expect(OUTCOME_ANSWER_LABEL[answer]).toBeTruthy()
    }
  })

  // The unflattering option is the useful one. If it ever disappears, the
  // metric stops being able to see the failure mode that matters most.
  it('still offers "the host never replied"', () => {
    expect(OUTCOME_ANSWER).toContain('no_reply')
    expect(OUTCOME_ANSWER_LABEL.no_reply).toContain('never replied')
  })
})

describe('outcomeUrl', () => {
  it('builds the answer link', () => {
    expect(outcomeUrl('https://digs.ie', 'tok')).toBe(
      'https://digs.ie/outcome/tok',
    )
  })

  it('does not double the slash', () => {
    expect(outcomeUrl('https://digs.ie/', 'tok')).toBe(
      'https://digs.ie/outcome/tok',
    )
  })
})

describe('outcomeEmail', () => {
  const base = {
    roomLabel: 'Single room',
    areaLabel: 'Maynooth',
    siteUrl: 'https://digs.ie',
    token: 'tok-123',
  }

  it('asks the question and carries the link', () => {
    const mail = outcomeEmail(base)
    expect(mail.subject).toBe('Did you find a place?')
    expect(mail.text).toContain('single room in Maynooth')
    expect(mail.text).toContain('https://digs.ie/outcome/tok-123')
  })

  it('promises not to ask again, which is why it may say so once', () => {
    expect(outcomeEmail(base).text).toContain('will not ask you about this room again')
  })

  it('never leaks the host or the address', () => {
    const text = outcomeEmail(base).text
    expect(text).not.toMatch(/\+353/)
    expect(text).not.toMatch(/eircode/i)
  })
})
