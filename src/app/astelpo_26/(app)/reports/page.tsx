import { db } from "@/lib/db";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import { subDays, startOfDay } from "date-fns";
import { BarChart2, CheckCircle2, AlertCircle, Clock, Flag, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500",
  PLANNING: "bg-blue-500",
  ON_HOLD: "bg-amber-500",
  COMPLETED: "bg-purple-500",
  CANCELLED: "bg-slate-500",
  ARCHIVED: "bg-slate-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-amber-500",
  MEDIUM: "bg-indigo-500",
  LOW: "bg-slate-500",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-500",
  IN_PROGRESS: "bg-indigo-500",
  IN_REVIEW: "bg-amber-500",
  BLOCKED: "bg-red-500",
  DONE: "bg-green-500",
  CANCELLED: "bg-slate-700",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "To Do", IN_PROGRESS: "In Progress", IN_REVIEW: "In Review",
  BLOCKED: "Blocked", DONE: "Done", CANCELLED: "Cancelled",
};

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className={cn("text-3xl font-bold mt-1.5", color ?? "text-white")}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function BarRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 text-xs w-24 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-400 text-xs w-12 text-right flex-shrink-0">{count} <span className="text-slate-600">({pct}%)</span></span>
    </div>
  );
}

export default async function ReportsPage() {
  const session = await auth();
  const userId = session?.user?.id!;
  const now = new Date();
  const todayStart = startOfDay(now);
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  const [tasks, projects, milestones] = await Promise.all([
    db.task.findMany({
      where: { project: { leadId: userId } },
      select: {
        id: true, status: true, priority: true, dueDate: true,
        createdAt: true, recurrenceFrequency: true,
      },
    }),
    db.project.findMany({
      where: { leadId: userId },
      select: { id: true, name: true, status: true, progress: true, colorLabel: true, endDate: true },
      orderBy: { progress: "desc" },
    }),
    db.milestone.findMany({
      where: { project: { leadId: userId } },
      select: { id: true, status: true, targetDate: true, completionPct: true },
    }),
  ]);

  // Task counts
  const nonRecurring = tasks.filter(t => !t.recurrenceFrequency);
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  for (const t of nonRecurring) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
  }

  const totalTasks = nonRecurring.length;
  const doneTasks = byStatus["DONE"] ?? 0;
  const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const overdueTasks = nonRecurring.filter(
    t => t.dueDate && new Date(t.dueDate) < todayStart && t.status !== "DONE" && t.status !== "CANCELLED"
  ).length;

  const completedThisMonth = nonRecurring.filter(
    t => t.status === "DONE" && t.createdAt >= thirtyDaysAgo
  ).length;
  const completedPrevMonth = nonRecurring.filter(
    t => t.status === "DONE" && t.createdAt >= sixtyDaysAgo && t.createdAt < thirtyDaysAgo
  ).length;
  const trendUp = completedThisMonth >= completedPrevMonth;

  // Project counts
  const projectByStatus: Record<string, number> = {};
  for (const p of projects) {
    projectByStatus[p.status] = (projectByStatus[p.status] ?? 0) + 1;
  }

  const activeProjects = projectByStatus["ACTIVE"] ?? 0;
  const avgProgress = projects.length === 0 ? 0 : Math.round(
    projects.reduce((s, p) => s + p.progress, 0) / projects.length
  );

  // Milestone counts
  const msTotal = milestones.length;
  const msCompleted = milestones.filter(m => m.status === "COMPLETED").length;
  const msMissed = milestones.filter(m => m.status === "MISSED").length;
  const msUpcoming = milestones.filter(
    m => m.targetDate && new Date(m.targetDate) >= now && m.status !== "COMPLETED"
  ).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-indigo-400" />
          Reports
        </h2>
        <p className="text-slate-400 text-sm mt-1">Portfolio overview across all your projects.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={totalTasks} sub={`${doneTasks} done`} />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          sub={trendUp ? "↑ vs last 30 days" : "↓ vs last 30 days"}
          color={completionRate >= 70 ? "text-green-400" : completionRate >= 40 ? "text-amber-400" : "text-red-400"}
        />
        <StatCard
          label="Overdue"
          value={overdueTasks}
          sub="active tasks past due"
          color={overdueTasks > 0 ? "text-red-400" : "text-green-400"}
        />
        <StatCard label="Active Projects" value={activeProjects} sub={`${avgProgress}% avg progress`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tasks by status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            Tasks by Status
          </h3>
          <div className="space-y-3">
            {["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"].map(s => (
              <BarRow
                key={s}
                label={TASK_STATUS_LABELS[s]}
                count={byStatus[s] ?? 0}
                total={totalTasks}
                color={TASK_STATUS_COLORS[s]}
              />
            ))}
          </div>
        </div>

        {/* Tasks by priority */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Tasks by Priority
          </h3>
          <div className="space-y-3">
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => (
              <BarRow
                key={p}
                label={p[0] + p.slice(1).toLowerCase()}
                count={byPriority[p] ?? 0}
                total={totalTasks}
                color={PRIORITY_COLORS[p]}
              />
            ))}
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <TrendingUp className={cn("w-4 h-4", trendUp ? "text-green-400" : "text-red-400")} />
            <p className="text-xs text-slate-400">
              <span className={cn("font-medium", trendUp ? "text-green-400" : "text-red-400")}>
                {completedThisMonth}
              </span>{" "}
              tasks completed in the last 30 days
              {completedPrevMonth > 0 && (
                <span className="text-slate-600"> (vs {completedPrevMonth} prior month)</span>
              )}
            </p>
          </div>
        </div>

        {/* Project progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-2">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Project Progress
            <span className="text-slate-500 font-normal">({projects.length})</span>
          </h3>
          {projects.length === 0 ? (
            <p className="text-slate-500 text-sm">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.colorLabel ?? "#6366f1" }}
                  />
                  <span className="text-slate-300 text-sm truncate w-40 flex-shrink-0">{p.name}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all",
                        p.progress >= 80 ? "bg-green-500" : p.progress >= 50 ? "bg-indigo-500" : p.progress >= 20 ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right flex-shrink-0">{p.progress}%</span>
                  <span className={cn(
                    "text-xs w-16 text-right flex-shrink-0",
                    STATUS_COLORS[p.status] ? "" : "text-slate-500"
                  )}>
                    <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1", STATUS_COLORS[p.status] ?? "bg-slate-500")} />
                    {p.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Flag className="w-4 h-4 text-purple-400" />
            Milestones
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total", value: msTotal, color: "text-white" },
              { label: "Completed", value: msCompleted, color: "text-green-400" },
              { label: "Upcoming", value: msUpcoming, color: "text-indigo-400" },
              { label: "Missed", value: msMissed, color: msMissed > 0 ? "text-red-400" : "text-slate-500" },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {msTotal > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Milestone health</span>
                <span>{msTotal > 0 ? Math.round((msCompleted / msTotal) * 100) : 0}% complete</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-green-500 h-full" style={{ width: `${Math.round((msCompleted / msTotal) * 100)}%` }} />
                <div className="bg-red-500/70 h-full" style={{ width: `${Math.round((msMissed / msTotal) * 100)}%` }} />
              </div>
              <div className="flex gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Done</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/70 inline-block" />Missed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />Remaining</span>
              </div>
            </div>
          )}
        </div>

        {/* Projects by status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">Projects by Status</h3>
          <div className="space-y-3">
            {["ACTIVE", "PLANNING", "ON_HOLD", "COMPLETED", "CANCELLED"].map(s => (
              <BarRow
                key={s}
                label={s.replace("_", " ")}
                count={projectByStatus[s] ?? 0}
                total={projects.length}
                color={STATUS_COLORS[s] ?? "bg-slate-500"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
