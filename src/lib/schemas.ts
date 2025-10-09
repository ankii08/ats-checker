import { z } from 'zod';

export const inputSchema = z.object({
  resume: z.string()
    .min(50, 'Resume text seems too short (minimum 50 characters)')
    .max(20000, 'Resume text is too long (maximum 20,000 characters)')
    .refine(
      (text) => text.trim().split(/\s+/).length >= 10,
      'Resume must contain at least 10 words'
    ),
  jobDesc: z.string()
    .min(50, 'Job description seems too short (minimum 50 characters)')
    .max(10000, 'Job description is too long (maximum 10,000 characters)')
    .refine(
      (text) => text.trim().split(/\s+/).length >= 10,
      'Job description must contain at least 10 words'
    ),
});

export const suggestionsSchema = z.object({
  suggestions: z
    .array(
      z.object({
        original: z.string().min(1),
        suggested: z.string().min(1),
      })
    )
    .default([]),
});

// Sanitization helper
export function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\r\n/g, '\n') // Normalize line endings
    .trim();
}
