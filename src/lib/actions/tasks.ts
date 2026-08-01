"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const base = (projectId: string) => `/astelpo_26/projects/${projectId}`;

export async function createTask(projectId: string, _: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title is required" };

  const dueDateRaw = formData.get("dueDate") as string;

  await db.task.create({
    data: {
      title: title.trim(),
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as string) || "TODO",
      priority: (formData.get("priority") as string) || "MEDIUM",
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      projectId,
      assigneeId: session.user.id,
    },
  });

  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  return null;
}

export async function updateTaskStatus(taskId: string, status: string, projectId: string) {
  await db.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
}

export async function deleteTask(taskId: string, projectId: string) {
  await db.task.delete({ where: { id: taskId } });
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
}
