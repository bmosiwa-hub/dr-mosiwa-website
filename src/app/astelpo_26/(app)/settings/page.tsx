import type { Metadata } from "next";
export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
      <p className="text-slate-400 text-sm">Coming in Phase 8 — profile, email preferences, theme, timezone, and backup.</p>
    </div>
  );
}
