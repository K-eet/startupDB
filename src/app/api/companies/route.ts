import { NextResponse } from 'next/server';
import { FieldPath } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import type { Company } from '@/types/company';

// Must not be prerendered at build time — the Admin SDK needs runtime credentials.
// Caching is handled by the CDN via the Cache-Control header below.
export const dynamic = 'force-dynamic';

// Only the fields the directory, filters, dashboard and admin list actually use.
// Heavy fields (Description, AI Reasoning, Social Media, ...) are excluded —
// fetching full documents was ~14 MB for 2,400+ companies.
const DIRECTORY_FIELDS = [
  'StartupDB_ID',
  'Slug',
  'Company Name',
  'One-line company description',
  'Industry',
  'Sub-Industry',
  'Company Type',
  'Primary Technology',
  'Sub-Technology',
  'Headquarters Country',
  'Headquarters State',
  'Headquarters City',
  'Founded Year',
];

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('companies')
      .orderBy(new FieldPath('Company Name'))
      .select(...DIRECTORY_FIELDS.map((f) => new FieldPath(f)))
      .get();

    const companies = snapshot.docs.map((doc) => doc.data() as Company);

    return NextResponse.json(companies, {
      headers: {
        // CDN caches for 5 minutes, serves stale while revalidating for a day
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
