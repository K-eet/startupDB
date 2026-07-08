import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser, isAdmin } from '@/lib/verify-request';

export const dynamic = 'force-dynamic';

const COLLECTION = 'communitySignups';
const EDITABLE = ['name', 'email', 'whatsapp', 'org', 'role', 'working', 'status'] as const;

async function requireAdmin(request: NextRequest) {
  const decoded = await requireUser(request);
  if (!decoded || !isAdmin(decoded)) return null;
  return decoded;
}

/** Edit a community signup (admin only). Only whitelisted string fields are updated. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;

  const updates: Record<string, string> = {};
  for (const key of EDITABLE) {
    if (typeof data[key] === 'string') updates[key] = (data[key] as string).trim().slice(0, 1000);
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  const ref = adminDb.collection(COLLECTION).doc(id);
  if (!(await ref.get()).exists) return NextResponse.json({ error: 'Signup not found.' }, { status: 404 });

  try {
    await ref.update(updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to update signup:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/** Delete a community signup (admin only). */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  const { id } = await params;
  try {
    await adminDb.collection(COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete signup:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
