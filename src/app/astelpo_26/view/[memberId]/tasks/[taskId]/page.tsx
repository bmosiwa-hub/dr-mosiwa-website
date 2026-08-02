import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, formatRelative, cn } from "@/lib/utils";
import { ArrowLeft, Flag, ExternalLink, FileText } from "lucide-react";
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

export default async function ViewerTaskDetailPage({
  params,
}: {
  params: Promise<{ memberId: string; taskId: string }>;
}) {
  const { memberId, taskId } = await params;

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    select: { project: { select: { id: true } } },
  });
  if (!member) notFound();

  const task = await db.task.findUnique({
    where: { id: taskId, projectId: member.project.id },
    include: {
      comments: { orderBy: { createdAt: "asc" } },
      links: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!task) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href={`/astelpo_26/view/${memberId}/tasks`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to tasks
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Flag className={cn("w-4 h-4 flex-shrink-0 mt-0.5", PRIORITY_COLOR[task.priority])} />
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-lg font-semibold">{task.title}</h1>
            {task.description && (
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">{task.description}</p>
            )}
          </div>
          <span className={cn("text-xs px-2.5 py-1 rounded font-medium flex-shrink-0", STATUS_COLOR[task.status])}>
            {task.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <p className="text-slate-500 mb-0.5">Priority</p>
            <p className={cn("font-medium", PRIORITY_COLOR[task.priority])}>{task.priority}</p>
          </div>
          {task.startDate && (
            <div>
              <p className="text-slate-500 mb-0.5">Start date</p>
              <p className="text-slate-200">{formatDate(task.startDate)}</p>
            </div>
          )}
          {task.dueDate && (
            <div>
              <p className="text-slate-500 mb-0.5">Due date</p>
              <p className="text-slate-200">{formatDate(task.dueDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes (read-only) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Notes ({task.comments.length})
        </h3>
        {task.comments.length === 0 ? (
          <p className="text-slate-500 text-sm">No notes on this task.</p>
        ) : (
          <div className="space-y-3">
            {task.comments.map((c) => (
              <div key={c.id} className="border border-slate-800 rounded-lg p-3">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                <p className="text-slate-600 text-xs mt-2">{formatRelative(c.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Links (read-only) */}
      {task.links.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            Links ({task.links.length})
          </h3>
          <div className="space-y-2">
            {task.links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{l.title || l.url}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
