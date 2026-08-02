"use client";

import { useActionState, useTransition } from "react";
import { inviteCollaborator, revokeAccess } from "@/lib/actions/collaborators";
import { UserPlus, Users, X, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Project = { id: string; name: string; colorLabel: string | null };
type Member = {
  id: string;
  email: string;
  role: "VIEWER" | "EDITOR";
  status: "PENDING" | "ACTIVE" | "REVOKED";
  project: { name: string; colorLabel: string | null };
  createdAt: Date;
};

const STATUS_ICON = {
  PENDING: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  ACTIVE: <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
  REVOKED: <XCircle className="w-3.5 h-3.5 text-slate-500" />,
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  REVOKED: "Revoked",
};

export function InviteClient({ projects, members }: { projects: Project[]; members: Member[] }) {
  const [state, action, pending] = useActionState(inviteCollaborator, {});
  const [revoking, startRevoke] = useTransition();

  const handleRevoke = (memberId: string) => {
    startRevoke(async () => {
      await revokeAccess(memberId);
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Invite Collaborator</h2>
        <p className="text-slate-400 text-sm mt-1">
          Give others access to specific projects — as an editor (with an account) or a viewer (link-based, requires your approval each time).
        </p>
      </div>

      {/* Invite form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-400" />
          Send Invitation
        </h3>

        <form action={action} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="colleague@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Project</label>
              <select
                name="projectId"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select a project…</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Access type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: "EDITOR",
                  label: "Editor",
                  desc: "Can view and edit tasks, notes, and project details. Requires creating an account.",
                },
                {
                  value: "VIEWER",
                  label: "Viewer",
                  desc: "View-only access via a link. Requires your approval each time they request access.",
                },
              ].map(opt => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 hover:border-indigo-500/50 cursor-pointer has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-900/20 transition-colors"
                >
                  <input type="radio" name="role" value={opt.value} className="mt-0.5 accent-indigo-500" required />
                  <div>
                    <p className="text-sm font-medium text-white">{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {state.error && (
            <p className="text-red-400 text-sm">{state.error}</p>
          )}
          {state.success && (
            <p className="text-green-400 text-sm">{state.success}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
          >
            {pending ? "Sending…" : "Send Invitation"}
          </button>
        </form>
      </div>

      {/* Existing members */}
      {members.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Current Collaborators
          </h3>
          <div className="space-y-2">
            {members.map(m => (
              <div
                key={m.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-3 rounded-lg border",
                  m.status === "REVOKED" ? "border-slate-800 opacity-50" : "border-slate-700"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: m.project.colorLabel ?? "#6366f1" }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{m.email}</p>
                    <p className="text-xs text-slate-500 truncate">{m.project.name} · {m.role === "EDITOR" ? "Editor" : "Viewer"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    {STATUS_ICON[m.status]}
                    {STATUS_LABEL[m.status]}
                  </span>
                  {m.status !== "REVOKED" && (
                    <button
                      onClick={() => handleRevoke(m.id)}
                      disabled={revoking}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Revoke access"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
