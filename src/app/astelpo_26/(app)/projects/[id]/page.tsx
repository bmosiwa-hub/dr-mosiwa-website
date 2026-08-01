import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, PROJECT_CATEGORY_LABELS, cn } from "@/lib/utils";
import { Calendar, Building2, Globe, DollarSign, Clock, CheckSquare } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, select: { name: true } });
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: "desc" }, take: 5 },
      milestones: { orderBy: { targetDate: "asc" } },
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { tasks: true, files: true, resources: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!project) notFound();

  const tabs = [
    { label: "Overview", href: `/astelpo_26/projects/${id}` },
    { label: "Tasks", href: `/astelpo_26/projects/${id}/tasks`, count: project._count.tasks },
    { label: "Files", href: `/astelpo_26/projects/${id}/files`, count: project._count.files },
    { label: "Notes", href: `/astelpo_26/projects/${id}/notes` },
    { label: "Resources", href: `/astelpo_26/projects/${id}/resources`, count: project._count.resources },
    { label: "Milestones", href: `/astelpo_26/projects/${id}/milestones`, count: project.milestones.length },
    { label: "Activity", href: `/astelpo_26/projects/${id}/activity` },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/astelpo_26/projects" className="text-slate-500 hover:text-slate-300 transition-colors">Projects</Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300">{project.name}</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {project.colorLabel && (
              <div className="w-3 h-3 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: project.colorLabel }} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                {project.shortName && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{project.shortName}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", PROJECT_STATUS_COLORS[project.status])}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", PRIORITY_COLORS[project.priority])}>
                  {PRIORITY_LABELS[project.priority]} Priority
                </span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
                  {PROJECT_CATEGORY_LABELS[project.category]}
                </span>
              </div>
              {project.description && (
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{project.description}</p>
              )}
            </div>
          </div>
          <Link
            href={`/astelpo_26/projects/${id}/edit`}
            className="flex-shrink-0 h-9 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-colors flex items-center"
          >
            Edit
          </Link>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-white font-medium">{project.progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-800">
          {project.clientName && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Building2 className="w-3.5 h-3.5" /> Client
              </div>
              <p className="text-slate-200 text-sm font-medium">{project.clientName}</p>
            </div>
          )}
          {project.country && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Globe className="w-3.5 h-3.5" /> Country
              </div>
              <p className="text-slate-200 text-sm font-medium">{project.country}</p>
            </div>
          )}
          {(project.startDate || project.endDate) && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Timeline
              </div>
              <p className="text-slate-200 text-sm font-medium">
                {formatDate(project.startDate)} → {formatDate(project.endDate)}
              </p>
            </div>
          )}
          {project.budget && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <DollarSign className="w-3.5 h-3.5" /> Budget
              </div>
              <p className="text-slate-200 text-sm font-medium">${project.budget.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-slate-800">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent hover:border-slate-500 transition-colors whitespace-nowrap"
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              Recent Tasks
            </h3>
            <Link href={`/astelpo_26/projects/${id}/tasks`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all
            </Link>
          </div>
          {project.tasks.length === 0 ? (
            <p className="text-slate-500 text-sm">No tasks yet.</p>
          ) : (
            <div className="space-y-2">
              {project.tasks.map((task: typeof project.tasks[number]) => (
                <div key={task.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", task.status === "DONE" ? "bg-green-500" : task.status === "IN_PROGRESS" ? "bg-indigo-500" : "bg-slate-600")} />
                  <span className={cn("text-sm flex-1 truncate", task.status === "DONE" ? "line-through text-slate-600" : "text-slate-300")}>{task.title}</span>
                  {task.dueDate && (
                    <span className="text-xs text-slate-500 flex-shrink-0">{formatDate(task.dueDate)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-indigo-400" />
            Activity
          </h3>
          {project.activities.length === 0 ? (
            <p className="text-slate-500 text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {project.activities.map((act: typeof project.activities[number]) => (
                <div key={act.id} className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-200 font-medium">{act.user.name}</span>{" "}
                  {act.action}{" "}
                  {act.entityName && <span className="text-indigo-400">{act.entityName}</span>}
                  <div className="text-slate-600 mt-0.5">{formatDate(act.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
