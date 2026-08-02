import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { RegisterClient } from "./RegisterClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account — AstelPO" };

export default async function RegisterPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await db.platformInvite.findUnique({ where: { token } });

  if (!invite) return notFound();

  const expired = invite.tokenExpiry < new Date();
  const used = !!invite.usedAt;

  return <RegisterClient token={token} email={invite.email} expired={expired} used={used} />;
}
