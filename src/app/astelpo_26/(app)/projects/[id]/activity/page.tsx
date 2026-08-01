import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatRelative } from "@/lib/utils";
import { Activity } from "lucide-react";

export default async function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    select: {
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });

  if (!project) notFound();

  const activities = project.activities;

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Activity Log ({activities.length})</h3>

      {activities.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Activity className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400">No activity yet</p>
          <p className="text-sm mt-1">Actions on this project will appear here.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />
          <div className="space-y-4 pl-10">
            {activities.map((act) => (
              <div key={act.id} className="relative">
                <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
                <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-slate-300">
                    <span className="text-white font-medium">{act.user.name}</span>{" "}
                    {act.action}
                    {act.entityName && <span className="text-indigo-400"> {act.entityName}</span>}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{formatRelative(act.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
