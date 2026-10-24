// PERSON 1 OWNS THIS FILE. The whole pipeline, run from the browser, one step at a time.
import type { Contradiction, Decision, Memory, ProjectSource, SourceDoc } from "@/types/schema";
import { saveMemory } from "@/lib/store";

// Servers sometimes answer with plain text (e.g. Vercel's "An error occurred…" page on a timeout).
// Read text first, so the user sees a real message instead of "Unexpected token… is not valid JSON".
async function json<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server error ${res.status}: ${text.slice(0, 160)}`);
  }
  if (!res.ok) throw new Error((data as { error?: string })?.error ?? `Request failed (${res.status})`);
  return data as T;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Try a request; on failure wait and try once more.
async function withRetry<T>(fn: () => Promise<T>, waitMs = 4000): Promise<T> {
  try {
    return await fn();
  } catch {
    await sleep(waitMs);
    return fn();
  }
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
  const skipped: string[] = [];
  for (const [i, doc] of readable.entries()) {
    onProgress(`Reading ${i + 1}/${readable.length}: ${doc.title}`);
    try {
      const found = await withRetry(async () =>
        json<Decision[]>(await fetch("/api/extract", { method: "POST", body: JSON.stringify(doc) }))
      );
      decisions.push(...found);
    } catch {
      // One unreadable note shouldn't kill the whole run.
      skipped.push(doc.title);
      onProgress(`⚠ Skipped "${doc.title}" (AI busy) — continuing`);
    }
  }
  if (decisions.length === 0) throw new Error("The AI is busy right now and couldn't read any notes. Wait a minute and try again.");

  onProgress(`Found ${decisions.length} decisions. Checking them against each other and against the code…`);
  const checked = await withRetry(async () =>
    json<{ decisions: Decision[]; contradictions: Contradiction[] }>(
      await fetch("/api/check", {
        method: "POST",
        body: JSON.stringify({ decisions, docs, pkg: source.pkg, pkgUrl: source.pkgUrl }),
      })
    )
  );

  const memory: Memory = {
    docs,
    decisions: checked.decisions,
    contradictions: checked.contradictions,
    tasks: source.tasks,
    builtAt: new Date().toISOString(),
  };
  saveMemory(memory);
  onProgress(skipped.length ? `Done (skipped ${skipped.length}: ${skipped.join(", ")})` : "Done");
  return memory;
}
