import { NextRequest, NextResponse } from 'next/server';
import { inputSchema, sanitizeText } from '@/lib/schemas';
import { ratelimit } from '@/lib/rate-limit-enhanced';
import { analysisCache, generateCacheKey } from '@/lib/cache';
import { callGeminiWithRetry, parseArrayResponse, parseSuggestionsResponse } from '@/lib/gemini-client';
import { logger, measurePerformance } from '@/lib/logger';
import { validateEnv } from '@/lib/config';

export const runtime = 'nodejs'; // ensures server runtime

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  // Validate environment
  try {
    validateEnv();
  } catch (error: any) {
    logger.error('Environment validation failed', { error: error.message });
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 503 });
  }

  // Rate limit check (IP-based)
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const rateLimitResult = ratelimit.check(ip);
  
  if (!rateLimitResult.allowed) {
    logger.warn('Rate limit exceeded', { ip, resetAt: rateLimitResult.resetAt });
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        resetAt: rateLimitResult.resetAt 
      }, 
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        }
      }
    );
  }

  // Parse and validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logger.warn('Invalid JSON received', { ip });
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn('Input validation failed', { errors: parsed.error.flatten() });
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // Sanitize inputs
  const resume = sanitizeText(parsed.data.resume);
  const jobDesc = sanitizeText(parsed.data.jobDesc);

  // Check cache first
  const cacheKey = generateCacheKey(resume, jobDesc);
  const cached = analysisCache.get(cacheKey);
  
  if (cached) {
    logger.info('Cache hit', { ip, duration: Date.now() - startTime });
    return NextResponse.json(
      { ...cached, cached: true },
      {
        headers: {
          'X-Cache': 'HIT',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        }
      }
    );
  }

  try {
    // 1) Extract keywords from JD with retry logic
    const keywords = await measurePerformance('extract_keywords', async () =>
      callGeminiWithRetry(
        {
          systemPrompt: `As an expert hiring manager, extract crucial ATS keywords (skills, software, quals, responsibilities). Ignore fluff. Return JSON array of strings.`,
          userText: jobDesc,
          maxRetries: 3,
          timeoutMs: 30000,
        },
        { type: 'ARRAY', items: { type: 'STRING' } },
        parseArrayResponse,
        []
      )
    );

    if (keywords.length === 0) {
      logger.warn('No keywords extracted', { ip });
      return NextResponse.json(
        { error: 'Could not extract keywords from job description. Please try with a different job description.' },
        { status: 422 }
      );
    }

    const uniq = [...new Set(keywords.map(k => k.toLowerCase()))];
    logger.info('Keywords extracted', { count: uniq.length });

    // 2) Match against resume
    const matched: string[] = [];
    const missing: string[] = [];
    const resLower = resume.toLowerCase();
    
    for (const kw of uniq) {
      const safe = kw.replace(/[^a-zA-Z0-9-]/g, '\\$&');
      const re = new RegExp(`\\b${safe}\\b`, 'i');
      (re.test(resLower) ? matched : missing).push(kw);
    }

    const score = Math.round((matched.length / Math.max(uniq.length, 1)) * 100);
    logger.info('Match analysis complete', { score, matched: matched.length, missing: missing.length });

    // 3) Generate suggestions if there are missing keywords
    let suggestions: { suggestions: { original: string; suggested: string }[] } = { suggestions: [] };
    
    if (missing.length > 0 && missing.length <= 20) { // Limit to 20 missing keywords to avoid huge prompts
      suggestions = await measurePerformance('generate_suggestions', async () =>
        callGeminiWithRetry(
          {
            systemPrompt: `You are an expert ATS resume optimizer and career coach. Your task is to naturally incorporate missing keywords into existing resume bullets WITHOUT adding new sentences.

RULES:
1. ONLY modify the original sentence - do NOT add additional sentences at the end
2. Weave keywords naturally into the existing text where they fit contextually
3. Maintain the original impact, metrics, and tone
4. Keep the same sentence structure and flow
5. Only suggest changes if keywords can be added authentically based on existing context
6. If a keyword doesn't fit naturally, skip that bullet (don't force it)
7. The suggested version should be ONE cohesive sentence, not two separate ideas

Return JSON: {"suggestions":[{"original":"...","suggested":"..."}]}`,
            userText: `My Resume:\n${resume}\n\nJob Description:\n${jobDesc}\n\nMissing Keywords to Integrate:\n${missing.join(', ')}\n\nFor each resume bullet, integrate relevant missing keywords naturally into the SAME sentence. Do not append new sentences.`,
            maxRetries: 2,
            timeoutMs: 45000,
          },
          {
            type: 'OBJECT',
            properties: {
              suggestions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    original: { type: 'STRING' },
                    suggested: { type: 'STRING' },
                  },
                },
              },
            },
          },
          parseSuggestionsResponse,
          { suggestions: [] }
        )
      );
    }

    const result = { score, matched, missing, suggestions };
    
    // Cache the result
    analysisCache.set(cacheKey, result);
    
    const duration = Date.now() - startTime;
    logger.info('Analysis complete', { ip, duration, score, cached: false });
    logger.trackApiCall('/api/analyze', duration, true);

    return NextResponse.json(
      { ...result, cached: false },
      {
        headers: {
          'X-Cache': 'MISS',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-Response-Time': `${duration}ms`,
        }
      }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('Analysis error', { ip, duration, error: error.message });
    logger.trackApiCall('/api/analyze', duration, false, error.message);
    
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
