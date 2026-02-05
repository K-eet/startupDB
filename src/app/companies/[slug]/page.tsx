'use client';

import { useParams } from 'next/navigation';
import { useCompany } from '@/hooks/useCompanies';
import { CompanyProfilePage } from './company-profile-page';
import { Loader2 } from 'lucide-react';

export default function CompanyPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { company, loading, error } = useCompany(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
          <p className="text-muted-foreground">The company you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return <CompanyProfilePage company={company} />;
}
