// Server-side directory reads. The Admin SDK query used to live inline in
// /api/companies; it's here so the server-rendered pages (/, /companies) and
// the API route all share one Firestore sweep and one field contract.
//
// ponytail: unstable_cache gives ~1 read per hour instead of one per request.
// maxInstances is 1 (apphosting.yaml), so one process = one cache. If that ever
// scales out, each instance keeps its own copy — still bounded, just N/hour.

import { unstable_cache } from 'next/cache';
import { FieldPath } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import type { Company } from '@/types/company';

// Only the fields the directory, filters, dashboard and admin list actually use.
// Heavy fields (Description, AI Reasoning, Social Media, ...) are excluded —
// fetching full documents was ~14 MB for 2,400+ companies.
export const DIRECTORY_FIELDS = [
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

async function fetchDirectoryCompanies(): Promise<Company[]> {
  const snapshot = await adminDb
    .collection('companies')
    .orderBy(new FieldPath('Company Name'))
    .select(...DIRECTORY_FIELDS.map((f) => new FieldPath(f)), new FieldPath('published'))
    .get();

  // Exclude user-submitted drafts (published === false). Existing companies
  // have no `published` field, so they're included by default. Filtered in
  // memory rather than via a query so a `!=`/missing-field filter doesn't drop
  // the un-flagged legacy docs.
  return snapshot.docs
    .filter((doc) => doc.data().published !== false)
    .map((doc) => doc.data() as Company);
}

/** Whole published directory, slim fields, cached for an hour. */
export const getDirectoryCompanies = unstable_cache(
  fetchDirectoryCompanies,
  ['directory-companies'],
  { revalidate: 3600 }
);
