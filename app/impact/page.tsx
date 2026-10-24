"use client";
// PERSON 1 OWNS THIS FILE. The Digital Twin bridge: "what if we reverse this decision?"
import { useState } from "react";
import { Card, Empty } from "@/components/ui";
import { useMemory } from "@/components/useMemory";
import { reverseDecision } from "@/lib/sim/cpm";

export default function Impact() {
  const { memory, ready } = useMemory();
  const [decisionId, setDecisionId] = useState("");
  const [rework, setRework] = useState(50);
  if (!ready) return null;
  if (!memory) return <Empty />;
  if (!memory.tasks.length) return <Card>No tasks found. In GitHub mode, tasks come from Issues.</Card>;

  const options = memory.decisions.filter((d) => d.status !== "superseded");
  const decision = options.find((d) => d.id === decisionId) ?? options.find((d) => d.status === "contradicted") ?? options[0];
  const r = decision ? reverseDecision(memory.tasks, decision, rework) : null;
  const title = (id: string) => memory.tasks.find((t) => t.id === id)?.title ?? id;
  const people = r ? Object.keys({ ...r.before.load, ...r.after.load }) : [];
  const maxLoad = r ? Math.max(1, ...Object.values(r.after.load)) : 1;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">What if we reverse a decision?</h1>
        <p className="text-stone-600">Simulates the rework on the project plan and shows how the deadline and workload move.</p>
      </div>
      <Card className="space-y-3">
        <select value={decision?.id} onChange={(e) => setDecisionId(e.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
          {options.map((d) => (
            <option key={d.id} value={d.id}>{d.status === "contradicted" ? "⚠ " : ""}{d.what}</option>
          ))}
        </select>
        <label className="block text-sm">
          Rework on affected tasks: <b>+{rework}%</b>
          <input type="range" min={0} max={200} step={10} value={rework} onChange={(e) => setRework(+e.target.value)} className="w-full" />
        </label>
      </Card>

      {r && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <div className="text-xs text-stone-500">Project length</div>
              <div className="text-3xl font-bold">
                {r.before.total} → <span className={r.after.total > r.before.total ? "text-red-600" : ""}>{r.after.total}</span> days
              </div>
            </Card>
            <Card className="text-center">
              <div className="text-xs text-stone-500">Directly affected tasks</div>
              <div className="text-3xl font-bold">{r.direct.length}</div>
            </Card>
            <Card className="text-center">
              <div className="text-xs text-stone-500">Downstream tasks delayed</div>
              <div className="text-3xl font-bold">{r.downstream.length}</div>
            </Card>
          </div>
          <Card>
            <h2 className="font-semibold">Affected work</h2>
            {r.direct.length === 0 && <p className="text-sm text-stone-500">No task in the plan mentions this decision&apos;s topics.</p>}
            <ul className="mt-2 space-y-1 text-sm">
              {r.direct.map((id) => <li key={id}>🔴 {title(id)} <span className="text-stone-400">(rework)</span></li>)}
              {r.downstream.map((id) => <li key={id}>🟠 {title(id)} <span className="text-stone-400">(waits on the above)</span></li>)}
            </ul>
            <p className="mt-3 text-sm text-stone-500">Critical path after: {r.after.critical.map(title).join(" → ")}</p>
          </Card>
          <Card>
            <h2 className="font-semibold">Workload (days)</h2>
            <div className="mt-3 space-y-2">
              {people.map((p) => (
                <div key={p} className="text-sm">
                  <div className="flex justify-between"><span>{p}</span><span>{r.before.load[p] ?? 0} → {r.after.load[p] ?? 0}</span></div>
                  <div className="h-2 rounded bg-stone-100">
                    <div className="h-2 rounded bg-stone-900" style={{ width: `${((r.after.load[p] ?? 0) / maxLoad) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
