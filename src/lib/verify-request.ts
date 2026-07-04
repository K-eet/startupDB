// Request authentication helpers shared by every mutating API route.
// Reuses the admin SDK verification pattern from /api/auth/admin-check.

import type { NextRequest } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from './firebase-admin';

/** Extract a Firebase ID token from the `Authorization: Bearer <token>` header. */
export function bearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

/**
 * Verify the caller's Firebase ID token (from the Bearer header). Returns the
 * decoded token, or null if missing/invalid. Routes turn null into a 401.
 */
export async function requireUser(request: NextRequest): Promise<DecodedIdToken | null> {
  const token = bearerToken(request);
  if (!token) return null;
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

/** The admin allowlist from the ADMIN_EMAILS env var (same source as admin-check). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Whether a decoded token belongs to a verified admin. */
export function isAdmin(decoded: DecodedIdToken): boolean {
  const email = decoded.email?.toLowerCase();
  return !!email && !!decoded.email_verified && adminEmails().includes(email);
}

/** Display name to snapshot on content the user creates. */
export function displayName(decoded: DecodedIdToken): string {
  return (decoded.name as string | undefined)?.trim() || decoded.email || 'Anonymous';
}
