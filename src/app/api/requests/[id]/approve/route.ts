import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser, isAdmin } from '@/lib/verify-request';
import { classifyRequestKind } from '@/lib/company-request';
import { isOwnerOf } from '@/lib/membership';
import { getOwnerUids, grantOwner, upsertMembership, getMemberships } from '@/lib/membership-db';
import { createCompanyFromRequest } from '@/lib/company-db';

export const dynamic = 'force-dynamic';

/**
 * Approve a pending company request. Two shapes:
 *   type 'add'   — new company. Admin only. Creates a directory entry and, if
 *                  the submitter is signed in, grants them ownership.
 *   type 'claim' — existing listing. requestKind is derived from the target's
 *                  ownerUids: claim (no owner yet) → admin approves → 'owner';
 *                  join (already owned) → an owner approves (admin fallback) →
 *                  'member'.
 */
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

  const companyName = (req.company?.name as string | undefined) ?? '';
  const submitterUid = req.uid as string | undefined;

  // --- New-company request: create the directory entry (admin only) ---
  if (req.type === 'add') {
    if (!isAdmin(approver)) {
      return NextResponse.json({ error: 'New companies are approved by an admin.' }, { status: 403 });
    }
    if (!companyName) {
      return NextResponse.json({ error: 'Request is missing a company name.' }, { status: 400 });
    }
    try {
      const slug = await createCompanyFromRequest({
        name: companyName,
        url: req.company?.url as string | undefined,
        descriptor: req.company?.descriptor as string | undefined,
      });
      // The submitter who added it becomes its owner (if they were signed in).
      if (submitterUid) await grantOwner(slug, submitterUid, companyName);
      await ref.update({ status: 'approved', createdSlug: slug, resolvedAt: new Date().toISOString() });
      return NextResponse.json({ ok: true, kind: 'add', slug });
    } catch (error) {
      console.error('Failed to approve add request:', error);
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
  }

  // --- Claim/join on an existing listing ---
  const slug = req.company?.slug as string | undefined;
  if (!slug) {
    return NextResponse.json({ error: 'Claim request is missing its company reference.' }, { status: 400 });
  }
  if (!submitterUid) {
    return NextResponse.json(
      { error: 'This request has no linked account to grant membership to.' },
      { status: 400 }
    );
  }

  const ownerUids = await getOwnerUids(slug);
  const kind = classifyRequestKind(ownerUids);

  // Authorize the approver by kind.
  if (kind === 'claim') {
    if (!isAdmin(approver)) {
      return NextResponse.json({ error: 'Claims are approved by an admin.' }, { status: 403 });
    }
  } else {
    const approverMemberships = await getMemberships(approver.uid);
    if (!isOwnerOf(approverMemberships, slug) && !isAdmin(approver)) {
      return NextResponse.json(
        { error: 'Only an owner of this company can approve join requests.' },
        { status: 403 }
      );
    }
  }

  try {
    if (kind === 'claim') {
      // Atomic: ownerUids on the company AND an 'owner' membership on the user.
      await grantOwner(slug, submitterUid, companyName);
    } else {
      // 'member' grant touches only the user doc — single-doc, no mirror.
      await upsertMembership(submitterUid, { slug, name: companyName, role: 'member' });
    }
    await ref.update({ status: 'approved', requestKind: kind, resolvedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, kind });
  } catch (error) {
    console.error('Failed to approve request:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
