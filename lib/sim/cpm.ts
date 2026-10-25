// PERSON 1 OWNS THIS FILE. (The "Digital Twin" part — plain DSA.)
import type { Decision, Task } from "@/types/schema";

// Critical Path Method: earliest finish of each task = max(finish of deps) + own estimate.
export function schedule(tasks: Task[]) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const finish = new Map<string, number>();
  const visiting = new Set<string>();

  const finishOf = (id: string): number => {
    if (finish.has(id)) return finish.get(id)!;
    if (visiting.has(id)) throw new Error(`Dependency cycle at task ${id}`);
    visiting.add(id);
    const t = byId.get(id);
    const start = t ? Math.max(0, ...t.deps.filter((d) => byId.has(d)).map(finishOf)) : 0;
    const f = start + (t?.est ?? 0);
    visiting.delete(id);
    finish.set(id, f);
    return f;
  };

  tasks.forEach((t) => finishOf(t.id));
  const total = Math.max(0, ...finish.values());

  // Walk back from the last task to get the critical path.
  const critical: string[] = [];
  let cur = tasks.find((t) => finish.get(t.id) === total);
  while (cur) {
    critical.unshift(cur.id);
    const start = finish.get(cur.id)! - cur.est;
    cur = cur.deps.map((d) => byId.get(d)).find((d) => d && finish.get(d.id) === start);
  }
  return { total, finish, critical };
}

export function workload(tasks: Task[]) {
  const load: Record<string, number> = {};
  for (const t of tasks) load[t.assignee] = (load[t.assignee] ?? 0) + t.est;
  return load;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, "");

function overlaps(a: string[], b: string[]) {
  return a.some((x) => b.some((y) => norm(x) === norm(y) || norm(x).includes(norm(y)) || norm(y).includes(norm(x))));
}

// "What if we reverse this decision?"
export function reverseDecision(tasks: Task[], decision: Decision, reworkPct: number) {
  const direct = tasks.filter((t) => overlaps(t.entities, decision.entities)).map((t) => t.id);

  // Everything downstream of a directly affected task (BFS over reverse dependencies).
  const downstream = new Set<string>();
  const queue = [...direct];
  while (queue.length) {
    const id = queue.shift()!;
    for (const t of tasks)
      if (t.deps.includes(id) && !direct.includes(t.id) && !downstream.has(t.id)) {
        downstream.add(t.id);
        queue.push(t.id);
      }
  }

  const changed = tasks.map((t) =>
    direct.includes(t.id) ? { ...t, est: Math.ceil(t.est * (1 + reworkPct / 100)) } : t
  );
  const before = schedule(tasks);
  const after = schedule(changed);
  return {
    direct,
    downstream: [...downstream],
    before: { total: before.total, critical: before.critical, load: workload(tasks) },
    after: { total: after.total, critical: after.critical, load: workload(changed) },
  };
}
export function projectDays(tasks: { id: string; est: number; deps: string[] }[]): number {
  const finish: Record<string, number> = {};

  const done = (id: string): number => {
    if (finish[id] !== undefined) return finish[id];

    const task = tasks.find((t) => t.id === id);
    if (!task) return 0;

    return (finish[id] = Math.max(0, ...task.deps.map(done)) + task.est);
  };

  return Math.max(0, ...tasks.map((t) => done(t.id)));
}