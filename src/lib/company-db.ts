// Server-side company creation (admin SDK). Used when an admin approves an
// "add a company" request from the moderation queue. Creates a minimal
// directory entry that an admin can enrich later via the existing edit form.

import { adminDb } from './firebase-admin';

/** URL-safe slug from a company name (matches scripts/compare-batch2.ts). */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Create a company document from an approved "add" request. Doc id = Slug
 * (the project convention), made unique with a short suffix on collision.
 * Returns the slug. Unknown fields are left blank for later enrichment.
 */
export async function createCompanyFromRequest(input: {
  name: string;
  url?: string;
  descriptor?: string;
}): Promise<string> {
  const base = slugify(input.name) || 'company';
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const existing = await adminDb.collection('companies').doc(slug).get();
    if (!existing.exists) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  await adminDb
    .collection('companies')
    .doc(slug)
    .set({
      StartupDB_ID: slug,
      Slug: slug,
      'Company Name': input.name,
      'One-line company description': input.descriptor ?? '',
      Description: input.descriptor ?? '',
      'Website URL': input.url ?? '',
      Industry: '',
      'Sub-Industry': '',
      'Company Type': '',
      Technology: '',
      'Sub-Technology': '',
      'Primary Technology': '',
      'Founded Year': 0,
      'Headquarters City': '',
      'Headquarters State': '',
      'Headquarters Country': 'Malaysia',
      'Company Size': '',
      'Founder Names': '',
      'Founder Titles': '',
      // Flag so admins can spot user-submitted entries that need enrichment.
      userSubmitted: true,
      // Hidden from the public directory until an admin enriches and publishes
      // it (see the Drafts tab in the moderation queue).
      published: false,
      createdAt: new Date().toISOString(),
    });

  return slug;
}
