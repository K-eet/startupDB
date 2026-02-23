'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCompany } from '@/hooks/useCompanies';
import { CompanyEditForm } from '@/app/admin/components/company-edit-form';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyEditPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { company, loading, error } = useCompany(slug);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load company: {error}</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">Company not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold">Edit: {company['Company Name']}</h1>
      </div>
      <CompanyEditForm company={company} />
    </div>
  );
}
