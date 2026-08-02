"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendEditorInvite, sendViewerInvite, sendNewAccountNotification } from "@/lib/email";
import { randomBytes } from "crypto";

const BASE = "/astelpo_26";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariahmosiwa.com";

export async function inviteCollaborator(
  _: unknown,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = formData.get("role") as "EDITOR" | "VIEWER";
  const projectId = formData.get("projectId") as string;

  if (!email || !role || !projectId) return { error: "All fields are required." };
  if (!["EDITOR", "VIEWER"].includes(role)) return { error: "Invalid role." };

  const project = await db.project.findFirst({
    where: { id: projectId, leadId: session.user.id },
  });
  if (!project) return { error: "Project not found." };

  const token = randomBytes(32).toString("hex");
  const editorExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for editors
  const viewerExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour for viewers
  const tokenExpiry = role === "VIEWER" ? viewerExpiry : editorExpiry;

  const existing = await db.projectMember.findFirst({
    where: { projectId, email, status: { notIn: ["REVOKED"] } },
  });

  let memberId: string;
  if (existing) {
    const newStatus = role === "VIEWER" ? "ACTIVE" : "PENDING";
    await db.projectMember.update({
      where: { id: existing.id },
      data: { role, status: newStatus, inviteToken: token, tokenExpiry },
    });
    memberId = existing.id;
  } else {
    const newStatus = role === "VIEWER" ? "ACTIVE" : "PENDING";
    const created = await db.projectMember.create({
      data: { projectId, email, role, status: newStatus, inviteToken: token, tokenExpiry },
    });
    memberId = created.id;
  }

  try {
    if (role === "EDITOR") {
      await sendEditorInvite({
        email,
        projectName: project.name,
        inviterName: session.user.name ?? "The project owner",
        token,
      });
    } else {
      const viewLink = `${BASE_URL}${BASE}/view/${memberId}`;
      await sendViewerInvite({ email, projectName: project.name, viewLink });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[inviteCollaborator] email failed:", msg);
    return { error: `Collaborator saved, but email failed to send: ${msg}` };
  }

  revalidatePath(`${BASE}/invite`);
  return { success: `Invitation sent to ${email}.` };
}

export async function acceptEditorInvite(token: string, formData: FormData): Promise<{ error?: string }> {
  const name = (formData.get("name") as string)?.trim();
  const password = (formData.get("password") as string);

  if (!name || !password) return { error: "Name and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const member = await db.projectMember.findUnique({ where: { inviteToken: token } });
  if (!member) return { error: "Invalid or expired invitation link." };
  if (member.tokenExpiry && member.tokenExpiry < new Date()) return { error: "This invitation has expired." };
  if (member.role !== "EDITOR") return { error: "This link is not for editor access." };

  const existingUser = await db.user.findUnique({ where: { email: member.email } });
  if (existingUser) {
    if (existingUser.accountStatus === "SUSPENDED") {
      return { error: "This account has been suspended. Contact the platform administrator." };
    }
    // Grant ACTIVE membership only if the user's account is already approved.
    // If they're still PENDING, their membership stays PENDING until admin approves.
    const memberStatus = existingUser.accountStatus === "ACTIVE" ? "ACTIVE" : "PENDING";
    await db.projectMember.update({
      where: { id: member.id },
      data: { userId: existingUser.id, status: memberStatus, inviteToken: null, tokenExpiry: null },
    });
    return {};
  }

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: { name, email: member.email, password: hashed, role: "VIEWER", accountStatus: "PENDING" },
  });

  // Link user to membership — status stays PENDING until admin approves the account.
  await db.projectMember.update({
    where: { id: member.id },
    data: { userId: user.id, status: "PENDING", inviteToken: null, tokenExpiry: null },
  });

  // Notify admin of new account
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (admin?.email) {
    sendNewAccountNotification({
      adminEmail: admin.email,
      newUserName: name,
      newUserEmail: member.email,
      settingsLink: `${BASE_URL}/astelpo_26/settings`,
    }).catch(() => {});
  }

  return {};
}


export async function revokeAccess(memberId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    include: { project: true },
  });
  if (!member || member.project.leadId !== session.user.id) return { error: "Unauthorized" };

  await db.projectMember.update({ where: { id: memberId }, data: { status: "REVOKED" } });
  revalidatePath(`${BASE}/invite`);
  return {};
}
