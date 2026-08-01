import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MilestonesClient } from "./MilestonesClient";

export default async function MilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    select: {
      milestones: { orderBy: { targetDate: "asc" } },
    },
  });

  if (!project) notFound();

  return <MilestonesClient projectId={id} initialMilestones={project.milestones} />;
}
