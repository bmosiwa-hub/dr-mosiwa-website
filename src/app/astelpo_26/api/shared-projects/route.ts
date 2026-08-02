import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const accountStatus = (session?.user as { accountStatus?: string } | undefined)?.accountStatus;
  if (!session?.user?.email || accountStatus !== "ACTIVE") return NextResponse.json([], { status: 401 });

  const members = await db.projectMember.findMany({
    where: {
      email: session.user.email,
      status: "ACTIVE",
    },
    include: {
      project: { select: { id: true, name: true, colorLabel: true } },
    },
    orderBy: { project: { name: "asc" } },
  });

  const projects = members.map(m => ({
    id: m.project.id,
    name: m.project.name,
    colorLabel: m.project.colorLabel,
    role: m.role,
  }));

  return NextResponse.json(projects);
}
