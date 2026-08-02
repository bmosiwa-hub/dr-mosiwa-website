import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TasksClient } from "./TasksClient";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
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
