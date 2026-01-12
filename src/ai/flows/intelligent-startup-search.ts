'use server';

/**
 * @fileOverview This file implements the intelligent startup search flow using Genkit.
 *
 * - intelligentStartupSearch - The function to perform the intelligent startup search.
 * - IntelligentStartupSearchInput - The input type for the intelligentStartupSearch function.
 * - StartupSearchResult - The type of each search result.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentStartupSearchInputSchema = z.object({
  keywords: z
    .string()
    .describe('Keywords describing the desired startup characteristics.'),
});
export type IntelligentStartupSearchInput = z.infer<typeof IntelligentStartupSearchInputSchema>;

const StartupSearchResultSchema = z.object({
  name: z.string().describe('The name of the startup.'),
  description: z.string().describe('A brief description of the startup.'),
  industry: z.string().describe('The parent industry category (e.g., B2B Software, Fintech).'),
  subIndustry: z.string().describe('The sub-industry within the parent category.'),
  technology: z.string().describe('The primary technology category.'),
  subTechnology: z.string().describe('The sub-technology within the parent category.'),
  archetype: z.string().describe('The startup archetype (e.g., Product-Led Startup/Scaleup, Deep-Tech Company).'),
  country: z.string().describe('The country where the startup is headquartered.'),
  city: z.string().describe('The city where the startup is headquartered.'),
});
export type StartupSearchResult = z.infer<typeof StartupSearchResultSchema>;

const IntelligentStartupSearchOutputSchema = z.array(StartupSearchResultSchema);
export type IntelligentStartupSearchOutput = z.infer<typeof IntelligentStartupSearchOutputSchema>;

export async function intelligentStartupSearch(input: IntelligentStartupSearchInput): Promise<IntelligentStartupSearchOutput> {
  return intelligentStartupSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentStartupSearchPrompt',
  input: {schema: IntelligentStartupSearchInputSchema},
  output: {schema: IntelligentStartupSearchOutputSchema},
  prompt: `You are an AI assistant specializing in searching for startups based on user-provided keywords.

  Given the following keywords, search for relevant startups and return a list of startups that match the user's intent, even if the keywords don't exactly match the startup's listed information.

  Keywords: {{{keywords}}}

  Return the results in a JSON array of StartupSearchResult objects.
  Each object must contain: name, description, industry, subIndustry, technology, subTechnology, archetype, country, city.
  Example:
  [
    {
      "name": "Acme Corp",
      "description": "A software startup focused on AI-powered analytics.",
      "industry": "B2B Software",
      "subIndustry": "Analytics",
      "technology": "AI/ML",
      "subTechnology": "LLMs",
      "archetype": "Product-Led Startup/Scaleup",
      "country": "United States",
      "city": "San Francisco"
    }
  ]
  `,
});

const intelligentStartupSearchFlow = ai.defineFlow(
  {
    name: 'intelligentStartupSearchFlow',
    inputSchema: IntelligentStartupSearchInputSchema,
    outputSchema: IntelligentStartupSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
