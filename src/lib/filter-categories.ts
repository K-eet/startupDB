// Hierarchical filter categories for the startup directory
// Using Y Combinator's classification system

export const industryCategories: Record<string, string[]> = {
  "B2B": [
    "Analytics",
    "Engineering, Product and Design",
    "Finance and Accounting",
    "Human Resources",
    "Infrastructure",
    "Legal",
    "Marketing",
    "Office Management",
    "Operations",
    "Productivity",
    "Recruiting and Talent",
    "Retail",
    "Sales",
    "Security",
    "Supply Chain and Logistics",
  ],
  "Consumer": [
    "Apparel and Cosmetics",
    "Consumer Electronics",
    "Content",
    "Food and Beverage",
    "Gaming",
    "Home and Personal",
    "Job and Career Services",
    "Social",
    "Transportation Services",
    "Travel, Leisure and Tourism",
    "Virtual and Augmented Reality",
  ],
  "Fintech": [
    "Asset Management",
    "Banking and Exchange",
    "Consumer Finance",
    "Credit and Lending",
    "Insurance",
    "Payments",
  ],
  "Healthcare": [
    "Consumer Health and Wellness",
    "Diagnostics",
    "Drug Discovery and Delivery",
    "Healthcare IT",
    "Healthcare Services",
    "Industrial Bio",
    "Medical Devices",
    "Therapeutics",
  ],
  "Education": [],
  "Industrials": [
    "Agriculture",
    "Automotive",
    "Aviation and Space",
    "Climate",
    "Defense",
    "Drones",
    "Energy",
    "Manufacturing and Robotics",
  ],
  "Real Estate and Construction": [
    "Construction",
    "Housing and Real Estate",
  ],
};

export const technologyCategories: Record<string, string[]> = {
  "Cloud": ["AWS", "Azure", "GCP", "Multi-cloud"],
  "AI/ML": ["LLMs", "Computer Vision", "NLP"],
  "Data": ["Analytics", "Warehousing", "ETL"],
  "Mobile": ["iOS", "Android", "Cross-platform"],
};

export const archetypes = [
  "Product-Led Startup/Scaleup",
  "Solution Provider/System Integrator",
  "Custom Software Developer",
  "ICT Partner & Reseller",
] as const;

export type Archetype = typeof archetypes[number];

export const locationCategories: Record<string, string[]> = {
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
