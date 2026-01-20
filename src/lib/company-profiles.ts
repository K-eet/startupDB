import { CompanyProfile, createSlug } from './types';

// Sample company profiles with placeholder data
export const companyProfiles: CompanyProfile[] = [
  {
    slug: 'datapulse',
    name: 'DataPulse',
    shortDescription: 'Real-time business intelligence platform with automated insights and predictive analytics for enterprise decision-making.',
    websiteUrl: 'https://datapulse.example.com',
    longDescription: `DataPulse is revolutionizing how enterprises make data-driven decisions. Our platform combines real-time data processing with advanced machine learning algorithms to deliver actionable insights the moment they matter.

Built for scale, DataPulse processes billions of data points daily, transforming raw information into strategic intelligence. Our proprietary AI engine identifies patterns, anomalies, and opportunities that human analysts might miss, enabling businesses to stay ahead of market trends and competitive pressures.

From Fortune 500 companies to high-growth startups, organizations trust DataPulse to power their most critical business decisions. Our platform integrates seamlessly with existing data infrastructure, providing value from day one without disrupting established workflows.`,
    tags: {
      industry: 'B2B',
      subIndustry: 'Analytics',
      archetype: 'Product-Led Startup/Scaleup',
      technology: 'AI/ML',
      subTechnology: 'LLMs',
    },
    foundedYear: 2019,
    location: {
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
    },
    fundingStatus: 'Funded',
    keyPeople: [
      {
        name: 'Sarah Chen',
        title: 'Co-Founder & CEO',
        linkedIn: 'https://linkedin.com/in/sarahchen',
      },
      {
        name: 'Michael Torres',
        title: 'Co-Founder & CTO',
        linkedIn: 'https://linkedin.com/in/michaeltorres',
      },
      {
        name: 'Emily Nakamura',
        title: 'VP of Engineering',
      },
    ],
    lastUpdated: '2026-01-15',
  },
  {
    slug: 'codeforge',
    name: 'CodeForge',
    shortDescription: 'AI-powered code generation and review platform that accelerates software development workflows.',
    websiteUrl: 'https://codeforge.example.com',
    longDescription: `CodeForge is redefining software development with AI-powered code generation and automated code review. Our platform understands your codebase, coding standards, and best practices to generate production-ready code that feels like it was written by your best engineers.

Our intelligent code review system catches bugs, security vulnerabilities, and performance issues before they reach production. By integrating directly into your development workflow, CodeForge reduces review cycles from days to minutes while maintaining the highest quality standards.

Trusted by engineering teams at leading technology companies, CodeForge has helped developers ship 40% faster while reducing bugs by 60%. Our platform supports all major programming languages and frameworks, making it the universal tool for modern software development.`,
    tags: {
      industry: 'B2B',
      subIndustry: 'Engineering, Product and Design',
      archetype: 'Product-Led Startup/Scaleup',
      technology: 'AI/ML',
      subTechnology: 'LLMs',
    },
    foundedYear: 2021,
    location: {
      city: 'Austin',
      state: 'Texas',
      country: 'United States',
    },
    fundingStatus: 'Funded',
    keyPeople: [
      {
        name: 'James Rodriguez',
        title: 'Founder & CEO',
        linkedIn: 'https://linkedin.com/in/jamesrodriguez',
      },
      {
        name: 'Priya Sharma',
        title: 'Co-Founder & CTO',
        linkedIn: 'https://linkedin.com/in/priyasharma',
      },
    ],
    lastUpdated: '2026-01-10',
  },
  {
    slug: 'neobank',
    name: 'NeoBank',
    shortDescription: 'Digital-first banking platform offering personalized financial services for underbanked populations.',
    websiteUrl: 'https://neobank.example.com',
    longDescription: `NeoBank is on a mission to democratize financial services for the billions of people worldwide who lack access to traditional banking. Our mobile-first platform provides a full suite of banking services—accounts, payments, savings, and credit—designed specifically for underbanked communities.

Using alternative data and machine learning, we assess creditworthiness beyond traditional credit scores, opening doors for individuals who have been excluded from the financial system. Our partnerships with local merchants and money transfer services ensure that our customers can access their money wherever they need it.

With over 5 million customers across 15 countries, NeoBank is proving that financial inclusion and profitability can go hand in hand. We're building the infrastructure for a more equitable financial future.`,
    tags: {
      industry: 'Fintech',
      subIndustry: 'Banking and Exchange',
      archetype: 'Product-Led Startup/Scaleup',
      technology: 'Cloud',
      subTechnology: 'AWS',
    },
    foundedYear: 2018,
    location: {
      city: 'London',
      country: 'United Kingdom',
    },
    fundingStatus: 'Funded',
    keyPeople: [
      {
        name: 'David Okonkwo',
        title: 'Founder & CEO',
        linkedIn: 'https://linkedin.com/in/davidokonkwo',
      },
      {
        name: 'Anna Petrova',
        title: 'COO',
        linkedIn: 'https://linkedin.com/in/annapetrova',
      },
      {
        name: 'Raj Patel',
        title: 'CTO',
        linkedIn: 'https://linkedin.com/in/rajpatel',
      },
    ],
    lastUpdated: '2026-01-12',
  },
];

// Helper function to get company by slug
export function getCompanyBySlug(slug: string): CompanyProfile | undefined {
  return companyProfiles.find((company) => company.slug === slug);
}

// Helper function to get all company slugs (for static generation)
export function getAllCompanySlugs(): string[] {
  return companyProfiles.map((company) => company.slug);
}
