"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateTask } from "@/lib/actions/tasks";
import { Pencil, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];
const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do", IN_PROGRESS: "In Progress", IN_REVIEW: "In Review",
  BLOCKED: "Blocked", DONE: "Done", CANCELLED: "Cancelled",
};
const PRIORITY_OPTS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

type Props = {
  taskId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: string | null;
  dueDate: string | null;
  recurrenceFrequency: string | null;
  recurrenceEndsAt: string | null;
};

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
      {pending ? "Saving…" : "Save Changes"}
    </button>
  );
}

export function TaskEditInline(props: Props) {
  const [editing, setEditing] = useState(false);
  const [isRecurring, setIsRecurring] = useState(!!props.recurrenceFrequency);

  const bound = updateTask.bind(null, props.taskId, props.projectId);
  const [state, formAction] = useActionState(bound, null);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors flex-shrink-0"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
    );
  }

  return (
    <form
      action={async (fd) => { await formAction(fd); setEditing(false); }}
      className="bg-slate-800/50 border border-indigo-700/50 rounded-xl p-4 space-y-3 w-full"
    >
      {(state as { error?: string } | null)?.error && (
        <p className="text-red-400 text-xs">{(state as { error: string }).error}</p>
      )}

      <input name="title" required defaultValue={props.title}
        placeholder="Task title *"
        className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />

      <textarea name="description" rows={2} defaultValue={props.description ?? ""}
        placeholder="Description (optional)"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none" />

      <div className="grid grid-cols-2 gap-3">
        <select name="status" defaultValue={props.status}
          className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
          {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select name="priority" defaultValue={props.priority}
          className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
          {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>)}
        </select>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Start date *</label>
          <input type="date" name="startDate" required defaultValue={props.startDate ?? ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Due date *</label>
          <input type="date" name="dueDate" required defaultValue={props.dueDate ?? ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <div
          onClick={() => setIsRecurring(r => !r)}
          className={cn(
            "w-8 h-4 rounded-full transition-colors relative flex-shrink-0",
            isRecurring ? "bg-indigo-600" : "bg-slate-700"
          )}
        >
          <span className={cn(
            "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform",
            isRecurring ? "translate-x-4" : "translate-x-0.5"
          )} />
        </div>
        <span className="text-sm text-slate-400 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Repeat
        </span>
      </label>

      {isRecurring && (
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-700">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-slate-500 px-1">Repeats</label>
            <select name="recurrenceFrequency" defaultValue={props.recurrenceFrequency ?? "WEEKLY"}
              className="h-9 bg-slate-800 border border-indigo-700/50 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Every 2 weeks</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-slate-500 px-1">Ends on (optional)</label>
            <input type="date" name="recurrenceEndsAt"
              defaultValue={props.recurrenceEndsAt ?? ""}
              className="h-9 bg-slate-800 border border-indigo-700/50 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setEditing(false)}
          className="h-9 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors flex items-center gap-1.5">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
        <SaveBtn />
      </div>
    </form>
  );
}
