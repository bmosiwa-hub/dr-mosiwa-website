import type { Metadata } from "next";
export const metadata: Metadata = { title: "Files" };

export default function FilesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Files</h2>
      <p className="text-slate-400 text-sm">Coming in Phase 5 — Vercel Blob file management across all projects.</p>
    </div>
  );
}
