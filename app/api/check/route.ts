// PERSON 2 + PERSON 3.
// POST {decisions, docs, pkg, pkgUrl} → {decisions (with statuses), contradictions}
// Order matters: first decide what was superseded (Person 3), then check the still-active ones against code (Person 2).
import { askLLM, hasLLM, parseJSON } from "@/lib/ai/llm";
import { JUDGE_SYSTEM } from "@/lib/ai/prompts";
import { applyRelations, candidatePairs, pairsPrompt, type Relation } from "@/lib/checks/relations";
import { checkCode } from "@/lib/checks/code";
import { MOCK_RELATIONS } from "@/data/mock";
import type { Decision, ProjectSource, SourceDoc } from "@/types/schema";

export async function POST(req: Request) {
  const body: { decisions: Decision[]; docs: SourceDoc[]; pkg: ProjectSource["pkg"]; pkgUrl?: string } = await req.json();

  // Layer 2: decision vs decision
  const pairs = candidatePairs(body.decisions);
  let relations: Relation[] = [];
  if (pairs.length) {
    if (!hasLLM()) {
      relations = pairs.flatMap((p, i) => {
        const m = MOCK_RELATIONS[`${p.a.id}|${p.b.id}`];
        return m ? [{ pair: i, ...m }] : [];
      });
    } else {
      try {
        const raw = await askLLM(JUDGE_SYSTEM, pairsPrompt(pairs), 3000);
        relations = parseJSON<Relation[]>(raw, []);
      } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 500 });
      }
    }
  }
  const judged = applyRelations(body.decisions, pairs, relations);

  // Layer 1: decision vs code (skips superseded decisions)
  const codeIssues = checkCode(judged.decisions, body.pkg ?? {}, body.docs ?? [], body.pkgUrl);
  const flagged = new Set(codeIssues.map((c) => c.decisionId));
  const decisions = judged.decisions.map((d) => (flagged.has(d.id) ? { ...d, status: "contradicted" as const } : d));

  return Response.json({ decisions, contradictions: [...codeIssues, ...judged.contradictions] });
}
