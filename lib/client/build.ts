// PERSON 1 OWNS THIS FILE. The whole pipeline, run from the browser, one step at a time.
import type { Contradiction, Decision, Memory, ProjectSource, SourceDoc } from "@/types/schema";
import { saveMemory } from "@/lib/store";

async function json<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data as T;
}

export async function buildMemory(opts: {
  repo?: string;
  uploads?: SourceDoc[];
  onProgress: (msg: string) => void;
}): Promise<Memory> {
  const { onProgress } = opts;

  onProgress(opts.repo ? `Reading GitHub repo ${opts.repo}…` : "Loading the StudySync demo project…");
  const source = await json<ProjectSource>(await fetch(`/api/docs${opts.repo ? `?repo=${encodeURIComponent(opts.repo)}` : ""}`));
  const docs = [...source.docs, ...(opts.uploads ?? [])];

  const readable = docs.filter((d) => d.type !== "commit");
  const decisions: Decision[] = [];
  for (const [i, doc] of readable.entries()) {
    onProgress(`Reading ${i + 1}/${readable.length}: ${doc.title}`);
    const found = await json<Decision[]>(await fetch("/api/extract", { method: "POST", body: JSON.stringify(doc) }));
    decisions.push(...found);
  }

  onProgress(`Found ${decisions.length} decisions. Checking them against each other and against the code…`);
  const checked = await json<{ decisions: Decision[]; contradictions: Contradiction[] }>(
    await fetch("/api/check", {
      method: "POST",
      body: JSON.stringify({ decisions, docs, pkg: source.pkg, pkgUrl: source.pkgUrl }),
    })
  );

  const memory: Memory = {
    docs,
    decisions: checked.decisions,
    contradictions: checked.contradictions,
    tasks: source.tasks,
    builtAt: new Date().toISOString(),
  };
  saveMemory(memory);
  onProgress("Done");
  return memory;
}
