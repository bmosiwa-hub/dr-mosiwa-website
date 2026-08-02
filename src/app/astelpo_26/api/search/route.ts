import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ tasks: [], projects: [] });

  const userId = session.user.id!;

  const [tasks, projects] = await Promise.all([
    db.task.findMany({
      where: {
        project: { leadId: userId },
        title: { contains: q, mode: "insensitive" },
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      select: { id: true, title: true, priority: true, dueDate: true, projectId: true, project: { select: { name: true } } },
      take: 6,
    }),
    db.project.findMany({
      where: {
        leadId: userId,
        name: { contains: q, mode: "insensitive" },
        status: { not: "COMPLETED" },
      },
      select: { id: true, name: true, status: true, colorLabel: true },
      take: 4,
    }),
  ]);

  return NextResponse.json({ tasks, projects });
}
