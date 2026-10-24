"use client";
// PERSON 1 OWNS THIS FILE.
import { useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { buildMemory } from "@/lib/client/build";
import type { Memory, SourceDoc } from "@/types/schema";

export default function Connect() {
  const [repo, setRepo] = useState("");
  const [uploads, setUploads] = useState<SourceDoc[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Memory | null>(null);

  async function run(useRepo: boolean) {
    setBusy(true);
    setError("");
    setResult(null);
    setLog([]);
    try {
      const m = await buildMemory({
        repo: useRepo ? repo : undefined,
        uploads,
        onProgress: (msg) => setLog((l) => [...l, msg]),
      });
      setResult(m);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);
    const docs: SourceDoc[] = await (await fetch("/api/ingest/files", { method: "POST", body: fd })).json();
    setUploads((u) => [...u, ...docs]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your team forgets. This doesn&apos;t.</h1>
        <p className="mt-2 text-stone-600">
          Team Memory reads your meeting notes, chats and code, remembers every decision, and warns you when the
          code or a newer decision quietly contradicts an old one.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Try the demo</h2>
          <p className="mt-1 text-sm text-stone-500">StudySync: 3 students, 4 months of notes, chats and commits.</p>
          <Button className="mt-4" disabled={busy} onClick={() => run(false)}>
            Load demo project
          </Button>
        </Card>
        <Card>
          <h2 className="font-semibold">Connect your own</h2>
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="github.com/owner/repo"
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <label className="mt-3 block text-sm text-stone-500">
            Meeting notes / chat exports (.md, .txt):
            <input type="file" multiple accept=".md,.txt,.json" onChange={(e) => onFiles(e.target.files)} className="mt-1 block text-sm" />
          </label>
          {uploads.length > 0 && <p className="mt-1 text-xs text-stone-500">{uploads.length} file(s) ready</p>}
          <Button className="mt-4" disabled={busy || !repo} onClick={() => run(true)}>
            Build memory
          </Button>
        </Card>
      </div>

      {log.length > 0 && (
        <Card className="font-mono text-sm">
          {log.map((l, i) => (
            <div key={i} className={i === log.length - 1 && busy ? "animate-pulse" : "text-stone-500"}>
              {i === log.length - 1 && !busy ? "✓ " : "→ "}
              {l}
            </div>
          ))}
        </Card>
      )}

      {error && <Card className="border-red-300 text-red-700">⚠ {error}</Card>}

      {result && (
        <Card>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat n={result.docs.length} label="sources read" />
            <Stat n={result.decisions.length} label="decisions remembered" />
            <Stat n={result.contradictions.length} label="contradictions found" danger />
          </div>
          <Link href="/alerts" className="mt-5 block rounded-lg bg-red-600 py-2 text-center text-sm font-medium text-white hover:bg-red-700">
            See what your team forgot →
          </Link>
        </Card>
      )}
    </div>
  );
}

function Stat({ n, label, danger }: { n: number; label: string; danger?: boolean }) {
  return (
    <div>
      <div className={`text-3xl font-bold ${danger && n > 0 ? "text-red-600" : ""}`}>{n}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}
