// Company profile types for the company detail page

export interface KeyPerson {
  name: string;
  title: string;
  linkedIn?: string;
}

export interface CompanyProfile {
  // Header (Identity & Immediate Context)
  slug: string;
  name: string;
  shortDescription: string;
  websiteUrl?: string;
  logoUrl?: string;

  // Overview (Expanded Understanding)
  longDescription: string;

  // Classification (Taxonomy & Positioning)
  tags: {
    industry: string;
    subIndustry: string;
    archetype: string;
    technology: string;
    subTechnology: string;
  };

  // Company Facts (Objective, Comparable Data)
  foundedYear: number;
  location: {
    city: string;
    state?: string;
    country: string;
  };
  fundingStatus: 'Bootstrapped' | 'Funded';

  // People (Accountability & Credibility)
  keyPeople: KeyPerson[];

  // Metadata (Trust & Freshness)
  lastUpdated: string; // ISO date string
}

// Helper to calculate company age
export function getCompanyAge(foundedYear: number): number {
  return new Date().getFullYear() - foundedYear;
}

// Helper to format company age as string
export function formatCompanyAge(foundedYear: number): string {
  const age = getCompanyAge(foundedYear);
  if (age === 0) return 'Founded this year';
  if (age === 1) return '1 year old';
  return `${age} years old`;
}

// Helper to create slug from company name
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
