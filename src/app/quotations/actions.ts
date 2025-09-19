'use server';

import { suggestElvComponents, SuggestElvComponentsInput, SuggestElvComponentsOutput } from '@/ai/flows/smart-quotation-suggestions';
import { z } from 'zod';

const suggestSchema = z.object({
    quotationDraft: z.string().min(10, 'Draft is too short.'),
});

export async function suggestElvComponentsAction(input: SuggestElvComponentsInput): Promise<SuggestElvComponentsOutput> {
    const parsed = suggestSchema.safeParse(input);
    if (!parsed.success) {
        // In a real app, you'd handle this more gracefully
        // For this example, we'll throw an error
        throw new Error('Invalid input: ' + parsed.error.issues.map(i => i.message).join(', '));
    }
    
    try {
        const result = await suggestElvComponents(parsed.data);
        return result;
    } catch (error) {
        console.error("Error in suggestElvComponents call:", error);
        throw new Error("Failed to get suggestions from AI.");
    }
}
