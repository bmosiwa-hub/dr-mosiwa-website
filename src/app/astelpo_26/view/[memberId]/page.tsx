import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ViewerRequestClient } from "./ViewerRequestClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Request Access — AstelPO" };

export default async function ViewerPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;

  const member = await db.projectMember.findUnique({
    where: { id: memberId },
    include: { project: { select: { name: true } } },
  });

  if (!member || member.role !== "VIEWER") return notFound();

  const revoked = member.status === "REVOKED";

  return (
    <ViewerRequestClient
      memberId={memberId}
      projectName={member.project.name}
      revoked={revoked}
    />
  );
}
