/**
 * Transactional email, via Resend's HTTP API.
 *
 * No SDK. The whole surface we use is one POST, and a dependency that wraps
 * one POST is a dependency to keep updated for no benefit.
 *
 * Every send is plain text. These are short operational messages to people who
 * are doing us a favour, and HTML email would mean maintaining a template, a
 * dark-mode variant and a spam-score problem for no gain.
 */

const ENDPOINT = 'https://api.resend.com/emails'

export type SendResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string }

/**
 * Send one email.
 *
 * When Resend is not configured this reports success with `skipped`, rather
 * than throwing. A local run with no API key should exercise the whole sweep
 * — reading, deciding, writing — and simply not send. Failing instead would
 * mean the freshness job could never be tested without a live mail account.
 */
export async function sendEmail(input: {
  to: string
  subject: string
  text: string
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) return { ok: true, skipped: true }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    })

    if (!response.ok) {
      // The body carries Resend's reason, which is the useful part in a log.
      return { ok: false, error: `${response.status} ${await response.text()}` }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}
