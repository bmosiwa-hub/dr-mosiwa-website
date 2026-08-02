import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, cn } from "@/lib/utils";
import { Briefcase, CheckSquare, Flag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Project View — AstelPO" };

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-amber-400",
  LOW: "text-slate-400",
};

const STATUS_COLOR: Record<string, string> = {
  TODO: "bg-slate-700 text-slate-300",
  IN_PROGRESS: "bg-indigo-900/50 text-indigo-300",
  IN_REVIEW: "bg-purple-900/50 text-purple-300",
  BLOCKED: "bg-red-900/50 text-red-300",
  DONE: "bg-green-900/50 text-green-300",
  CANCELLED: "bg-slate-800 text-slate-500",
};

export default async function ViewerProjectPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    include: {
      project: {
        include: {
          tasks: {
            where: { status: { notIn: ["DONE", "CANCELLED"] } },
            orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
          },
          milestones: { orderBy: { targetDate: "asc" } },
        },
      },
    },
  });

  if (!member || member.role !== "VIEWER") return notFound();
  if (member.status === "REVOKED") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-red-400 font-semibold mb-2">Access Revoked</p>
          <p className="text-slate-400 text-sm">Your access to this project has been removed by the owner.</p>
        </div>
      </div>
    );
  }

  const project = member.project;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-sm">AstelPO</span>
          <span className="text-slate-500 text-sm"> · Viewer access</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Project title */}
        <div className="flex items-start gap-3">
          {project.colorLabel && (
            <div className="w-3 h-3 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: project.colorLabel }} />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            {project.description && <p className="text-slate-400 text-sm mt-1">{project.description}</p>}
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              {project.startDate && <span>Start: {formatDate(project.startDate)}</span>}
              {project.endDate && <span>End: {formatDate(project.endDate)}</span>}
              <span className="capitalize">{project.status.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Overall progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {/* Tasks */}
        <div>
          <h2 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            Active Tasks
          </h2>
          {project.tasks.length === 0 ? (
            <p className="text-slate-500 text-sm">No active tasks.</p>
          ) : (
            <div className="space-y-2">
              {project.tasks.map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center gap-3">
                  <Flag className={cn("w-3.5 h-3.5 flex-shrink-0", PRIORITY_COLOR[task.priority])} />
                  <span className="text-slate-200 text-sm flex-1 truncate">{task.title}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded font-medium flex-shrink-0", STATUS_COLOR[task.status])}>
                    {task.status.replace("_", " ")}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-slate-500 flex-shrink-0">{formatDate(task.dueDate)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestones */}
        {project.milestones.length > 0 && (
          <div>
            <h2 className="text-white font-semibold text-sm mb-3">Milestones</h2>
            <div className="space-y-3">
              {project.milestones.map(m => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-200 text-sm">{m.name}</span>
                    {m.targetDate && <span className="text-xs text-slate-500">{formatDate(m.targetDate)}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.completionPct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{m.completionPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
