import type { Metadata } from 'next';
import { getDirectoryCompanies } from '@/lib/directory-data';
import { directoryStats } from '@/lib/directory-stats';
import { directoryJsonLd } from '@/lib/company-jsonld';
import { SITE_URL } from '@/lib/site';
import { HomeClient } from './home-client';

// The Admin SDK has no credentials at build time (same reason as sitemap.ts), so
// this can't be a prerendered ISR page. Rendering is per-request but the
// Firestore sweep behind getDirectoryCompanies is cached for an hour.
// ponytail: origin-rendered every hit. Add a CDN Cache-Control header in
// next.config if TTFB becomes the bottleneck.
export const dynamic = 'force-dynamic';

// Cards server-rendered into the HTML. Matches RESULTS_PAGE_SIZE in
// startup-directory so hydration doesn't change what's on screen. Deliberately
// not the whole corpus: App Hosting doesn't gzip HTML, so inlining 2,400+
// companies would put ~1.4 MB uncompressed on every request. The rest arrives
// from /api/companies (gzipped, CDN-cached) and every company is crawlable via
// /companies regardless.
const SSR_CARDS = 24;

const DESCRIPTION =
  'Browse technology companies operating in Malaysia — filter by sector, sub-sector, company type and location.';
const TITLE = 'StartupDB — Malaysian Startup & Technology Company Directory';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    siteName: 'StartupDB',
    type: 'website',
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const companies = await getDirectoryCompanies();
  const stats = directoryStats(companies);
  const initialCompanies = companies.slice(0, SSR_CARDS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            directoryJsonLd(initialCompanies, SITE_URL, {
              path: '/',
              name: 'StartupDB Directory',
              description: DESCRIPTION,
              total: stats.total,
            })
          ),
        }}
      />
      <HomeClient
        initialCompanies={initialCompanies}
        stats={stats}
        initialTab={tab === 'vcs' ? 'vcs' : 'startups'}
      />
    </>
  );
}
