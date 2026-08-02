"use client";

import { useState, useTransition } from "react";
import { requestViewerAccess } from "@/lib/actions/collaborators";
import { Briefcase, Eye, AlertCircle, CheckCircle } from "lucide-react";

export function ViewerRequestClient({
  memberId,
  projectName,
  revoked,
}: {
  memberId: string;
  projectName: string;
  revoked: boolean;
}) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await requestViewerAccess(memberId, email.trim().toLowerCase());
      setResult(res);
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

        {revoked ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h1 className="text-white text-xl font-bold mb-2">Access Revoked</h1>
            <p className="text-slate-400 text-sm">Your access to this project has been revoked by the owner.</p>
          </div>
        ) : result?.success ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <h1 className="text-white text-xl font-bold mb-2">Request Sent</h1>
            <p className="text-slate-400 text-sm">{result.success}</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-indigo-400" />
              <h1 className="text-white text-xl font-bold">Request Access</h1>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Enter your email to request viewer access to <strong className="text-white">{projectName}</strong>. The project owner will receive an email and approve your request.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Your email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {result?.error && <p className="text-red-400 text-sm">{result.error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
              >
                {pending ? "Sending request…" : "Request Access"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
