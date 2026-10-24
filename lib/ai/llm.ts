// PERSON 3 OWNS THIS FILE.
// The ONLY place that talks to an LLM. To switch provider (Gemini, OpenAI...), change this file only.
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.LLM_MODEL || "claude-haiku-5-5";

export function hasLLM() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function askLLM(system: string, user: string, maxTokens = 2000): Promise<string> {
  if (!hasLLM()) throw new Error("No ANTHROPIC_API_KEY set. Add it to .env.local (and to Vercel env vars).");
  const client = new Anthropic();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

// LLMs sometimes wrap JSON in prose or ```json fences. This pulls the JSON out.
export function parseJSON<T>(raw: string, fallback: T): T {
  const start = raw.search(/[\[{]/);
  const endArr = raw.lastIndexOf("]");
  const endObj = raw.lastIndexOf("}");
  const end = Math.max(endArr, endObj);
  if (start === -1 || end === -1) return fallback;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}
