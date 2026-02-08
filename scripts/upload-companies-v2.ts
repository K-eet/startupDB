/**
 * Upload companies from CSV to Firestore (V2 - matches new schema)
 *
 * This script uploads CSV data with field names matching the Company interface.
 *
 * Usage:
 *   npx tsx scripts/upload-companies-v2.ts <path-to-csv>
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
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
db.settings({ ignoreUndefinedProperties: true });
const COLLECTION = 'companies';

// Parse CSV with proper handling of quoted fields
function parseCSV(content: string): Record<string, string>[] {
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const rows: Record<string, string>[] = [];
  const lines: string[][] = [];

  let currentLine: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentLine.push(currentField.trim());
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const headers = lines[0];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 1 && values[0] === '') continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Parse semicolon-separated values into array
function parseList(value: string | undefined): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(';').map((s) => s.trim()).filter(Boolean);
}

// Map CSV row to Company document (using exact field names)
function mapRowToCompany(row: Record<string, string>): Record<string, unknown> {
  // Generate slug from Company Name if not provided
  const slug = row['Slug'] || row['Company Name']
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || '';

  // Parse Founded Year as number
  const foundedYear = parseInt(row['Founded Year']) || undefined;

  // Parse semicolon-separated fields into arrays
  const subTechnology = parseList(row['Sub-Technology']);
  const otherIndustries = parseList(row['Other Industries']);
  const otherTechnologies = parseList(row['Other Technologies']);
  const scienceTechnologies = parseList(row['Science Technologies']);
  const programsAccelerators = parseList(row['Programs/Accelerators']);
  const founderNames = parseList(row['Founder Names']);
  const founderTitles = parseList(row['Founder Titles']);
  const managementTeam = parseList(row['Management Team']);
  const clientFocus = parseList(row['Client Focus']);
  const impactGoals = parseList(row['Impact Goals']);

  // Helper to return single value as string, multiple as array
  const toFieldValue = (arr: string[]) => {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    return arr;
  };

  return {
    // Keep exact field names from CSV to match Company interface
    'StartupDB_ID': row['StartupDB_ID'] || '',
    'Company Name': row['Company Name'] || '',
    'Industry': row['Industry'] || '',
    'Sub-Industry': row['Sub-Industry'] || '',
    'Company Type': row['Company Type'] || '',
    'Technology': row['Technology'] || '',
    'Sub-Technology': toFieldValue(subTechnology),
    'One-line company description': row['One-line company description'] || '',
    'Description': row['Company Overview'] || row['Description'] || '',
    'Founded Year': foundedYear,
    'Headquarters City': row['Headquarters City'] || '',
    'Headquarters State': row['Headquarters State'] || '',
    'Headquarters Country': row['Headquarters Country'] || '',
    'Company Size': row['Company Size'] || '',
    'Founder Names': toFieldValue(founderNames),
    'Founder Titles': toFieldValue(founderTitles),
    'Website URL': row['Website URL'] || '',
    'Slug': slug,

    // Additional fields that might be useful
    'Status': row['Status'] || 'Operational',
    'Growth Stage': row['Growth Stage'] || '',
    'Email Address': row['Email Address'] || '',
    'Phone Number': row['Phone Number'] || '',
    'Logo URL': row['Logo URL'] || '',
    'Company ID': row['Company ID'] || '',
    'SSM Reg Number': row['SSM Reg Number'] || '',
    'Founded Date': row['Founded Date'] || '',
    'Legal Name': row['Legal Name'] || '',
    'Full Address': row['Full Address'] || '',
    'Postcode': row['Postcode'] || '',
    'Programs/Accelerators': programsAccelerators,
    'Other Industries': otherIndustries,
    'Other Technologies': otherTechnologies,
    'Science Technologies': scienceTechnologies,
    'Management Team': managementTeam,
    'Client Focus': clientFocus,
    'Impact Goals': impactGoals,
    'Social Media': row['Social Media'] || '',

    // Enriched fields
    'Latitude': parseFloat(row['Latitude']) || undefined,
    'Longitude': parseFloat(row['Longitude']) || undefined,
    'Total Funds Raised': parseFloat(row['Total Funds Raised']) || 0,
    'Latest Valuation': parseFloat(row['Latest Valuation']) || 0,
    'Latest Funding Round Type': row['Latest Funding Round Type'] || '',
    'Last Funding Date': row['Last Funding Date'] || '',
    'Investor Count': parseInt(row['Investor Count']) || 0,
    'Open for Funding': row['Open for Funding'] === 'Yes',
    'Open for Investment': row['Open for Investment'] === 'Yes',
    'Exit Type': row['Exit Type'] || '',
    'Ownership': row['Ownership'] || '',
    'Number of Founders': parseInt(row['Number of Founders']) || 0,
    'Number of Management Team': parseInt(row['Number of Management Team']) || 0,
    'Number of Key Persons': parseInt(row['Number of Key Persons']) || 0,
    'Verified Status': row['Verified Status'] || '',
    'Stealth Status': row['Stealth Status'] || '',
    'Primary Industry': row['Primary Industry'] || '',
    'Primary Technology': row['Primary Technology'] || '',
  };
}

// Upload companies to Firestore
async function uploadCompanies(companies: Record<string, unknown>[]): Promise<void> {
  let batch = db.batch();
  let batchCount = 0;
  let totalCount = 0;

  for (const company of companies) {
    const slug = company['Slug'] as string;
    if (!slug) {
      console.warn(`Skipping company without slug: ${company['Company Name']}`);
      continue;
    }

    const docRef = db.collection(COLLECTION).doc(slug);
    batch.set(docRef, company);
    batchCount++;
    totalCount++;

    if (batchCount === 500) {
      await batch.commit();
      console.log(`Committed ${totalCount} companies...`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
  console.log(`Successfully uploaded ${totalCount} companies to Firestore`);
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/upload-companies-v2.ts <path-to-csv>');
    process.exit(1);
  }

  const csvPath = path.resolve(args[0]);

  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf-8');

  console.log('Parsing CSV...');
  const rows = parseCSV(content);
  console.log(`Found ${rows.length} rows`);

  console.log('Mapping to Company documents...');
  const companies = rows.map(mapRowToCompany);

  // Log first company for verification
  if (companies.length > 0) {
    console.log('\nFirst company preview:');
    console.log(JSON.stringify(companies[0], null, 2));
    console.log('');
  }

  console.log(`Uploading ${companies.length} companies to Firestore...`);
  await uploadCompanies(companies);

  console.log('Done!');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
