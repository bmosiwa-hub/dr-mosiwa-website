import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { InviteClient } from "./InviteClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Invite Collaborator" };

export default async function InvitePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/astelpo_26/login");

  const [projects, members] = await Promise.all([
    db.project.findMany({
      where: { leadId: session.user.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      select: { id: true, name: true, colorLabel: true },
      orderBy: { name: "asc" },
    }),
    db.projectMember.findMany({
      where: { project: { leadId: session.user.id } },
      include: { project: { select: { name: true, colorLabel: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <InviteClient projects={projects} members={members} />;
}
