// src/ai/flows/smart-quotation-suggestions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting missing ELV components in a quotation.
 *
 * - suggestElvComponents - The main function to call to get ELV component suggestions.
 * - SuggestElvComponentsInput - The input type for the suggestElvComponents function.
 * - SuggestElvComponentsOutput - The output type for the suggestElvComponents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestElvComponentsInputSchema = z.object({
  quotationDraft: z
    .string()
    .describe('The initial draft of the quotation, including listed components.'),
});
export type SuggestElvComponentsInput = z.infer<typeof SuggestElvComponentsInputSchema>;

const SuggestElvComponentsOutputSchema = z.object({
  suggestedComponents: z
    .string()
    .describe('A list of suggested ELV components that are missing from the quotation draft.'),
});
export type SuggestElvComponentsOutput = z.infer<typeof SuggestElvComponentsOutputSchema>;

export async function suggestElvComponents(
  input: SuggestElvComponentsInput
): Promise<SuggestElvComponentsOutput> {
  return suggestElvComponentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestElvComponentsPrompt',
  input: {schema: SuggestElvComponentsInputSchema},
  output: {schema: SuggestElvComponentsOutputSchema},
  prompt: `You are an expert in ELV (Extra Low Voltage) systems.
  Given the following quotation draft, identify any missing components that are typically required for a complete ELV system.
  Provide a list of suggested components with a brief explanation of why they are needed.

Quotation Draft:
{{{quotationDraft}}}

Suggested Components:
`,
});

const suggestElvComponentsFlow = ai.defineFlow(
  {
    name: 'suggestElvComponentsFlow',
    inputSchema: SuggestElvComponentsInputSchema,
    outputSchema: SuggestElvComponentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
