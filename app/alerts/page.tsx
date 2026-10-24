"use client";
// PERSON 1 OWNS THIS FILE. The hero screen of the demo.
import { Card, Empty } from "@/components/ui";
import { useMemory } from "@/components/useMemory";

export default function Alerts() {
  const { memory, ready } = useMemory();
  if (!ready) return null;
  if (!memory) return <Empty />;

  const byId = new Map(memory.decisions.map((d) => [d.id, d]));
  const code = memory.contradictions.filter((c) => c.kind === "code");
  const dec = memory.contradictions.filter((c) => c.kind === "decision");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">⚠ {memory.contradictions.length} things your team forgot</h1>
        <p className="text-stone-600">Decisions that no longer match the code, or that clash with a later decision.</p>
      </div>

      {[
        { title: "Decision vs. code", items: code },
        { title: "Decision vs. decision", items: dec },
      ].map((group) =>
        group.items.length ? (
          <section key={group.title} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">{group.title}</h2>
            {group.items.map((c) => {
              const d = byId.get(c.decisionId);
              return (
                <Card key={c.id} className="border-l-4 border-l-red-500">
                  <p className="font-medium">{c.explanation}</p>
                  <div className={`mt-4 grid gap-3 ${c.evidence.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                    {c.evidence.map((e, i) => (
                      <div key={i} className="rounded-lg bg-stone-50 p-3 text-sm">
                        <div className="text-xs font-semibold text-stone-500">{e.label}</div>
                        <div className="mt-1 font-mono text-[13px]">{e.snippet}</div>
                        {e.url && (
                          <a href={e.url} target="_blank" className="mt-1 block text-xs text-blue-600 underline">
                            open
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  {d && <p className="mt-3 text-xs text-stone-400">Source: {memory.docs.find((x) => x.id === d.sourceId)?.title ?? d.sourceId}</p>}
                </Card>
              );
            })}
          </section>
        ) : null
      )}

      <SupersededNote count={memory.decisions.filter((d) => d.status === "superseded").length} />
    </div>
  );
}

function SupersededNote({ count }: { count: number }) {
  if (!count) return null;
  return (
    <Card className="bg-stone-50 text-sm text-stone-600">
      ✓ {count} decision(s) were <b>knowingly replaced</b> by the team (e.g. a moved deadline). Those are normal
      evolution, not alarms. See them on the Decisions page.
    </Card>
  );
}
