import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { TimezoneSync } from "@/components/layout/TimezoneSync";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { TIMEZONE_COOKIE } from "@/lib/dates";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/astelpo_26/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  if (!user) redirect("/astelpo_26/login");

  const isAdmin = user.role === "ADMIN";
  const knownTimezone = (await cookies()).get(TIMEZONE_COOKIE)?.value ?? null;

  return (
    <div className="h-screen flex overflow-hidden bg-slate-950">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header currentUser={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <MobileNav isAdmin={isAdmin} />

      {/* Keeps "today" anchored to the viewer's clock, not the server's */}
      <TimezoneSync current={knownTimezone} />
    </div>
  );
}
