"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendEditorInvite, sendViewerApprovalRequest, sendViewerAccessGranted } from "@/lib/email";
import { randomBytes } from "crypto";

const BASE = "/astelpo_26";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariah.ca";

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

  const existing = await db.projectMember.findFirst({
    where: { projectId, email, status: { notIn: ["REVOKED"] } },
  });
  if (existing) return { error: "This person already has access to this project." };

  const token = randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.projectMember.create({
    data: { projectId, email, role, status: "PENDING", inviteToken: token, tokenExpiry },
  });

  try {
    if (role === "EDITOR") {
      await sendEditorInvite({
        email,
        projectName: project.name,
        inviterName: session.user.name ?? "The project owner",
        token,
      });
    } else {
      const member = await db.projectMember.findFirst({ where: { projectId, email, role: "VIEWER" } });
      if (member) {
        const viewLink = `${BASE_URL}${BASE}/view/${member.id}`;
        await sendViewerAccessGranted({ email, projectName: project.name, viewLink });
      }
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
    // Link existing user to member
    await db.projectMember.update({
      where: { id: member.id },
      data: { userId: existingUser.id, status: "ACTIVE", inviteToken: null, tokenExpiry: null },
    });
    return {};
  }

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: { name, email: member.email, password: hashed, role: "VIEWER" },
  });

  await db.projectMember.update({
    where: { id: member.id },
    data: { userId: user.id, status: "ACTIVE", inviteToken: null, tokenExpiry: null },
  });

  return {};
}

export async function requestViewerAccess(
  memberId: string,
  requesterEmail: string
): Promise<{ error?: string; success?: string }> {
  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    include: { project: { include: { lead: true } } },
  });

  if (!member || member.role !== "VIEWER") return { error: "Invalid access link." };
  if (member.status === "REVOKED") return { error: "Your access to this project has been revoked." };

  // Check for recent pending session to avoid spam
  const recent = await db.viewerSession.findFirst({
    where: {
      memberId,
      requesterEmail,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // 15 min
    },
  });
  if (recent) return { success: "A request was already sent recently. Please wait for approval." };

  const vsToken = randomBytes(32).toString("hex");
  const viewerSession = await db.viewerSession.create({
    data: { memberId, requesterEmail, token: vsToken },
  });

  const ownerEmail = member.project.lead?.email;
  if (!ownerEmail) return { error: "Could not reach project owner." };

  const approvalLink = `${BASE_URL}${BASE}/api/approve-viewer?token=${vsToken}`;
  await sendViewerApprovalRequest({
    ownerEmail,
    requesterEmail,
    projectName: member.project.name,
    approvalLink,
  });

  return { success: "Access request sent. You'll receive an email when approved." };
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
