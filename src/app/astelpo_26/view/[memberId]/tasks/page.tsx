import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, cn } from "@/lib/utils";
import { CheckSquare, Flag } from "lucide-react";
import Link from "next/link";

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-amber-400",
  LOW: "text-slate-500",
};

const STATUS_COLOR: Record<string, string> = {
  TODO: "bg-slate-700 text-slate-300",
  IN_PROGRESS: "bg-indigo-900/50 text-indigo-300",
  IN_REVIEW: "bg-purple-900/50 text-purple-300",
  BLOCKED: "bg-red-900/50 text-red-300",
  DONE: "bg-green-900/50 text-green-300",
  CANCELLED: "bg-slate-800 text-slate-500",
};

const STATUS_ORDER = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];

export default async function ViewerTasksPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    select: {
      project: {
        select: {
          tasks: {
            orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
            select: { id: true, title: true, description: true, status: true, priority: true, startDate: true, dueDate: true },
          },
        },
      },
    },
  });

  if (!member) notFound();

  const tasks = member.project.tasks;
  const active = tasks.filter(t => !["DONE", "CANCELLED"].includes(t.status));
  const done = tasks.filter(t => ["DONE", "CANCELLED"].includes(t.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-400" />
          Tasks ({tasks.length})
        </h3>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400">No tasks yet</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2">
              {active.map((task) => (
                <Link key={task.id} href={`/astelpo_26/view/${memberId}/tasks/${task.id}`}>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-slate-700 transition-colors">
                    <Flag className={cn("w-3.5 h-3.5 flex-shrink-0", PRIORITY_COLOR[task.priority])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm truncate">{task.title}</p>
                      {task.description && <p className="text-slate-500 text-xs truncate mt-0.5">{task.description}</p>}
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded font-medium flex-shrink-0", STATUS_COLOR[task.status])}>
                      {task.status.replace("_", " ")}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-slate-500 flex-shrink-0">{formatDate(task.dueDate)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {done.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed / Cancelled</p>
              {done.map((task) => (
                <Link key={task.id} href={`/astelpo_26/view/${memberId}/tasks/${task.id}`}>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 flex items-center gap-3 opacity-60 hover:opacity-80 transition-opacity">
                    <Flag className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" />
                    <p className="text-slate-400 text-sm flex-1 truncate line-through">{task.title}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded font-medium flex-shrink-0", STATUS_COLOR[task.status])}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
