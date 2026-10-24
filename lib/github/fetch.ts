// PERSON 2 OWNS THIS FILE.
// Reads a real public GitHub repo: package.json, recent commits, issues (→ tasks), and notes/*.md (→ docs).
import type { ProjectSource, SourceDoc, Task } from "@/types/schema";

const API = "https://api.github.com";

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "team-memory" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`; // avoids the 60 req/hour limit
  return h;
}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: headers(), cache: "no-store" });
  if (res.status === 404) throw new GitHubError(404, `Not found on GitHub: ${path}`);
  if (res.status === 403 || res.status === 429)
    throw new GitHubError(res.status, "GitHub rate limit hit. Add a GITHUB_TOKEN in .env.local / Vercel, or wait an hour.");
  if (!res.ok) throw new GitHubError(res.status, `GitHub error ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

class GitHubError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// package.json (JS projects) or requirements.txt (Python projects). Neither → empty deps, no crash.
async function fetchDeps(repo: string): Promise<{ pkg: ProjectSource["pkg"]; pkgUrl?: string }> {
  try {
    const f = await gh<{ content: string; html_url: string }>(`/repos/${repo}/contents/package.json`);
    return { pkg: JSON.parse(decodeBase64(f.content)), pkgUrl: f.html_url };
  } catch (e) {
    if (e instanceof GitHubError && e.status !== 404) throw e;
  }
  try {
    const f = await gh<{ content: string; html_url: string }>(`/repos/${repo}/contents/requirements.txt`);
    const names = decodeBase64(f.content)
      .split("\n")
      .map((l) => l.split(/[=<>~!\[ ;#]/)[0].trim().toLowerCase())
      .filter(Boolean);
    return { pkg: { dependencies: Object.fromEntries(names.map((n) => [n, "*"])) }, pkgUrl: f.html_url };
  } catch (e) {
    if (e instanceof GitHubError && e.status !== 404) throw e;
  }
  return { pkg: {} };
}

function decodeBase64(b64: string) {
  return Buffer.from(b64, "base64").toString("utf8");
}

export function parseRepo(input: string): string | null {
  const m = input.trim().match(/(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/);
  return m ? `${m[1]}/${m[2]}` : null;
}

export async function fetchRepo(repo: string): Promise<ProjectSource> {
  // Does the repo exist and is it public?
  try {
    await gh(`/repos/${repo}`);
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) throw new Error(`Repo "${repo}" not found, or it is private. Use a public repo.`);
    throw e;
  }

  const { pkg, pkgUrl } = await fetchDeps(repo);

  // commits → evidence docs
  const commits = await gh<{ sha: string; html_url: string; commit: { message: string; author: { name: string; date: string } } }[]>(
    `/repos/${repo}/commits?per_page=30`
  );
  const commitDocs: SourceDoc[] = commits.map((c) => ({
    id: `commit-${c.sha.slice(0, 7)}`,
    type: "commit",
    title: c.commit.message.split("\n")[0],
    date: c.commit.author.date.slice(0, 10),
    author: c.commit.author.name,
    text: c.commit.message,
    url: c.html_url,
  }));

  // notes/*.md → meeting notes. First line can be "date: YYYY-MM-DD".
  let noteDocs: SourceDoc[] = [];
  try {
    const files = await gh<{ name: string; path: string; html_url: string }[]>(`/repos/${repo}/contents/notes`);
    noteDocs = await Promise.all(
      files
        .filter((f) => /\.(md|txt)$/i.test(f.name))
        .map(async (f, i) => {
          const file = await gh<{ content: string }>(`/repos/${repo}/contents/${f.path}`);
          const text = decodeBase64(file.content);
          const date = text.match(/date:\s*(\d{4}-\d{2}-\d{2})/i)?.[1] ?? new Date().toISOString().slice(0, 10);
          return { id: `note-${i + 1}`, type: "note" as const, title: f.name.replace(/\.(md|txt)$/i, ""), date, text, url: f.html_url };
        })
    );
  } catch (e) {
    if (e instanceof GitHubError && e.status !== 404) throw e;
    // no notes/ folder — fine, user can upload notes instead
  }

  // issues → tasks. In the issue body write: "estimate: 3d" and "depends on #12".
  const issues = await gh<
    { number: number; title: string; body: string | null; assignee: { login: string } | null; labels: { name: string }[]; pull_request?: unknown }[]
  >(`/repos/${repo}/issues?state=all&per_page=50`);
  const tasks: Task[] = issues
    .filter((i) => !i.pull_request)
    .map((i) => {
      const body = i.body ?? "";
      return {
        id: `#${i.number}`,
        title: i.title,
        assignee: i.assignee?.login ?? body.match(/assignee:\s*(\w+)/i)?.[1] ?? "unassigned",
        est: Number(body.match(/estimate:\s*(\d+)/i)?.[1] ?? 1),
        deps: [...body.matchAll(/depends on #(\d+)/gi)].map((m) => `#${m[1]}`),
        entities: i.labels.map((l) => l.name),
      };
    });

  return { docs: [...noteDocs, ...commitDocs], pkg, pkgUrl, tasks };
}
