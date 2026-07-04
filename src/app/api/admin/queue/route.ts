import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { requireUser, isAdmin } from '@/lib/verify-request';
import { listPendingEvents } from '@/lib/events-db';

export const dynamic = 'force-dynamic';

/** Admin moderation queue: pending events + pending company requests. Admin only. */
export async function GET(request: NextRequest) {
  const decoded = await requireUser(request);
  if (!decoded || !isAdmin(decoded)) {
    return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  }

  try {
    const [pendingEvents, requestsSnap, draftsSnap] = await Promise.all([
      listPendingEvents(),
      adminDb.collection('companyRequests').where('status', '==', 'pending_review').get(),
      // User-submitted companies awaiting enrichment + publish (single-field
      // equality → auto-indexed).
      adminDb.collection('companies').where('published', '==', false).get(),
    ]);

    // Attach the submitter's email (admin-only view) by resolving the Auth
    // record — kept off the public StoredEvent so live events don't leak it.
    const events = await Promise.all(
      pendingEvents.map(async (e) => {
        let submitterEmail: string | undefined;
        try {
          submitterEmail = (await adminAuth.getUser(e.ownerUid)).email ?? undefined;
        } catch {
          /* auth record gone */
        }
        return { ...e, submitterEmail };
      })
    );

    const requests = requestsSnap.docs
      .map((d) => ({
        id: d.id,
        type: d.data().type,
        uid: d.data().uid ?? null,
        contact: d.data().contact ?? null,
        company: d.data().company ?? null,
        submittedAt: d.data().submittedAt?.toMillis?.() ?? null,
      }))
      .sort((a, b) => (a.submittedAt ?? 0) - (b.submittedAt ?? 0));

    const drafts = draftsSnap.docs
      .map((d) => ({
        slug: (d.data().Slug as string) ?? d.id,
        name: (d.data()['Company Name'] as string) ?? d.id,
        descriptor: (d.data()['One-line company description'] as string) ?? '',
        website: (d.data()['Website URL'] as string) ?? '',
        createdAt: (d.data().createdAt as string) ?? null,
      }))
      .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));

    return NextResponse.json({ events, requests, drafts });
  } catch (error) {
    console.error('Failed to load moderation queue:', error);
    return NextResponse.json({ error: 'Failed to load queue.' }, { status: 500 });
  }
}
