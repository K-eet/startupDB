// JSON-LD structured data for company profile pages. Server-rendered into the
// page HTML so crawlers and AI answer engines read it from the initial payload.
// Kept dependency-free (no internal imports) so it runs under node:test the same
// way company-request.ts does. Company is imported type-only, erased at runtime.
import type { Company } from '../types/company';

// Drop keys whose value is empty/undefined/[] so we never emit blank or "N/A"
// fields that dilute the schema.
function pruned<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v == null || v === '') return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    })
  ) as Partial<T>;
}

// Founder names only — JSON-LD Person needs the name, not the title. Matches
// parseFounders' separator handling ([,;]) without pulling in the dependency.
function founderNames(names: Company['Founder Names']): string[] {
  if (!names) return [];
  const list = Array.isArray(names) ? names : names.split(/[,;]/);
  return list.map((n) => n.trim()).filter(Boolean);
}

// Build Organization + BreadcrumbList as a JSON-LD graph for one company.
// siteUrl is the canonical origin (from SITE_URL).
export function companyJsonLd(company: Company, siteUrl: string) {
  const name = company['Company Name'] || 'Company';
  const pageUrl = `${siteUrl}/companies/${company.Slug}`;

  const addressFields = pruned({
    addressLocality: company['Headquarters City'],
    addressRegion: company['Headquarters State'],
    addressCountry: company['Headquarters Country'],
  });
  const address = Object.keys(addressFields).length
    ? { '@type': 'PostalAddress', ...addressFields }
    : undefined;

  const founder = founderNames(company['Founder Names']).map((n) => ({
    '@type': 'Person',
    name: n,
  }));

  const organization = pruned({
    '@type': 'Organization',
    '@id': pageUrl,
    name,
    url: company['Website URL'],
    description:
      company['One-line company description'] || company.Description,
    foundingDate: company['Founded Year']
      ? String(company['Founded Year'])
      : undefined,
    industry: company.Industry,
    address,
    founder: founder.length ? founder : undefined,
  });

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'StartupDB', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Companies',
        item: `${siteUrl}/companies`,
      },
      { '@type': 'ListItem', position: 3, name, item: pageUrl },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, breadcrumb],
  };
}
