"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, isOverdue, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS, PROJECT_CATEGORY_LABELS } from "@/lib/utils";
import { LayoutGrid, List, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = "/astelpo_26";

type ProjectWithMeta = {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  progress: number;
  colorLabel: string | null;
  clientName: string | null;
  endDate: Date | null;
  _count: { tasks: number };
  tags: { tag: { id: string; name: string } }[];
};

interface Props {
  projects: ProjectWithMeta[];
}

export function ProjectGrid({ projects }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("ALL");

  const statuses = ["ALL", "ACTIVE", "PLANNING", "NOT_STARTED", "ON_HOLD", "COMPLETED", "CANCELLED"];
  const filtered = filter === "ALL" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-2">
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1 overflow-x-auto scrollbar-none flex-1 max-w-fit">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                filter === s ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {s === "ALL" ? "All" : PROJECT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setView("grid")}
            className={cn("p-2 rounded-lg transition-colors", view === "grid" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn("p-2 rounded-lg transition-colors", view === "list" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg font-medium text-slate-400">No projects yet</p>
          <p className="text-sm mt-1">Create your first project to get started.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => <ProjectRow key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project: p }: { project: ProjectWithMeta }) {
  const overdue = isOverdue(p.endDate);

  return (
    <Link href={`${BASE}/projects/${p.id}`}>
      <div className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 transition-all cursor-pointer">
        {p.colorLabel && (
          <div className="h-1 w-12 rounded-full mb-4" style={{ backgroundColor: p.colorLabel }} />
        )}

        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
            {p.name}
          </h3>
          {overdue && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PROJECT_STATUS_COLORS[p.status])}>
            {PROJECT_STATUS_LABELS[p.status]}
          </span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PRIORITY_COLORS[p.priority])}>
            {PRIORITY_LABELS[p.priority]}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{p.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{p._count.tasks} tasks</span>
          {p.endDate && (
            <span className={cn("flex items-center gap-1", overdue && "text-red-400")}>
              <Calendar className="w-3 h-3" />
              {formatDate(p.endDate)}
            </span>
          )}
        </div>

        {p.clientName && (
          <p className="text-xs text-slate-600 mt-2 truncate">{p.clientName}</p>
        )}
      </div>
    </Link>
  );
}

function ProjectRow({ project: p }: { project: ProjectWithMeta }) {
  const overdue = isOverdue(p.endDate);
  return (
    <Link href={`${BASE}/projects/${p.id}`}>
      <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl px-4 py-3 transition-all">
        {p.colorLabel && (
          <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: p.colorLabel }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm truncate">{p.name}</span>
            {overdue && <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
          </div>
          <span className="text-xs text-slate-500">{PROJECT_CATEGORY_LABELS[p.category]}{p.clientName ? ` · ${p.clientName}` : ""}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PROJECT_STATUS_COLORS[p.status])}>
            {PROJECT_STATUS_LABELS[p.status]}
          </span>
          <div className="w-24 hidden sm:block">
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
            </div>
            <span className="text-xs text-slate-600">{p.progress}%</span>
          </div>
          {p.endDate && (
            <span className={cn("text-xs hidden md:block", overdue ? "text-red-400" : "text-slate-500")}>
              {formatDate(p.endDate)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
