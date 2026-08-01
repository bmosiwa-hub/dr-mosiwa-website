"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createMilestone, updateMilestoneStatus, deleteMilestone } from "@/lib/actions/milestones";
import { Flag, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "MISSED"];
const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress",
  COMPLETED: "Completed", MISSED: "Missed",
};
const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "text-slate-400 bg-slate-800",
  IN_PROGRESS: "text-indigo-400 bg-indigo-900/30",
  COMPLETED: "text-green-400 bg-green-900/30",
  MISSED: "text-red-400 bg-red-900/30",
};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
      {pending ? "Adding…" : "Add Milestone"}
    </button>
  );
}

export type Milestone = { id: string; name: string; description: string | null; targetDate: Date | null; status: string; completionPct: number };

export function MilestonesClient({ projectId, initialMilestones }: { projectId: string; initialMilestones: Milestone[] }) {
  const [showForm, setShowForm] = useState(false);
  const bound = createMilestone.bind(null, projectId);
  const [state, formAction] = useActionState(bound, null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Milestones ({initialMilestones.length})</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {showForm && (
        <form action={async (fd: FormData) => { await formAction(fd); setShowForm(false); }}
          className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
          {(state as { error?: string } | null)?.error && (
            <p className="text-red-400 text-sm">{(state as { error: string }).error}</p>
          )}
          <input name="name" required placeholder="Milestone name *"
            className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
          <div className="grid grid-cols-2 gap-3">
            <input name="description" placeholder="Description (optional)"
              className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
            <input type="date" name="targetDate"
              className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
            <SubmitBtn />
          </div>
        </form>
      )}

      {initialMilestones.length === 0 && !showForm ? (
        <div className="text-center py-16 text-slate-500">
          <Flag className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400">No milestones yet</p>
          <p className="text-sm mt-1">Break the project into key checkpoints.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {initialMilestones.map((m) => (
            <div key={m.id} className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 group transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{m.name}</p>
                {m.description && <p className="text-slate-500 text-xs mt-0.5 truncate">{m.description}</p>}
                {m.targetDate && (
                  <p className="text-slate-600 text-xs mt-1">
                    Target: {new Date(m.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
              <div className="w-24 hidden sm:block">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.completionPct}%` }} />
                </div>
                <span className="text-xs text-slate-600">{m.completionPct}%</span>
              </div>
              <select value={m.status}
                onChange={(e) => updateMilestoneStatus(m.id, e.target.value, projectId)}
                className={cn("h-7 border-0 rounded-full px-2 text-xs font-medium focus:outline-none cursor-pointer", STATUS_COLORS[m.status])}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <form action={deleteMilestone.bind(null, m.id, projectId)}>
                <button type="submit" className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
