"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const base = (projectId: string) => `/astelpo_26/projects/${projectId}`;

async function syncProgress(projectId: string) {
  const tasks = await db.task.findMany({
    where: { projectId, recurrenceFrequency: null },
    select: { status: true },
  });
  const active = tasks.filter(t => t.status !== "CANCELLED");
  const done = active.filter(t => t.status === "DONE").length;
  const progress = active.length === 0 ? 0 : Math.round((done / active.length) * 100);
  await db.project.update({ where: { id: projectId }, data: { progress } });
}

export async function createTask(projectId: string, _: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title is required" };

  const startDateRaw = formData.get("startDate") as string;
  const dueDateRaw = formData.get("dueDate") as string;
  if (!startDateRaw) return { error: "Start date is required" };
  if (!dueDateRaw) return { error: "Due date is required" };

  const recurrenceFrequencyRaw = formData.get("recurrenceFrequency") as string | null;
  const recurrenceFrequency = recurrenceFrequencyRaw
    ? (recurrenceFrequencyRaw as "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY")
    : null;
  const recurrenceEndsAtRaw = formData.get("recurrenceEndsAt") as string;

  await db.task.create({
    data: {
      title: title.trim(),
      description: (formData.get("description") as string) || null,
      status: ((formData.get("status") as string) || "TODO") as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED",
      priority: ((formData.get("priority") as string) || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      recurrenceFrequency,
      recurrenceEndsAt: recurrenceEndsAtRaw ? new Date(recurrenceEndsAtRaw) : null,
      projectId,
      assigneeId: session.user.id,
    },
  });

  await syncProgress(projectId);
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  revalidatePath("/astelpo_26/today");
  revalidatePath("/astelpo_26/projects");
  return null;
}

export async function updateTaskStatus(taskId: string, status: string, projectId: string) {
  await db.task.update({ where: { id: taskId }, data: { status: status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED" } });
  await syncProgress(projectId);
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  revalidatePath("/astelpo_26/today");
  revalidatePath("/astelpo_26/projects");
}

export async function deleteTask(taskId: string, projectId: string) {
  await db.task.delete({ where: { id: taskId } });
  await syncProgress(projectId);
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  revalidatePath("/astelpo_26/today");
  revalidatePath("/astelpo_26/projects");
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

  const recurrenceFrequencyRaw = formData.get("recurrenceFrequency") as string | null;
  const recurrenceFrequency = recurrenceFrequencyRaw
    ? (recurrenceFrequencyRaw as "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY")
    : null;
  const recurrenceEndsAtRaw = formData.get("recurrenceEndsAt") as string;

  await db.task.update({
    where: { id: taskId },
    data: {
      title: title.trim(),
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as string) as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED",
      priority: (formData.get("priority") as string) as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      recurrenceFrequency,
      recurrenceEndsAt: recurrenceEndsAtRaw ? new Date(recurrenceEndsAtRaw) : null,
    },
  });

  await syncProgress(projectId);
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath(base(projectId));
  revalidatePath("/astelpo_26/today");
  revalidatePath("/astelpo_26/projects");
  return null;
}
