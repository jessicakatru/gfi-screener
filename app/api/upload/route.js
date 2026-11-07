import { extractResume } from "@/lib/extract";
import { scoreResume } from "@/lib/score";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) return Response.json({ error: "File ledu" }, { status: 400 });
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      return Response.json({ error: "Only .pdf or .docx files support chestayi" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const resume = await extractResume(buf, file.name);
    const scored = { ...resume, ...scoreResume(resume), sourceUrl: null };
    delete scored.rawText;
    return Response.json(scored);
  } catch (e) {
    return Response.json({ error: "Processing failed: " + e.message }, { status: 500 });
  }
}
