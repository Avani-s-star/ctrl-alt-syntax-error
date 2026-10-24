// PERSON 3 OWNS THIS FILE.
// The ONLY place that talks to an LLM. To switch provider (Gemini, OpenAI...), change this file only.

import { GoogleGenAI } from "@google/genai";

// Tried in order. If one is overloaded (503) or rate-limited (429), the next one is used.
// Override with LLM_MODELS="model-a,model-b" in .env.local / Vercel.
const MODELS = (process.env.LLM_MODELS || process.env.LLM_MODEL || "gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const RETRIES_PER_MODEL = 2;

export function hasLLM() {
  return Boolean(process.env.GEMINI_API_KEY);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Errors worth retrying: overloaded, rate-limited, temporary server errors.
function isTemporary(e: unknown) {
  const msg = String((e as Error)?.message ?? e);
  return /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|fetch failed/i.test(msg);
}

// "Model not found" → skip straight to the next model.
function isMissingModel(e: unknown) {
  const msg = String((e as Error)?.message ?? e);
  return /\b404\b|NOT_FOUND|is not found|not supported/i.test(msg);
}

export async function askLLM(system: string, user: string, maxTokens = 2000): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No GEMINI_API_KEY set. Add it to .env.local and to Vercel environment variables.");
  }

  const client = new GoogleGenAI({ apiKey });
  let lastError: unknown;

  for (const model of MODELS) {
    for (let attempt = 0; attempt <= RETRIES_PER_MODEL; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: user,
          config: { systemInstruction: system, maxOutputTokens: maxTokens, temperature: 0 },
        });
        return response.text ?? "";
      } catch (e) {
        lastError = e;
        if (isMissingModel(e)) break; // this model doesn't exist → try the next one
        if (!isTemporary(e)) throw e; // e.g. invalid key → retrying won't help
        if (attempt < RETRIES_PER_MODEL) await sleep(800 * 2 ** attempt); // wait 0.8s, then 1.6s
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export function parseJSON<T>(raw: string, fallback: T): T {
  const start = raw.search(/[\[{]/);
  const end = Math.max(raw.lastIndexOf("]"), raw.lastIndexOf("}"));

  if (start === -1 || end < start) return fallback;

  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}
