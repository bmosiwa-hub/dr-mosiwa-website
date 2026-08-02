"use client";

import { useActionState, useState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { createTask, updateTaskStatus, deleteTask, updateTask } from "@/lib/actions/tasks";
import { createRecurringTask, updateRecurringTask, deleteRecurringTask, toggleRecurringTask } from "@/lib/actions/recurring";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Circle, CheckCircle2, Clock, AlertCircle, Pencil, X, ArrowUpDown, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";

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

const FREQ_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BIWEEKLY: "Every 2 weeks",
  MONTHLY: "Monthly",
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
          <label className="text-xs text-slate-500 px-1">Start date *</label>
          <input type="date" name="startDate" required
            defaultValue={defaultValues?.startDate ? new Date(defaultValues.startDate).toISOString().split("T")[0] : ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Due date *</label>
          <input type="date" name="dueDate" required
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
          <label className="text-xs text-slate-500 px-1">Start date *</label>
          <input type="date" name="startDate" required
            defaultValue={task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Due date *</label>
          <input type="date" name="dueDate" required
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

// ─── Recurring Task Form ─────────────────────────────────────────────────────

function RecurringTaskForm({
  projectId, taskId, defaultValues, onDone,
}: {
  projectId: string;
  taskId?: string;
  defaultValues?: RecurringTaskItem;
  onDone: () => void;
}) {
  const action = taskId
    ? updateRecurringTask.bind(null, taskId, projectId)
    : createRecurringTask.bind(null, projectId);
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={async (fd: FormData) => { await formAction(fd); onDone(); }}
      className="bg-slate-900 border border-indigo-700/50 rounded-xl p-4 space-y-3">
      {(state as { error?: string } | null)?.error && (
        <p className="text-red-400 text-sm">{(state as { error: string }).error}</p>
      )}
      <input name="title" required placeholder="Task title *" defaultValue={defaultValues?.title}
        className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
      <textarea name="description" rows={2} placeholder="Description (optional)" defaultValue={defaultValues?.description ?? ""}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Priority</label>
          <select name="priority" defaultValue={defaultValues?.priority ?? "MEDIUM"}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
            {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Repeats</label>
          <select name="frequency" defaultValue={defaultValues?.frequency ?? "WEEKLY"}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="BIWEEKLY">Every 2 weeks</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">First occurrence *</label>
          <input type="date" name="startingFrom" required
            defaultValue={defaultValues?.startingFrom ? new Date(defaultValues.startingFrom).toISOString().split("T")[0] : ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-slate-500 px-1">Duration (days)</label>
          <input type="number" name="durationDays" min={1} defaultValue={defaultValues?.durationDays ?? 1}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex flex-col gap-0.5 col-span-2">
          <label className="text-xs text-slate-500 px-1">Ends on (leave blank for no end)</label>
          <input type="date" name="endsAt"
            defaultValue={defaultValues?.endsAt ? new Date(defaultValues.endsAt).toISOString().split("T")[0] : ""}
            className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone}
          className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
        <SubmitBtn label={taskId ? "Save Changes" : "Add Recurring Task"} pendingLabel="Saving…" />
      </div>
    </form>
  );
}

function RecurringTasksSection({ projectId, items }: { projectId: string; items: RecurringTaskItem[] }) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-6 border-t border-slate-800 pt-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-full text-left mb-3"
      >
        <RefreshCw className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-white">Recurring Tasks</span>
        <span className="text-xs text-slate-500 bg-slate-800 px-1.5 rounded">{items.length}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 ml-auto" /> : <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
      </button>

      {open && (
        <div className="space-y-2">
          {items.map(rt =>
            editingId === rt.id ? (
              <RecurringTaskForm
                key={rt.id}
                projectId={projectId}
                taskId={rt.id}
                defaultValues={rt}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div
                key={rt.id}
                className={cn(
                  "flex items-center gap-3 border rounded-xl px-4 py-3 group transition-colors",
                  rt.active
                    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                    : "bg-slate-900/40 border-slate-800/40 opacity-60"
                )}
              >
                <RefreshCw className={cn("w-3.5 h-3.5 flex-shrink-0", rt.active ? "text-indigo-400" : "text-slate-600")} />
                <div className="flex-1 min-w-0">
                  <span className={cn("text-sm", rt.active ? "text-white" : "text-slate-400")}>{rt.title}</span>
                  {rt.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{rt.description}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{FREQ_LABELS[rt.frequency]}</span>
                <span className={cn("text-xs font-medium flex-shrink-0", PRIORITY_COLORS[rt.priority])}>
                  {rt.priority}
                </span>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  From {new Date(rt.startingFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {rt.endsAt && (
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    Until {new Date(rt.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
                <form action={toggleRecurringTask.bind(null, rt.id, projectId, !rt.active)}>
                  <button
                    type="submit"
                    className="h-6 px-2 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    {rt.active ? "Pause" : "Resume"}
                  </button>
                </form>
                <button
                  onClick={() => { setEditingId(rt.id); setShowForm(false); }}
                  className="text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <form action={deleteRecurringTask.bind(null, rt.id, projectId)}>
                  <button
                    type="submit"
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )
          )}

          {items.length === 0 && !showForm && (
            <p className="text-slate-500 text-sm py-2">No recurring tasks yet.</p>
          )}

          {showForm ? (
            <RecurringTaskForm
              projectId={projectId}
              onDone={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); }}
              className="flex items-center gap-1.5 h-8 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Recurring Task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main exports ─────────────────────────────────────────────────────────────

export type Task = {
  id: string; title: string; description: string | null;
  status: string; priority: string; startDate: Date | null; dueDate: Date | null;
};

export type RecurringTaskItem = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  frequency: string;
  durationDays: number;
  startingFrom: Date;
  endsAt: Date | null;
  active: boolean;
};

type SortKey = "priority" | "dueDate" | "none";

export function TasksClient({
  projectId,
  initialTasks,
  initialRecurringTasks,
}: {
  projectId: string;
  initialTasks: Task[];
  initialRecurringTasks: RecurringTaskItem[];
}) {
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
        <div className="text-center py-12 text-slate-500">
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

      <RecurringTasksSection projectId={projectId} items={initialRecurringTasks} />
    </div>
  );
}
