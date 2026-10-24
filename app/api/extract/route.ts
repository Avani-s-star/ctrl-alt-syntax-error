// PERSON 3 OWNS THIS FILE.
// POST one SourceDoc → Decision[]. One doc per call keeps each request short (no timeouts).
import { askLLM, hasLLM, parseJSON } from "@/lib/ai/llm";
import { EXTRACT_SYSTEM } from "@/lib/ai/prompts";
import { MOCK_DECISIONS } from "@/data/mock";
import type { Decision, SourceDoc } from "@/types/schema";

// Gemini can be slow when busy; allow up to 60s instead of the platform default.
export const maxDuration = 60;

type Raw = Omit<Decision, "id" | "sourceId" | "status">;

export async function POST(req: Request) {
  const doc: SourceDoc = await req.json();
  if (doc.type === "commit") return Response.json([]); // commits are evidence, not decisions

  let items: Raw[];
  if (!hasLLM()) {
    items = MOCK_DECISIONS[doc.id] ?? [];
  } else {
    try {
      const raw = await askLLM(EXTRACT_SYSTEM, `Document "${doc.title}" (${doc.type}, dated ${doc.date}, by ${doc.author ?? "unknown"}):\n\n${doc.text}`);
      items = parseJSON<Raw[]>(raw, []);
    } catch (e) {
      // AI unavailable even after retries. For the built-in demo, use the backup answers so the demo never dies.
      const backup = MOCK_DECISIONS[doc.id];
      if (backup && !doc.url) {
        console.error("extract failed, using backup:", (e as Error).message);
        items = backup;
      } else {
        return Response.json({ error: (e as Error).message }, { status: 500 });
      }
    }
  }

  const decisions: Decision[] = items
    .filter((d) => d && typeof d.what === "string")
    .map((d, i) => ({
      what: d.what,
      why: d.why ?? "",
      who: d.who ?? "team",
      date: /^\d{4}-\d{2}-\d{2}$/.test(d.date ?? "") ? d.date : doc.date,
      entities: Array.isArray(d.entities) ? d.entities.slice(0, 4) : [],
      id: `${doc.id}-${i}`,
      sourceId: doc.id,
      status: "active",
    }));
  return Response.json(decisions);
}
