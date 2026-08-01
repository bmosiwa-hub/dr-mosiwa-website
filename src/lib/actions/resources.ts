"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const base = (projectId: string) => `/astelpo_26/projects/${projectId}`;

export async function createResource(projectId: string, _: unknown, formData: FormData) {
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  if (!title?.trim()) return { error: "Title is required" };
  if (!url?.trim()) return { error: "URL is required" };

  await db.resource.create({
    data: {
      title: title.trim(),
      url: url.trim(),
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || "OTHER",
      notes: (formData.get("notes") as string) || null,
      projectId,
    },
  });

  revalidatePath(`${base(projectId)}/resources`);
  return null;
}

export async function deleteResource(resourceId: string, projectId: string) {
  await db.resource.delete({ where: { id: resourceId } });
  revalidatePath(`${base(projectId)}/resources`);
}
