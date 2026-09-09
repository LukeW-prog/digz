'use server'

import { revalidatePath } from 'next/cache'
import { isOutcomeAnswer } from '@/lib/outcomes'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Record a student's answer to the outcome question.
 *
 * The token is the whole authorisation. It is unguessable and grants nothing
 * but the ability to answer this one question, so there is no session to check
 * and nothing to leak if it is shared.
 *
 * Admin client because outcome_checks has no policies: it is measurement data
 * and nobody but us reads it.
 */
export async function recordOutcome(formData: FormData) {
  const token = String(formData.get('token') ?? '')
  const answer = formData.get('answer')

  if (!token || !isOutcomeAnswer(answer)) return

  const supabase = createAdminClient()

  // `is('answer', null)` makes this first-answer-wins. Someone who clicks
  // twice, or forwards the mail, cannot overwrite what they said.
  await supabase
    .from('outcome_checks')
    .update({ answer, answered_at: new Date().toISOString() })
    .eq('token', token)
    .is('answer', null)

  revalidatePath(`/outcome/${token}`)
}
