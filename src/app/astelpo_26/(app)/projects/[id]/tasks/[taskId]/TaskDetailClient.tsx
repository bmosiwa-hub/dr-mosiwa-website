"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { addTaskNote, deleteTaskNote, addTaskLink, deleteTaskLink } from "@/lib/actions/taskDetails";
import { Trash2, Plus, ExternalLink, FileText, Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Note = { id: string; content: string; createdAt: Date };
type Link = { id: string; title: string; url: string; createdAt: Date };

function SubmitBtn({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0">
      {pending ? pendingLabel : label}
    </button>
  );
}

function NotesSection({ taskId, projectId, notes }: { taskId: string; projectId: string; notes: Note[] }) {
  const [open, setOpen] = useState(false);
  const bound = addTaskNote.bind(null, taskId, projectId);
  const [state, action] = useActionState(bound, null);
  const [, startTransition] = useTransition();

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Notes
          {notes.length > 0 && <span className="text-slate-500 font-normal">({notes.length})</span>}
        </h3>
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
          {open ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {open ? "Cancel" : "Add note"}
        </button>
      </div>

      {open && (
        <form action={async (fd) => { await action(fd); setOpen(false); }} className="mb-4 space-y-2">
          {(state as { error?: string } | null)?.error && (
            <p className="text-red-400 text-xs">{(state as { error: string }).error}</p>
          )}
          <textarea name="content" rows={3} required placeholder="Write a note…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          <div className="flex justify-end">
            <SubmitBtn label="Save note" pendingLabel="Saving…" />
          </div>
        </form>
      )}

      {notes.length === 0 && !open ? (
        <p className="text-slate-500 text-sm">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="group flex gap-3">
              <div className="flex-1 bg-slate-800/50 rounded-lg px-3 py-2.5 border border-slate-700/50">
                <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                <p className="text-slate-600 text-xs mt-1.5">
                  {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <form action={() => startTransition(() => deleteTaskNote(note.id, taskId, projectId))}>
                <button type="submit"
                  className="mt-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LinksSection({ taskId, projectId, links }: { taskId: string; projectId: string; links: Link[] }) {
  const [open, setOpen] = useState(false);
  const bound = addTaskLink.bind(null, taskId, projectId);
  const [state, action] = useActionState(bound, null);
  const [, startTransition] = useTransition();

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Link2 className="w-4 h-4 text-indigo-400" />
          Documents & Links
          {links.length > 0 && <span className="text-slate-500 font-normal">({links.length})</span>}
        </h3>
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 h-7 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors">
          {open ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {open ? "Cancel" : "Add link"}
        </button>
      </div>

      {open && (
        <form action={async (fd) => { await action(fd); setOpen(false); }} className="mb-4 space-y-2">
          {(state as { error?: string } | null)?.error && (
            <p className="text-red-400 text-xs">{(state as { error: string }).error}</p>
          )}
          <input name="title" required placeholder="Title (e.g. Project Brief)" autoFocus
            className="w-full h-8 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
          <div className="flex gap-2">
            <input name="url" required placeholder="https://…" type="url"
              className="flex-1 h-8 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
            <SubmitBtn label="Add" pendingLabel="Adding…" />
          </div>
        </form>
      )}

      {links.length === 0 && !open ? (
        <p className="text-slate-500 text-sm">No links yet.</p>
      ) : (
        <div className="space-y-1.5">
          {links.map(link => (
            <div key={link.id} className="group flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex-1 min-w-0 text-sm text-slate-200 hover:text-indigo-300 transition-colors truncate">
                {link.title}
              </a>
              <span className="text-xs text-slate-600 truncate max-w-[160px] hidden sm:block">
                {link.url.replace(/^https?:\/\//, "").split("/")[0]}
              </span>
              <form action={() => startTransition(() => deleteTaskLink(link.id, taskId, projectId))}>
                <button type="submit"
                  className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function TaskDetailClient({
  taskId, projectId, notes, links,
}: {
  taskId: string;
  projectId: string;
  notes: Note[];
  links: Link[];
}) {
  return (
    <div className={cn("space-y-5")}>
      <NotesSection taskId={taskId} projectId={projectId} notes={notes} />
      <LinksSection taskId={taskId} projectId={projectId} links={links} />
    </div>
  );
}
