import type { Metadata } from 'next';
import Link from 'next/link';
import { getDirectoryCompanies } from '@/lib/directory-data';
import { directoryJsonLd } from '@/lib/company-jsonld';
import { SITE_URL } from '@/lib/site';
import { normalizeCompanyName } from '@/lib/utils';

// Plain server-rendered A–Z index: the crawlable link graph into every company
// page, in one document, with no client JS. Same hour-cached Firestore sweep as
// the home page. Also gives the BreadcrumbList in company-jsonld a real target.
export const dynamic = 'force-dynamic';

const TITLE = 'All companies A–Z — StartupDB';
const DESCRIPTION =
  'Complete alphabetical index of every technology company listed in the StartupDB Malaysian startup directory.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/companies' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/companies', siteName: 'StartupDB', type: 'website' },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export default async function CompaniesIndex() {
  const companies = (await getDirectoryCompanies()).filter((c) => c.Slug);

  // Group by leading character; anything non-alphabetic lands under '#'.
  const groups = new Map<string, typeof companies>();
  for (const company of companies) {
    const first = (company['Company Name'] || '').trim().charAt(0).toUpperCase();
    const key = first >= 'A' && first <= 'Z' ? first : '#';
    const bucket = groups.get(key);
    if (bucket) bucket.push(company);
    else groups.set(key, [company]);
  }
  const letters = [...groups.keys()].sort();

  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            // Sampled, not the full 2,400: a complete itemListElement doubles
            // the page weight (once in the HTML, once in the RSC payload) for a
            // list the rendered <a href>s below already enumerate. numberOfItems
            // still reports the true total.
            directoryJsonLd(companies.slice(0, 100), SITE_URL, {
              path: '/companies',
              name: TITLE,
              description: DESCRIPTION,
              total: companies.length,
            })
          ),
        }}
      />

      <header className="mb-8">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          StartupDB
        </Link>
        <h1 className="text-xl font-semibold tracking-tight mt-6">All companies A–Z</h1>
        <p className="text-muted-foreground mt-2">
          Every one of the {companies.length.toLocaleString()} technology companies in the
          directory. <Link href="/" className="text-primary hover:underline">Search and filter them here →</Link>
        </p>
      </header>

      <nav aria-label="Jump to letter" className="flex flex-wrap gap-2 mb-8">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter === '#' ? 'other' : letter}`}
            className="px-2 py-1 text-sm font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
          >
            {letter}
          </a>
        ))}
      </nav>

      {letters.map((letter) => (
        <section key={letter} id={`letter-${letter === '#' ? 'other' : letter}`} className="mb-8">
          <h2 className="text-lg font-semibold border-b border-border pb-2 mb-3">{letter}</h2>
          {/* Link styling hangs off the <ul> rather than each <a>: with 2,400+
              anchors, a per-link className is ~300 KB of repeated markup once in
              the HTML and again in the RSC payload. */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm [&_a:hover]:text-primary [&_a:hover]:underline">
            {groups.get(letter)!.map((company) => (
              <li key={company.Slug}>
                <a href={`/companies/${company.Slug}`}>
                  {normalizeCompanyName(company['Company Name'] || 'Unnamed Company')}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
