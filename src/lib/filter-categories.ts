// Hierarchical filter categories for the startup directory

export const industryCategories: Record<string, string[]> = {
  "B2B Software": ["Analytics", "Developer Tools", "Infrastructure", "Productivity", "Security"],
  "Consumer": ["E-commerce", "Entertainment", "Social", "Marketplace"],
  "Fintech": ["Banking", "Crypto", "Insurance", "Payments"],
  "Healthcare": ["Biotech", "Digital Health", "Medical Devices"],
  "AI/ML": ["Applied AI", "Foundation Models", "MLOps"],
  "Climate": ["Clean Energy", "Carbon Capture", "Sustainability"],
  "Hardware": ["Robotics", "IoT", "Semiconductors"],
};

export const technologyCategories: Record<string, string[]> = {
  "Cloud": ["AWS", "Azure", "GCP", "Multi-cloud"],
  "AI/ML": ["LLMs", "Computer Vision", "NLP"],
  "Data": ["Analytics", "Warehousing", "ETL"],
  "Mobile": ["iOS", "Android", "Cross-platform"],
};

export const archetypes = [
  "Product-Led Startup/Scaleup",
  "Tech Solution & Integration Provider",
  "Custom Software Developer",
  "Deep-Tech Company",
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
