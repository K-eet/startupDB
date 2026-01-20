import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CompanyProfile } from './types';

// Collection names
export const COLLECTIONS = {
  COMPANIES: 'companies',
  VC_FIRMS: 'vcFirms',
  EVENTS: 'events',
} as const;

// ============================================
// Company Operations
// ============================================

/**
 * Get a single company by slug
 */
export async function getCompany(slug: string): Promise<CompanyProfile | null> {
  const docRef = doc(db, COLLECTIONS.COMPANIES, slug);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data() as CompanyProfile;
}

/**
 * Get all companies
 */
export async function getAllCompanies(): Promise<CompanyProfile[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.COMPANIES));
  return querySnapshot.docs.map((doc) => doc.data() as CompanyProfile);
}

/**
 * Get companies with filters
 */
export async function getCompaniesWithFilters(filters: {
  industry?: string;
  archetype?: string;
  technology?: string;
  country?: string;
  fundingStatus?: 'Bootstrapped' | 'Funded';
  limitCount?: number;
}): Promise<CompanyProfile[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.industry) {
    constraints.push(where('tags.industry', '==', filters.industry));
  }
  if (filters.archetype) {
    constraints.push(where('tags.archetype', '==', filters.archetype));
  }
  if (filters.technology) {
    constraints.push(where('tags.technology', '==', filters.technology));
  }
  if (filters.country) {
    constraints.push(where('location.country', '==', filters.country));
  }
  if (filters.fundingStatus) {
    constraints.push(where('fundingStatus', '==', filters.fundingStatus));
  }
  if (filters.limitCount) {
    constraints.push(limit(filters.limitCount));
  }

  const q = query(collection(db, COLLECTIONS.COMPANIES), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => doc.data() as CompanyProfile);
}

/**
 * Create or update a company
 */
export async function saveCompany(company: CompanyProfile): Promise<void> {
  const docRef = doc(db, COLLECTIONS.COMPANIES, company.slug);
  await setDoc(docRef, {
    ...company,
    lastUpdated: new Date().toISOString(),
  });
}

/**
 * Update specific fields of a company
 */
export async function updateCompany(
  slug: string,
  updates: Partial<CompanyProfile>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.COMPANIES, slug);
  await updateDoc(docRef, {
    ...updates,
    lastUpdated: new Date().toISOString(),
  });
}

/**
 * Delete a company
 */
export async function deleteCompany(slug: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.COMPANIES, slug);
  await deleteDoc(docRef);
}

/**
 * Get all company slugs (for static generation)
 */
export async function getAllCompanySlugs(): Promise<string[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.COMPANIES));
  return querySnapshot.docs.map((doc) => doc.id);
}

// ============================================
// Seed Data Helper
// ============================================

/**
 * Seed companies from static data (useful for initial setup)
 */
export async function seedCompanies(companies: CompanyProfile[]): Promise<void> {
  const promises = companies.map((company) => saveCompany(company));
  await Promise.all(promises);
  console.log(`Seeded ${companies.length} companies to Firestore`);
}
