import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

/**
 * One place that decides who may touch what.
 *
 * The rule is strict isolation: a project belongs to the person who leads it.
 * Nobody — including ADMIN — reads anyone else's work. ADMIN is a role for
 * managing accounts, not for seeing their contents.
 *
 * The single exception is explicit sharing: an ACTIVE ProjectMember can read
 * the project they were added to, and only an EDITOR member can change it.
 *
 * Pages call notFound() rather than reporting "forbidden", because telling a
 * stranger that an id exists is itself a leak. Actions throw, which surfaces
 * as an error rather than silently doing nothing.
 */

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/astelpo_26/login");
  return userId;
}

/** Prisma filter: projects this user may read. */
export function readableProjectWhere(userId: string) {
  return {
    OR: [
      { leadId: userId },
      { members: { some: { userId, status: "ACTIVE" as const } } },
    ],
  };
}

/** Prisma filter: projects this user may change. Read-only members excluded. */
export function writableProjectWhere(userId: string) {
  return {
    OR: [
      { leadId: userId },
      { members: { some: { userId, status: "ACTIVE" as const, role: "EDITOR" as const } } },
    ],
  };
}

async function canAccessProject(projectId: string, userId: string, mode: "read" | "write") {
  const where = mode === "read" ? readableProjectWhere(userId) : writableProjectWhere(userId);
  const hit = await db.project.findFirst({
    where: { id: projectId, ...where },
    select: { id: true },
  });
  return !!hit;
}

// ─── Page guards (404 on denial) ──────────────────────────────────────────────

/** Use at the top of any page that renders a project by id. */
export async function requireProjectPage(projectId: string): Promise<string> {
  const userId = await requireUserId();
  if (!(await canAccessProject(projectId, userId, "read"))) notFound();
  return userId;
}

/** Use on a page that renders a single task. Confirms the task's project too. */
export async function requireTaskPage(taskId: string, projectId: string): Promise<string> {
  const userId = await requireUserId();
  const task = await db.task.findFirst({
    where: { id: taskId, projectId },
    select: { projectId: true },
  });
  if (!task) notFound();
  if (!(await canAccessProject(task.projectId, userId, "read"))) notFound();
  return userId;
}

// ─── Action guards (throw on denial) ──────────────────────────────────────────

export class NotAuthorizedError extends Error {
  constructor() {
    super("Not authorized");
    this.name = "NotAuthorizedError";
  }
}

/** Use in any server action that writes to a project the caller named by id. */
export async function requireProjectWrite(projectId: string): Promise<string> {
  const userId = await requireUserId();
  if (!(await canAccessProject(projectId, userId, "write"))) throw new NotAuthorizedError();
  return userId;
}

export async function requireProjectRead(projectId: string): Promise<string> {
  const userId = await requireUserId();
  if (!(await canAccessProject(projectId, userId, "read"))) throw new NotAuthorizedError();
  return userId;
}

/** Resolves a task to its project, then authorises the write. */
export async function requireTaskWrite(taskId: string): Promise<{ userId: string; projectId: string }> {
  const userId = await requireUserId();
  const task = await db.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
  if (!task) throw new NotAuthorizedError();
  if (!(await canAccessProject(task.projectId, userId, "write"))) throw new NotAuthorizedError();
  return { userId, projectId: task.projectId };
}

/** Same, for records that hang off a project by a projectId column. */
export async function requireMilestoneWrite(milestoneId: string) {
  const userId = await requireUserId();
  const row = await db.milestone.findUnique({ where: { id: milestoneId }, select: { projectId: true } });
  if (!row) throw new NotAuthorizedError();
  if (!(await canAccessProject(row.projectId, userId, "write"))) throw new NotAuthorizedError();
  return { userId, projectId: row.projectId };
}

export async function requireNoteWrite(noteId: string) {
  const userId = await requireUserId();
  const row = await db.projectNote.findUnique({ where: { id: noteId }, select: { projectId: true } });
  if (!row) throw new NotAuthorizedError();
  if (!(await canAccessProject(row.projectId, userId, "write"))) throw new NotAuthorizedError();
  return { userId, projectId: row.projectId };
}

export async function requireResourceWrite(resourceId: string) {
  const userId = await requireUserId();
  const row = await db.resource.findUnique({ where: { id: resourceId }, select: { projectId: true } });
  if (!row) throw new NotAuthorizedError();
  if (!(await canAccessProject(row.projectId, userId, "write"))) throw new NotAuthorizedError();
  return { userId, projectId: row.projectId };
}

export async function requireRecurringWrite(recurringId: string) {
  const userId = await requireUserId();
  const row = await db.recurringTask.findUnique({
    where: { id: recurringId },
    select: { projectId: true },
  });
  if (!row) throw new NotAuthorizedError();
  if (!(await canAccessProject(row.projectId, userId, "write"))) throw new NotAuthorizedError();
  return { userId, projectId: row.projectId };
}
