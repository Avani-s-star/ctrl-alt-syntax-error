"use client";
// PERSON 1 OWNS THIS FILE (Person 3 owns the /api/ask behind it).
import { useState } from "react";
import { Button, Card, Empty } from "@/components/ui";
import { useMemory } from "@/components/useMemory";
import type { SourceDoc } from "@/types/schema";

const SUGGESTIONS = ["Why did we choose Firebase?", "What did we decide about login and passwords?", "When is the MVP deadline?"];

type Msg = { role: "user" | "ai"; text: string };

export default function Ask() {
  const { memory, ready } = useMemory();
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<SourceDoc | null>(null);
  if (!ready) return null;
  if (!memory) return <Empty />;

  async function ask(question: string) {
    if (!question.trim() || !memory) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ question, decisions: memory.decisions, contradictions: memory.contradictions, docs: memory.docs }),
    });
    const data = await res.json();
    setMsgs((m) => [...m, { role: "ai", text: data.answer ?? `⚠ ${data.error}` }]);
    setBusy(false);
  }

  // Turn "[note-3]" into a clickable chip.
  function render(text: string) {
    return text.split(/(\[[\w-]+\])/g).map((part, i) => {
      const id = part.match(/^\[([\w-]+)\]$/)?.[1];
      const doc = id && memory!.docs.find((d) => d.id === id);
      return doc ? (
        <button key={i} onClick={() => setOpen(doc)} className="mx-0.5 rounded bg-blue-100 px-1.5 text-xs text-blue-800 hover:bg-blue-200">
          {doc.title}
        </button>
      ) : (
        <span key={i}>{part}</span>
      );
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ask your project</h1>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)} className="rounded-full border border-stone-300 px-3 py-1 text-sm hover:bg-white">
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {msgs.map((m, i) => (
          <Card key={i} className={m.role === "user" ? "ml-auto max-w-[80%] bg-stone-900 text-white" : "whitespace-pre-wrap"}>
            {m.role === "ai" ? render(m.text) : m.text}
          </Card>
        ))}
        {busy && <p className="animate-pulse text-sm text-stone-500">Searching the team&apos;s memory…</p>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Why did we choose…?" className="flex-1 rounded-lg border border-stone-300 px-3 py-2" />
        <Button disabled={busy}>Ask</Button>
      </form>
      {open && (
        <Card className="bg-amber-50">
          <div className="flex justify-between text-sm font-semibold">
            <span>{open.title} · {open.date}</span>
            <button onClick={() => setOpen(null)}>✕</button>
          </div>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm">{open.text}</pre>
        </Card>
      )}
    </div>
  );
}
