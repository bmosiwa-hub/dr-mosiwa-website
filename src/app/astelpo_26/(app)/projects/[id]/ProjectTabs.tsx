"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", segment: null },
  { label: "Tasks", segment: "tasks" },
  { label: "Milestones", segment: "milestones" },
  { label: "Notes", segment: "notes" },
  { label: "Resources", segment: "resources" },
  { label: "Files", segment: "files" },
  { label: "Activity", segment: "activity" },
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const segment = useSelectedLayoutSegment();

  return (
    <div className="border-b border-slate-800 overflow-x-auto scrollbar-none">
      <div className="flex min-w-max">
        {TABS.map((tab) => {
          const href = tab.segment
            ? `/astelpo_26/projects/${projectId}/${tab.segment}`
            : `/astelpo_26/projects/${projectId}`;
          const active = tab.segment === null
            ? segment === null
            : segment === tab.segment;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                active
                  ? "text-indigo-400 border-indigo-500"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-600"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
