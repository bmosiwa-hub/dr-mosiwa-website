"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban, CheckSquare, X, RefreshCw } from "lucide-react";
import { createTask } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

export function NewDropdown() {
  const [open, setOpen] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function openTaskModal() {
    setOpen(false);
    const res = await fetch("/astelpo_26/api/projects-list");
    const data = await res.json();
    setProjects(data);
    setTaskModal(true);
  }

  function resetModal() {
    setTaskModal(false);
    setTitle("");
    setStartDate("");
    setDueDate("");
    setIsRecurring(false);
    setSelectedProject("");
  }

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !selectedProject || !startDate || !dueDate) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set("title", title);
    fd.set("startDate", startDate);
    fd.set("dueDate", dueDate);
    if (!isRecurring) fd.delete("recurrenceFrequency");
    await createTask(selectedProject, null, fd);
    setSaving(false);
    resetModal();
    router.push(`/astelpo_26/projects/${selectedProject}/tasks`);
    router.refresh();
  }

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 h-8 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-40">
            <button
              onClick={() => { setOpen(false); router.push("/astelpo_26/projects/new"); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-800 transition-colors text-left"
            >
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-200 text-sm">New Project</span>
            </button>
            <button
              onClick={openTaskModal}
              className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-800 transition-colors text-left border-t border-slate-800"
            >
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-200 text-sm">New Task</span>
            </button>
          </div>
        )}
      </div>

      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModal} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Quick Task</h2>
              <button onClick={resetModal} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Task title *"
                required
                className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                required
                className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="">Select project *</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs text-slate-500">Start date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs text-slate-500">Due date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    required
                    className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Recurring toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1 border-t border-slate-800">
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs text-slate-500">Repeats</label>
                    <select
                      name="recurrenceFrequency"
                      defaultValue="WEEKLY"
                      className="h-9 bg-slate-800 border border-indigo-700/50 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="BIWEEKLY">Every 2 weeks</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs text-slate-500">Ends on (optional)</label>
                    <input
                      type="date"
                      name="recurrenceEndsAt"
                      className="h-9 bg-slate-800 border border-indigo-700/50 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={resetModal}
                  className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !title.trim() || !selectedProject || !startDate || !dueDate}
                  className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  {saving ? "Adding…" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
