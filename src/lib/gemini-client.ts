// Centralized Gemini API client with retry logic and better error handling

interface GeminiCallOptions {
  systemPrompt: string;
  userText: string;
  maxRetries?: number;
  timeoutMs?: number;
}

export async function callGeminiWithRetry<T>(
  options: GeminiCallOptions,
  responseSchema: any,
  parser: (text: string) => T,
  defaultValue: T
): Promise<T> {
  const { systemPrompt, userText, maxRetries = 3, timeoutMs = 30000 } = options;
  const key = process.env.GEMINI_API_KEY;
  
  if (!key) throw new Error('Missing GEMINI_API_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const payload = {
        contents: [{ parts: [{ text: userText }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.3, // Lower temperature for more consistent results
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check for rate limit errors (429)
        if (response.status === 429 && attempt < maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.warn(`Rate limited, retrying in ${backoffMs}ms... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
        
        throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
      }

      const json = await response.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || text.trim() === '') {
        console.warn(`Empty response from Gemini (attempt ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        return defaultValue;
      }

      return parser(text);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`Request timeout (attempt ${attempt}/${maxRetries})`);
      } else {
        console.error(`Gemini call failed (attempt ${attempt}/${maxRetries}):`, error.message);
      }

      if (attempt === maxRetries) {
        console.error('All retry attempts exhausted');
        return defaultValue;
      }

      // Exponential backoff
      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  return defaultValue;
}

export function parseArrayResponse(text: string): string[] {
  try {
    const arr = JSON.parse(text);
    return Array.isArray(arr) ? arr.filter(item => typeof item === 'string') : [];
  } catch (e) {
    console.error('Failed to parse array response:', text);
    return [];
  }
}

export function parseSuggestionsResponse(text: string): { suggestions: { original: string; suggested: string }[] } {
  try {
    const parsed = JSON.parse(text);
    if (parsed && Array.isArray(parsed.suggestions)) {
      return parsed;
    }
    return { suggestions: [] };
  } catch (e) {
    console.error('Failed to parse suggestions response:', text);
    return { suggestions: [] };
  }
}
