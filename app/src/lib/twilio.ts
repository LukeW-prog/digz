/**
 * Phone verification via Twilio Verify.
 *
 * Verify rather than raw SMS: it generates the code, expires it, rate limits
 * attempts and handles resends, none of which is worth reimplementing.
 *
 * mvp.md calls this the one verification step not to skip. It costs a few
 * cents per host and it is what makes throwaway listing accounts expensive.
 */

type VerifyOutcome =
  | { ok: true }
  | { ok: false; message: string; retryable: boolean }

const BASE = 'https://verify.twilio.com/v2/Services'

function credentials() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const service = process.env.TWILIO_VERIFY_SERVICE_SID
  if (!sid || !token || !service) return null
  return {
    service,
    auth: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
  }
}

/** True when Twilio is wired up. Lets the UI explain itself in local dev. */
export function phoneVerificationConfigured(): boolean {
  return credentials() !== null
}

export async function sendVerificationCode(
  e164: string,
): Promise<VerifyOutcome> {
  const creds = credentials()
  if (!creds) {
    return {
      ok: false,
      message: 'Phone verification is not configured on this site yet.',
      retryable: false,
    }
  }

  try {
    const res = await fetch(`${BASE}/${creds.service}/Verifications`, {
      method: 'POST',
      headers: {
        Authorization: creds.auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: e164, Channel: 'sms' }),
      cache: 'no-store',
    })

    if (res.ok) return { ok: true }

    const body = await res.json().catch(() => ({}))

    // 60200 is an invalid number, 60203 is too many attempts on one number.
    if (body?.code === 60200) {
      return {
        ok: false,
        message: 'Twilio could not deliver to that number. Check it and retry.',
        retryable: true,
      }
    }
    if (body?.code === 60203) {
      return {
        ok: false,
        message:
          'Too many codes sent to that number. Wait ten minutes and try again.',
        retryable: false,
      }
    }

    return {
      ok: false,
      message: 'Could not send the code just now. Try again shortly.',
      retryable: true,
    }
  } catch {
    return {
      ok: false,
      message: 'Could not reach the text message service. Try again shortly.',
      retryable: true,
    }
  }
}

export async function checkVerificationCode(
  e164: string,
  code: string,
): Promise<VerifyOutcome> {
  const creds = credentials()
  if (!creds) {
    return {
      ok: false,
      message: 'Phone verification is not configured on this site yet.',
      retryable: false,
    }
  }

  try {
    const res = await fetch(`${BASE}/${creds.service}/VerificationCheck`, {
      method: 'POST',
      headers: {
        Authorization: creds.auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: e164, Code: code }),
      cache: 'no-store',
    })

    const body = await res.json().catch(() => ({}))

    if (res.ok && body?.status === 'approved') return { ok: true }

    // A 404 means the code expired and Verify has forgotten the attempt.
    if (res.status === 404) {
      return {
        ok: false,
        message: 'That code has expired. Ask for a new one.',
        retryable: false,
      }
    }

    return {
      ok: false,
      message: 'That code is not right. Check the message and try again.',
      retryable: true,
    }
  } catch {
    return {
      ok: false,
      message: 'Could not reach the text message service. Try again shortly.',
      retryable: true,
    }
  }
}
