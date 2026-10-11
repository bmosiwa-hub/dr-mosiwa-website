import { db } from "@/lib/db";
import { readableProjectWhere, requireUserId } from "@/lib/authz";
import { notFound } from "next/navigation";
import { ResourcesClient } from "./ResourcesClient";

export default async function ResourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();

  const project = await db.project.findFirst({
    where: { id, ...readableProjectWhere(userId) },
    select: {
      resources: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();

  return <ResourcesClient projectId={id} initialResources={project.resources} />;
}
