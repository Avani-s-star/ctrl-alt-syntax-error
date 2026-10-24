// PERSON 2 OWNS THIS FILE.
// Layer 1 of contradiction detection: decision vs. code. Deterministic, no AI, very reliable.
import type { Contradiction, Decision, SourceDoc } from "@/types/schema";

type Tech = { name: string; aliases: string[]; packages: string[]; categories: string[] };

// Add more technologies here. aliases = how people write it in notes; packages = npm names.
export const TECH: Tech[] = [
  { name: "Firebase", aliases: ["firebase"], packages: ["firebase", "firebase-admin", "pyrebase4"], categories: ["auth", "database"] },
  { name: "Supabase", aliases: ["supabase"], packages: ["@supabase/supabase-js", "@supabase/ssr", "supabase"], categories: ["auth", "database"] },
  { name: "Clerk", aliases: ["clerk"], packages: ["@clerk/nextjs"], categories: ["auth"] },
  { name: "Auth.js", aliases: ["next-auth", "nextauth", "auth.js"], packages: ["next-auth"], categories: ["auth"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo", "mongoose"], packages: ["mongodb", "mongoose", "pymongo", "motor", "mongoengine"], categories: ["database"] },
  { name: "Prisma/Postgres", aliases: ["prisma", "postgres", "postgresql"], packages: ["@prisma/client", "pg", "postgres", "psycopg2", "psycopg2-binary", "psycopg", "asyncpg"], categories: ["database"] },
  { name: "MySQL", aliases: ["mysql"], packages: ["mysql2", "mysql", "pymysql", "mysqlclient"], categories: ["database"] },
  { name: "Redux", aliases: ["redux"], packages: ["redux", "@reduxjs/toolkit", "react-redux"], categories: ["state"] },
  { name: "Zustand", aliases: ["zustand"], packages: ["zustand"], categories: ["state"] },
  { name: "Jotai", aliases: ["jotai"], packages: ["jotai"], categories: ["state"] },
  { name: "Chart.js", aliases: ["chart.js", "chartjs", "react-chartjs"], packages: ["chart.js", "react-chartjs-2"], categories: ["charts"] },
  { name: "Recharts", aliases: ["recharts"], packages: ["recharts"], categories: ["charts"] },
  { name: "D3", aliases: ["d3"], packages: ["d3"], categories: ["charts"] },
  { name: "Tailwind", aliases: ["tailwind"], packages: ["tailwindcss"], categories: ["styling"] },
  { name: "styled-components", aliases: ["styled-components", "styled components"], packages: ["styled-components"], categories: ["styling"] },
  { name: "GraphQL", aliases: ["graphql", "apollo"], packages: ["graphql", "@apollo/client"], categories: ["api"] },
  { name: "tRPC", aliases: ["trpc"], packages: ["@trpc/server", "@trpc/client"], categories: ["api"] },
];

export function techFor(entity: string): Tech | undefined {
  const e = entity.toLowerCase();
  return TECH.find((t) => t.aliases.some((a) => e === a || e.includes(a)));
}

type Pkg = { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

export function checkCode(decisions: Decision[], pkg: Pkg, docs: SourceDoc[] = [], pkgUrl?: string): Contradiction[] {
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  const present = TECH.filter((t) => t.packages.some((p) => deps.includes(p)));
  const commits = docs.filter((d) => d.type === "commit");
  const out: Contradiction[] = [];

  for (const d of decisions) {
        // Skip only if the team RECORDED a switch to another technology (e.g. "moving auth to Supabase").
    // If the newer decision names no technology, the package change is still unexplained → keep checking.
    if (d.status === "superseded") {
      const newer = decisions.find((x) => x.id === d.supersededBy);
      if (newer?.entities.some((e) => techFor(e))) continue;
    }
    const seen = new Set<string>();
    for (const entity of d.entities) {
      const tech = techFor(entity);
      if (!tech || seen.has(tech.name)) continue;
      seen.add(tech.name);
      if (present.includes(tech)) continue; // decision matches the code

      const alternatives = present.filter((p) => p.categories.some((c) => tech.categories.includes(c)));
      if (alternatives.length === 0) continue; // nothing in that category at all — likely not built yet, don't alarm

           // Best evidence = commits mentioning the old tech AND the new one ("replace mongo with postgres").
      const mentions = (c: SourceDoc, t: Tech) => t.aliases.some((al) => c.text.toLowerCase().includes(al));
      const switchCommits = commits.filter((c) => alternatives.some((a) => mentions(c, a)));
      const both = switchCommits.filter((c) => mentions(c, tech));
      const relatedCommits = both.length ? both : switchCommits;

      // If a commit shows what it was switched TO, name only that replacement.
      const named = alternatives.filter((a) => both.some((c) => mentions(c, a)));
      const replacements = named.length ? named : alternatives;
      const altNames = replacements.map((a) => a.name);
      const usedPkgs = deps.filter((p) => replacements.some((a) => a.packages.includes(p)));
      
      out.push({
        id: `code-${d.id}-${tech.name}`,
        decisionId: d.id,
        kind: "code",
        explanation: `The team decided to use ${tech.name}, but the codebase has no ${tech.name} package. It uses ${altNames.join(" / ")} instead, and no recorded decision explains the switch.`,
        evidence: [
          { label: `Decision (${d.date}, ${d.who})`, snippet: d.what },
          { label: "package.json", snippet: usedPkgs.join(", "), url: pkgUrl },
          ...relatedCommits.slice(0, 2).map((c) => ({
            label: `Commit by ${c.author ?? "?"} (${c.date})`,
            snippet: c.text,
            url: c.url,
          })),
        ],
      });
    }
  }
  return out;
}
