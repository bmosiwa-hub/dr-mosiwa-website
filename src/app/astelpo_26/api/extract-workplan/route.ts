import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const PROMPT = `You are analyzing a project workplan document. Extract ALL tasks, activities, and milestones.

Return ONLY a valid JSON object — no markdown fences, no explanation, just JSON:
{
  "tasks": [
    {
      "title": "task title",
      "description": "one-line description or null",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "dueDate": "YYYY-MM-DD or null"
    }
  ],
  "milestones": [
    {
      "name": "milestone name",
      "description": "one-line description or null",
      "targetDate": "YYYY-MM-DD or null"
    }
  ]
}

Rules:
- Individual activities, tasks, deliverables → tasks array
- Key phase endpoints, major checkpoints, submission deadlines → milestones array
- Use null for dates not explicitly mentioned
- Assume year ${new Date().getFullYear()} when only month/day is given
- Priority: CRITICAL for key deliverables, HIGH for important tasks, MEDIUM for standard, LOW for minor`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  try {
    if (ext === "pdf") {
      const pdfParse = (await import("pdf-parse")) as unknown as (buf: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (ext === "docx" || ext === "doc") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (ext === "xlsx" || ext === "xls") {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      for (const sheetName of workbook.SheetNames) {
        text += `\n--- Sheet: ${sheetName} ---\n`;
        text += XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported format. Upload a PDF, Word (.docx), or Excel (.xlsx) file." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Could not read the file. Make sure it is not password protected or corrupted." },
      { status: 400 }
    );
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "No text could be extracted from the file." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `${PROMPT}\n\n---WORKPLAN---\n${text.slice(0, 20000)}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  console.log("[extract-workplan] raw response:", raw.slice(0, 2000));

  // Strip markdown code fences if present
  const stripped = raw.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);

  if (!match) {
    console.log("[extract-workplan] no JSON object found in response");
    return NextResponse.json({ error: "Extraction produced no structured output." }, { status: 500 });
  }

  try {
    const result = JSON.parse(match[0]) as {
      tasks: { title: string; description: string | null; priority: string; dueDate: string | null }[];
      milestones: { name: string; description: string | null; targetDate: string | null }[];
    };
    return NextResponse.json({
      tasks: result.tasks ?? [],
      milestones: result.milestones ?? [],
    });
  } catch (err) {
    console.log("[extract-workplan] JSON parse error:", err, "matched text:", match[0].slice(0, 500));
    return NextResponse.json({ error: "Could not parse the extracted data." }, { status: 500 });
  }
}
