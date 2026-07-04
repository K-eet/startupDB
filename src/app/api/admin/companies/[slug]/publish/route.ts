import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser, isAdmin } from '@/lib/verify-request';

export const dynamic = 'force-dynamic';

/** Publish a draft company → visible in the directory. Admin only. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = await requireUser(request);
  if (!decoded || !isAdmin(decoded)) {
    return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  }

  const snap = await adminDb.collection('companies').where('Slug', '==', slug).limit(1).get();
  if (snap.empty) return NextResponse.json({ error: 'Company not found.' }, { status: 404 });

  try {
    await snap.docs[0].ref.update({ published: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to publish company:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
