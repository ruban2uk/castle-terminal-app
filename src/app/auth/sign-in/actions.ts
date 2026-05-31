'use server';

import { auth } from '@/lib/auth/server';

export async function signInWithEmail(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const { error } = await auth.signIn.email({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message || 'Failed to sign in. Try again' };
  }

  return { success: true };
}
