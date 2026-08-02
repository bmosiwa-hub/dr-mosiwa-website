import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { FilesClient } from "./FilesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Files" };

export default async function FilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/astelpo_26/login");
  const userId = session.user.id;

  const files = await db.projectFile.findMany({
    where: { project: { leadId: userId } },
    select: {
      id: true, name: true, originalName: true, url: true,
      size: true, mimeType: true, category: true, description: true,
      createdAt: true,
      project: { select: { id: true, name: true, colorLabel: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <FilesClient
      files={files.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() }))}
    />
  );
}
