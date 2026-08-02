import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const accountStatus = (session?.user as { accountStatus?: string } | undefined)?.accountStatus;
  if (!session?.user || accountStatus !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id!;
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const [overdue, dueToday] = await Promise.all([
    db.task.findMany({
      where: { project: { leadId: userId }, dueDate: { lt: todayStart }, status: { notIn: ["DONE", "CANCELLED"] } },
      select: { id: true, title: true, dueDate: true, projectId: true, project: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    db.task.findMany({
      where: { project: { leadId: userId }, dueDate: { gte: todayStart, lte: todayEnd }, status: { notIn: ["DONE", "CANCELLED"] } },
      select: { id: true, title: true, dueDate: true, projectId: true, project: { select: { name: true } } },
      orderBy: { priority: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({ overdue, dueToday });
}
