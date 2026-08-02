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

  const startDateRaw = formData.get("startDate") as string;
  const dueDateRaw = formData.get("dueDate") as string;
  if (!startDateRaw) return { error: "Start date is required" };
  if (!dueDateRaw) return { error: "Due date is required" };

  await db.task.create({
    data: {
      title: title.trim(),
      description: (formData.get("description") as string) || null,
      status: ((formData.get("status") as string) || "TODO") as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED",
      priority: ((formData.get("priority") as string) || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      projectId,
      assigneeId: session.user.id,
    },
  });

  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  revalidatePath("/astelpo_26/today");
  return null;
}

export async function updateTaskStatus(taskId: string, status: string, projectId: string) {
  await db.task.update({ where: { id: taskId }, data: { status: status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED" } });
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  revalidatePath("/astelpo_26/today");
}

export async function deleteTask(taskId: string, projectId: string) {
  await db.task.delete({ where: { id: taskId } });
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  revalidatePath("/astelpo_26/today");
}

export async function postponeTask(taskId: string, projectId: string, newDate: string) {
  await db.task.update({ where: { id: taskId }, data: { dueDate: new Date(newDate) } });
  revalidatePath("/astelpo_26/today");
  revalidatePath(`${base(projectId)}/tasks`);
}

export async function updateTask(taskId: string, projectId: string, _: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title is required" };

  const startDateRaw = formData.get("startDate") as string;
  const dueDateRaw = formData.get("dueDate") as string;
  if (!startDateRaw) return { error: "Start date is required" };
  if (!dueDateRaw) return { error: "Due date is required" };

  await db.task.update({
    where: { id: taskId },
    data: {
      title: title.trim(),
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as string) as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED",
      priority: (formData.get("priority") as string) as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  revalidatePath("/astelpo_26/today");
  return null;
}
