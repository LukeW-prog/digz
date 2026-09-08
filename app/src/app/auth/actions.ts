'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type SignInState = {
  sent?: boolean
  email?: string
  error?: string
}

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  role: z.enum(['student', 'host']).default('student'),
  next: z.string().optional(),
})

/**
 * Sign in by emailed link.
 *
 * No passwords. mvp.md keeps friction off the student side deliberately —
 * they are the desperate half of this market — and a password is one more
 * thing to forget in August. It also means we never store a password hash,
 * which is one less thing to lose.
 */
export async function sendSignInLink(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role') ?? 'student',
    next: formData.get('next') ?? undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the email address' }
  }

  const { email, role, next } = parsed.data
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const callback = new URL('/auth/callback', site)
  if (next) callback.searchParams.set('next', next)
  callback.searchParams.set('role', role)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callback.toString(),
      // The role decides which profile row gets created on first sign in.
      data: { role },
    },
  })

  if (error) {
    return { error: 'Could not send the link just now. Try again shortly.' }
  }

  return { sent: true, email }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
