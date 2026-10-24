// PERSON 2 OWNS THIS FILE.
// GET /api/docs            → the built-in StudySync demo
// GET /api/docs?repo=o/r   → a real public GitHub repo
import { DEMO_DOCS, DEMO_PACKAGE_JSON, DEMO_TASKS } from "@/data/demo";
import { fetchRepo, parseRepo } from "@/lib/github/fetch";
import type { ProjectSource } from "@/types/schema";

export async function GET(req: Request) {
  const repoParam = new URL(req.url).searchParams.get("repo");
  if (!repoParam) {
    const demo: ProjectSource = { docs: DEMO_DOCS, pkg: DEMO_PACKAGE_JSON, tasks: DEMO_TASKS };
    return Response.json(demo);
  }
  const repo = parseRepo(repoParam);
  if (!repo) return Response.json({ error: "Use the form owner/repo or a github.com URL" }, { status: 400 });
  try {
    return Response.json(await fetchRepo(repo));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
