/**
 * Clear all companies from Firestore
 *
 * Usage:
 *   npx tsx scripts/clear-companies.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Initialize Firebase Admin with service account
if (getApps().length === 0) {
  const serviceAccountPath = path.resolve(__dirname, '../data/studio-7465988978-5ed5b-firebase-adminsdk-fbsvc-d8919e0dca.json');
  initializeApp({
    credential: cert(serviceAccountPath),
    projectId: 'studio-7465988978-5ed5b',
  });
}

const db = getFirestore();
const COLLECTION = 'companies';

async function clearCompanies(): Promise<void> {
  console.log('Fetching all companies from Firestore...');
  const snapshot = await db.collection(COLLECTION).get();

  if (snapshot.empty) {
    console.log('Collection is already empty.');
    return;
  }

  console.log(`Found ${snapshot.size} companies. Deleting...`);

  let batch = db.batch();
  let batchCount = 0;
  let totalDeleted = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    batchCount++;
    totalDeleted++;

    // Firestore batches have a limit of 500 operations
    if (batchCount === 500) {
      await batch.commit();
      console.log(`Deleted ${totalDeleted} companies...`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`Successfully deleted ${totalDeleted} companies from Firestore.`);
}

clearCompanies().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
