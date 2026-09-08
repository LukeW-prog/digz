'use server'

import { revalidatePath } from 'next/cache'
import { normalisePhone } from '@/lib/phone'
import { checkVerificationCode, sendVerificationCode } from '@/lib/twilio'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export type VerifyState = {
  step: 'enter_phone' | 'enter_code' | 'done'
  /** E.164, carried through the two steps in a hidden field. */
  phone?: string
  display?: string
  error?: string
}

/** Step one: take a number, check it is a real Irish mobile, text a code. */
export async function startPhoneVerification(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const host = await requireHost()
  if ('error' in host) return { step: 'enter_phone', error: host.error }

  const parsed = normalisePhone(String(formData.get('phone') ?? ''))
  if (!parsed.ok) {
    return { step: 'enter_phone', error: parsed.message }
  }

  // One verified phone per host. Blocking the number rather than only the
  // account is what stops a removed host coming straight back. See safety.md.
  const admin = createAdminClient()

  const { data: blocked } = await admin
    .from('blocked_phones')
    .select('phone')
    .eq('phone', parsed.e164)
    .maybeSingle()

  if (blocked) {
    return {
      step: 'enter_phone',
      error: 'That number cannot be used on Digs.',
    }
  }

  const { data: taken } = await admin
    .from('hosts')
    .select('id')
    .eq('phone', parsed.e164)
    .not('phone_verified_at', 'is', null)
    .neq('id', host.id)
    .maybeSingle()

  if (taken) {
    return {
      step: 'enter_phone',
      error: 'That number is already verified on another account.',
    }
  }

  const sent = await sendVerificationCode(parsed.e164)
  if (!sent.ok) {
    return { step: 'enter_phone', error: sent.message }
  }

  return {
    step: 'enter_code',
    phone: parsed.e164,
    display: parsed.display,
  }
}

/** Step two: check the code, and only then write the number to the host row. */
export async function confirmPhoneVerification(
  prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const host = await requireHost()
  if ('error' in host) return { ...prev, error: host.error }

  const phone = String(formData.get('phone') ?? '')
  const code = String(formData.get('code') ?? '').replace(/\D/g, '')

  if (!phone) return { step: 'enter_phone', error: 'Start again, please.' }
  if (code.length < 4) {
    return { ...prev, step: 'enter_code', error: 'Enter the code from the text.' }
  }

  const checked = await checkVerificationCode(phone, code)
  if (!checked.ok) {
    return {
      ...prev,
      step: checked.retryable ? 'enter_code' : 'enter_phone',
      error: checked.message,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('hosts')
    .update({ phone, phone_verified_at: new Date().toISOString() })
    .eq('id', host.id)

  if (error) {
    return { ...prev, step: 'enter_code', error: 'Could not save that. Try again.' }
  }

  revalidatePath('/host', 'layout')
  return { step: 'done', phone, display: prev.display }
}

async function requireHost(): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Sign in again to continue.' }

  const { data: host } = await supabase
    .from('hosts')
    .select('id, blocked_at')
    .eq('id', user.id)
    .single()

  if (!host || host.blocked_at) return { error: 'This account cannot post listings.' }
  return { id: host.id }
}
