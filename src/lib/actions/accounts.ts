"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { sendPlatformInviteEmail, sendNewAccountNotification, sendAccountApprovedEmail } from "@/lib/email";

const BASE = "/astelpo_26";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariahmosiwa.com";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "ADMIN") throw new Error("Unauthorized");
  return session.user as { id: string; email?: string | null; name?: string | null };
}

export async function approveAccount(userId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { accountStatus: "ACTIVE" },
    select: { email: true, name: true },
  });

  await db.projectMember.updateMany({
    where: { userId, status: "PENDING" },
    data: { status: "ACTIVE" },
  });

  if (user.email) {
    sendAccountApprovedEmail({
      email: user.email,
      name: user.name ?? "there",
      loginLink: `${BASE_URL}${BASE}/login`,
    }).catch(() => {});
  }

  revalidatePath(`${BASE}/settings`);
  return {};
}

export async function suspendAccount(userId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }
  await db.user.update({ where: { id: userId }, data: { accountStatus: "SUSPENDED" } });
  revalidatePath(`${BASE}/settings`);
  return {};
}

export async function reactivateAccount(userId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }
  await db.user.update({ where: { id: userId }, data: { accountStatus: "ACTIVE" } });
  revalidatePath(`${BASE}/settings`);
  return {};
}

export async function sendPlatformInvite(
  _: unknown,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  let admin: { id: string; email?: string | null; name?: string | null };
  try {
    admin = await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const existingInvite = await db.platformInvite.findFirst({
    where: { email, usedAt: null, tokenExpiry: { gt: new Date() } },
  });
  if (existingInvite) return { error: "A valid invite has already been sent to this email." };

  const token = randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.platformInvite.create({ data: { email, token, tokenExpiry } });

  try {
    await sendPlatformInviteEmail({
      email,
      registerLink: `${BASE_URL}${BASE}/register/${token}`,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Invite saved but email failed: ${msg}` };
  }

  revalidatePath(`${BASE}/settings`);
  return { success: `Invitation sent to ${email}.` };
}

export async function createAccountFromPlatformInvite(
  token: string,
  formData: FormData
): Promise<{ error?: string }> {
  const name = (formData.get("name") as string)?.trim();
  const password = formData.get("password") as string;

  if (!name || !password) return { error: "Name and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const invite = await db.platformInvite.findUnique({ where: { token } });
  if (!invite || invite.usedAt) return { error: "Invalid or already used invite link." };
  if (invite.tokenExpiry < new Date()) return { error: "This invite link has expired." };

  const existing = await db.user.findUnique({ where: { email: invite.email } });
  if (existing) return { error: "An account with this email already exists. Please log in." };

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: { name, email: invite.email, password: hashed, role: "VIEWER", accountStatus: "PENDING" },
  });

  await db.platformInvite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });

  // Auto-link any pending editor memberships
  await db.projectMember.updateMany({
    where: { email: user.email, status: "PENDING", role: "EDITOR" },
    data: { userId: user.id, status: "ACTIVE" },
  });

  // Notify admin
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (admin?.email) {
    sendNewAccountNotification({
      adminEmail: admin.email,
      newUserName: name,
      newUserEmail: invite.email,
      settingsLink: `${BASE_URL}${BASE}/settings`,
    }).catch(() => {});
  }

  return {};
}
