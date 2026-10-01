import { db } from "@/lib/db";
import { auth } from "@/auth";
import { addDaysToKey, dayEnd, formatDayKey, hourIn } from "@/lib/dates";
import { resolveDayWindow } from "@/lib/dates.server";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { OverduePanel, TodayPanel, UpcomingPanel, MilestonesPanel, InProgressPanel } from "./TodayClient";
import type { DashTask, DashMilestone } from "./TodayClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };


export default async function TodayPage() {
  const session = await auth();
  const userId = session?.user?.id!;
  const now = new Date();

  const taskInclude = { project: { select: { id: true, name: true, colorLabel: true } } } as const;

  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, timezone: true },
  });
  const firstName = currentUser?.name?.split(" ")[0] ?? "there";

  // Due dates are calendar dates stored at UTC midnight, so "today" has to be
  // the viewer's calendar day — not a window cut from the server's clock,
  // which on Vercel is UTC and runs hours behind anyone east of Greenwich.
  const { todayKey, start: todayStart, end: tomorrowStart, timezone } =
    await resolveDayWindow(currentUser?.timezone);
  const ninetyDaysOut = dayEnd(addDaysToKey(todayKey, 90));
  const sixtyDaysOut = dayEnd(addDaysToKey(todayKey, 60));

  const [tasksDueToday, upcomingTasksRaw, overdueTasksRaw, inProgressTasks, recurringTasksRaw, activeProjects, upcomingMilestones] = await Promise.all([
    db.task.findMany({
      where: {
        project: { leadId: userId },
        dueDate: { gte: todayStart, lt: tomorrowStart },
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      include: taskInclude,
      orderBy: { priority: "desc" },
    }),
    db.task.findMany({
      where: {
        project: { leadId: userId },
        status: { notIn: ["DONE", "CANCELLED"] },
        OR: [
          { startDate: { gte: tomorrowStart, lt: ninetyDaysOut } },
          { dueDate: { gte: tomorrowStart, lt: ninetyDaysOut } },
        ],
      },
      include: taskInclude,
      orderBy: [{ startDate: "asc" }, { dueDate: "asc" }],
      take: 100,
    }),
    db.task.findMany({
      where: {
        project: { leadId: userId },
        dueDate: { lt: todayStart },
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      include: taskInclude,
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    // Started and not finished — the day's working set. A task counts as
    // started once its start date has arrived (or, with no start date, once it
    // is due), and stays here until it is actually done.
    db.task.findMany({
      where: {
        project: { leadId: userId },
        status: { notIn: ["DONE", "CANCELLED"] },
        OR: [
          { startDate: { lt: tomorrowStart } },
          { startDate: null, dueDate: { lt: tomorrowStart } },
        ],
      },
      include: taskInclude,
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    }),
    db.task.findMany({
      where: {
        project: { leadId: userId },
        recurrenceFrequency: { not: null },
        startDate: { not: null },
        status: { notIn: ["DONE", "CANCELLED"] },
        OR: [{ recurrenceEndsAt: null }, { recurrenceEndsAt: { gt: now } }],
      },
      select: {
        id: true, title: true, priority: true,
        recurrenceFrequency: true, startDate: true, dueDate: true, recurrenceEndsAt: true,
        project: { select: { id: true, name: true, colorLabel: true } },
      },
    }),
    db.project.count({ where: { leadId: userId, status: "ACTIVE" } }),
    db.milestone.findMany({
      where: {
        project: { leadId: userId },
        status: { notIn: ["COMPLETED", "MISSED"] },
        targetDate: { gte: todayStart, lt: sixtyDaysOut },
      },
      select: {
        id: true, name: true, targetDate: true, status: true,
        project: { select: { id: true, name: true, colorLabel: true } },
      },
      orderBy: { targetDate: "asc" },
      take: 10,
    }),
  ]);

  // Convert recurring tasks to RecurringTaskInput starting from the SECOND occurrence
  // so the original task occurrence (already in upcoming/today) isn't shown twice.
  function advanceDate(d: Date, freq: string) {
    switch (freq) {
      case "DAILY":    d.setDate(d.getDate() + 1); break;
      case "WEEKLY":   d.setDate(d.getDate() + 7); break;
      case "BIWEEKLY": d.setDate(d.getDate() + 14); break;
      case "MONTHLY":  d.setMonth(d.getMonth() + 1); break;
    }
  }
  const recurringInputs = recurringTasksRaw
    .filter(t => t.startDate)
    .map(t => {
      const s = new Date(t.startDate!);
      const e = t.dueDate ? new Date(t.dueDate) : new Date(s);
      const durationDays = Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
      const nextStart = new Date(s);
      advanceDate(nextStart, t.recurrenceFrequency!);
      return {
        id: t.id,
        title: t.title,
        priority: t.priority as string,
        frequency: t.recurrenceFrequency as string,
        durationDays,
        startingFrom: nextStart,
        endsAt: t.recurrenceEndsAt,
        project: t.project,
      };
    });

  const greeting = () => {
    const h = hourIn(timezone, now);
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">{greeting()}, {firstName}.</h2>
        <p className="text-slate-400 mt-1">
          {formatDayKey(todayKey)} · {activeProjects} active project{activeProjects !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Due Today", value: tasksDueToday.length, color: tasksDueToday.length > 0 ? "bg-indigo-900/30 text-indigo-300 border-indigo-700/30" : "bg-slate-800 text-slate-400 border-slate-700" },
          { label: "Overdue", value: overdueTasksRaw.length, color: overdueTasksRaw.length > 0 ? "bg-red-900/30 text-red-400 border-red-800/30" : "bg-slate-800 text-slate-400 border-slate-700" },
          { label: "Upcoming", value: upcomingTasksRaw.length, color: "bg-amber-900/20 text-amber-400 border-amber-800/20" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${s.color}`}>
            <span className="font-bold text-base">{s.value}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <OverduePanel tasks={overdueTasksRaw} />
          <TodayPanel tasks={tasksDueToday} />
          <UpcomingPanel tasks={upcomingTasksRaw} recurringTasks={recurringInputs} />
          <MilestonesPanel milestones={upcomingMilestones.map((m): DashMilestone => ({
            id: m.id, name: m.name, status: m.status as string,
            targetDate: m.targetDate?.toISOString() ?? null,
            project: m.project,
          }))} />
        </div>

        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[{ label: "New Project", href: "/astelpo_26/projects/new", icon: FolderKanban }].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                  <a.icon className="w-4 h-4 text-indigo-400" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          <InProgressPanel tasks={inProgressTasks as DashTask[]} todayKey={todayKey} />
        </div>
      </div>
    </div>
  );
}

