'use client';

import { useState, useEffect } from 'react';
import type { Company } from '@/types/company';

interface UseAllCompaniesResult {
  companies: Company[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  total: number;
}

// Module-level cache — survives re-renders and navigation within the session
let companiesCache: Company[] | null = null;
let companiesFetchPromise: Promise<Company[]> | null = null;

// Fetch all companies for the directory's client-side filtering.
// Hits /api/companies (CDN-cached, slim directory fields, gzipped) over plain
// fetch — deliberately NO Firebase client SDK import, so the directory and admin
// list don't bundle Firestore. Full Firestore reads live in useCompany/useCompanies.
export function useAllCompanies(): UseAllCompaniesResult {
  const [companies, setCompanies] = useState<Company[]>(companiesCache ?? []);
  const [loading, setLoading] = useState(companiesCache === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companiesCache !== null) {
      setCompanies(companiesCache);
      setLoading(false);
      return;
    }

    if (!companiesFetchPromise) {
      companiesFetchPromise = fetch('/api/companies').then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch companies (HTTP ${res.status})`);
        }
        return (await res.json()) as Company[];
      });
    }

    setLoading(true);
    setError(null);

    companiesFetchPromise
      .then((docs) => {
        companiesCache = docs;
        setCompanies(docs);
      })
      .catch((err) => {
        console.error('Error fetching all companies:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
        companiesFetchPromise = null; // allow retry on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    companies,
    loading,
    error,
    hasMore: false,
    loadMore: async () => {},
    total: companies.length,
  };
}
