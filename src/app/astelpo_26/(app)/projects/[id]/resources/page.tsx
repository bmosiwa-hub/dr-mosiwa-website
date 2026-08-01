import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ResourcesClient } from "./ResourcesClient";

export default async function ResourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    select: {
      resources: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();

  return <ResourcesClient projectId={id} initialResources={project.resources} />;
}
