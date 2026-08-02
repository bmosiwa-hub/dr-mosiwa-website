import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Briefcase, Clock } from "lucide-react";

export default async function PendingApprovalPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelpo_26/login");

  const accountStatus = (session.user as { accountStatus?: string }).accountStatus;
  if (accountStatus === "ACTIVE") redirect("/astelpo_26/today");

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-6 h-6 text-white" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-4">
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <Clock className="w-5 h-5" />
            <h1 className="text-lg font-bold">Awaiting Approval</h1>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Your account has been created successfully. The project owner needs to approve your access before you can proceed.
            You'll receive an email once your account is approved.
          </p>

          <p className="text-slate-500 text-xs">
            Signed in as <span className="text-slate-300">{session.user.email}</span>
          </p>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/astelpo_26/login" });
            }}
          >
            <button
              type="submit"
              className="w-full h-9 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
