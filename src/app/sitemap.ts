import type { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { SITE_URL } from '@/lib/site';

// Admin SDK needs runtime credentials — generate at request time, not at build
// (mirrors /api/companies). Crawlers hit this rarely, so the per-request read of
// ~2.5k Slug-only docs is fine.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/categorisation',
    '/community',
    '/events',
    '/jobs',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
  }));

  const snapshot = await adminDb.collection('companies').select('Slug').get();
  const companyRoutes: MetadataRoute.Sitemap = snapshot.docs
    .map((doc) => (doc.data() as { Slug?: string }).Slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({
      url: `${SITE_URL}/companies/${slug}`,
      changeFrequency: 'monthly',
    }));

  return [...staticRoutes, ...companyRoutes];
}
