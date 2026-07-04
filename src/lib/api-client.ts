'use client';

import { app } from '@/lib/firebase';

/**
 * fetch() wrapper that attaches the current user's Firebase ID token as a
 * Bearer header (the server routes verify it via requireUser). JSON bodies get
 * a Content-Type automatically. Safe to call when signed out — it just omits
 * the auth header, and protected routes will answer 401.
 *
 * firebase/auth is imported lazily (kept off the critical path per firebase.ts);
 * getAuth(app) returns the instance the AuthProvider already initialized.
 */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const { getAuth } = await import('firebase/auth');
  const user = getAuth(app).currentUser;
  if (user) headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(input, { ...init, headers });
}

/** Pull a human-readable error message out of a failed JSON response. */
export async function errorMessage(res: Response, fallback = 'Something went wrong.'): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.error === 'string' ? data.error : fallback;
  } catch {
    return fallback;
  }
}
