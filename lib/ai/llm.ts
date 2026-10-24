// PERSON 3 OWNS THIS FILE.
// The ONLY place that talks to an LLM. To switch provider (Gemini, OpenAI...), change this file only.

import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.LLM_MODEL || "gemini-2.5-flash";

export function hasLLM() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function askLLM(
  system: string,
  user: string,
  maxTokens = 2000
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No GEMINI_API_KEY set. Add it to .env.local and to Vercel environment variables."
    );
  }

  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: MODEL,
    contents: user,
    config: {
      systemInstruction: system,
      maxOutputTokens: maxTokens,
      temperature: 0,
    },
  });

  return response.text ?? "";
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
