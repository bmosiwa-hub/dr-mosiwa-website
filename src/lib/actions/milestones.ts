"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const base = (projectId: string) => `/astelpo_26/projects/${projectId}`;

export async function createMilestone(projectId: string, _: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Name is required" };

  const targetDateRaw = formData.get("targetDate") as string;

  await db.milestone.create({
    data: {
      name: name.trim(),
      description: (formData.get("description") as string) || null,
      targetDate: targetDateRaw ? new Date(targetDateRaw) : null,
      status: "NOT_STARTED",
      projectId,
    },
  });

  revalidatePath(`${base(projectId)}/milestones`);
  return null;
}

export async function updateMilestoneStatus(milestoneId: string, status: string, projectId: string) {
  const completionPct = status === "COMPLETED" ? 100 : status === "IN_PROGRESS" ? 50 : 0;
  await db.milestone.update({
    where: { id: milestoneId },
    data: { status: status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MISSED", completionPct },
  });
  revalidatePath(`${base(projectId)}/milestones`);
}

export async function deleteMilestone(milestoneId: string, projectId: string) {
  await db.milestone.delete({ where: { id: milestoneId } });
  revalidatePath(`${base(projectId)}/milestones`);
}
