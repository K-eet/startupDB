import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/verify-request';
import { getMemberships, membersOf } from '@/lib/membership-db';
import { membershipFor } from '@/lib/membership';
import { listEventsByOwner } from '@/lib/events-db';

export const dynamic = 'force-dynamic';

type ManagedMember = { uid: string; name: string; email?: string; role: 'owner' | 'member' };
type ManagedPending = { id: string; name: string; email: string; requestedAt: string | null };
type ManagedOrg = {
  slug: string;
  name: string;
  industry: string;
  city: string;
  members: ManagedMember[];
  pending: ManagedPending[];
};

// Resolve display names for member uids from Firebase Auth (users/{uid} stores
// no profile fields — name/email live on the Auth record).
async function resolveMember(uid: string, slug: string, role: 'owner' | 'member'): Promise<ManagedMember> {
  try {
    const u = await adminAuth.getUser(uid);
    return { uid, name: u.displayName || u.email || uid, email: u.email ?? undefined, role };
  } catch {
    return { uid, name: uid, role };
  }
}

/** The signed-in user's dashboard: memberships, pending requests, events, and —
 *  for companies they own — the member roster + join requests (for management). */
export async function GET(request: NextRequest) {
  const decoded = await requireUser(request);
  if (!decoded) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });

  try {
    const [memberships, events, myRequestsSnap] = await Promise.all([
      getMemberships(decoded.uid),
      listEventsByOwner(decoded.uid),
      // Single-field filter (auto-indexed); status filtered in memory to avoid a
      // (uid, status) composite index.
      adminDb.collection('companyRequests').where('uid', '==', decoded.uid).get(),
    ]);

    const pendingRequests = myRequestsSnap.docs
      .filter((d) => d.data().status === 'pending_review')
      .map((d) => ({ id: d.id, type: d.data().type, company: d.data().company ?? null }));

    // For companies the user owns, resolve roster + pending join requests.
    const owned = memberships.filter((m) => m.role === 'owner');
    const managed: ManagedOrg[] = await Promise.all(
      owned.map(async (m) => {
        const [companySnap, rows, reqSnap] = await Promise.all([
          adminDb.collection('companies').where('Slug', '==', m.slug).limit(1).get(),
          membersOf(m.slug),
          // Requests targeting this company (single-field nested query); status
          // filtered in memory to avoid a composite index.
          adminDb.collection('companyRequests').where('company.slug', '==', m.slug).get(),
        ]);
        const company = companySnap.empty ? null : companySnap.docs[0].data();
        const members = await Promise.all(
          rows.map((r) => resolveMember(r.uid, m.slug, membershipFor(r.memberships, m.slug)?.role ?? 'member'))
        );
        const pending = reqSnap.docs
          .filter((d) => d.data().status === 'pending_review' && d.data().uid)
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              name: data.contact?.name ?? 'Someone',
              email: data.contact?.email ?? '',
              requestedAt: data.submittedAt?.toDate?.().toISOString() ?? null,
            };
          });
        return {
          slug: m.slug,
          name: m.name,
          industry: (company?.['Industry'] as string) ?? '',
          city: (company?.['Headquarters City'] as string) ?? '',
          members,
          pending,
        };
      })
    );

    return NextResponse.json({ memberships, events, pendingRequests, managed });
  } catch (error) {
    console.error('Failed to load /me:', error);
    return NextResponse.json({ error: 'Failed to load your account.' }, { status: 500 });
  }
}
