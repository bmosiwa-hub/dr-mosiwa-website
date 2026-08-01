"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validations/project";

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session as typeof session & { user: { id: string } };
}

type FormState = { error?: string; success?: boolean } | null;

export async function createProject(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();

  const raw = {
    name: formData.get("name"),
    shortName: formData.get("shortName"),
    description: formData.get("description"),
    category: formData.get("category"),
    clientName: formData.get("clientName"),
    organization: formData.get("organization"),
    fundingAgency: formData.get("fundingAgency"),
    country: formData.get("country"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    colorLabel: formData.get("colorLabel"),
    budget: formData.get("budget"),
    notes: formData.get("notes"),
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { startDate, endDate, ...rest } = parsed.data;

  const project = await db.project.create({
    data: {
      ...rest,
      leadId: session.user.id,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: rest.budget ?? null,
    },
  });

  await db.activity.create({
    data: {
      action: "created project",
      entityType: "project",
      entityId: project.id,
      entityName: project.name,
      projectId: project.id,
      userId: session.user.id!,
    },
  });

  revalidatePath("/astelpo_26/projects");
  redirect(`/astelpo_26/projects/${project.id}`);
}

export async function updateProject(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();

  const raw = {
    name: formData.get("name"),
    shortName: formData.get("shortName"),
    description: formData.get("description"),
    category: formData.get("category"),
    clientName: formData.get("clientName"),
    organization: formData.get("organization"),
    fundingAgency: formData.get("fundingAgency"),
    country: formData.get("country"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    colorLabel: formData.get("colorLabel"),
    budget: formData.get("budget"),
    notes: formData.get("notes"),
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { startDate, endDate, ...rest } = parsed.data;

  await db.project.update({
    where: { id },
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: rest.budget ?? null,
    },
  });

  await db.activity.create({
    data: {
      action: "updated project",
      entityType: "project",
      entityId: id,
      entityName: rest.name,
      projectId: id,
      userId: session.user.id!,
    },
  });

  revalidatePath(`/astelpo_26/projects/${id}`);
  revalidatePath("/astelpo_26/projects");
  return { success: true };
}

export async function deleteProject(id: string) {
  await getSession();
  await db.project.delete({ where: { id } });
  revalidatePath("/astelpo_26/projects");
  redirect("/astelpo_26/projects");
}

export async function updateProjectProgress(id: string, progress: number) {
  await getSession();
  await db.project.update({ where: { id }, data: { progress } });
  revalidatePath(`/astelpo_26/projects/${id}`);
}
