import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatRelative } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function ViewerNotesPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    select: {
      project: {
        select: {
          projectNotes: { orderBy: { updatedAt: "desc" } },
        },
      },
    },
  });

  if (!member) notFound();
  const notes = member.project.projectNotes;

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Notes ({notes.length})</h3>

      {notes.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                {note.title ? (
                  <h4 className="text-white font-medium text-sm">{note.title}</h4>
                ) : (
                  <span className="text-slate-600 text-xs italic">Untitled</span>
                )}
                <span className="text-xs text-slate-600 flex-shrink-0">{formatRelative(note.updatedAt)}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
