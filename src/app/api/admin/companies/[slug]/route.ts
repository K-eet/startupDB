import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser, isAdmin } from '@/lib/verify-request';

export const dynamic = 'force-dynamic';

/** Delete a company outright (admin only). Used from the edit page. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = await requireUser(request);
  if (!decoded || !isAdmin(decoded)) {
    return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  }

  const snap = await adminDb.collection('companies').where('Slug', '==', slug).limit(1).get();
  if (snap.empty) return NextResponse.json({ error: 'Company not found.' }, { status: 404 });

  try {
    await snap.docs[0].ref.delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete company:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
