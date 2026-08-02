"use client";

import { useActionState } from "react";
import { updateProfile, changePassword } from "@/lib/actions/auth";
import { User, Lock, Shield } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfileClient({ user }: { user: ProfileUser }) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, {});
  const [passwordState, passwordAction, passwordPending] = useActionState(changePassword, {});

  return (
    <div className="space-y-6">

      {/* Avatar + info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {initials(user.name)}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-lg truncate">{user.name}</p>
          <p className="text-slate-400 text-sm truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn(
              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium",
              user.role === "ADMIN"
                ? "bg-indigo-900/30 text-indigo-400 border-indigo-700/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            )}>
              <Shield className="w-3 h-3" />
              {user.role === "ADMIN" ? "Admin" : "Viewer"}
            </span>
            <span className="text-slate-600 text-xs">
              Member since {format(new Date(user.createdAt), "MMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          Personal Information
        </h3>

        <form action={profileAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Display Name</label>
            <input
              name="name"
              defaultValue={user.name}
              required
              minLength={2}
              className="w-full h-9 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full h-9 px-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-500 text-sm cursor-not-allowed"
            />
            <p className="text-slate-600 text-xs">Email cannot be changed.</p>
          </div>

          {profileState.error && (
            <p className="text-red-400 text-xs">{profileState.error}</p>
          )}
          {profileState.success && (
            <p className="text-green-400 text-xs">{profileState.success}</p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {profilePending ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" />
          Change Password
        </h3>

        <form action={passwordAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="w-full h-9 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">New Password</label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full h-9 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              className="w-full h-9 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {passwordState.error && (
            <p className="text-red-400 text-xs">{passwordState.error}</p>
          )}
          {passwordState.success && (
            <p className="text-green-400 text-xs">{passwordState.success}</p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="h-9 px-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {passwordPending ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
