"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/astelpo_26/today",
    });
  } catch (error) {
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
      accountStatus: "PENDING",
    },
  });

  return { success: true };
}
