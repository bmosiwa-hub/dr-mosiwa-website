import { db } from "@/lib/db";
import { auth } from "@/auth";
import { formatRelative, formatDate, isOverdue, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS, PRIORITY_COLORS, cn } from "@/lib/utils";
import { FolderKanban, CheckSquare, AlertCircle, TrendingUp, Clock, Calendar } from "lucide-react";
import { addDays } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id!;

  const twoWeeksFromNow = addDays(new Date(), 14);

  const [projectStats, taskStats, recentActivity, upcomingTasks] = await Promise.all([
    db.project.groupBy({
      by: ["status"],
      where: { leadId: userId },
      _count: { id: true },
    }),
    db.task.aggregate({
      where: { project: { leadId: userId } },
      _count: { id: true },
    }),
    db.activity.findMany({
      where: { userId },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    db.task.findMany({
      where: {
        project: { leadId: userId },
        status: { notIn: ["DONE", "CANCELLED"] },
        dueDate: { lte: twoWeeksFromNow },
      },
      include: { project: { select: { id: true, name: true, colorLabel: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  const totalProjects = projectStats.reduce((s: number, p: { _count: { id: number } }) => s + p._count.id, 0);
  const activeProjects = projectStats.find((p: { status: string }) => p.status === "ACTIVE")?._count.id ?? 0;
  const completedProjects = projectStats.find((p: { status: string }) => p.status === "COMPLETED")?._count.id ?? 0;

  const overdueTasks = await db.task.count({
    where: { project: { leadId: userId }, dueDate: { lt: new Date() }, status: { notIn: ["DONE", "CANCELLED"] } },
  });
  const completedTasks = await db.task.count({
    where: { project: { leadId: userId }, status: "DONE" },
  });

  const statCards = [
    { label: "Total Projects", value: totalProjects, icon: FolderKanban, color: "text-indigo-400", bg: "bg-indigo-900/20" },
    { label: "Active Projects", value: activeProjects, icon: TrendingUp, color: "text-green-400", bg: "bg-green-900/20" },
    { label: "Tasks Completed", value: completedTasks, icon: CheckSquare, color: "text-blue-400", bg: "bg-blue-900/20" },
    { label: "Overdue Tasks", value: overdueTasks, icon: AlertCircle, color: overdueTasks > 0 ? "text-red-400" : "text-slate-400", bg: overdueTasks > 0 ? "bg-red-900/20" : "bg-slate-800" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", s.bg)}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Upcoming Tasks
            </h3>
            <span className="text-xs text-slate-500">Next 14 days</span>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-slate-500 text-sm">No tasks due in the next 14 days.</p>
          ) : (
            <div className="space-y-0">
              {upcomingTasks.map((task: typeof upcomingTasks[number]) => (
                <Link key={task.id} href={`/astelpo_26/projects/${task.project.id}`}>
                  <div className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0 hover:opacity-80 transition-opacity">
                    {task.project.colorLabel ? (
                      <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: task.project.colorLabel }} />
                    ) : (
                      <div className="w-1.5 h-8 rounded-full bg-slate-700 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm truncate">{task.title}</p>
                      <p className="text-slate-500 text-xs truncate">{task.project.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", PRIORITY_COLORS[task.priority])}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className={cn("text-xs", isOverdue(task.dueDate) ? "text-red-400 font-medium" : "text-slate-400")}>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-400" />
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <p className="text-slate-500 text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((act: typeof recentActivity[number]) => (
                <div key={act.id} className="text-xs leading-relaxed">
                  <p className="text-slate-300">
                    {act.action}{" "}
                    {act.entityName && <span className="text-indigo-400 font-medium">{act.entityName}</span>}
                  </p>
                  {act.project && (
                    <p className="text-slate-600 truncate">{act.project.name}</p>
                  )}
                  <p className="text-slate-700 mt-0.5">{formatRelative(act.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
