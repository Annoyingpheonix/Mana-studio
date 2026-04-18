'use server';

/**
 * @fileOverview Gamertag Generator AI Agent.
 *
 * - generateGamerTag - A function that generates a gamertag based on the user's name.
 * - GenerateGamerTagInput - The input type for the generateGamerTag function.
 * - GenerateGamerTagOutput - The return type for the generateGamerTag function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGamerTagInputSchema = z.object({
  name: z.string().describe('The user\'s name.'),
});
export type GenerateGamerTagInput = z.infer<typeof GenerateGamerTagInputSchema>;

const GenerateGamerTagOutputSchema = z.object({
  gamertag: z.string().describe('A unique gamertag generated based on the user\'s name.'),
});
export type GenerateGamerTagOutput = z.infer<typeof GenerateGamerTagOutputSchema>;

export async function generateGamerTag(input: GenerateGamerTagInput): Promise<GenerateGamerTagOutput> {
  return generateGamerTagFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGamerTagPrompt',
  input: {schema: GenerateGamerTagInputSchema},
  output: {schema: GenerateGamerTagOutputSchema},
  prompt: `You are a gamertag generator. Generate a unique gamertag based on the user's name.

Name: {{{name}}}

Gamertag: `,
});

const generateGamerTagFlow = ai.defineFlow(
  {
    name: 'generateGamerTagFlow',
    inputSchema: GenerateGamerTagInputSchema,
    outputSchema: GenerateGamerTagOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('The AI model returned an empty response.');
      }
      return output;
    } catch (error) {
      console.error('Error generating gamertag:', error);
      // Re-throw the error to be handled by the client
      throw new Error('Failed to generate a unique gamertag. Please try again later.');
    }
  }
);
