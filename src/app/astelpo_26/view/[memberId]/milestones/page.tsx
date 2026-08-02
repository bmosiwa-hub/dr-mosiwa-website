import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, cn } from "@/lib/utils";
import { Target } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  NOT_STARTED: "bg-slate-700 text-slate-300",
  IN_PROGRESS: "bg-indigo-900/50 text-indigo-300",
  COMPLETED: "bg-green-900/50 text-green-300",
  MISSED: "bg-red-900/50 text-red-300",
};

export default async function ViewerMilestonesPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    select: {
      project: {
        select: {
          milestones: {
            orderBy: { targetDate: "asc" },
            select: { id: true, name: true, description: true, targetDate: true, completionPct: true, status: true },
          },
        },
      },
    },
  });

  if (!member) notFound();
  const milestones = member.project.milestones;

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Target className="w-4 h-4 text-indigo-400" />
        Milestones ({milestones.length})
      </h3>

      {milestones.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Target className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400">No milestones yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => (
            <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{m.name}</p>
                  {m.description && <p className="text-slate-400 text-xs mt-0.5">{m.description}</p>}
                  {m.targetDate && <p className="text-slate-500 text-xs mt-1">{formatDate(m.targetDate)}</p>}
                </div>
                <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0", STATUS_COLOR[m.status])}>
                  {m.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.completionPct}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{m.completionPct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
