import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const accountStatus = (session?.user as { accountStatus?: string } | undefined)?.accountStatus;
  if (!session?.user || accountStatus !== "ACTIVE") return NextResponse.json([], { status: 401 });

  const projects = await db.project.findMany({
    where: { leadId: session.user.id!, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(projects);
}
