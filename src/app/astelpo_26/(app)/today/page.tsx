import { db } from "@/lib/db";
import { auth } from "@/auth";
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS, cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { Clock, FolderKanban } from "lucide-react";
import Link from "next/link";
import { OverduePanel, TodayPanel, UpcomingPanel, MilestonesPanel } from "./TodayClient";
import type { DashTask, DashMilestone } from "./TodayClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };

type ProjectItem = {
  id: string;
  name: string;
  status: string;
  priority: string;
  colorLabel: string | null;
  progress: number;
  endDate: Date | null;
};

export default async function TodayPage() {
  const session = await auth();
  const userId = session?.user?.id!;
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const ninetyDaysOut = addDays(now, 90);

  const taskInclude = { project: { select: { id: true, name: true, colorLabel: true } } } as const;

  const currentUser = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
  const firstName = currentUser?.name?.split(" ")[0] ?? "there";

  const [tasksDueToday, upcomingTasksRaw, overdueTasksRaw, recentProjects, recurringTasksRaw, activeProjects, upcomingMilestones] = await Promise.all([
    db.task.findMany({
      where: {
        project: { leadId: userId },
        dueDate: { gte: todayStart, lte: todayEnd },
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
          { startDate: { gt: todayEnd, lte: ninetyDaysOut } },
          { dueDate: { gt: todayEnd, lte: ninetyDaysOut } },
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
    db.project.findMany({
      where: { leadId: userId },
      orderBy: { name: "asc" },
      take: 5,
      select: { id: true, name: true, status: true, priority: true, colorLabel: true, progress: true, endDate: true },
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
        targetDate: { gte: todayStart, lte: addDays(now, 60) },
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
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">{greeting()}, {firstName}.</h2>
        <p className="text-slate-400 mt-1">
          {format(new Date(), "EEEE, MMMM d")} · {activeProjects} active project{activeProjects !== 1 ? "s" : ""}
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

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Recent Projects
              </h3>
              <Link href="/astelpo_26/projects" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">All</Link>
            </div>
            <div className="space-y-2">
              {recentProjects.map((p: ProjectItem) => (
                <Link key={p.id} href={`/astelpo_26/projects/${p.id}`}>
                  <div className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0 hover:opacity-80 transition-opacity">
                    {p.colorLabel ? (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.colorLabel }} />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-xs font-medium truncate">{p.name}</p>
                      <span className={cn("text-xs px-1.5 py-0 rounded font-medium", PROJECT_STATUS_COLORS[p.status])}>
                        {PROJECT_STATUS_LABELS[p.status]}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600">{p.progress}%</span>
                  </div>
                </Link>
              ))}
              {recentProjects.length === 0 && <p className="text-slate-500 text-xs">No projects yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

