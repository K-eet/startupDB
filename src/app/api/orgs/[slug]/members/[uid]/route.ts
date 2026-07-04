import { NextRequest, NextResponse } from 'next/server';
import { requireUser, isAdmin } from '@/lib/verify-request';
import { isOwnerOf } from '@/lib/membership';
import { getMemberships, setMemberRole, removeMember, LastOwnerError } from '@/lib/membership-db';

export const dynamic = 'force-dynamic';

// Authorize the caller as an owner of the company (admin fallback).
async function requireOwner(request: NextRequest, slug: string) {
  const decoded = await requireUser(request);
  if (!decoded) return { error: 'Please sign in.', status: 401 as const };
  if (isAdmin(decoded)) return { decoded };
  const memberships = await getMemberships(decoded.uid);
  if (!isOwnerOf(memberships, slug)) {
    return { error: 'Only an owner can manage members.', status: 403 as const };
  }
  return { decoded };
}

/** Promote/demote a member. Body: { role: 'owner' | 'member' }. Owner only. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; uid: string }> }
) {
  const { slug, uid } = await params;
  const auth = await requireOwner(request, slug);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const role = (body as { role?: unknown }).role;
  if (role !== 'owner' && role !== 'member') {
    return NextResponse.json({ error: 'Role must be owner or member.' }, { status: 400 });
  }

  try {
    // Atomic: membership role + companies.ownerUids kept in sync, with an
    // in-transaction last-owner guard.
    await setMemberRole(slug, uid, role);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof LastOwnerError) {
      return NextResponse.json({ error: 'Cannot demote the last owner.' }, { status: 409 });
    }
    console.error('Failed to change role:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/** Remove a member from the company. Owner only. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; uid: string }> }
) {
  const { slug, uid } = await params;
  const auth = await requireOwner(request, slug);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // Atomic: drop membership + remove from ownerUids, with an in-transaction
    // last-owner guard.
    await removeMember(slug, uid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof LastOwnerError) {
      return NextResponse.json({ error: 'Cannot remove the last owner.' }, { status: 409 });
    }
    console.error('Failed to remove member:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
