// PERSON 3 OWNS THIS FILE.
// POST {question, decisions, contradictions, docs} → {answer} with [sourceId] citations.
import { askLLM, hasLLM } from "@/lib/ai/llm";
import { ASK_SYSTEM } from "@/lib/ai/prompts";
import type { Contradiction, Decision, SourceDoc } from "@/types/schema";

export async function POST(req: Request) {
  const { question, decisions, contradictions, docs }: {
    question: string; decisions: Decision[]; contradictions: Contradiction[]; docs: SourceDoc[];
  } = await req.json();

  if (!hasLLM()) {
    // Offline fallback: keyword match so the page still works without a key.
    const words = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const hits = decisions.filter((d) => words.some((w) => (d.what + " " + d.entities.join(" ")).toLowerCase().includes(w)));
    const answer = hits.length
      ? hits.map((d) => `• ${d.what} (${d.date}, ${d.who}) — ${d.status} [${d.sourceId}]`).join("\n")
      : "I couldn't find that in the team's records. (Offline mode: add an API key for real answers.)";
    return Response.json({ answer });
  }

  const context = [
    "DECISIONS:",
    ...decisions.map((d) => `[${d.sourceId}] ${d.date} | ${d.who} | ${d.what}${d.why ? ` (why: ${d.why})` : ""} | status: ${d.status}`),
    "",
    "CONTRADICTIONS FOUND:",
    ...contradictions.map((c) => `- ${c.explanation}`),
    "",
    "DOCUMENTS:",
    ...docs.map((d) => `[${d.id}] ${d.title} (${d.date}): ${d.text.slice(0, 1500)}`),
  ].join("\n");

  try {
    const answer = await askLLM(ASK_SYSTEM, `${context}\n\nQUESTION: ${question}`, 800);
    return Response.json({ answer });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
