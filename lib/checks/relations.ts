// PERSON 3 OWNS THIS FILE.
// Layer 2: decision vs. decision. Find pairs worth comparing, then apply the LLM's verdicts.
import type { Contradiction, Decision } from "@/types/schema";
import { techFor } from "./code";

export type Pair = { a: Decision; b: Decision }; // a older, b newer
export type Relation = { pair: number; relation: "supersedes" | "contradicts" | "unrelated"; reason: string };

const STOP = new Set(["frontend", "backend", "team", "app", "project", "the"]);

function topicKeys(d: Decision): Set<string> {
  const keys = new Set<string>();
  for (const e of d.entities) {
    const lower = e.toLowerCase().trim();
    if (!STOP.has(lower)) keys.add(lower);
    const tech = techFor(e);
    if (tech) tech.categories.forEach((c) => keys.add(c)); // "Firebase" and "Supabase" both → "auth"
    for (const w of lower.split(/\s+/)) if (w.length > 3 && !STOP.has(w)) keys.add(w);
  }
  return keys;
}

// Pairs of decisions that share a topic, older first. Capped so one LLM call can judge them all.
export function candidatePairs(decisions: Decision[], max = 60): Pair[] {
  const sorted = [...decisions].sort((x, y) => x.date.localeCompare(y.date));
  const keys = sorted.map(topicKeys);
  const pairs: Pair[] = [];
  for (let i = 0; i < sorted.length; i++)
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[i].sourceId === sorted[j].sourceId) continue;
      const shared = [...keys[i]].some((k) => keys[j].has(k));
      if (shared) pairs.push({ a: sorted[i], b: sorted[j] });
    }
  return pairs.slice(0, max);
}

export function pairsPrompt(pairs: Pair[]): string {
  return pairs
    .map(
      (p, i) =>
        `Pair ${i}:\nA (${p.a.date}, ${p.a.who}): ${p.a.what}${p.a.why ? ` — because ${p.a.why}` : ""}\nB (${p.b.date}, ${p.b.who}): ${p.b.what}${p.b.why ? ` — because ${p.b.why}` : ""}`
    )
    .join("\n\n");
}

export function applyRelations(decisions: Decision[], pairs: Pair[], relations: Relation[]) {
  const byId = new Map(decisions.map((d) => [d.id, { ...d }]));

  // If one later decision "contradicts" several earlier ones, keep only the MOST RECENT earlier one.
  // The AI sometimes adds a weaker, unrelated pair (e.g. "Firebase auth" vs "hash passwords").
  const bestPerLater = new Map<string, { p: Pair; r: Relation }>();

  for (const r of relations) {
    const p = pairs[r.pair];
    if (!p) continue;
    if (r.relation === "supersedes") {
      const a = byId.get(p.a.id)!;
      a.status = "superseded";
      a.supersededBy = p.b.id;
    } else if (r.relation === "contradicts") {
      const current = bestPerLater.get(p.b.id);
      if (!current || p.a.date > current.p.a.date) bestPerLater.set(p.b.id, { p, r });
    }
  }

  const contradictions: Contradiction[] = [];
  for (const { p, r } of bestPerLater.values()) {
    byId.get(p.a.id)!.status = "contradicted";
    byId.get(p.b.id)!.status = "contradicted";
    contradictions.push({
      id: `dec-${p.a.id}-${p.b.id}`,
      decisionId: p.b.id,
      otherDecisionId: p.a.id,
      kind: "decision",
      explanation: r.reason,
      evidence: [
        { label: `Earlier decision (${p.a.date}, ${p.a.who})`, snippet: p.a.what },
        { label: `Later decision (${p.b.date}, ${p.b.who})`, snippet: p.b.what },
      ],
    });
  }
  return { decisions: [...byId.values()], contradictions };
}