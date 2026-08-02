"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

type NotifTask = { id: string; title: string; dueDate: string | null; projectId: string; project: { name: string } };
type Data = { overdue: NotifTask[]; dueToday: NotifTask[] };

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function toggle() {
    if (!open && !data) {
      setLoading(true);
      const res = await fetch("/astelpo_26/api/notifications");
      setData(await res.json());
      setLoading(false);
    }
    setOpen(o => !o);
  }

  async function markDone(taskId: string, projectId: string) {
    await updateTaskStatus(taskId, "DONE", projectId);
    setData(prev => prev ? {
      overdue: prev.overdue.filter(t => t.id !== taskId),
      dueToday: prev.dueToday.filter(t => t.id !== taskId),
    } : prev);
    router.refresh();
  }

  const total = (data?.overdue.length ?? 0) + (data?.dueToday.length ?? 0);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {(total > 0 || !data) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && <p className="px-4 py-4 text-slate-500 text-sm">Loading…</p>}

            {!loading && data && total === 0 && (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">All caught up!</p>
              </div>
            )}

            {data && data.overdue.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Overdue
                </p>
                {data.overdue.map(t => (
                  <TaskRow key={t.id} task={t} onDone={() => markDone(t.id, t.projectId)} onNavigate={() => { router.push(`/astelpo_26/projects/${t.projectId}/tasks/${t.id}`); setOpen(false); }} overdue />
                ))}
              </div>
            )}

            {data && data.dueToday.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs text-indigo-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due Today
                </p>
                {data.dueToday.map(t => (
                  <TaskRow key={t.id} task={t} onDone={() => markDone(t.id, t.projectId)} onNavigate={() => { router.push(`/astelpo_26/projects/${t.projectId}/tasks/${t.id}`); setOpen(false); }} />
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-800">
            <button onClick={() => { router.push("/astelpo_26/today"); setOpen(false); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all on Home →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onDone, onNavigate, overdue }: {
  task: NotifTask; onDone: () => void; onNavigate: () => void; overdue?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 px-4 py-2.5 hover:bg-slate-800/50 transition-colors group">
      <button onClick={onDone} title="Mark done"
        className="mt-0.5 text-slate-600 hover:text-green-400 transition-colors flex-shrink-0">
        <CheckCircle2 className="w-4 h-4" />
      </button>
      <button onClick={onNavigate} className="flex-1 min-w-0 text-left">
        <p className="text-slate-200 text-xs leading-snug line-clamp-2">{task.title}</p>
        <p className={cn("text-xs mt-0.5", overdue ? "text-red-400" : "text-slate-500")}>
          {task.project.name}{task.dueDate ? ` · ${formatDate(new Date(task.dueDate))}` : ""}
        </p>
      </button>
    </div>
  );
}
