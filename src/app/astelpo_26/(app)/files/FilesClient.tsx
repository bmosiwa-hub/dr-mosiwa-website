"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  FileText, Image, Archive, FileVideo, FileAudio, FileCode,
  FileSpreadsheet, Download, Search, FolderOpen, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectFile = {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  category: string | null;
  description: string | null;
  createdAt: string;
  project: { id: string; name: string; colorLabel: string | null };
};

type Props = { files: ProjectFile[] };

type GroupBy = "project" | "date" | "type";

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
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0 group">
      <div className="flex-shrink-0">{fileIcon(file.mimeType)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium truncate">{file.originalName}</p>
        {file.description && (
          <p className="text-slate-500 text-xs truncate">{file.description}</p>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 text-xs text-slate-500">
        <span className="hidden sm:inline">{formatSize(file.size)}</span>
        <span className="hidden md:inline">{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
          title="Open file"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href={file.url}
          download={file.originalName}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export function FilesClient({ files }: Props) {
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("project");

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter(
      (f) =>
        f.originalName.toLowerCase().includes(q) ||
        f.project.name.toLowerCase().includes(q) ||
        (f.description ?? "").toLowerCase().includes(q)
    );
  }, [files, search]);

  const groups = useMemo(() => {
    if (groupBy === "project") {
      const map = new Map<string, { label: string; color: string | null; items: ProjectFile[] }>();
      for (const f of filtered) {
        if (!map.has(f.project.id)) {
          map.set(f.project.id, { label: f.project.name, color: f.project.colorLabel, items: [] });
        }
        map.get(f.project.id)!.items.push(f);
      }
      return [...map.entries()].map(([key, val]) => ({ key, ...val }));
    }

    if (groupBy === "type") {
      const map = new Map<string, { label: string; color: null; items: ProjectFile[] }>();
      for (const f of filtered) {
        const type = fileTypeLabel(f.mimeType);
        if (!map.has(type)) map.set(type, { label: type, color: null, items: [] });
        map.get(type)!.items.push(f);
      }
      return [...map.entries()].map(([key, val]) => ({ key, ...val }));
    }

    // groupBy === "date"
    const map = new Map<string, { label: string; color: null; items: ProjectFile[] }>();
    for (const f of filtered) {
      const month = format(new Date(f.createdAt), "MMMM yyyy");
      if (!map.has(month)) map.set(month, { label: month, color: null, items: [] });
      map.get(month)!.items.push(f);
    }
    return [...map.entries()].map(([key, val]) => ({ key, ...val }));
  }, [filtered, groupBy]);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white">Files</h2>
          <p className="text-slate-400 text-sm mt-1">
            {files.length} file{files.length !== 1 ? "s" : ""} · {formatSize(totalSize)} total
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="w-full h-9 pl-9 pr-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {(["project", "type", "date"] as GroupBy[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={cn(
                "h-7 px-3 rounded-md text-xs font-medium transition-colors capitalize",
                groupBy === g
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              By {g}
            </button>
          ))}
        </div>
      </div>

      {/* File groups */}
      {files.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <FolderOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">No files uploaded yet</p>
          <p className="text-slate-600 text-xs mt-1">Files attached to project deliverables appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500 text-sm">No files match your search.</p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.key} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                {group.color && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                )}
                <h3 className="text-white font-semibold text-sm">{group.label}</h3>
                <span className="text-slate-600 text-xs">({group.items.length})</span>
              </div>
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
