import { db } from "@/lib/db";
import { formatDate, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, PROJECT_CATEGORY_LABELS, cn } from "@/lib/utils";
import { Calendar, Building2, Globe, DollarSign, Briefcase } from "lucide-react";
import { ViewerTabBar } from "./ViewerTabBar";

interface Props {
  params: Promise<{ memberId: string }>;
  children: React.ReactNode;
}

function AccessError({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <p className="text-white font-semibold mb-2">{title}</p>
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

export default async function ViewerLayout({ params, children }: Props) {
  const { memberId } = await params;

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    include: {
      project: {
        include: {
          _count: { select: { tasks: true, files: true, resources: true, milestones: true } },
        },
      },
    },
  });

  if (!member || member.role !== "VIEWER") {
    return <AccessError title="Not Found" message="This link is not valid." />;
  }
  if (member.status === "REVOKED") {
    return <AccessError title="Access Revoked" message="Your access to this project has been removed by the owner." />;
  }
  if (member.tokenExpiry && member.tokenExpiry < new Date()) {
    return <AccessError title="Link Expired" message="This view link has expired. Contact the project owner to get a new one." />;
  }

  const project = member.project;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">AstelPO</span>
        </div>
        <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">View only</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
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

        <ViewerTabBar memberId={memberId} />

        <div>{children}</div>
      </div>
    </div>
  );
}
