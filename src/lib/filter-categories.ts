// Hierarchical filter categories for the startup directory
// Using Y Combinator's classification system

export const industryCategories: Record<string, string[]> = {
  "B2B": [
    "Analytics",
    "Commerce & Marketplaces",
    "Engineering & Product Tools",
    "Finance & Accounting",
    "Human Resources",
    "Infrastructure",
    "Legal",
    "Marketing",
    "Office Management",
    "Operations",
    "Productivity",
    "Recruiting & Talent",
    "Retail Technology",
    "Sales",
    "Security",
    "Supply Chain & Logistics",
  ],
  "Consumer": [
    "Apparel & Cosmetics",
    "Consumer Electronics",
    "Content & Media",
    "Food & Beverage",
    "Gaming",
    "Home & Personal",
    "Immersive Media (VR/AR)",
    "Retail & Commerce",
    "Social Platforms",
    "Transportation Services",
    "Travel, Leisure & Tourism",
    "Work & Careers",
  ],
  "FinTech": [
    "Asset Management",
    "Banking & Capital Markets",
    "Consumer Finance",
    "Credit & Lending",
    "Insurance",
    "Payments",
  ],
  "Healthcare": [
    "Biotechnology",
    "Consumer Health & Wellness",
    "Diagnostics",
    "Drug Discovery & Delivery",
    "Healthcare IT",
    "Healthcare Services",
    "Medical Devices",
    "Therapeutics",
  ],
  "Education": [
    "Assessment & Credentialing",
    "EdTech Platforms",
    "Education Services & Content",
    "Learning Management Systems",
    "Workforce & Skills Training",
  ],
  "Industrials": [
    "Agriculture",
    "Automotive & Mobility",
    "Aviation & Autonomous Systems",
    "Climate & Environmental Technologies",
    "Defense",
    "Energy",
    "Manufacturing & Robotics",
  ],
  "Real Estate & Construction": [
    "Building Materials & Systems",
    "Construction Technology",
    "Property Management & Operations",
    "Real Estate Platforms & Marketplaces",
    "Smart Buildings & Facilities",
  ],
  "GovTech": [
    "Civic Engagement & Services",
    "Digital Government Platforms",
    "Public Safety & Security",
    "Regulatory & Compliance Systems",
    "Smart Cities & Urban Tech",
  ],
  "General Technology": [
    "Developer Tools",
    "Emerging Technology",
    "Platforms & Infrastructure",
  ],
};

export const technologyCategories: Record<string, string[]> = {
  "Artificial Intelligence": [],
  "Biotechnology": [],
  "Blockchain": [],
  "Development Tool": [],
  "e-Commerce": [],
  "e-payment": [],
  "Fintech Lending": [],
  "Healthtech": [],
  "Hrtech": [],
  "Robotics": [],
  "Sharing Economy/Consumer": [],
};

export const archetypes = [
  "Product-Led Startup / Scaleup",
  "Solution Provider / Systems Integrator",
  "Custom Software Developer",
  "ICT Partner & Reseller",
] as const;

export type Archetype = typeof archetypes[number];

export const locationCategories: Record<string, string[]> = {
  "Malaysia": [
    "Kuala Lumpur",
    "KUALA LUMPUR",
    "PETALING JAYA",
    "Petaling Jaya",
    "CYBERJAYA",
    "Subang Jaya",
    "SHAH ALAM",
    "SERDANG",
    "SERI KEMBANGAN",
    "BAYAN LEPAS",
  ],
  "United States": ["San Francisco", "New York", "Austin", "Boston", "Seattle", "Los Angeles", "Miami", "Denver"],
  "Germany": ["Berlin", "Munich", "Hamburg"],
  "United Kingdom": ["London", "Cambridge", "Manchester"],
  "Israel": ["Tel Aviv", "Jerusalem"],
  "Singapore": ["Singapore"],
  "Canada": ["Toronto", "Vancouver"],
  "Netherlands": ["Amsterdam", "Rotterdam"],
  "France": ["Paris", "Lyon"],
  "Japan": ["Tokyo", "Osaka"],
  "Australia": ["Sydney", "Melbourne"],
  "India": ["Bangalore", "Mumbai"],
  "Sweden": ["Stockholm", "Gothenburg"],
  "South Korea": ["Seoul"],
  "Ireland": ["Dublin"],
};

// Helper to get all industries
export const getAllIndustries = () => Object.keys(industryCategories);

// Helper to get all sub-industries
export const getAllSubIndustries = () => Object.values(industryCategories).flat();

// Helper to get all technologies
export const getAllTechnologies = () => Object.keys(technologyCategories);

// Helper to get all sub-technologies
export const getAllSubTechnologies = () => Object.values(technologyCategories).flat();

// Helper to get all countries
export const getAllCountries = () => Object.keys(locationCategories);

// Helper to get all cities
export const getAllCities = () => Object.values(locationCategories).flat();
