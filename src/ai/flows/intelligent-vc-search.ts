'use server';

/**
 * @fileOverview Implements an AI-powered search for venture capital firms based on keywords related to their investment focus.
 *
 * - intelligentVCSearch - A function that takes search keywords and returns a list of relevant VC firms.
 * - IntelligentVCSearchInput - The input type for the intelligentVCSearch function.
 * - IntelligentVCSearchOutput - The return type for the intelligentVCSearch function, representing a list of VC firms.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentVCSearchInputSchema = z.object({
  keywords: z
    .string()
    .describe(
      'Keywords describing the desired investment focus, industry, or area of expertise of the venture capital firm.'
    ),
});
export type IntelligentVCSearchInput = z.infer<typeof IntelligentVCSearchInputSchema>;

const VCFirmSchema = z.object({
  name: z.string().describe('The name of the venture capital firm.'),
  investmentFocus: z
    .string()
    .describe(
      'A description of the typical investment focus of this venture capital firm.'
    ),
  contactDetails: z.string().describe('Contact details for the venture capital firm.'),
});

const IntelligentVCSearchOutputSchema = z.array(VCFirmSchema);
export type IntelligentVCSearchOutput = z.infer<typeof IntelligentVCSearchOutputSchema>;

export async function intelligentVCSearch(input: IntelligentVCSearchInput): Promise<IntelligentVCSearchOutput> {
  return intelligentVCSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentVCSearchPrompt',
  input: {schema: IntelligentVCSearchInputSchema},
  output: {schema: IntelligentVCSearchOutputSchema},
  prompt: `You are an AI assistant specializing in identifying relevant venture capital firms based on user-provided keywords.

  Given the following keywords: "{{keywords}}", identify and list venture capital firms whose investment focus aligns with these keywords.

  Return a JSON array of VC firms, including their name, a brief description of their investment focus, and contact details.
  Make sure the result is a valid JSON.

  Example:
  [
    {
      "name": "Sequoia Capital",
      "investmentFocus": "Focuses on seed to growth stage companies, particularly in technology.",
      "contactDetails": "info@sequoiacap.com"
    },
    {
      "name": "Andreessen Horowitz",
      "investmentFocus": "Invests in software, bio engineering, and consumer companies.",
      "contactDetails": "info@a16z.com"
    }
  ]
  `,
});

const intelligentVCSearchFlow = ai.defineFlow(
  {
    name: 'intelligentVCSearchFlow',
    inputSchema: IntelligentVCSearchInputSchema,
    outputSchema: IntelligentVCSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
