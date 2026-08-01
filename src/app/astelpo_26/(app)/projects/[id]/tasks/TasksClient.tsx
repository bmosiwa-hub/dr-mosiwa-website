"use client";

import { useActionState, useState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { createTask, updateTaskStatus, deleteTask, updateTask } from "@/lib/actions/tasks";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Circle, CheckCircle2, Clock, AlertCircle, Pencil, X, ArrowUpDown } from "lucide-react";

const STATUS_OPTS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];
const PRIORITY_OPTS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PRIORITY_RANK: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

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

function SubmitBtn({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
      {pending ? pendingLabel : label}
    </button>
  );
}

function TaskForm({
  projectId, onDone, defaultValues,
}: {
  projectId: string;
  onDone: () => void;
  defaultValues?: { title: string; description: string | null; status: string; priority: string; startDate: Date | null; dueDate: Date | null };
}) {
  const bound = createTask.bind(null, projectId);
  const [state, formAction] = useActionState(bound, null);

  return (
    <form action={async (fd: FormData) => { await formAction(fd); onDone(); }}
      className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
      {(state as { error?: string } | null)?.error && (
        <p className="text-red-400 text-sm">{(state as { error: string }).error}</p>
      )}
      <input name="title" required placeholder="Task title *" defaultValue={defaultValues?.title}
        className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
      <textarea name="description" rows={2} placeholder="Description (optional)" defaultValue={defaultValues?.description ?? ""}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <select name="status" defaultValue={defaultValues?.status ?? "TODO"}
          className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
          {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select name="priority" defaultValue={defaultValues?.priority ?? "MEDIUM"}
          className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
          {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>)}
        </select>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Start date</label>
          <input type="date" name="startDate"
            defaultValue={defaultValues?.startDate ? new Date(defaultValues.startDate).toISOString().split("T")[0] : ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Due date</label>
          <input type="date" name="dueDate"
            defaultValue={defaultValues?.dueDate ? new Date(defaultValues.dueDate).toISOString().split("T")[0] : ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone}
          className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
        <SubmitBtn label="Add Task" pendingLabel="Adding…" />
      </div>
    </form>
  );
}

function EditTaskForm({
  task, projectId, onDone,
}: {
  task: Task;
  projectId: string;
  onDone: () => void;
}) {
  const bound = updateTask.bind(null, task.id, projectId);
  const [state, formAction] = useActionState(bound, null);

  return (
    <form action={async (fd: FormData) => { await formAction(fd); onDone(); }}
      className="bg-slate-900 border border-indigo-700 rounded-xl p-4 space-y-3">
      {(state as { error?: string } | null)?.error && (
        <p className="text-red-400 text-sm">{(state as { error: string }).error}</p>
      )}
      <input name="title" required placeholder="Task title *" defaultValue={task.title}
        className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
      <textarea name="description" rows={2} placeholder="Description (optional)" defaultValue={task.description ?? ""}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <select name="status" defaultValue={task.status}
          className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
          {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select name="priority" defaultValue={task.priority}
          className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
          {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>)}
        </select>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Start date</label>
          <input type="date" name="startDate"
            defaultValue={task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Due date</label>
          <input type="date" name="dueDate"
            defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone}
          className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
        <SubmitBtn label="Save Changes" pendingLabel="Saving…" />
      </div>
    </form>
  );
}

export type Task = {
  id: string; title: string; description: string | null;
  status: string; priority: string; startDate: Date | null; dueDate: Date | null;
};

type SortKey = "priority" | "dueDate" | "none";

export function TasksClient({ projectId, initialTasks }: { projectId: string; initialTasks: Task[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    if (sortKey === "none") return initialTasks;
    return [...initialTasks].sort((a, b) => {
      if (sortKey === "priority") {
        const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        return sortDir === "asc" ? diff : -diff;
      }
      if (sortKey === "dueDate") {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return sortDir === "asc" ? aTime - bTime : bTime - aTime;
      }
      return 0;
    });
  }, [initialTasks, sortKey, sortDir]);

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k;
    return (
      <button onClick={() => toggleSort(k)}
        className={cn(
          "flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-medium transition-colors",
          active ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
        )}>
        <ArrowUpDown className="w-3 h-3" />
        {label}
        {active && <span className="ml-0.5 opacity-70">{sortDir === "asc" ? "↑" : "↓"}</span>}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">Tasks ({initialTasks.length})</h3>
          <div className="flex items-center gap-1.5 ml-2">
            <SortBtn k="priority" label="Priority" />
            <SortBtn k="dueDate" label="Due Date" />
            {sortKey !== "none" && (
              <button onClick={() => { setSortKey("none"); }}
                className="h-7 w-7 flex items-center justify-center rounded-md bg-slate-800 border border-slate-700 text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="flex items-center gap-1.5 h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {showForm && (
        <TaskForm projectId={projectId} onDone={() => setShowForm(false)} />
      )}

      {initialTasks.length === 0 && !showForm ? (
        <div className="text-center py-16 text-slate-500">
          <p className="font-medium text-slate-400">No tasks yet</p>
          <p className="text-sm mt-1">Add your first task to get started.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sorted.map(task => (
            editingId === task.id ? (
              <EditTaskForm key={task.id} task={task} projectId={projectId} onDone={() => setEditingId(null)} />
            ) : (
              <div key={task.id}
                className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 group transition-colors">
                <div className="flex-shrink-0">{STATUS_ICON[task.status] ?? <Circle className="w-4 h-4 text-slate-500" />}</div>
                <Link href={`/astelpo_26/projects/${projectId}/tasks/${task.id}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <span className={cn("text-sm", task.status === "DONE" || task.status === "CANCELLED" ? "line-through text-slate-500" : "text-white")}>
                    {task.title}
                  </span>
                  {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
                </Link>
                <span className={cn("text-xs font-medium flex-shrink-0", PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                {task.startDate && (
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    Start {new Date(task.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
                {task.dueDate && (
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
                <select value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value, projectId)}
                  className="h-7 bg-slate-800 border border-slate-700 rounded-md px-1.5 text-slate-300 text-xs focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <button onClick={() => { setEditingId(task.id); setShowForm(false); }}
                  className="text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <form action={deleteTask.bind(null, task.id, projectId)}>
                  <button type="submit" className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
