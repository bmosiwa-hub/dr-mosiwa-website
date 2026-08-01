import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatRelative } from "@/lib/utils";
import { createNote, deleteNote } from "@/lib/actions/notes";
import { FileText, Plus, Trash2 } from "lucide-react";
import { InlineNoteForm } from "./NoteForm";

export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      projectNotes: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!project) notFound();

  const notes = project.projectNotes;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Notes ({notes.length})</h3>
      </div>

      <InlineNoteForm projectId={id} />

      {notes.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400">No notes yet</p>
          <p className="text-sm mt-1">Capture ideas, decisions, and context here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 group">
              <div className="flex items-start justify-between gap-3 mb-2">
                {note.title ? (
                  <h4 className="text-white font-medium text-sm">{note.title}</h4>
                ) : (
                  <span className="text-slate-600 text-xs italic">Untitled</span>
                )}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-600">{formatRelative(note.updatedAt)}</span>
                  <form action={deleteNote.bind(null, note.id, id)}>
                    <button type="submit" className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
