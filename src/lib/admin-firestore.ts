import { collection, query, where, limit, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Company } from '@/types/company';

/**
 * Update specific fields of a company using legacy field names.
 * Queries by Slug field to find the correct document.
 */
export async function updateCompanyFields(
  slug: string,
  updates: Partial<Company>
): Promise<void> {
  const q = query(
    collection(db, 'companies'),
    where('Slug', '==', slug),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(`Company with slug "${slug}" not found`);
  }

  await updateDoc(snapshot.docs[0].ref, updates);
}
