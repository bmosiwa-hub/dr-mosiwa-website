"use server";

import { db } from "@/lib/db";
import { requireProjectWrite, requireNoteWrite } from "@/lib/authz";
import { revalidatePath } from "next/cache";

const base = (projectId: string) => `/astelpo_26/projects/${projectId}`;

export async function createNote(projectId: string, _: unknown, formData: FormData) {
  await requireProjectWrite(projectId);
  const content = formData.get("content") as string;
  if (!content?.trim()) return { error: "Content is required" };

  await db.projectNote.create({
    data: {
      title: (formData.get("title") as string) || null,
      content: content.trim(),
      projectId,
    },
  });

  revalidatePath(`${base(projectId)}/notes`);
  return null;
}

export async function updateNote(noteId: string, projectId: string, _: unknown, formData: FormData) {
  await requireNoteWrite(noteId);
  const content = formData.get("content") as string;
  if (!content?.trim()) return { error: "Content is required" };

  await db.projectNote.update({
    where: { id: noteId },
    data: {
      title: (formData.get("title") as string) || null,
      content: content.trim(),
    },
  });

  revalidatePath(`${base(projectId)}/notes`);
  return null;
}

export async function deleteNote(noteId: string, projectId: string) {
  await requireNoteWrite(noteId);
  await db.projectNote.delete({ where: { id: noteId } });
  revalidatePath(`${base(projectId)}/notes`);
}
