import { NextRequest, NextResponse } from 'next/server';
import { FieldPath } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser, isAdmin } from '@/lib/verify-request';

export const dynamic = 'force-dynamic';

/**
 * Admin-only list of unpublished company drafts (published === false).
 *
 * These are created when an admin approves an "add a company" request
 * (see POST /api/requests/[id]/approve → createCompanyFromRequest) and stay
 * hidden from the public directory (/api/companies filters them out, and
 * /companies/[slug] 404s them) until an admin enriches + publishes them via
 * the edit form. Filtered in memory so legacy docs without the field are
 * never mistaken for drafts.
 */
export async function GET(request: NextRequest) {
  const decoded = await requireUser(request);
  if (!decoded || !isAdmin(decoded)) {
    return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  }

  try {
    // Slim field mask — drafts only need identity + timestamps for the tab.
    const snap = await adminDb
      .collection('companies')
      .select(
        new FieldPath('Slug'),
        new FieldPath('Company Name'),
        new FieldPath('One-line company description'),
        new FieldPath('Website URL'),
        new FieldPath('published'),
        new FieldPath('createdAt'),
        new FieldPath('updatedAt')
      )
      .get();
    const drafts = snap.docs
      .filter((d) => d.data().published === false)
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          slug: (data.Slug as string) ?? d.id,
          name: (data['Company Name'] as string) ?? '—',
          descriptor: (data['One-line company description'] as string) ?? '',
          url: (data['Website URL'] as string) ?? '',
          createdAt: (data.createdAt as string) ?? null,
          updatedAt: (data.updatedAt as string) ?? null,
        };
      })
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Failed to load company drafts:', error);
    return NextResponse.json({ error: 'Failed to load drafts.' }, { status: 500 });
  }
}
