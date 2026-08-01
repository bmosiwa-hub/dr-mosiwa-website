"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createTask, updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Circle, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const STATUS_OPTS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];
const PRIORITY_OPTS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do", IN_PROGRESS: "In Progress", IN_REVIEW: "In Review",
  BLOCKED: "Blocked", DONE: "Done", CANCELLED: "Cancelled",
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-400", MEDIUM: "text-blue-400",
  HIGH: "text-amber-400", CRITICAL: "text-red-400",
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  TODO: <Circle className="w-4 h-4 text-slate-500" />,
  IN_PROGRESS: <Clock className="w-4 h-4 text-indigo-400" />,
  IN_REVIEW: <Clock className="w-4 h-4 text-amber-400" />,
  BLOCKED: <AlertCircle className="w-4 h-4 text-red-400" />,
  DONE: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  CANCELLED: <Circle className="w-4 h-4 text-slate-700" />,
};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
      {pending ? "Adding…" : "Add Task"}
    </button>
  );
}

export type Task = {
  id: string; title: string; description: string | null;
  status: string; priority: string; dueDate: Date | null;
};

export function TasksClient({ projectId, initialTasks }: { projectId: string; initialTasks: Task[] }) {
  const [showForm, setShowForm] = useState(false);
  const bound = createTask.bind(null, projectId);
  const [state, formAction] = useActionState(bound, null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Tasks ({initialTasks.length})</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {showForm && (
        <form action={async (fd: FormData) => { await formAction(fd); setShowForm(false); }}
          className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
          {(state as { error?: string } | null)?.error && (
            <p className="text-red-400 text-sm">{(state as { error: string }).error}</p>
          )}
          <input name="title" required placeholder="Task title *"
            className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
          <textarea name="description" rows={2} placeholder="Description (optional)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          <div className="grid grid-cols-3 gap-3">
            <select name="status" defaultValue="TODO"
              className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <select name="priority" defaultValue="MEDIUM"
              className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>)}
            </select>
            <input type="date" name="dueDate"
              className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
            <SubmitBtn />
          </div>
        </form>
      )}

      {initialTasks.length === 0 && !showForm ? (
        <div className="text-center py-16 text-slate-500">
          <p className="font-medium text-slate-400">No tasks yet</p>
          <p className="text-sm mt-1">Add your first task to get started.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {initialTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 group transition-colors">
              <div className="flex-shrink-0">{STATUS_ICON[task.status] ?? <Circle className="w-4 h-4 text-slate-500" />}</div>
              <div className="flex-1 min-w-0">
                <span className={cn("text-sm", task.status === "DONE" || task.status === "CANCELLED" ? "line-through text-slate-500" : "text-white")}>
                  {task.title}
                </span>
                {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
              </div>
              <span className={cn("text-xs font-medium flex-shrink-0", PRIORITY_COLORS[task.priority])}>{task.priority}</span>
              {task.dueDate && (
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
              <select value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value, projectId)}
                className="h-7 bg-slate-800 border border-slate-700 rounded-md px-1.5 text-slate-300 text-xs focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity">
                {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <form action={deleteTask.bind(null, task.id, projectId)}>
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
