// Company profile types for the company detail page

export interface KeyPerson {
  name: string;
  title: string;
  linkedIn?: string;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  twitter?: string;
  appStore?: string;
  playStore?: string;
  [key: string]: string | undefined;
}

export interface CompanyProfile {
  // Identifiers
  slug: string;
  companyId?: string;
  ssmRegistrationNumber?: string;

  // Header (Identity & Immediate Context)
  name: string;
  legalName?: string;
  shortDescription: string;
  websiteUrl?: string;
  logoUrl?: string;

  // Overview (Expanded Understanding)
  longDescription: string;

  // Classification (Taxonomy & Positioning)
  tags: {
    industry: string;
    subIndustry?: string;
    otherIndustries?: string[];
    archetype: string;
    technology: string;
    subTechnology?: string;
    otherTechnologies?: string[];
    scienceTechnologies?: string[];
  };

  // Company Facts (Objective, Comparable Data)
  foundedYear: number;
  foundedDate?: string;
  location: {
    city: string;
    state?: string;
    country: string;
    fullAddress?: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
  };

  // Status & Stage
  status: 'Operational' | 'Closed' | 'Acquired' | string;
  exitType?: string;
  growthStage?: string;
  companySize?: '1-50' | '51-100' | '101-500' | '>500';
  companyType?: string;

  // Funding Information
  fundingStatus: 'Bootstrapped' | 'Funded';
  totalFundsRaised?: number;
  latestValuation?: number;
  latestFundingRoundType?: string;
  lastFundingDate?: string;
  investorCount?: number;
  openForFunding?: boolean;
  openForInvestment?: boolean;

  // Contact Information
  emailAddress?: string;
  phoneNumber?: string;

  // Business Details
  clientFocus?: string[];
  ownership?: string;
  impactGoals?: string[];
  programsAccelerators?: string[];

  // People (Accountability & Credibility)
  keyPeople: KeyPerson[];
  numberOfFounders?: number;
  numberOfManagementTeam?: number;
  numberOfKeyPersons?: number;

  // Social Media
  socialMedia?: SocialMedia;

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
