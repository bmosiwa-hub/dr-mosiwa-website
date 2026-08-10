import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, PROJECT_CATEGORY_LABELS, cn } from "@/lib/utils";
import { Calendar, Building2, Globe, DollarSign } from "lucide-react";
import { WorkplanImport } from "./WorkplanImport";
import { ProjectTabs } from "./ProjectTabs";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export default async function ProjectLayout({ params, children }: Props) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      _count: { select: { tasks: true, files: true, resources: true, milestones: true } },
    },
  });

  if (!project) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/astelpo_26/projects" className="text-slate-500 hover:text-slate-300 transition-colors">Projects</Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 truncate max-w-xs">{project.name}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {project.colorLabel && (
              <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: project.colorLabel }} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white">{project.name}</h2>
                {project.shortName && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{project.shortName}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", PROJECT_STATUS_COLORS[project.status])}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
                <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", PRIORITY_COLORS[project.priority])}>
                  {PRIORITY_LABELS[project.priority]}
                </span>
                <span className="text-xs text-slate-500">{PROJECT_CATEGORY_LABELS[project.category]}</span>
              </div>
              {project.description && (
                <p className="text-slate-400 text-sm mt-2 leading-relaxed line-clamp-2">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <WorkplanImport projectId={id} />
            <Link href={`/astelpo_26/projects/${id}/edit`}
              className="h-8 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-colors flex items-center">
              Edit
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="text-white font-medium">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {(project.clientName || project.country || project.startDate || project.endDate || project.budget) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800">
            {project.clientName && (
              <div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5"><Building2 className="w-3 h-3" /> Client</div>
                <p className="text-slate-200 text-sm truncate">{project.clientName}</p>
              </div>
            )}
            {project.country && (
              <div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5"><Globe className="w-3 h-3" /> Country</div>
                <p className="text-slate-200 text-sm">{project.country}</p>
              </div>
            )}
            {(project.startDate || project.endDate) && (
              <div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5"><Calendar className="w-3 h-3" /> Timeline</div>
                <p className="text-slate-200 text-sm">{formatDate(project.startDate)} → {formatDate(project.endDate)}</p>
              </div>
            )}
            {project.budget && (
              <div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5"><DollarSign className="w-3 h-3" /> Budget</div>
                <p className="text-slate-200 text-sm">${project.budget.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ProjectTabs projectId={id} />

      <div>{children}</div>
    </div>
  );
}
