export interface Company {
  StartupDB_ID: string;
  'Company Name': string;
  Industry: string;
  'Sub-Industry': string;
  'Company Type': string;
  Technology: string;
  'Sub-Technology': string | string[];
  'One-line company description': string;
  Description: string;
  'Founded Year': number;
  'Headquarters City': string;
  'Headquarters State': string;
  'Headquarters Country': string;
  'Company Size': string;
  'Founder Names': string | string[];
  'Founder Titles': string | string[];
  'Website URL': string;
  Slug: string;
  'Primary Technology'?: string;
  // Array fields (semicolon-separated in CSV)
  'Other Industries'?: string[];
  'Other Technologies'?: string[];
  'Science Technologies'?: string[];
  'Programs/Accelerators'?: string[];
  'Client Focus'?: string[];
  'Impact Goals'?: string[];
  'Management Team'?: string[];
  'AI Confidence'?: string;
  'AI Reasoning'?: string;
  'AI Model'?: string;
  // Directory visibility. Absent on legacy docs (treated as published); false = hidden draft
  // (user-submitted, awaiting enrichment). See /api/companies filter and the admin edit form.
  published?: boolean;
  userSubmitted?: boolean;
  // ISO timestamps. createdAt set on creation; updatedAt bumped on each admin save.
  createdAt?: string;
  updatedAt?: string;
}

// Helper to normalize a field that might be a string or array
export function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(';').map((s) => s.trim()).filter(Boolean);
}

// Helper to calculate company age
export function calculateCompanyAge(foundedYear: number | undefined): string {
  if (!foundedYear) return 'N/A';
  const currentYear = new Date().getFullYear();
  const age = currentYear - foundedYear;
  if (age < 1) return 'Less than 1 year';
  if (age === 1) return '1 year';
  return `${age} years`;
}

// Helper to parse founder names and titles into pairs
// Supports both comma and semicolon separators, and array inputs
export function parseFounders(
  names: string | string[] | undefined,
  titles: string | string[] | undefined
): { name: string; title: string }[] {
  if (!names) return [];

  // Handle array or string input
  const nameList = Array.isArray(names)
    ? names
    : names.split(/[,;]/).map((n) => n.trim()).filter(Boolean);

  const titleList = !titles
    ? []
    : Array.isArray(titles)
      ? titles
      : titles.split(/[,;]/).map((t) => t.trim());

  return nameList.map((name, index) => ({
    name,
    title: titleList[index] || 'Founder',
  }));
}
