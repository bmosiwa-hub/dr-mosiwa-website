import { db } from "@/lib/db";
import { readableProjectWhere, requireUserId } from "@/lib/authz";
import { notFound } from "next/navigation";
import { ProjectFilesClient } from "./ProjectFilesClient";

export default async function FilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();

  const project = await db.project.findFirst({
    where: { id, ...readableProjectWhere(userId) },
    select: { id: true },
  });
  if (!project) notFound();

  const files = await db.projectFile.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, originalName: true, url: true, size: true,
      mimeType: true, description: true, category: true, version: true,
      createdAt: true,
      deliverable: { select: { id: true, name: true } },
    },
  });

  const serialized = files.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
    deliverable: f.deliverable ?? null,
  }));

  return <ProjectFilesClient projectId={id} files={serialized} />;
}
