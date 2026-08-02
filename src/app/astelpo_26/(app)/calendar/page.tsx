import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CalendarClient } from "./CalendarClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/astelpo_26/login");
  const userId = session.user.id;

  const [tasks, milestones, googleAccount] = await Promise.all([
    db.task.findMany({
      where: {
        project: { leadId: userId },
        status: { notIn: ["DONE", "CANCELLED"] },
        OR: [{ dueDate: { not: null } }, { startDate: { not: null } }],
      },
      select: {
        id: true, title: true, priority: true, status: true,
        dueDate: true, startDate: true,
        project: { select: { id: true, name: true, colorLabel: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    db.milestone.findMany({
      where: {
        project: { leadId: userId },
        status: { notIn: ["COMPLETED"] },
        targetDate: { not: null },
      },
      select: {
        id: true, name: true, targetDate: true, status: true,
        project: { select: { id: true, name: true } },
      },
    }),
    db.account.findFirst({
      where: { userId, provider: "google-calendar" },
      select: { id: true },
    }),
  ]);

  const serializedTasks = tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate?.toISOString() ?? null,
    startDate: t.startDate?.toISOString() ?? null,
    priority: t.priority as string,
    status: t.status as string,
  }));

  const serializedMilestones = milestones.map((m) => ({
    ...m,
    targetDate: m.targetDate?.toISOString() ?? null,
    status: m.status as string,
  }));

  return (
    <CalendarClient
      tasks={serializedTasks}
      milestones={serializedMilestones}
      isGoogleConnected={!!googleAccount}
    />
  );
}
