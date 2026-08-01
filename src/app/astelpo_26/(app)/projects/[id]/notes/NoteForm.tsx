"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createNote } from "@/lib/actions/notes";
import { Plus } from "lucide-react";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
      {pending ? "Saving…" : "Save Note"}
    </button>
  );
}

export function InlineNoteForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const bound = createNote.bind(null, projectId);
  const [state, formAction] = useActionState(bound, null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
        <Plus className="w-4 h-4" /> New Note
      </button>
    );
  }

  return (
    <form action={async (fd) => { await formAction(fd); setOpen(false); }}
      className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
      <input name="title" placeholder="Title (optional)"
        className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
      <textarea name="content" required rows={4} placeholder="Note content *"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none" />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)}
          className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
        <SubmitBtn />
      </div>
    </form>
  );
}
