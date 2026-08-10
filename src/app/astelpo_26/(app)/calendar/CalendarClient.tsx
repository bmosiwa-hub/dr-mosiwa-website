"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Flag,
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

type CalMilestone = {
  id: string;
  name: string;
  targetDate: string | null;
  status: string;
  project: { id: string; name: string };
};

type Props = {
  tasks: CalTask[];
  milestones: CalMilestone[];
  isGoogleConnected: boolean;
};

// ─── Priority colors ──────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "bg-red-600",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-blue-600",
  LOW: "bg-slate-600",
};

// ─── Day cell events ──────────────────────────────────────────────────────────

function DayEvents({
  tasks,
  milestones,
  max = 2,
}: {
  tasks: CalTask[];
  milestones: CalMilestone[];
  max?: number;
}) {
  const all = [
    ...milestones.map((m) => ({ type: "milestone" as const, label: m.name, color: "bg-purple-600" })),
    ...tasks.map((t) => ({ type: "task" as const, label: t.title, color: PRIORITY_COLOR[t.priority] ?? "bg-blue-600" })),
  ];

  const shown = all.slice(0, max);
  const overflow = all.length - max;

  return (
    <div className="space-y-0.5 mt-0.5">
      {shown.map((e, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-1 rounded px-1 py-0.5 text-white",
            e.type === "milestone" ? "bg-purple-700/70" : e.color + "/70"
          )}
        >
          {e.type === "milestone" ? (
            <Flag className="w-2.5 h-2.5 flex-shrink-0" />
          ) : (
            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", e.color)} />
          )}
          <span className="text-[10px] leading-tight truncate">{e.label}</span>
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
  milestones,
  onClose,
}: {
  day: Date;
  tasks: CalTask[];
  milestones: CalMilestone[];
  onClose: () => void;
}) {
  const hasContent = tasks.length > 0 || milestones.length > 0;

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
        <p className="text-slate-500 text-sm">No tasks or milestones on this day.</p>
      )}

      {milestones.length > 0 && (
        <div className="space-y-2">
          <p className="text-purple-400 text-xs font-medium uppercase tracking-wider">Milestones</p>
          {milestones.map((m) => (
            <div key={m.id} className="flex items-start gap-3 bg-purple-900/20 border border-purple-700/30 rounded-lg px-3 py-2.5">
              <Flag className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium">{m.name}</p>
                <p className="text-slate-500 text-xs">{m.project.name} · {m.status.replace("_", " ")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-blue-400 text-xs font-medium uppercase tracking-wider">Tasks</p>
          {tasks.map((t) => (
            <div key={t.id} className="flex items-start gap-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5">
              <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", PRIORITY_COLOR[t.priority] ?? "bg-blue-600")} />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium">{t.title}</p>
                <p className="text-slate-500 text-xs">{t.project.name} · {t.status.replace("_", " ")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CalendarClient({ tasks, milestones, isGoogleConnected }: Props) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [syncing, startSync] = useTransition();
  const [disconnecting, startDisconnect] = useTransition();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Build day grid
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Blank leading cells (Sunday = 0)
  const leadingBlanks = getDay(days[0]);

  // Index tasks by dueDate
  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalTask[]>();
    for (const t of tasks) {
      const dateStr = t.dueDate;
      if (!dateStr) continue;
      const key = format(parseISO(dateStr), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  // Index milestones by targetDate
  const milestonesByDay = useMemo(() => {
    const map = new Map<string, CalMilestone[]>();
    for (const m of milestones) {
      if (!m.targetDate) continue;
      const key = format(parseISO(m.targetDate), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [milestones]);

  // Selected day's data
  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedTasks = selectedKey ? (tasksByDay.get(selectedKey) ?? []) : [];
  const selectedMilestones = selectedKey ? (milestonesByDay.get(selectedKey) ?? []) : [];

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <p className="text-slate-400 text-sm mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} and {milestones.length} milestone{milestones.length !== 1 ? "s" : ""} with dates
          </p>
        </div>

        {/* Google Calendar */}
        <div className="flex items-center gap-3">
          {isGoogleConnected ? (
            <>
              <div className="flex items-center gap-1.5 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Google Connected</span>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing || disconnecting}
                className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                {syncing ? "Syncing…" : "Sync to Google"}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={syncing || disconnecting}
                className="h-9 px-3 bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-700/50 rounded-lg text-slate-400 hover:text-red-400 text-sm transition-colors disabled:opacity-50"
              >
                {disconnecting ? "…" : "Disconnect"}
              </button>
            </>
          ) : (
            <a
              href="/astelpo_26/api/google-calendar/connect"
              className="flex items-center gap-2 h-9 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Connect Google Calendar
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
              const dayMilestones = milestonesByDay.get(key) ?? [];
              const hasEvents = dayTasks.length > 0 || dayMilestones.length > 0;
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
                  <div className="hidden sm:block"><DayEvents tasks={dayTasks} milestones={dayMilestones} max={2} /></div>
                  {/* Mobile: just show dot indicators */}
                  <div className="sm:hidden flex gap-0.5 mt-0.5 flex-wrap">
                    {dayMilestones.map((_, i) => <div key={`m${i}`} className="w-1.5 h-1.5 rounded-full bg-purple-500" />)}
                    {dayTasks.slice(0, 3).map((t, i) => <div key={`t${i}`} className={cn("w-1.5 h-1.5 rounded-full", PRIORITY_COLOR[t.priority] ?? "bg-blue-600")} />)}
                    {(dayTasks.length + dayMilestones.length) > 3 && <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
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
              milestones={selectedMilestones}
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
                <Flag className="w-3 h-3 text-purple-400" />
                <span>Milestone</span>
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
