import type { Metadata } from 'next'
import { VerifyForm } from './verify-form'
import { phoneVerificationConfigured } from '@/lib/twilio'

export const metadata: Metadata = {
  title: 'Verify your number',
  description: 'Confirm your mobile number before posting a digs listing.',
}

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="label">For hosts</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Verify your number
      </h1>

      <p className="mt-5 max-w-md leading-relaxed text-soft">
        We text you a code once. It is the main thing keeping fake listings off
        the site, so there is no way around it.
      </p>

      <div className="mt-8">
        <VerifyForm configured={phoneVerificationConfigured()} />
      </div>

      <div className="mt-12 border-t border-rule pt-6 text-sm text-soft">
        <h2 className="label text-ink">What we do with it</h2>
        <ul className="mt-3 space-y-2">
          <li>
            It is shown to a student only after they have read the safety
            notice, and we record every time that happens.
          </li>
          <li>It is never shown publicly on a listing.</li>
          <li>
            One verified number per account. If an account is removed, the
            number goes with it.
          </li>
        </ul>
      </div>
    </div>
  )
}
