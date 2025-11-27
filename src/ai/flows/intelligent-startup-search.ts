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
  industry: z.string().describe('The industry the startup operates in.'),
  stage: z.string().describe('The current stage of the startup (e.g., seed, series A).'),
  location: z.string().describe('The location of the startup headquarters.'),
  description: z.string().describe('A brief description of the startup.'),
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
  Each object must contain the name, industry, stage, location and description of the startup.
  Example:
  [
    {
      "name": "Acme Corp",
      "industry": "Software",
      "stage": "Series A",
      "location": "San Francisco, CA",
      "description": "A software startup focused on AI."
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
