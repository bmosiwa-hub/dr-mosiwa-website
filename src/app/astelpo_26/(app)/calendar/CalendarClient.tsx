"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
  format,
  addMonths,
  subMonths,
  isToday,
  parseISO,
  startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { syncToGoogleCalendar, disconnectGoogleCalendar } from "@/lib/actions/calendar";

// ─── Types ────────────────────────────────────────────────────────────────────

type CalTask = {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
  startDate: string | null;
  project: { id: string; name: string; colorLabel: string | null };
};

// A task occupies every day from the day it starts until the day it is
// actually finished — the deadline is a marker inside that run, not the end of
// it. An unfinished task keeps claiming days past its due date, because it is
// still work you owe. The role says what a given day means for the task.
type TaskRole = "start" | "ongoing" | "due" | "overdue";

type TaskOnDay = { task: CalTask; role: TaskRole };

const ROLE_LABELS: Record<TaskRole, string> = {
  overdue: "Overdue",
  due: "Due",
  start: "Starting",
  ongoing: "In progress",
};

// Most urgent first, so a crowded cell truncates the calm items, not the loud ones.
const ROLE_WEIGHT: Record<TaskRole, number> = { overdue: 0, due: 1, start: 2, ongoing: 3 };

type Props = {
  tasks: CalTask[];
  isGoogleConnected: boolean;
  initMessage?: string | null;
};

// ─── Priority colors ──────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "bg-red-600",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-blue-600",
  LOW: "bg-slate-600",
};

// ─── Day cell events ──────────────────────────────────────────────────────────

