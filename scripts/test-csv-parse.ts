/**
 * Test CSV parsing without uploading to Firestore
 *
 * Usage:
 *   npx tsx scripts/test-csv-parse.ts <path-to-csv>
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CompanyProfile, KeyPerson, SocialMedia } from '../src/lib/types';

// Parse semicolon-separated values into array
function parseList(value: string | undefined): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(';').map((s) => s.trim()).filter(Boolean);
}

// Parse social media string into object
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
function parseFounders(names: string | undefined, titles: string | undefined): KeyPerson[] {
  if (!names || names.trim() === '') return [];

  const nameList = names.split(';').map((s) => s.trim()).filter(Boolean);
  const titleList = titles ? titles.split(';').map((s) => s.trim()).filter(Boolean) : [];

  return nameList.map((name, index) => {
    let title = '';
    const titleEntry = titleList[index] || '';

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

// Determine funding status
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

  const slug = row['Slug'] || row['Company Name']
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const company: CompanyProfile = {
    slug,
    companyId: row['Company ID'] || undefined,
    ssmRegistrationNumber: row['SSM Registration Number'] || undefined,
    name: row['Company Name'],
    legalName: row['Legal Name'] || undefined,
    shortDescription: row['Description']?.substring(0, 200) || '',
    websiteUrl: row['Website URL'] || undefined,
    logoUrl: row['Logo URL'] || undefined,
    longDescription: row['Description'] || '',
    tags: {
      industry: row['Primary Industry'] || 'Other',
      otherIndustries: parseList(row['Other Industries']),
      archetype: row['Company Type'] || 'Startup',
      technology: row['Primary Technology'] || 'Other',
      otherTechnologies: parseList(row['Other Technologies']),
      scienceTechnologies: parseList(row['Science Technologies']),
    },
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
    status: row['Status'] || 'Operational',
    exitType: row['Exit Type'] || undefined,
    growthStage: row['Growth Stage'] || undefined,
    companySize: row['Company Size'] || undefined,
    companyType: row['Company Type'] || undefined,
    fundingStatus: determineFundingStatus(totalFundsRaised, row['Latest Funding Round Type']),
    totalFundsRaised: totalFundsRaised || undefined,
    latestValuation: latestValuation || undefined,
    latestFundingRoundType: row['Latest Funding Round Type'] || undefined,
    lastFundingDate: row['Last Funding Date'] || undefined,
    investorCount: parseInt(row['Investor Count']) || undefined,
    openForFunding: row['Open for Funding']?.toLowerCase() === 'yes',
    openForInvestment: row['Open for Investment']?.toLowerCase() === 'yes',
    emailAddress: row['Email Address'] || undefined,
    phoneNumber: row['Phone Number'] || undefined,
    clientFocus: parseList(row['Client Focus']),
    ownership: row['Ownership'] || undefined,
    impactGoals: parseList(row['Impact Goals']),
    programsAccelerators: parseList(row['Programs/Accelerators']),
    keyPeople: parseFounders(row['Founder Names'], row['Founder Titles']),
    numberOfFounders: parseInt(row['Number of Founders']) || undefined,
    numberOfManagementTeam: parseInt(row['Number of Management Team']) || undefined,
    numberOfKeyPersons: parseInt(row['Number of Key Persons']) || undefined,
    socialMedia: parseSocialMedia(row['Social Media']),
    lastUpdated: new Date().toISOString(),
  };

  return company;
}

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

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/test-csv-parse.ts <path-to-csv>');
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
  console.log(`Found ${rows.length} rows\n`);

  console.log('Mapping to CompanyProfile...');
  const companies = rows.map(mapRowToCompany);

  // Show stats
  const industries = new Set(companies.map(c => c.tags.industry));
  const countries = new Set(companies.map(c => c.location.country));
  const fundedCount = companies.filter(c => c.fundingStatus === 'Funded').length;

  console.log('\n=== PARSING SUMMARY ===');
  console.log(`Total companies: ${companies.length}`);
  console.log(`Unique industries: ${industries.size}`);
  console.log(`Unique countries: ${countries.size}`);
  console.log(`Funded: ${fundedCount}`);
  console.log(`Bootstrapped: ${companies.length - fundedCount}`);

  console.log('\n=== SAMPLE COMPANIES ===');

  // Show first 3 companies
  for (let i = 0; i < Math.min(3, companies.length); i++) {
    const c = companies[i];
    console.log(`\n--- ${i + 1}. ${c.name} (${c.slug}) ---`);
    console.log(`Industry: ${c.tags.industry}`);
    console.log(`Technology: ${c.tags.technology}`);
    console.log(`Location: ${c.location.city}, ${c.location.country}`);
    console.log(`Founded: ${c.foundedYear}`);
    console.log(`Funding: ${c.fundingStatus}${c.latestValuation ? ` (Valuation: ${c.latestValuation.toLocaleString()})` : ''}`);
    console.log(`Founders: ${c.keyPeople.map(p => p.name).join(', ') || 'N/A'}`);
    console.log(`Description: ${c.shortDescription.substring(0, 100)}...`);
  }

  console.log('\n=== VALIDATION ===');

  // Check for issues
  const missingSlug = companies.filter(c => !c.slug);
  const missingName = companies.filter(c => !c.name);
  const duplicateSlugs = companies.filter((c, i, arr) => arr.findIndex(x => x.slug === c.slug) !== i);

  console.log(`Missing slug: ${missingSlug.length}`);
  console.log(`Missing name: ${missingName.length}`);
  console.log(`Duplicate slugs: ${duplicateSlugs.length}`);

  if (duplicateSlugs.length > 0) {
    console.log('\nDuplicate slug examples:');
    const seen = new Set<string>();
    for (const c of duplicateSlugs.slice(0, 5)) {
      if (!seen.has(c.slug)) {
        console.log(`  - "${c.slug}" (${c.name})`);
        seen.add(c.slug);
      }
    }
  }

  console.log('\n=== READY FOR UPLOAD ===');
  console.log('If everything looks good, run:');
  console.log(`  npm run upload-companies "${csvPath}"`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
