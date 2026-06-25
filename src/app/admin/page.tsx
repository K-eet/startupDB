'use client';

import { useAllCompanies } from '@/hooks/useAllCompanies';
import { CompanyList } from './components/company-list';

export default function AdminPage() {
  const { companies, loading, error } = useAllCompanies();

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load companies: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Companies</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground">{companies.length} companies total</p>
          )}
        </div>
      </div>
      <CompanyList companies={companies} loading={loading} />
    </div>
  );
}
