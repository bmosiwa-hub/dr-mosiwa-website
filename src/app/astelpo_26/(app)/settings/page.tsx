import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/astelpo_26/today");

  const users = await db.user.findMany({
    where: { role: "VIEWER" },
    orderBy: [{ accountStatus: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, accountStatus: true, createdAt: true },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage accounts and access to AstelPO.</p>
      </div>
      <SettingsClient users={users} />
    </div>
  );
}
