"use server";

import { signIn, signOut, auth } from "@/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/astelpo_26/today",
    });
  } catch (error) {
    if (
      error !== null &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
    ) throw error;
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/astelpo_26/login" });
}

export async function createUser(data: FormData) {
  const parsed = registerSchema.safeParse({
    name: data.get("name"),
    email: data.get("email"),
    password: data.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: "VIEWER",
      accountStatus: "PENDING",
    },
  });

  return { success: true };
}

export async function updateProfile(
  _: unknown,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const name = (formData.get("name") as string)?.trim();
  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." };

  await db.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/astelpo_26/settings/profile");
  revalidatePath("/astelpo_26");
  return { success: "Profile updated." };
}

export async function changePassword(
  _: unknown,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const current = formData.get("currentPassword") as string;
  const next = formData.get("newPassword") as string;
  const confirm = formData.get("confirmPassword") as string;

  if (!current || !next || !confirm) return { error: "All fields are required." };
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "Passwords do not match." };

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
  if (!user?.password) return { error: "No password set on this account." };

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return { error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(next, 12);
  await db.user.update({ where: { id: session.user.id }, data: { password: hashed } });

  return { success: "Password changed." };
}
