"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderKanban, CheckSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Result = {
  tasks: { id: string; title: string; priority: string; projectId: string; project: { name: string } }[];
  projects: { id: string; name: string; status: string; colorLabel: string | null }[];
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-400", MEDIUM: "text-blue-400", HIGH: "text-amber-400", CRITICAL: "text-red-400",
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result>({ tasks: [], projects: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) { setQuery(""); setResults({ tasks: [], projects: [] }); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults({ tasks: [], projects: [] }); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/astelpo_26/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); open ? onClose() : null; }
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function go(href: string) { router.push(href); onClose(); }

  const hasResults = results.tasks.length > 0 || results.projects.length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks and projects…"
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {(hasResults || loading || query.length >= 2) && (
          <div className="max-h-80 overflow-y-auto py-2">
            {loading && <p className="px-4 py-3 text-slate-500 text-sm">Searching…</p>}

            {!loading && !hasResults && query.length >= 2 && (
              <p className="px-4 py-3 text-slate-500 text-sm">No results for "{query}"</p>
            )}

            {results.projects.length > 0 && (
              <div>
                <p className="px-4 py-1 text-xs text-slate-600 font-medium uppercase tracking-wider">Projects</p>
                {results.projects.map(p => (
                  <button key={p.id} onClick={() => go(`/astelpo_26/projects/${p.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.colorLabel ?? "#6366f1" }} />
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderKanban className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-200 text-sm truncate">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.tasks.length > 0 && (
              <div>
                <p className="px-4 py-1 text-xs text-slate-600 font-medium uppercase tracking-wider">Tasks</p>
                {results.tasks.map(t => (
                  <button key={t.id} onClick={() => go(`/astelpo_26/projects/${t.projectId}/tasks/${t.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm truncate">{t.title}</p>
                      <p className="text-slate-600 text-xs truncate">{t.project.name}</p>
                    </div>
                    <span className={cn("text-xs font-medium flex-shrink-0", PRIORITY_COLORS[t.priority])}>{t.priority}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!query && (
          <p className="px-4 py-4 text-slate-600 text-xs text-center">Type at least 2 characters to search</p>
        )}
      </div>
    </div>
  );
}
