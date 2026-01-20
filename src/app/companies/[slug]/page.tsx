import { notFound } from 'next/navigation';
import { getCompanyBySlug, getAllCompanySlugs } from '@/lib/company-profiles';
import { formatCompanyAge } from '@/lib/types';
import { CompanyProfilePage } from './company-profile-page';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCompanySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    return {
      title: 'Company Not Found | StartupDB',
    };
  }

  return {
    title: `${company.name} | StartupDB`,
    description: company.shortDescription,
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  return <CompanyProfilePage company={company} />;
}
