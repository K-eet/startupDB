/**
 * Upload companies from CSV/TSV to Firestore
 *
 * Usage:
 *   npx tsx scripts/upload-companies.ts <path-to-csv>
 *
 * Example:
 *   npx tsx scripts/upload-companies.ts ./data/companies.csv
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import type { CompanyProfile, KeyPerson, SocialMedia } from '../src/lib/types';

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

// Parse semicolon-separated values into array
function parseList(value: string | undefined): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(';').map((s) => s.trim()).filter(Boolean);
}

// Parse social media string into object
// Format: "Facebook: url; LinkedIn: url; Instagram: url"
function parseSocialMedia(value: string | undefined): SocialMedia | undefined {
  if (!value || value.trim() === '') return undefined;

  const social: SocialMedia = {};
  const entries = value.split(';').map((s) => s.trim()).filter(Boolean);

  for (const entry of entries) {
    const colonIndex = entry.indexOf(':');
    if (colonIndex === -1) continue;

    const platform = entry.substring(0, colonIndex).trim().toLowerCase();
    const url = entry.substring(colonIndex + 1).trim();

    if (platform.includes('facebook')) social.facebook = url;
    else if (platform.includes('instagram')) social.instagram = url;
    else if (platform.includes('linkedin')) social.linkedIn = url;
    else if (platform.includes('twitter') || platform.includes('x.com')) social.twitter = url;
    else if (platform.includes('appstore') || platform.includes('apple')) social.appStore = url;
    else if (platform.includes('playstore') || platform.includes('play.google')) social.playStore = url;
    else social[platform] = url;
  }

  return Object.keys(social).length > 0 ? social : undefined;
}

// Parse founders into KeyPerson array
// Format: "Name1; Name2" and "Name1 - Title; Name2 - Title"
function parseFounders(names: string | undefined, titles: string | undefined): KeyPerson[] {
  if (!names || names.trim() === '') return [];

  const nameList = names.split(';').map((s) => s.trim()).filter(Boolean);
  const titleList = titles ? titles.split(';').map((s) => s.trim()).filter(Boolean) : [];

  return nameList.map((name, index) => {
    let title = '';
    const titleEntry = titleList[index] || '';

    // Title format is usually "Name - Title" or just "Title"
    if (titleEntry.includes(' - ')) {
      title = titleEntry.split(' - ').slice(1).join(' - ').trim();
    } else {
      title = titleEntry;
    }

    return {
      name,
      title: title || 'Founder',
    };
  });
}

// Determine funding status from various fields
function determineFundingStatus(
  totalFundsRaised: number,
  latestRoundType: string | undefined
): 'Bootstrapped' | 'Funded' {
  if (totalFundsRaised > 0) return 'Funded';
  if (latestRoundType && latestRoundType.trim() !== '') return 'Funded';
  return 'Bootstrapped';
}

// Map CSV row to CompanyProfile
function mapRowToCompany(row: Record<string, string>): CompanyProfile {
  const totalFundsRaised = parseFloat(row['Total Funds Raised']) || 0;
  const latestValuation = parseFloat(row['Latest Valuation']) || 0;
  const foundedYear = parseInt(row['Founded Year']) || new Date().getFullYear();

  // Use slug from CSV or generate from name
  const slug = row['Slug'] || row['Company Name']
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const company: CompanyProfile = {
    // Identifiers
    slug,
    companyId: row['Company ID'] || undefined,
    ssmRegistrationNumber: row['SSM Registration Number'] || undefined,

    // Header
    name: row['Company Name'],
    legalName: row['Legal Name'] || undefined,
    shortDescription: row['Description']?.substring(0, 200) || '',
    websiteUrl: row['Website URL'] || undefined,
    logoUrl: row['Logo URL'] || undefined,

    // Overview
    longDescription: row['Description'] || '',

    // Classification
    tags: {
      industry: row['Primary Industry'] || 'Other',
      otherIndustries: parseList(row['Other Industries']),
      archetype: row['Company Type'] || 'Startup',
      technology: row['Primary Technology'] || 'Other',
      otherTechnologies: parseList(row['Other Technologies']),
      scienceTechnologies: parseList(row['Science Technologies']),
    },

    // Company Facts
    foundedYear,
    foundedDate: row['Founded Date'] || undefined,
    location: {
      city: row['Headquarters City'] || '',
      state: row['Headquarters State'] || undefined,
      country: row['Headquarters Country'] || '',
      fullAddress: row['Full Address'] || undefined,
      postcode: row['Postcode'] || undefined,
      latitude: parseFloat(row['Latitude']) || undefined,
      longitude: parseFloat(row['Longitude']) || undefined,
    },

    // Status & Stage
    status: row['Status'] || 'Operational',
    exitType: row['Exit Type'] || undefined,
    growthStage: row['Growth Stage'] || undefined,
    companySize: (row['Company Size'] || undefined) as CompanyProfile['companySize'],
    companyType: row['Company Type'] || undefined,

    // Funding
    fundingStatus: determineFundingStatus(totalFundsRaised, row['Latest Funding Round Type']),
    totalFundsRaised: totalFundsRaised || undefined,
    latestValuation: latestValuation || undefined,
    latestFundingRoundType: row['Latest Funding Round Type'] || undefined,
    lastFundingDate: row['Last Funding Date'] || undefined,
    investorCount: parseInt(row['Investor Count']) || undefined,
    openForFunding: row['Open for Funding']?.toLowerCase() === 'yes',
    openForInvestment: row['Open for Investment']?.toLowerCase() === 'yes',

    // Contact
    emailAddress: row['Email Address'] || undefined,
    phoneNumber: row['Phone Number'] || undefined,

    // Business Details
    clientFocus: parseList(row['Client Focus']),
    ownership: row['Ownership'] || undefined,
    impactGoals: parseList(row['Impact Goals']),
    programsAccelerators: parseList(row['Programs/Accelerators']),

    // People
    keyPeople: parseFounders(row['Founder Names'], row['Founder Titles']),
    numberOfFounders: parseInt(row['Number of Founders']) || undefined,
    numberOfManagementTeam: parseInt(row['Number of Management Team']) || undefined,
    numberOfKeyPersons: parseInt(row['Number of Key Persons']) || undefined,

    // Social Media
    socialMedia: parseSocialMedia(row['Social Media']),

    // Metadata
    lastUpdated: new Date().toISOString(),
  };

  return company;
}

// Parse CSV with proper handling of quoted fields
function parseCSV(content: string): Record<string, string>[] {
  // Normalize line endings
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
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
      } else if (char === ',') {
        // End of field
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        // End of line
        currentLine.push(currentField.trim());
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Don't forget the last field and line
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const headers = lines[0];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 1 && values[0] === '') continue; // Skip empty lines

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Upload companies to Firestore
async function uploadCompanies(companies: CompanyProfile[]): Promise<void> {
  let batch = db.batch();
  let batchCount = 0;
  let totalCount = 0;

  for (const company of companies) {
    const docRef = db.collection(COLLECTION).doc(company.slug);
    batch.set(docRef, company);
    batchCount++;
    totalCount++;

    // Firestore batches have a limit of 500 operations
    if (batchCount === 500) {
      await batch.commit();
      console.log(`Committed ${totalCount} companies...`);
      batch = db.batch(); // Create new batch
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    await batch.commit();
  }
  console.log(`Successfully uploaded ${companies.length} companies to Firestore`);
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/upload-companies.ts <path-to-csv>');
    console.error('Example: npx tsx scripts/upload-companies.ts ./data/companies.csv');
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

  console.log('Mapping to CompanyProfile...');
  const companies = rows.map(mapRowToCompany);

  console.log(`Uploading ${companies.length} companies to Firestore...`);
  await uploadCompanies(companies);

  console.log('Done!');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
