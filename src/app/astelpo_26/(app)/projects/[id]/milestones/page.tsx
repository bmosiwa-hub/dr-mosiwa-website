import { db } from "@/lib/db";
import { readableProjectWhere, requireUserId } from "@/lib/authz";
import { notFound } from "next/navigation";
import { MilestonesClient } from "./MilestonesClient";

export default async function MilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();

  const project = await db.project.findFirst({
    where: { id, ...readableProjectWhere(userId) },
    select: {
      milestones: { orderBy: { targetDate: "asc" } },
    },
  });

  if (!project) notFound();

  return <MilestonesClient projectId={id} initialMilestones={project.milestones} />;
}
