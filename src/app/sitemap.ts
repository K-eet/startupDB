import type { MetadataRoute } from 'next';
import { getDirectoryCompanies } from '@/lib/directory-data';
import { SITE_URL } from '@/lib/site';

// Admin SDK needs runtime credentials — generate at request time, not at build
// (mirrors /api/companies). Shares the hour-cached corpus with / and /companies,
// so this costs no extra Firestore reads — and, unlike the old Slug-only sweep,
// it excludes unpublished drafts, which 404 on their detail page.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/companies',
    '/categorisation',
    '/community',
    '/events',
    '/jobs',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
  }));

  const companies = await getDirectoryCompanies();
  const companyRoutes: MetadataRoute.Sitemap = companies
    .map((company) => company.Slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({
      url: `${SITE_URL}/companies/${slug}`,
      changeFrequency: 'monthly',
    }));

  return [...staticRoutes, ...companyRoutes];
}
