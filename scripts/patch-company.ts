/**
 * Patch a single company document in Firestore by Slug.
 *
 * Usage:
 *   npx tsx scripts/patch-company.ts <slug> <field> <value>
 *
 * Example:
 *   npx tsx scripts/patch-company.ts select-tv-solutions "Sub-Industry" "Infrastructure"
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

if (getApps().length === 0) {
  const serviceAccountPath = path.resolve(__dirname, '../data/studio-7465988978-5ed5b-firebase-adminsdk-fbsvc-d8919e0dca.json');
  initializeApp({
    credential: cert(serviceAccountPath),
    projectId: 'studio-7465988978-5ed5b',
  });
}

const db = getFirestore();

async function main() {
  const [slug, field, value] = process.argv.slice(2);

  if (!slug || !field || value === undefined) {
    console.error('Usage: npx tsx scripts/patch-company.ts <slug> <field> <value>');
    process.exit(1);
  }

  // Query by Slug field (doc ID may not match slug)
  const snapshot = await db.collection('companies').where('Slug', '==', slug).limit(1).get();

  if (snapshot.empty) {
    console.error(`No company found with Slug = "${slug}"`);
    process.exit(1);
  }

  const doc = snapshot.docs[0];
  const before = doc.data()[field];
  await doc.ref.update({ [field]: value });

  console.log(`Updated "${slug}"`);
  console.log(`  ${field}: ${JSON.stringify(before)} → ${JSON.stringify(value)}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
