"use client";
// PERSON 1 OWNS THIS FILE.
import { Card, Empty, StatusBadge } from "@/components/ui";
import { useMemory } from "@/components/useMemory";

export default function Decisions() {
  const { memory, ready } = useMemory();
  if (!ready) return null;
  if (!memory) return <Empty />;

  const byId = new Map(memory.decisions.map((d) => [d.id, d]));
  const sorted = [...memory.decisions].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Decision timeline</h1>
      <ol className="relative space-y-3 border-l-2 border-stone-200 pl-6">
        {sorted.map((d) => (
          <li key={d.id} className="relative">
            <span className={`absolute -left-[31px] top-5 h-3 w-3 rounded-full ${d.status === "contradicted" ? "bg-red-500" : d.status === "superseded" ? "bg-stone-400" : "bg-emerald-500"}`} />
            <Card className={d.status === "superseded" ? "opacity-60" : ""}>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span>{d.date}</span>·<span>{d.who}</span>·<StatusBadge status={d.status} />
                {d.entities.map((e) => (
                  <span key={e} className="rounded bg-stone-100 px-1.5 py-0.5">{e}</span>
                ))}
              </div>
              <p className={`mt-2 font-medium ${d.status === "superseded" ? "line-through" : ""}`}>{d.what}</p>
              {d.why && <p className="text-sm text-stone-500">Why: {d.why}</p>}
              {d.supersededBy && byId.get(d.supersededBy) && (
                <p className="mt-1 text-sm text-stone-600">↳ Replaced on {byId.get(d.supersededBy)!.date}: {byId.get(d.supersededBy)!.what}</p>
              )}
              <p className="mt-2 text-xs text-stone-400">from: {memory.docs.find((x) => x.id === d.sourceId)?.title ?? d.sourceId}</p>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
