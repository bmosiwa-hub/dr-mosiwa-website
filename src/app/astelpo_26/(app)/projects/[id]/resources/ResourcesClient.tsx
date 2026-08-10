"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createResource, deleteResource } from "@/lib/actions/resources";
import { Link2, ExternalLink, Trash2, Plus } from "lucide-react";

const CATEGORIES = [
  "GOOGLE_DRIVE", "DROPBOX", "GITHUB", "SHAREPOINT",
  "MEETING_LINK", "REFERENCE", "DATASET", "PUBLICATION",
  "GUIDELINE", "OTHER",
];
const CAT_LABELS: Record<string, string> = {
  GOOGLE_DRIVE: "Google Drive", DROPBOX: "Dropbox", GITHUB: "GitHub",
  SHAREPOINT: "SharePoint", MEETING_LINK: "Meeting Link", REFERENCE: "Reference",
  DATASET: "Dataset", PUBLICATION: "Publication", GUIDELINE: "Guideline", OTHER: "Other",
};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
      {pending ? "Saving…" : "Add Resource"}
    </button>
  );
}

export type Resource = { id: string; title: string; url: string; description: string | null; category: string; notes: string | null };

export function ResourcesClient({ projectId, initialResources }: { projectId: string; initialResources: Resource[] }) {
  const [showForm, setShowForm] = useState(false);
  const bound = createResource.bind(null, projectId);
  const [state, formAction] = useActionState(bound, null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Resources ({initialResources.length})</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      {showForm && (
        <form action={async (fd: FormData) => { await formAction(fd); setShowForm(false); }}
          className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
          {(state as { error?: string } | null)?.error && (
            <p className="text-red-400 text-sm">{(state as { error: string }).error}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <input name="title" required placeholder="Title *"
              className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
            <select name="category" defaultValue="OTHER"
              className="h-9 bg-slate-800 border border-slate-700 rounded-lg px-2 text-white text-sm focus:outline-none focus:border-indigo-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>
          <input name="url" required type="url" placeholder="URL *"
            className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
          <input name="description" placeholder="Description (optional)"
            className="w-full h-9 bg-slate-800 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
            <SubmitBtn />
          </div>
        </form>
      )}

      {initialResources.length === 0 && !showForm ? (
        <div className="text-center py-16 text-slate-500">
          <Link2 className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          <p className="font-medium text-slate-400">No resources yet</p>
          <p className="text-sm mt-1">Add links to Drive folders, reports, meeting rooms, and more.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {initialResources.map(r => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 group transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded-full">{CAT_LABELS[r.category]}</span>
                  </div>
                  <p className="text-white text-sm font-medium truncate">{r.title}</p>
                  {r.description && <p className="text-slate-500 text-xs mt-1 truncate">{r.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <form action={deleteResource.bind(null, r.id, projectId)}>
                    <button type="submit"
                      className="h-7 w-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-red-900/30 text-slate-600 hover:text-red-400 transition-colors sm:opacity-0 sm:group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
