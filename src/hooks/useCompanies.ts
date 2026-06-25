'use client';

import { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { Company } from '@/types/company';

const db = getFirestore(app);

const COLLECTION = 'companies';
const PAGE_SIZE = 20;

interface UseCompaniesResult {
  companies: Company[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  total: number;
}

interface UseCompanyResult {
  company: Company | null;
  loading: boolean;
  error: string | null;
}

export function useCompanies(): UseCompaniesResult {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Initial load
  useEffect(() => {
    async function fetchInitial() {
      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, COLLECTION),
          orderBy('Company Name'),
          limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc) => doc.data() as Company);

        setCompanies(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setTotal(docs.length);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    }

    fetchInitial();
  }, []);

  const loadMore = async () => {
    if (!lastDoc || !hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy('Company Name'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => doc.data() as Company);

      setCompanies((prev) => [...prev, ...docs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setTotal((prev) => prev + docs.length);
    } catch (err) {
      console.error('Error loading more companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more companies');
    } finally {
      setLoading(false);
    }
  };

  return { companies, loading, error, hasMore, loadMore, total };
}

export function useCompany(slug: string): UseCompanyResult {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompany() {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, COLLECTION),
          where('Slug', '==', slug),
          limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setCompany(null);
        } else {
          setCompany(snapshot.docs[0].data() as Company);
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch company');
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [slug]);

  return { company, loading, error };
}
