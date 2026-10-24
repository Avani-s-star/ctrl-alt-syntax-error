// PERSON 2 OWNS THIS FILE.
// POST multipart form with "files" → SourceDoc[]. Put "date: YYYY-MM-DD" in a note to set its date.
import type { SourceDoc } from "@/types/schema";

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const docs: SourceDoc[] = await Promise.all(
    files.map(async (f, i) => {
      const text = (await f.text()).slice(0, 20000);
      const date = text.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? new Date().toISOString().slice(0, 10);
      return { id: `upload-${Date.now()}-${i}`, type: "upload", title: f.name, date, text };
    })
  );
  return Response.json(docs);
}
