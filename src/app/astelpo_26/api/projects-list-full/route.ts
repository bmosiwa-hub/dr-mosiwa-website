import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const projects = await db.project.findMany({
    where: { leadId: session.user.id!, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    select: { id: true, name: true, colorLabel: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(projects);
}
