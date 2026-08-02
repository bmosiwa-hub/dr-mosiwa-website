"use client";

import { useState, useTransition } from "react";
import { createAccountFromPlatformInvite } from "@/lib/actions/accounts";
import { Briefcase, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export function RegisterClient({
  token,
  email,
  expired,
  used,
}: {
  token: string;
  email: string;
  expired: boolean;
  used: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAccountFromPlatformInvite(token, fd);
      if (res?.error) setError(res.error);
      else setDone(true);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
        </div>

        {(expired || used) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h1 className="text-white text-xl font-bold mb-2">{used ? "Link Already Used" : "Link Expired"}</h1>
            <p className="text-slate-400 text-sm">
              {used
                ? "This invite link has already been used. Try logging in instead."
                : "This invite link has expired. Ask the project owner to send a new one."}
            </p>
            {used && (
              <Link href="/astelpo_26/login" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
                Go to login →
              </Link>
            )}
          </div>
        )}

        {!expired && !used && !done && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <h1 className="text-white text-xl font-bold mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm mb-6">
              You've been invited to join <strong className="text-white">AstelPO</strong>. Your account will need to be approved before you can access projects.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
                <input
                  name="name"
                  type="text"
                  required
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
              >
                {pending ? "Creating account…" : "Create Account"}
              </button>
            </form>
            <p className="text-center text-xs text-slate-500 mt-4">
              Already have an account?{" "}
              <Link href="/astelpo_26/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link>
            </p>
          </div>
        )}

        {done && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <h1 className="text-white text-xl font-bold mb-2">Account created!</h1>
            <p className="text-slate-400 text-sm mb-5">
              Your account is pending approval. You'll receive an email once the project owner approves your access.
            </p>
            <Link
              href="/astelpo_26/login"
              className="inline-block h-10 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium leading-10 transition-colors"
            >
              Go to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
