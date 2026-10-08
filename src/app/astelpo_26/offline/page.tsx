import Link from "next/link";
import { WifiOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline" };

/**
 * Served by the service worker when a navigation fails. It must stay static and
 * public — it is precached at install time, before anyone has signed in, and is
 * shown with no network at all, so it cannot read the session or the database.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-5">
          <WifiOff className="w-5 h-5 text-slate-500" />
        </div>
        <h1 className="text-white text-lg font-semibold">You are offline</h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          AstelPO needs a connection to load your projects and tasks. Your work is safe on the
          server — reconnect and carry on.
        </p>
        <Link
          href="/astelpo_26/today"
          className="inline-flex items-center justify-center h-9 px-5 mt-6 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
