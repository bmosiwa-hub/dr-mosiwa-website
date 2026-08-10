"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  FileText, Image, Archive, FileVideo, FileAudio, FileCode,
  FileSpreadsheet, Download, Search, FolderOpen, ExternalLink, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectFile = {
  id: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  description: string | null;
  category: string | null;
  version: string | null;
  createdAt: string;
  deliverable: { id: string; name: string } | null;
};

type GroupBy = "deliverable" | "type" | "date";

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <Image className="w-4 h-4 text-teal-400" />;
  if (mimeType.startsWith("video/")) return <FileVideo className="w-4 h-4 text-indigo-400" />;
  if (mimeType.startsWith("audio/")) return <FileAudio className="w-4 h-4 text-pink-400" />;
  if (mimeType.includes("pdf")) return <FileText className="w-4 h-4 text-red-400" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
  if (mimeType.includes("zip") || mimeType.includes("compressed") || mimeType.includes("archive"))
    return <Archive className="w-4 h-4 text-amber-400" />;
  if (mimeType.includes("javascript") || mimeType.includes("json") || mimeType.includes("html") || mimeType.includes("css"))
    return <FileCode className="w-4 h-4 text-blue-400" />;
  return <FileText className="w-4 h-4 text-slate-400" />;
}

function fileTypeLabel(mimeType: string) {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "Spreadsheet";
  if (mimeType.includes("word") || mimeType.includes("document")) return "Document";
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return "Archive";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "Presentation";
  return "File";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileRow({ file }: { file: ProjectFile }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className="flex-shrink-0">{fileIcon(file.mimeType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium truncate">{file.originalName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {file.description && <p className="text-slate-500 text-xs truncate">{file.description}</p>}
          {file.version && <span className="text-xs text-indigo-400/80 bg-indigo-900/20 px-1.5 py-0 rounded border border-indigo-800/30 flex-shrink-0">v{file.version}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 text-xs text-slate-500">
        <span className="hidden sm:inline">{formatSize(file.size)}</span>
        <span className="hidden md:inline">{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
        <a href={file.url} target="_blank" rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 transition-colors" title="Open">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a href={file.url} download={file.originalName}
          className="text-slate-500 hover:text-slate-300 transition-colors" title="Download">
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export function ProjectFilesClient({ files }: { projectId: string; files: ProjectFile[] }) {
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("deliverable");

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter(
      (f) =>
        f.originalName.toLowerCase().includes(q) ||
        (f.description ?? "").toLowerCase().includes(q) ||
        (f.deliverable?.name ?? "").toLowerCase().includes(q)
    );
  }, [files, search]);

  const groups = useMemo(() => {
    if (groupBy === "deliverable") {
      const map = new Map<string, { label: string; items: ProjectFile[] }>();
      for (const f of filtered) {
        const key = f.deliverable?.id ?? "__none";
        const label = f.deliverable?.name ?? "Unlinked";
        if (!map.has(key)) map.set(key, { label, items: [] });
        map.get(key)!.items.push(f);
      }
      // Sort: linked deliverables first, unlinked last
      return [...map.entries()]
        .sort(([a], [b]) => (a === "__none" ? 1 : b === "__none" ? -1 : 0))
        .map(([key, val]) => ({ key, ...val }));
    }

    if (groupBy === "type") {
      const map = new Map<string, { label: string; items: ProjectFile[] }>();
      for (const f of filtered) {
        const type = fileTypeLabel(f.mimeType);
        if (!map.has(type)) map.set(type, { label: type, items: [] });
        map.get(type)!.items.push(f);
      }
      return [...map.entries()].map(([key, val]) => ({ key, ...val }));
    }

    // date
    const map = new Map<string, { label: string; items: ProjectFile[] }>();
    for (const f of filtered) {
      const month = format(new Date(f.createdAt), "MMMM yyyy");
      if (!map.has(month)) map.set(month, { label: month, items: [] });
      map.get(month)!.items.push(f);
    }
    return [...map.entries()].map(([key, val]) => ({ key, ...val }));
  }, [filtered, groupBy]);

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  if (files.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <FolderOpen className="w-10 h-10 mx-auto mb-3 text-slate-700" />
        <p className="font-medium text-slate-400">No files yet</p>
        <p className="text-sm mt-1 max-w-xs mx-auto text-slate-600">
          Files attached to deliverables will appear here. Upload support requires an external storage provider (S3, R2).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="w-full h-9 pl-9 pr-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            {(["deliverable", "type", "date"] as GroupBy[]).map((g) => (
              <button key={g} onClick={() => setGroupBy(g)}
                className={cn(
                  "h-7 px-2.5 rounded-md text-xs font-medium transition-colors capitalize",
                  groupBy === g ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                )}>
                {g === "deliverable" ? "Deliverable" : `By ${g}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-lg px-3 h-9">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{files.length} file{files.length !== 1 ? "s" : ""} · {formatSize(totalSize)}</span>
            <span className="sm:hidden">{files.length}</span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm">No files match your search.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.key} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-1">
                {group.label}
                <span className="text-slate-600 font-normal ml-1.5 text-xs">({group.items.length})</span>
              </h3>
              <div>
                {group.items.map((f) => <FileRow key={f.id} file={f} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
