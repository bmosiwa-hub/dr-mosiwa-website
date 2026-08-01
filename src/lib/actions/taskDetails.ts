"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

function taskPath(projectId: string, taskId: string) {
  return `/astelpo_26/projects/${projectId}/tasks/${taskId}`;
}

// ── Notes (TaskComment) ───────────────────────────────────────────────────────

export async function addTaskNote(taskId: string, projectId: string, _: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const content = (formData.get("content") as string)?.trim();
  if (!content) return { error: "Note cannot be empty" };

  await db.taskComment.create({
    data: { content, taskId, authorId: session.user.id! },
  });

  revalidatePath(taskPath(projectId, taskId));
  return null;
}

export async function deleteTaskNote(noteId: string, taskId: string, projectId: string) {
  await db.taskComment.delete({ where: { id: noteId } });
  revalidatePath(taskPath(projectId, taskId));
}

// ── Links (TaskLink) ──────────────────────────────────────────────────────────

export async function addTaskLink(taskId: string, projectId: string, _: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();

  if (!title) return { error: "Title is required" };
  if (!url) return { error: "URL is required" };

  const normalized = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

  await db.taskLink.create({ data: { title, url: normalized, taskId } });

  revalidatePath(taskPath(projectId, taskId));
  return null;
}

export async function deleteTaskLink(linkId: string, taskId: string, projectId: string) {
  await db.taskLink.delete({ where: { id: linkId } });
  revalidatePath(taskPath(projectId, taskId));
}
