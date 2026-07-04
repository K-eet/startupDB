import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser, isAdmin } from '@/lib/verify-request';
import { isOwnerOf } from '@/lib/membership';
import { getMemberships } from '@/lib/membership-db';

export const dynamic = 'force-dynamic';

/** Reject a pending request (no side effects). Admin, or an owner of the target company. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const approver = await requireUser(request);
  if (!approver) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });

  const ref = adminDb.collection('companyRequests').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  const req = snap.data()!;

  if (req.status !== 'pending_review') {
    return NextResponse.json({ error: 'Request already resolved.' }, { status: 409 });
  }

  const slug = req.company?.slug as string | undefined;
  const memberships = slug ? await getMemberships(approver.uid) : [];
  const allowed = isAdmin(approver) || (slug ? isOwnerOf(memberships, slug) : false);
  if (!allowed) {
    return NextResponse.json({ error: 'You cannot reject this request.' }, { status: 403 });
  }

  try {
    await ref.update({ status: 'rejected', resolvedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to reject request:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
