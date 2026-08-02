"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban, CheckSquare, X } from "lucide-react";
import { createTask } from "@/lib/actions/tasks";
import { db } from "@/lib/db";

export function NewDropdown() {
  const [open, setOpen] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
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

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedProject) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("title", title);
    await createTask(selectedProject, null, fd);
    setSaving(false);
    setTaskModal(false);
    setTitle("");
    setSelectedProject("");
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTaskModal(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Quick Task</h2>
              <button onClick={() => setTaskModal(false)} className="text-slate-500 hover:text-slate-300">
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
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setTaskModal(false)}
                  className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !title.trim() || !selectedProject}
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
