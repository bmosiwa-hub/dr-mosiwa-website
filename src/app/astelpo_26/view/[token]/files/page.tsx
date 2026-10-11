import { FolderOpen } from "lucide-react";

export default function ViewerFilesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <FolderOpen className="w-10 h-10 mb-3 text-slate-700" />
      <p className="font-medium text-slate-400">File uploads coming soon</p>
      <p className="text-sm mt-1">Use the Resources tab to share links in the meantime.</p>
    </div>
  );
}
