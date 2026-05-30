'use client';

import { createAuthClient } from '@neondatabase/auth/next';

export const authClient = createAuthClient();

export async function signInWithGoogle(callbackURL: string = '/') {
  try {
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

export async function signInWithGitHub(callbackURL: string = '/') {
  try {
    await authClient.signIn.social({
      provider: "github",
      callbackURL,
    });
  } catch (error) {
    console.error("GitHub sign-in error:", error);
    throw error;
  }
}
