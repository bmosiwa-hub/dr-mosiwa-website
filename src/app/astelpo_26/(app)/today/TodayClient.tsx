"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { updateTaskStatus, postponeTask } from "@/lib/actions/tasks";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { CheckCircle2, Clock, Flag, RefreshCw, SkipForward, XCircle } from "lucide-react";
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

export type DashMilestone = {
  id: string;
  name: string;
  status: string;
  targetDate: string | null;
  project: { id: string; name: string; colorLabel: string | null };
};

type Timeline = "week" | "14d" | "month" | "quarter";
const TIMELINE_OPTS: { key: Timeline; label: string; days: number }[] = [
  { key: "week",    label: "Week",    days: 7  },
  { key: "14d",     label: "14 days", days: 14 },
  { key: "month",   label: "Month",   days: 30 },
  { key: "quarter", label: "Quarter", days: 90 },
];

const PRIORITY_DOT: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-amber-500",
  MEDIUM: "bg-indigo-500",
  LOW: "bg-slate-500",
};

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
      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          autoFocus
          className="h-7 px-2 bg-slate-800 border border-amber-700 rounded-md text-amber-300 text-xs focus:outline-none w-32"
        />
        <button onClick={confirmPostpone} disabled={!newDate}
          className="h-7 px-2 rounded-md bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-medium transition-colors">
          Set
        </button>
        <button onClick={() => setPickingDate(false)}
          className="h-7 w-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors border border-slate-700">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 flex-shrink-0", pending && "opacity-40 pointer-events-none")}>
      {/* Done — always visible, icon+text on desktop, icon-only on mobile */}
      <button
        onClick={() => act(() => updateTaskStatus(task.id, "DONE", task.project.id))}
        title="Mark complete"
        className="flex items-center gap-1 h-7 px-2 rounded-md bg-green-900/30 hover:bg-green-800/50 text-green-400 text-xs font-medium transition-colors border border-green-800/30">
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Done</span>
      </button>
      {/* Postpone — icon-only on mobile */}
      <button
        onClick={() => setPickingDate(true)}
        title="Postpone"
        className="flex items-center gap-1 h-7 px-2 rounded-md bg-amber-900/30 hover:bg-amber-800/50 text-amber-400 text-xs font-medium transition-colors border border-amber-800/30">
        <SkipForward className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Postpone</span>
      </button>
      {/* Cancel — icon-only on mobile */}
      <button
        onClick={() => act(() => updateTaskStatus(task.id, "CANCELLED", task.project.id))}
        title="Cancel"
        className="h-7 w-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors border border-slate-700">
        <XCircle className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function TaskRow({ task, showDates }: { task: DashTask; showDates?: boolean }) {
  const dot = PRIORITY_DOT[task.priority] ?? "bg-indigo-500";

  return (
    <div className="py-2.5 border-b border-slate-800 last:border-0">
      {/* Row 1: dot + title + actions */}
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", dot)} />
        <Link
          href={
            task.isRecurring
              ? `/astelpo_26/projects/${task.project.id}/tasks`
              : `/astelpo_26/projects/${task.project.id}/tasks/${task.id}`
          }
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {task.isRecurring && <RefreshCw className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
            <p className="text-slate-200 text-sm font-medium truncate">{task.title}</p>
          </div>
        </Link>

        {task.isRecurring ? (
          <span className="flex items-center gap-1 text-xs text-indigo-400/80 bg-indigo-900/20 border border-indigo-800/30 rounded-md px-2 h-6 flex-shrink-0 whitespace-nowrap">
            <RefreshCw className="w-2.5 h-2.5" /> Recurring
          </span>
        ) : (
          <TaskActions task={task} />
        )}
      </div>

      {/* Row 2: project + dates */}
      <div className="flex items-center gap-2 mt-0.5 pl-4">
        <p className="text-slate-600 text-xs truncate flex-1 min-w-0">{task.project.name}</p>
        {showDates && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {task.startDate && (
              <span className="text-xs text-slate-600 whitespace-nowrap">
                Start {formatDate(task.startDate)}
              </span>
            )}
            {task.dueDate && (
              <span className={cn("text-xs whitespace-nowrap", isOverdue(task.dueDate) ? "text-red-400 font-medium" : "text-slate-500")}>
                Due {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function OverduePanel({ tasks }: { tasks: DashTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 md:p-5">
      <h3 className="text-red-400 font-semibold text-sm flex items-center gap-2 mb-3">
        <span className="text-red-400">!</span> Overdue ({tasks.length})
      </h3>
      <div>{tasks.map(t => <TaskRow key={t.id} task={t} showDates />)}</div>
    </div>
  );
}

export function TodayPanel({ tasks }: { tasks: DashTask[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
        Today{tasks.length > 0 && <span className="text-slate-500 font-normal ml-1">({tasks.length})</span>}
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Upcoming Tasks
          {visible.length > 0 && <span className="text-slate-500 font-normal">({visible.length})</span>}
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {TIMELINE_OPTS.map(o => (
            <button key={o.key} onClick={() => setTimeline(o.key)}
              className={cn(
                "h-6 px-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0",
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

const MS_STATUS_COLOR: Record<string, string> = {
  NOT_STARTED: "text-slate-500",
  IN_PROGRESS: "text-indigo-400",
  MISSED: "text-red-400",
};

export function MilestonesPanel({ milestones }: { milestones: DashMilestone[] }) {
  if (milestones.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
        <Flag className="w-4 h-4 text-purple-400" />
        Upcoming Milestones
        <span className="text-slate-500 font-normal">({milestones.length})</span>
      </h3>
      <div>
        {milestones.map((m) => (
          <div key={m.id} className="py-2.5 border-b border-slate-800 last:border-0">
            <div className="flex items-center gap-2 min-w-0">
              <Flag className="w-3 h-3 text-purple-500 flex-shrink-0" />
              <p className="text-slate-200 text-sm font-medium truncate flex-1 min-w-0">{m.name}</p>
              {m.targetDate && (
                <span className="text-xs text-slate-500 flex-shrink-0 whitespace-nowrap">
                  {formatDate(new Date(m.targetDate))}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 pl-5">
              <p className="text-slate-600 text-xs truncate flex-1">{m.project.name}</p>
              <span className={cn("text-xs font-medium flex-shrink-0", MS_STATUS_COLOR[m.status] ?? "text-slate-500")}>
                {m.status.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
