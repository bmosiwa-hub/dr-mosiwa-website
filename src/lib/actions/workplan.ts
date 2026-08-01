"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type ExtractedTask = {
  title: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
};

type ExtractedMilestone = {
  name: string;
  description: string | null;
  targetDate: string | null;
};

export async function bulkCreateFromWorkplan(
  projectId: string,
  tasks: ExtractedTask[],
  milestones: ExtractedMilestone[]
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id!;

  await db.$transaction([
    ...tasks.map((t) =>
      db.task.create({
        data: {
          title: t.title,
          description: t.description || null,
          status: "TODO",
          priority: (t.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") || "MEDIUM",
          dueDate: t.dueDate ? new Date(t.dueDate) : null,
          projectId,
          assigneeId: userId,
        },
      })
    ),
    ...milestones.map((m) =>
      db.milestone.create({
        data: {
          name: m.name,
          description: m.description || null,
          targetDate: m.targetDate ? new Date(m.targetDate) : null,
          status: "NOT_STARTED",
          projectId,
        },
      })
    ),
  ]);

  revalidatePath(`/astelpo_26/projects/${projectId}`);
  revalidatePath(`/astelpo_26/projects/${projectId}/tasks`);
  revalidatePath(`/astelpo_26/projects/${projectId}/milestones`);
}
