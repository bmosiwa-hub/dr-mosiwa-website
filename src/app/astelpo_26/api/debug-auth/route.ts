import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") ?? "azmosiwa@gmail.com";
  const password = searchParams.get("password") ?? "";

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "user_not_found", email });
    if (!user.password) return NextResponse.json({ error: "no_password_set", id: user.id });

    const valid = password ? await bcrypt.compare(password, user.password) : null;

    return NextResponse.json({
      found: true,
      id: user.id,
      name: user.name,
      email: user.email,
      hasPassword: !!user.password,
      passwordValid: valid,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "db_error", message: e?.message ?? String(e) }, { status: 500 });
  }
}
