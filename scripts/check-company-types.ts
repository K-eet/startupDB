import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

if (getApps().length === 0) {
  initializeApp({
    credential: cert(path.resolve(__dirname, '../data/studio-7465988978-5ed5b-firebase-adminsdk-fbsvc-d8919e0dca.json')),
    projectId: 'studio-7465988978-5ed5b',
  });
}

const db = getFirestore();
const canonical = new Set([
  'Product-Led Startup/Scaleup',
  'Solution Provider / Systems Integrator',
  'Custom Software Developer',
  'ICT Partner & Reseller',
]);

async function main() {
  const snap = await db.collection('companies').get();
  const bad: { name: string; type: string; slug: string }[] = [];

  snap.forEach(doc => {
    const data = doc.data();
    const ct = (data['Company Type'] || '').trim();
    if (!canonical.has(ct)) {
      bad.push({ name: data['Company Name'], type: ct, slug: data['Slug'] });
    }
  });

  if (bad.length === 0) {
    console.log('All clean in Firestore.');
  } else {
    console.log(`${bad.length} companies with non-canonical Company Type:`);
    const grouped: Record<string, string[]> = {};
    for (const { name, type, slug } of bad) {
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(`${name} (${slug})`);
    }
    for (const [type, names] of Object.entries(grouped).sort()) {
      console.log(`\n  "${type}"  (${names.length})`);
      names.sort().forEach(n => console.log(`    - ${n}`));
    }
  }
}

main().catch(console.error);
