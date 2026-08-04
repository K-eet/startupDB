import type { MetadataRoute } from 'next';
import { getDirectoryCompanies } from '@/lib/directory-data';
import { SITE_URL } from '@/lib/site';

// Admin SDK needs runtime credentials — generate at request time, not at build
// (mirrors /api/companies). Shares the hour-cached corpus with / and /companies,
// so this costs no extra Firestore reads — and, unlike the old Slug-only sweep,
// it excludes unpublished drafts, which 404 on their detail page.
export const dynamic = 'force-dynamic';

// No <changefreq>: Google ignores it outright. <lastmod> is the field it actually
// uses to prioritise recrawls, so emit that where we genuinely know it and
// nothing where we don't — a made-up date is worse than an absent one.
function lastModified(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const companies = await getDirectoryCompanies();

  const companyRoutes: MetadataRoute.Sitemap = companies
    .filter((company) => company.Slug)
    .map((company) => ({
      url: `${SITE_URL}/companies/${company.Slug}`,
      lastModified: lastModified(company.updatedAt),
    }));

  // The directory views change whenever any company does, so the newest company
  // edit is their honest last-modified.
  const newestEdit = companyRoutes
    .map((route) => route.lastModified as Date | undefined)
    .filter((date): date is Date => date instanceof Date)
    .reduce<Date | undefined>(
      (newest, date) => (!newest || date > newest ? date : newest),
      undefined
    );

  const staticRoutes: MetadataRoute.Sitemap = [
    // Trailing slash matters: a bare origin is not a valid <loc>, and Search
    // Console rejects the whole file over one bad entry ("could not be read").
    { path: '/', lastModified: newestEdit },
    { path: '/companies', lastModified: newestEdit },
    { path: '/categorisation' },
    { path: '/community' },
    { path: '/events' },
    { path: '/jobs' },
  ].map(({ path, lastModified: date }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: date,
  }));

  return [...staticRoutes, ...companyRoutes];
}
