import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await auth();

  const projects = await db.project.findMany({
    where: { leadId: session?.user?.id },
    include: {
      _count: { select: { tasks: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { name: "asc" },
  });

  type P = typeof projects[number];
  const stats = {
    total: projects.length,
    active: projects.filter((p: P) => p.status === "ACTIVE").length,
    completed: projects.filter((p: P) => p.status === "COMPLETED").length,
    onHold: projects.filter((p: P) => p.status === "ON_HOLD").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {stats.total} projects · {stats.active} active
          </p>
        </div>
        <Link
          href="/astelpo_26/projects/new"
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Active", value: stats.active, color: "bg-green-900/30 text-green-400 border-green-800/30" },
          { label: "On Hold", value: stats.onHold, color: "bg-amber-900/30 text-amber-400 border-amber-800/30" },
          { label: "Completed", value: stats.completed, color: "bg-purple-900/30 text-purple-400 border-purple-800/30" },
          { label: "Total", value: stats.total, color: "bg-slate-800 text-slate-300 border-slate-700" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${s.color}`}>
            <span className="font-bold">{s.value}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <ProjectGrid projects={projects} />
    </div>
  );
}
