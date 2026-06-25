import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import type { Company } from '@/types/company';
import { CompanyProfilePage } from './company-profile-page';

// Server-fetch the company so the page ships full HTML + metadata to crawlers
// instead of a client-only shell. cache() dedupes the read between
// generateMetadata and the render. Dynamic — the Admin SDK needs runtime creds.
const getCompany = cache(async (slug: string): Promise<Company | null> => {
  const snapshot = await adminDb
    .collection('companies')
    .where('Slug', '==', slug)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  // Round-trip to plain JSON: the raw doc may hold Firestore Timestamps/refs,
  // which can't cross the server→client boundary into CompanyProfilePage.
  return JSON.parse(JSON.stringify(snapshot.docs[0].data())) as Company;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return { title: 'Company Not Found — StartupDB' };

  const name = company['Company Name'] || 'Company';
  const description =
    company['One-line company description'] || `${name} on StartupDB.`;
  const path = `/companies/${slug}`;

  return {
    title: `${name} — StartupDB`,
    description,
    alternates: { canonical: path },
    openGraph: { title: name, description, url: path, type: 'website' },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();
  return <CompanyProfilePage company={company} />;
}
