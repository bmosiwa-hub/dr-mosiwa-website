import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, cn } from "@/lib/utils";
import { CheckSquare, Clock } from "lucide-react";
import Link from "next/link";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: "desc" }, take: 5 },
      milestones: { orderBy: { targetDate: "asc" }, take: 5 },
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" /> Recent Tasks
            </h3>
            <Link href={`/astelpo_26/projects/${id}/tasks`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>
          {project.tasks.length === 0 ? (
            <p className="text-slate-500 text-sm">No tasks yet. <Link href={`/astelpo_26/projects/${id}/tasks`} className="text-indigo-400 hover:underline">Add one</Link></p>
          ) : (
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                    task.status === "DONE" ? "bg-green-500" : task.status === "IN_PROGRESS" ? "bg-indigo-500" : "bg-slate-600")} />
                  <span className={cn("text-sm flex-1 truncate",
                    task.status === "DONE" ? "line-through text-slate-600" : "text-slate-300")}>{task.title}</span>
                  {task.dueDate && <span className="text-xs text-slate-500 flex-shrink-0">{formatDate(task.dueDate)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {project.milestones.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Milestones</h3>
              <Link href={`/astelpo_26/projects/${id}/milestones`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm truncate">{m.name}</p>
                    {m.targetDate && <p className="text-slate-600 text-xs">{formatDate(m.targetDate)}</p>}
                  </div>
                  <div className="w-20">
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.completionPct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{m.completionPct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-indigo-400" /> Activity
        </h3>
        {project.activities.length === 0 ? (
          <p className="text-slate-500 text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {project.activities.map((act) => (
              <div key={act.id} className="text-xs text-slate-400 leading-relaxed">
                <span className="text-slate-200 font-medium">{act.user.name}</span>{" "}
                {act.action}
                {act.entityName && <span className="text-indigo-400"> {act.entityName}</span>}
                <div className="text-slate-600 mt-0.5">{formatDate(act.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
