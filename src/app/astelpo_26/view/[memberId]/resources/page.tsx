import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ExternalLink, BookOpen } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  GOOGLE_DRIVE: "Google Drive",
  DROPBOX: "Dropbox",
  GITHUB: "GitHub",
  SHAREPOINT: "SharePoint",
  MEETING_LINK: "Meeting Link",
  REFERENCE: "Reference",
  DATASET: "Dataset",
  PUBLICATION: "Publication",
  GUIDELINE: "Guideline",
  OTHER: "Other",
};

export default async function ViewerResourcesPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    select: {
      project: {
        select: {
          resources: { orderBy: { createdAt: "desc" }, select: { id: true, title: true, description: true, category: true, url: true } },
        },
      },
    },
  });

  if (!member) notFound();
  const resources = member.project.resources;

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Resources ({resources.length})</h3>

      {resources.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400">No resources yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map((r) => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded">
                    {CATEGORY_LABEL[r.category] ?? r.category}
                  </span>
                  <p className="text-white text-sm font-medium mt-1.5 truncate">{r.title}</p>
                  {r.description && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{r.description}</p>}
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-400 transition-colors flex-shrink-0 mt-0.5"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
