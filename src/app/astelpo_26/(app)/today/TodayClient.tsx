"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { updateTaskStatus, postponeTask } from "@/lib/actions/tasks";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { CheckCircle2, Clock, RefreshCw, SkipForward, XCircle } from "lucide-react";
import { computeOccurrences } from "@/lib/recurrence";
import type { RecurringTaskInput } from "@/lib/recurrence";

export type DashTask = {
  id: string;
  title: string;
  priority: string;
  status: string;
  startDate: Date | null;
  dueDate: Date | null;
  project: { id: string; name: string; colorLabel: string | null };
  isRecurring?: boolean;
  recurringTaskId?: string;
};

type Timeline = "week" | "14d" | "month" | "quarter";
const TIMELINE_OPTS: { key: Timeline; label: string; days: number }[] = [
  { key: "week",    label: "This week",    days: 7  },
  { key: "14d",     label: "Next 14 days", days: 14 },
  { key: "month",   label: "Next month",   days: 30 },
  { key: "quarter", label: "Next quarter", days: 90 },
];

function TaskActions({ task }: { task: DashTask }) {
  const [pending, startTransition] = useTransition();
  const [pickingDate, setPickingDate] = useState(false);
  const [newDate, setNewDate] = useState("");

  function act(fn: () => Promise<void>) {
    startTransition(fn);
  }

  function confirmPostpone() {
    if (!newDate) return;
    setPickingDate(false);
    act(() => postponeTask(task.id, task.project.id, newDate));
  }

  if (pickingDate) {
    return (
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          autoFocus
          className="h-6 px-2 bg-slate-800 border border-amber-700 rounded-md text-amber-300 text-xs focus:outline-none"
        />
        <button onClick={confirmPostpone} disabled={!newDate}
          className="h-6 px-2 rounded-md bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-medium transition-colors">
          Set
        </button>
        <button onClick={() => setPickingDate(false)}
          className="h-6 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors border border-slate-700">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 flex-shrink-0", pending && "opacity-40 pointer-events-none")}>
      <button
        onClick={() => act(() => updateTaskStatus(task.id, "DONE", task.project.id))}
        title="Mark complete"
        className="flex items-center gap-1 h-6 px-2 rounded-md bg-green-900/30 hover:bg-green-800/50 text-green-400 text-xs font-medium transition-colors border border-green-800/30">
        <CheckCircle2 className="w-3 h-3" />
        Done
      </button>
      <button
        onClick={() => setPickingDate(true)}
        title="Postpone to a new date"
        className="flex items-center gap-1 h-6 px-2 rounded-md bg-amber-900/30 hover:bg-amber-800/50 text-amber-400 text-xs font-medium transition-colors border border-amber-800/30">
        <SkipForward className="w-3 h-3" />
        Postpone
      </button>
      <button
        onClick={() => act(() => updateTaskStatus(task.id, "CANCELLED", task.project.id))}
        title="Cancel task"
        className="flex items-center gap-1 h-6 px-2 rounded-md bg-slate-800 hover:bg-red-900/30 text-slate-500 hover:text-red-400 text-xs font-medium transition-colors border border-slate-700">
        <XCircle className="w-3 h-3" />
        Cancel
      </button>
    </div>
  );
}

function TaskRow({ task, showDates }: { task: DashTask; showDates?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
      <div className={cn(
        "w-2 h-2 rounded-full flex-shrink-0",
        task.priority === "CRITICAL" ? "bg-red-600" : task.priority === "HIGH" ? "bg-amber-500" : "bg-indigo-500"
      )} />
      <Link
        href={
          task.isRecurring
            ? `/astelpo_26/projects/${task.project.id}/tasks`
            : `/astelpo_26/projects/${task.project.id}/tasks/${task.id}`
        }
        className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1.5">
          {task.isRecurring && <RefreshCw className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
          <p className="text-slate-300 text-sm truncate">{task.title}</p>
        </div>
        <p className="text-slate-600 text-xs truncate">{task.project.name}</p>
      </Link>
      {showDates && (
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          {task.startDate && (
            <span className="text-xs text-slate-600">Start {formatDate(task.startDate)}</span>
          )}
          {task.dueDate && (
            <span className={cn("text-xs", isOverdue(task.dueDate) ? "text-red-400" : "text-slate-500")}>
              Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      )}
      {task.isRecurring ? (
        <span className="flex items-center gap-1 text-xs text-indigo-400/80 bg-indigo-900/20 border border-indigo-800/30 rounded-md px-2 h-6 flex-shrink-0">
          <RefreshCw className="w-2.5 h-2.5" /> Recurring
        </span>
      ) : (
        <TaskActions task={task} />
      )}
    </div>
  );
}

export function OverduePanel({ tasks }: { tasks: DashTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-5">
      <h3 className="text-red-400 font-semibold text-sm flex items-center gap-2 mb-3">
        <span className="w-4 h-4 text-red-400">!</span> Overdue ({tasks.length})
      </h3>
      <div className="divide-y divide-slate-800/0">
        {tasks.map(t => <TaskRow key={t.id} task={t} showDates />)}
      </div>
    </div>
  );
}

export function TodayPanel({ tasks }: { tasks: DashTask[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
        Today{tasks.length > 0 && <span className="text-slate-500 font-normal">({tasks.length})</span>}
      </h3>
      {tasks.length === 0 ? (
        <p className="text-slate-500 text-sm">Nothing due today.</p>
      ) : (
        <div>{tasks.map(t => <TaskRow key={t.id} task={t} />)}</div>
      )}
    </div>
  );
}

export function UpcomingPanel({
  tasks,
  recurringTasks,
}: {
  tasks: DashTask[];
  recurringTasks: RecurringTaskInput[];
}) {
  const [timeline, setTimeline] = useState<Timeline>("week");

  const cutoff = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    d.setDate(d.getDate() + TIMELINE_OPTS.find(o => o.key === timeline)!.days);
    return d;
  }, [timeline]);

  const visible = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const regular = tasks.filter(t => {
      const startInPeriod = t.startDate && new Date(t.startDate) <= cutoff;
      const dueInPeriod = t.dueDate && new Date(t.dueDate) <= cutoff;
      return startInPeriod || dueInPeriod;
    });

    const recurring: DashTask[] = recurringTasks.flatMap(rt =>
      computeOccurrences(rt, tomorrow, cutoff).map(o => ({
        id: o.id,
        title: o.title,
        priority: o.priority,
        status: o.status,
        startDate: o.startDate,
        dueDate: o.dueDate,
        project: o.project,
        isRecurring: true as const,
        recurringTaskId: o.recurringTaskId,
      }))
    );

    return [...regular, ...recurring].sort((a, b) => {
      const aDate = a.startDate ?? a.dueDate;
      const bDate = b.startDate ?? b.dueDate;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });
  }, [tasks, recurringTasks, cutoff]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Upcoming
          {visible.length > 0 && <span className="text-slate-500 font-normal">({visible.length})</span>}
        </h3>
        <div className="flex items-center gap-1">
          {TIMELINE_OPTS.map(o => (
            <button key={o.key} onClick={() => setTimeline(o.key)}
              className={cn(
                "h-6 px-2.5 rounded-md text-xs font-medium transition-colors",
                timeline === o.key
                  ? "bg-amber-700/40 text-amber-300 border border-amber-700/50"
                  : "bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700"
              )}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="text-slate-500 text-sm">No tasks coming up in this period.</p>
      ) : (
        <div>{visible.map(t => <TaskRow key={t.id} task={t} showDates />)}</div>
      )}
    </div>
  );
}