function DayEvents({ tasks, max = 2 }: { tasks: TaskOnDay[]; max?: number }) {
  const all = tasks.map((t) => ({
    label: t.task.title,
    color: PRIORITY_COLOR[t.task.priority] ?? "bg-blue-600",
    role: t.role,
  }));

  // Overdue, then due, then starting, then merely in progress — a day carrying
  // several long-running tasks must never truncate away what it actually owes.
  all.sort((a, b) => ROLE_WEIGHT[a.role] - ROLE_WEIGHT[b.role]);

  const shown = all.slice(0, max);
  const overflow = all.length - max;

  return (
    <div className="space-y-0.5 mt-0.5">
      {shown.map((e, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-1 rounded px-1 py-0.5 text-white",
            e.role === "overdue"
              ? "bg-red-800/70 ring-1 ring-red-500/40"
              : e.role === "ongoing"
                ? "bg-slate-700/50"
                : e.color + "/70"
          )}
          title={`${ROLE_LABELS[e.role]}: ${e.label}`}
        >
          {e.role === "ongoing" ? (
            // Hollow dot: work in flight, nothing owed today.
            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 ring-1", e.color.replace("bg-", "ring-"))} />
          ) : (
            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", e.color)} />
          )}
          <span className={cn("text-[10px] leading-tight truncate", e.role === "ongoing" && "text-slate-300")}>
            {e.label}
          </span>
        </div>
      ))}
      {overflow > 0 && (
        <p className="text-[10px] text-slate-500 px-1">+{overflow} more</p>
      )}
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DayPanel({
  day,
  tasks,
  onClose,
}: {
  day: Date;
  tasks: TaskOnDay[];
  onClose: () => void;
}) {
  const hasContent = tasks.length > 0;

  const groups: { role: TaskRole; items: TaskOnDay[] }[] = (
    ["overdue", "due", "start", "ongoing"] as TaskRole[]
  )
    .map((role) => ({ role, items: tasks.filter((t) => t.role === role) }))
    .filter((g) => g.items.length > 0);

  const window = (t: CalTask) => {
    if (t.startDate && t.dueDate) {
      return `${format(parseISO(t.startDate), "MMM d")} – ${format(parseISO(t.dueDate), "MMM d")}`;
    }
    if (t.dueDate) return `Due ${format(parseISO(t.dueDate), "MMM d")}`;
    if (t.startDate) return `Started ${format(parseISO(t.startDate), "MMM d")}`;
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{format(day, "MMMM d, yyyy")}</h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      {!hasContent && (
        <p className="text-slate-500 text-sm">No work in progress on this day.</p>
      )}

      {groups.map(({ role, items }) => (
        <div key={role} className="space-y-2">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider",
              role === "overdue"
                ? "text-red-400"
                : role === "due"
                  ? "text-blue-400"
                  : role === "start"
                    ? "text-emerald-400"
                    : "text-slate-400"
            )}
          >
            {role === "overdue" ? "Overdue — still open" : ROLE_LABELS[role]}
          </p>
          {items.map(({ task: t }) => (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 border",
                role === "overdue"
                  ? "bg-red-900/20 border-red-700/40"
                  : role === "ongoing"
                    ? "bg-slate-800/40 border-slate-700/60"
                    : "bg-slate-800 border-slate-700"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                  role === "ongoing"
                    ? cn("ring-1", (PRIORITY_COLOR[t.priority] ?? "bg-blue-600").replace("bg-", "ring-"))
                    : PRIORITY_COLOR[t.priority] ?? "bg-blue-600"
                )}
              />
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", role === "ongoing" ? "text-slate-300" : "text-white")}>
                  {t.title}
                </p>
                <p className="text-slate-500 text-xs">
                  {t.project.name} · {t.status.replace("_", " ")}
                  {window(t) && (
                    <span className={role === "overdue" ? "text-red-400" : "text-slate-600"}> · {window(t)}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CalendarClient({ tasks, isGoogleConnected, initMessage }: Props) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [syncing, startSync] = useTransition();
  const [disconnecting, startDisconnect] = useTransition();
  const [syncMsg, setSyncMsg] = useState<string | null>(initMessage ?? null);

  // Build day grid
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Blank leading cells (Sunday = 0)
  const leadingBlanks = getDay(days[0]);

  // Index tasks across their whole run — a task that started on the 10th
  // belongs on the 10th and every day after it until it is finished, deadline
  // or no deadline. Tasks with a single date still occupy that one day.
  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskOnDay[]>();
    if (days.length === 0) return map;

    const monthStart = startOfDay(days[0]);
    const monthEnd = startOfDay(days[days.length - 1]);
    const today = startOfDay(new Date());

    for (const t of tasks) {
      const started = t.startDate ? startOfDay(parseISO(t.startDate)) : null;
      const due = t.dueDate ? startOfDay(parseISO(t.dueDate)) : null;
      if (!started && !due) continue;

      let from = started ?? due!;
      let to = due ?? started!;
      // Guard against a start recorded after its deadline — show the deadline
      // rather than an empty or inverted range.
      if (from > to) from = to;
      // The server only sends tasks that are still open, so anything whose
      // deadline has passed is unfinished work: keep it on every day through
      // today rather than letting it vanish the day after it came due.
      if (to < today) to = today;

      // Only materialise the part of the window that this month can show.
      const first = from < monthStart ? monthStart : from;
      const last = to > monthEnd ? monthEnd : to;
      if (first > last) continue;

      for (const day of eachDayOfInterval({ start: first, end: last })) {
        const role: TaskRole =
          due && isSameDay(day, due)
            ? "due"
            : due && day > due
              ? "overdue"
              : started && isSameDay(day, started)
                ? "start"
                : "ongoing";
        const key = format(day, "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ task: t, role });
      }
    }
    return map;
  }, [tasks, days]);

  const spanningCount = useMemo(
    () =>
      tasks.filter(
        (t) => t.startDate && t.dueDate && !isSameDay(parseISO(t.startDate), parseISO(t.dueDate))
      ).length,
    [tasks]
  );

  // Selected day's data
  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedTasks = selectedKey ? (tasksByDay.get(selectedKey) ?? []) : [];

  function handleSync() {
    setSyncMsg(null);
    startSync(async () => {
      const res = await syncToGoogleCalendar();
      setSyncMsg(res.error ?? res.success ?? "Done");
    });
  }

  function handleDisconnect() {
    if (!confirm("Disconnect Google Calendar? This won't delete events already synced.")) return;
    setSyncMsg(null);
    startDisconnect(async () => {
      const res = await disconnectGoogleCalendar();
      setSyncMsg(res.error ?? res.success ?? "Done");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <p className="text-slate-400 text-sm mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} in progress
            {spanningCount > 0 && (
              <span className="text-slate-500"> · {spanningCount} spanning multiple days</span>
            )}
          </p>
        </div>

        {/* Google Calendar */}
        <div className="flex items-center gap-2 flex-wrap">
          {isGoogleConnected ? (
            <>
              <div className="flex items-center gap-1.5 text-green-400 text-xs sm:text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Google Connected</span>
                <span className="sm:hidden">Connected</span>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing || disconnecting}
                className="flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors"
              >
                {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarDays className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{syncing ? "Syncing…" : "Sync to Google"}</span>
                <span className="sm:hidden">{syncing ? "…" : "Sync"}</span>
              </button>
              <button
                onClick={handleDisconnect}
                disabled={syncing || disconnecting}
                className="h-8 sm:h-9 px-3 bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-700/50 rounded-lg text-slate-400 hover:text-red-400 text-xs sm:text-sm transition-colors disabled:opacity-50"
              >
                {disconnecting ? "…" : "Disconnect"}
              </button>
            </>
          ) : (
            <a
              href="/astelpo_26/api/google-calendar/connect"
              className="flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connect Google Calendar</span>
              <span className="sm:hidden">Connect Google</span>
            </a>
          )}
        </div>
      </div>

      {syncMsg && (
        <div className={cn(
          "px-4 py-2.5 rounded-lg text-sm border",
          syncMsg.toLowerCase().includes("error") || syncMsg.toLowerCase().includes("failed")
            ? "bg-red-900/20 border-red-700/30 text-red-400"
            : "bg-green-900/20 border-green-700/30 text-green-400"
        )}>
          {syncMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Calendar grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <button
              onClick={() => { setCurrentMonth(m => subMonths(m, 1)); setSelectedDay(null); }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-white font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
            <button
              onClick={() => { setCurrentMonth(m => addMonths(m, 1)); setSelectedDay(null); }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-slate-500">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {/* Leading blanks */}
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} className="border-b border-r border-slate-800/50 min-h-[90px]" />
            ))}

            {/* Days */}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay.get(key) ?? [];
              const hasEvents = dayTasks.length > 0;
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const today = isToday(day);
              const inMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={cn(
                    "border-b border-r border-slate-800/50 min-h-[60px] md:min-h-[90px] p-1 md:p-1.5 cursor-pointer transition-colors",
                    !inMonth && "opacity-40",
                    isSelected && "bg-indigo-900/20 border-indigo-600/30",
                    !isSelected && hasEvents && "hover:bg-slate-800/50",
                    !isSelected && !hasEvents && "hover:bg-slate-800/30"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1",
                    today ? "bg-indigo-600 text-white" : "text-slate-400"
                  )}>
                    {format(day, "d")}
                  </div>
                  <div className="hidden sm:block"><DayEvents tasks={dayTasks} max={2} /></div>
                  {/* Mobile: just show dot indicators */}
                  <div className="sm:hidden flex gap-0.5 mt-0.5 flex-wrap">
                    {[...dayTasks]
                      .sort((a, b) => ROLE_WEIGHT[a.role] - ROLE_WEIGHT[b.role])
                      .slice(0, 3)
                      .map((t, i) => (
                        <div
                          key={`t${i}`}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            t.role === "overdue"
                              ? "bg-red-500"
                              : t.role === "ongoing"
                                ? cn("ring-1", (PRIORITY_COLOR[t.task.priority] ?? "bg-blue-600").replace("bg-", "ring-"))
                                : PRIORITY_COLOR[t.task.priority] ?? "bg-blue-600"
                          )}
                        />
                      ))}
                    {dayTasks.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {selectedDay ? (
            <DayPanel
              day={selectedDay}
              tasks={selectedTasks}
              onClose={() => setSelectedDay(null)}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-500 text-sm">
              Click a day to see details.
            </div>
          )}

          {/* Legend */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full ring-1 ring-slate-400" />
                <span>In progress (not due yet)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Overdue — past due, still open</span>
              </div>
              {[["CRITICAL", "Critical", "bg-red-600"], ["HIGH", "High priority", "bg-orange-500"], ["MEDIUM", "Medium priority", "bg-blue-600"], ["LOW", "Low priority", "bg-slate-600"]].map(([, label, color]) => (
                <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className={cn("w-2 h-2 rounded-full", color)} />
                  <span>{label} task</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
