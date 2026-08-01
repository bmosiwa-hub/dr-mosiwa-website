"use client";

import { useState, useTransition } from "react";
import { updateTaskStatus, postponeTask } from "@/lib/actions/tasks";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { CheckCircle2, Clock, SkipForward, XCircle } from "lucide-react";

export type DashTask = {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: Date | null;
  project: { id: string; name: string; colorLabel: string | null };
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

function TaskRow({ task, showDate }: { task: DashTask; showDate?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
      <div className={cn(
        "w-2 h-2 rounded-full flex-shrink-0",
        task.priority === "CRITICAL" ? "bg-red-600" : task.priority === "HIGH" ? "bg-amber-500" : "bg-indigo-500"
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-sm truncate">{task.title}</p>
        <p className="text-slate-600 text-xs truncate">{task.project.name}</p>
      </div>
      {showDate && task.dueDate && (
        <span className={cn("text-xs flex-shrink-0", isOverdue(task.dueDate) ? "text-red-400" : "text-slate-500")}>
          {formatDate(task.dueDate)}
        </span>
      )}
      <TaskActions task={task} />
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
        {tasks.map(t => <TaskRow key={t.id} task={t} showDate />)}
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

export function UpcomingPanel({ tasks }: { tasks: DashTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-400" />
        Coming Up This Week
      </h3>
      <div>{tasks.map(t => <TaskRow key={t.id} task={t} showDate />)}</div>
    </div>
  );
}
