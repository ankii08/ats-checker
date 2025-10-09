// Validate environment variables at startup

import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Add more as needed
  // UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  // UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;

  try {
    cachedEnv = envSchema.parse({
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
    }
    throw error;
  }
}

// Check if API key is configured
export function isConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Get safe config (without exposing secrets)
export function getSafeConfig() {
  return {
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}
