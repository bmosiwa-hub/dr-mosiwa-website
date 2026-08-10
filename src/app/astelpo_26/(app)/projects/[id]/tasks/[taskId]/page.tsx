import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TaskDetailClient } from "./TaskDetailClient";
import { updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import { cn, formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, CalendarClock, Flag } from "lucide-react";

const STATUS_OPTS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];
const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do", IN_PROGRESS: "In Progress", IN_REVIEW: "In Review",
  BLOCKED: "Blocked", DONE: "Done", CANCELLED: "Cancelled",
};
const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-700 text-slate-300",
  IN_PROGRESS: "bg-indigo-900/40 text-indigo-300",
  IN_REVIEW: "bg-amber-900/40 text-amber-300",
  BLOCKED: "bg-red-900/40 text-red-400",
  DONE: "bg-green-900/40 text-green-400",
  CANCELLED: "bg-slate-800 text-slate-500",
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-400", MEDIUM: "text-blue-400",
  HIGH: "text-amber-400", CRITICAL: "text-red-400",
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id: projectId, taskId } = await params;

  const task = await db.task.findUnique({
    where: { id: taskId, projectId },
    include: {
      comments: { orderBy: { createdAt: "desc" } },
      links: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!task) notFound();

  const backHref = `/astelpo_26/projects/${projectId}/tasks`;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </Link>

      {/* Task header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <h2 className={cn("text-xl font-bold flex-1", task.status === "DONE" || task.status === "CANCELLED" ? "line-through text-slate-500" : "text-white")}>
            {task.title}
          </h2>
        </div>

        {task.description && (
          <p className="text-slate-400 text-sm leading-relaxed">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className={cn("h-6 px-2.5 rounded-full text-xs font-medium flex items-center", STATUS_COLORS[task.status])}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className={cn("text-xs font-semibold flex items-center gap-1", PRIORITY_COLORS[task.priority])}>
            <Flag className="w-3 h-3" />
            {task.priority}
          </span>
          {task.startDate && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <CalendarClock className="w-3 h-3" />
              Start {formatDate(task.startDate)}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Quick status change */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-500 self-center">Move to:</span>
          {STATUS_OPTS.filter(s => s !== task.status).map(s => (
            <form key={s} action={updateTaskStatus.bind(null, taskId, s, projectId)}>
              <button type="submit"
                className="h-7 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors">
                {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        </div>
      </div>

      <TaskDetailClient taskId={taskId} projectId={projectId} notes={task.comments} links={task.links} />

      {/* Danger zone */}
      <div className="bg-slate-900 border border-red-900/20 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300 font-medium">Delete task</p>
          <p className="text-xs text-slate-500 mt-0.5">This cannot be undone.</p>
        </div>
        <form action={deleteTask.bind(null, taskId, projectId)}>
          <button type="submit"
            className="h-8 px-3 bg-red-900/30 hover:bg-red-800/50 text-red-400 text-xs font-medium rounded-lg border border-red-800/30 transition-colors">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
