import type { Metadata } from "next";
export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Calendar</h2>
      <p className="text-slate-400 text-sm">Coming in Phase 4 — FullCalendar integration with project deadlines, tasks, and milestones.</p>
    </div>
  );
}
