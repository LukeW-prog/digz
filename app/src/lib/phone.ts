/**
 * Irish phone numbers, normalised to E.164.
 *
 * Hosts type their number the way they say it out loud — "087 123 4567" — and
 * Twilio needs "+353871234567". Getting this wrong means the verification SMS
 * silently goes nowhere, and phone verification is the single highest-value
 * anti-fraud measure in the product, so it is worth doing properly.
 */

const IE = '+353'

/** Irish mobile prefixes, without the trunk zero. */
const MOBILE_PREFIXES = ['82', '83', '84', '85', '86', '87', '88', '89']

export type PhoneResult =
  | { ok: true; e164: string; display: string }
  | { ok: false; message: string }

export function normalisePhone(raw: string): PhoneResult {
  // Strip everything that is not a digit or a leading plus.
  const cleaned = raw.trim().replace(/[^\d+]/g, '')

  if (!cleaned) {
    return { ok: false, message: 'Enter your mobile number' }
  }

  let national: string

  if (cleaned.startsWith('+353')) {
    national = cleaned.slice(4)
  } else if (cleaned.startsWith('00353')) {
    national = cleaned.slice(5)
  } else if (cleaned.startsWith('353') && !cleaned.startsWith('3530')) {
    national = cleaned.slice(3)
  } else if (cleaned.startsWith('0')) {
    national = cleaned.slice(1)
  } else if (cleaned.startsWith('+')) {
    return {
      ok: false,
      message: 'We can only text Irish mobile numbers at the moment.',
    }
  } else {
    national = cleaned
  }

  // A stray trunk zero after the country code is a very common typo.
  national = national.replace(/^0+/, '')

  if (!/^\d+$/.test(national)) {
    return { ok: false, message: 'That does not look like a phone number' }
  }

  const prefix = national.slice(0, 2)
  if (!MOBILE_PREFIXES.includes(prefix)) {
    return {
      ok: false,
      message:
        'That is not an Irish mobile number. We need a mobile so we can text you a code.',
    }
  }

  if (national.length !== 9) {
    return {
      ok: false,
      message: 'An Irish mobile number has nine digits after the 0.',
    }
  }

  return {
    ok: true,
    e164: `${IE}${national}`,
    display: `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`,
  }
}

/** For showing a host their own number back without printing it in full. */
export function maskPhone(e164: string): string {
  return e164.length < 4 ? e164 : `${'•'.repeat(6)}${e164.slice(-4)}`
}
