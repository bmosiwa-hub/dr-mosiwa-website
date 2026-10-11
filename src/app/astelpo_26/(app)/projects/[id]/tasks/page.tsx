import { db } from "@/lib/db";
import { readableProjectWhere, requireUserId } from "@/lib/authz";
import { notFound } from "next/navigation";
import { TasksClient } from "./TasksClient";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();

  const project = await db.project.findFirst({
    where: { id, ...readableProjectWhere(userId) },
    select: {
      tasks: {
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        select: {
          id: true, title: true, description: true, status: true, priority: true,
          startDate: true, dueDate: true, recurrenceFrequency: true, recurrenceEndsAt: true,
        },
      },
    },
  });

  if (!project) notFound();

  return <TasksClient projectId={id} initialTasks={project.tasks} />;
}
