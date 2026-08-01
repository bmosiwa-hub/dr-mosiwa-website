import { FolderOpen } from "lucide-react";

export default async function FilesPage({ params }: { params: Promise<{ id: string }> }) {
  await params;

  return (
    <div className="text-center py-20 text-slate-500">
      <FolderOpen className="w-10 h-10 mx-auto mb-3 text-slate-700" />
      <p className="font-medium text-slate-400">File uploads coming soon</p>
      <p className="text-sm mt-1 max-w-xs mx-auto">
        File storage requires an external provider (e.g. S3, Cloudflare R2). Link your documents via Resources in the meantime.
      </p>
    </div>
  );
}
