"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const base = (projectId: string) => `/astelpo_26/projects/${projectId}`;

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

const VALID_FREQ = ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"] as const;
type Freq = (typeof VALID_FREQ)[number];

export async function createRecurringTask(
  projectId: string,
  _: unknown,
  formData: FormData,
): Promise<{ error?: string } | null> {
  try { await requireAuth(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required" };

  const startingFromRaw = formData.get("startingFrom") as string;
  if (!startingFromRaw) return { error: "Start date is required" };

  const frequency = formData.get("frequency") as string;
  if (!VALID_FREQ.includes(frequency as Freq)) return { error: "Invalid frequency" };

  const durationDays = Math.max(1, parseInt(formData.get("durationDays") as string) || 1);
  const endsAtRaw = formData.get("endsAt") as string;

  await db.recurringTask.create({
    data: {
      title,
      description: (formData.get("description") as string) || null,
      priority: ((formData.get("priority") as string) || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      projectId,
      frequency: frequency as Freq,
      durationDays,
      startingFrom: new Date(startingFromRaw),
      endsAt: endsAtRaw ? new Date(endsAtRaw) : null,
    },
  });

  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath("/astelpo_26/today");
  return null;
}

export async function updateRecurringTask(
  id: string,
  projectId: string,
  _: unknown,
  formData: FormData,
): Promise<{ error?: string } | null> {
  try { await requireAuth(); } catch { return { error: "Unauthorized" }; }

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required" };

  const startingFromRaw = formData.get("startingFrom") as string;
  if (!startingFromRaw) return { error: "Start date is required" };

  const frequency = formData.get("frequency") as string;
  if (!VALID_FREQ.includes(frequency as Freq)) return { error: "Invalid frequency" };

  const durationDays = Math.max(1, parseInt(formData.get("durationDays") as string) || 1);
  const endsAtRaw = formData.get("endsAt") as string;

  await db.recurringTask.update({
    where: { id },
    data: {
      title,
      description: (formData.get("description") as string) || null,
      priority: ((formData.get("priority") as string) || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      frequency: frequency as Freq,
      durationDays,
      startingFrom: new Date(startingFromRaw),
      endsAt: endsAtRaw ? new Date(endsAtRaw) : null,
    },
  });

  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath("/astelpo_26/today");
  return null;
}

export async function deleteRecurringTask(id: string, projectId: string) {
  await db.recurringTask.delete({ where: { id } });
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath("/astelpo_26/today");
}

export async function toggleRecurringTask(id: string, projectId: string, active: boolean) {
  await db.recurringTask.update({ where: { id }, data: { active } });
  revalidatePath(`${base(projectId)}/tasks`);
  revalidatePath("/astelpo_26/today");
}
