import type { IntelligentStartupSearchOutput } from "@/ai/flows/intelligent-startup-search";
import type { IntelligentVCSearchOutput } from "@/ai/flows/intelligent-vc-search";

export const initialStartups: IntelligentStartupSearchOutput = [
    {
        name: "InnovateAI",
        industry: "Artificial Intelligence",
        stage: "Seed",
        location: "San Francisco, CA",
        description: "Developing next-generation AI-powered tools for enterprise automation."
    },
    {
        name: "HealthSphere",
        industry: "Healthcare",
        stage: "Series A",
        location: "Boston, MA",
        description: "A platform for personalized remote patient monitoring and telehealth services."
    },
    {
        name: "FinTechBlocks",
        industry: "FinTech",
        stage: "Series B",
        location: "New York, NY",
        description: "Building blockchain-based solutions for secure and transparent financial transactions."
    },
    {
        name: "EcoSolutions",
        industry: "CleanTech",
        stage: "Seed",
        location: "Berlin, Germany",
        description: "Creating sustainable alternatives to single-use plastics through bio-engineering."
    }
];

export const initialVCFirms: IntelligentVCSearchOutput = [
    {
        name: "Future Ventures",
        investmentFocus: "Early-stage deep tech and frontier technology, including AI, robotics, and synthetic biology.",
        contactDetails: "contact@futureventures.com"
    },
    {
        name: "Growth Equity Partners",
        investmentFocus: "Growth-stage SaaS and enterprise software companies with proven traction and revenue.",
        contactDetails: "info@growthequity.vc"
    },
    {
        name: "BioHealth Innovators",
        investmentFocus: "Seed and Series A investments in biotechnology, medical devices, and digital health startups.",
        contactDetails: "partners@biohealthinnovators.io"
    },
    {
        name: "Consumer Growth Fund",
        investmentFocus: "Focuses on disruptive direct-to-consumer (D2C) brands and consumer technology platforms.",
        contactDetails: "deals@consumergrowth.com"
    }
];
