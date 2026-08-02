"use client";

import { useActionState, useTransition } from "react";
import { approveAccount, suspendAccount, reactivateAccount, sendPlatformInvite } from "@/lib/actions/accounts";
import { UserPlus, CheckCircle, Clock, XCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type User = {
  id: string;
  name: string;
  email: string;
  accountStatus: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: Date;
};

const STATUS_BADGE: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Pending",
    class: "bg-amber-900/30 text-amber-400 border-amber-700/30",
    icon: <Clock className="w-3 h-3" />,
  },
  ACTIVE: {
    label: "Active",
    class: "bg-green-900/30 text-green-400 border-green-700/30",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  SUSPENDED: {
    label: "Suspended",
    class: "bg-slate-800 text-slate-500 border-slate-700",
    icon: <XCircle className="w-3 h-3" />,
  },
};

export function SettingsClient({ users }: { users: User[] }) {
  const [inviteState, inviteAction, invitePending] = useActionState(sendPlatformInvite, {});
  const [, startTransition] = useTransition();

  const pending = users.filter((u) => u.accountStatus === "PENDING");
  const active = users.filter((u) => u.accountStatus === "ACTIVE");
  const suspended = users.filter((u) => u.accountStatus === "SUSPENDED");

  const handleApprove = (id: string) => startTransition(async () => { await approveAccount(id); });
  const handleSuspend = (id: string) => startTransition(async () => { await suspendAccount(id); });
  const handleReactivate = (id: string) => startTransition(async () => { await reactivateAccount(id); });

  return (
    <div className="space-y-8">

      {/* Pending approvals — shown prominently at top */}
      {pending.length > 0 && (
        <div className="bg-amber-900/10 border border-amber-700/30 rounded-xl p-5 space-y-3">
          <h3 className="text-amber-400 font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Approval ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.name}</p>
                  <p className="text-slate-400 text-xs truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(u.id)}
                    className="h-7 px-3 bg-green-700 hover:bg-green-600 rounded-lg text-white text-xs font-medium transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleSuspend(u.id)}
                    className="h-7 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs font-medium transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite new user */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-400" />
          Invite Someone to Join AstelPO
        </h3>
        <form action={inviteAction} className="flex gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="colleague@example.com"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={invitePending}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors flex-shrink-0"
          >
            {invitePending ? "Sending…" : "Send Invite"}
          </button>
        </form>
        {inviteState.error && <p className="text-red-400 text-xs">{inviteState.error}</p>}
        {inviteState.success && <p className="text-green-400 text-xs">{inviteState.success}</p>}
      </div>

      {/* All accounts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          All Accounts ({users.length})
        </h3>

        {users.length === 0 ? (
          <p className="text-slate-500 text-sm">No accounts yet. Invite someone above to get started.</p>
        ) : (
          <div className="space-y-2">
            {[...pending, ...active, ...suspended].map((u) => {
              const badge = STATUS_BADGE[u.accountStatus];
              return (
                <div key={u.id} className="flex items-center justify-between gap-3 border border-slate-800 rounded-lg px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{u.name}</p>
                      <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", badge.class)}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{u.email} · Joined {format(new Date(u.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {u.accountStatus === "PENDING" && (
                      <button onClick={() => handleApprove(u.id)} className="h-7 px-3 bg-green-700 hover:bg-green-600 rounded-lg text-white text-xs font-medium transition-colors">Approve</button>
                    )}
                    {u.accountStatus === "ACTIVE" && (
                      <button onClick={() => handleSuspend(u.id)} className="h-7 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs font-medium transition-colors">Suspend</button>
                    )}
                    {u.accountStatus === "SUSPENDED" && (
                      <button onClick={() => handleReactivate(u.id)} className="h-7 px-3 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-white text-xs font-medium transition-colors">Reactivate</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
