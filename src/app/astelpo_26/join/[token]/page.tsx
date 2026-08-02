import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { JoinClient } from "./JoinClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Accept Invitation — AstelPO" };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const member = await db.projectMember.findUnique({
    where: { inviteToken: token },
    include: { project: { select: { name: true } } },
  });

  if (!member || member.role !== "EDITOR") return notFound();

  const expired = member.tokenExpiry ? member.tokenExpiry < new Date() : false;
  const alreadyUsed = member.status === "ACTIVE";

  return (
    <JoinClient
      token={token}
      projectName={member.project.name}
      email={member.email}
      expired={expired}
      alreadyUsed={alreadyUsed}
    />
  );
}
