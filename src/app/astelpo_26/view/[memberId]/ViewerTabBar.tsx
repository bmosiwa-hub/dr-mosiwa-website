"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function ViewerTabBar({ memberId }: { memberId: string }) {
  const pathname = usePathname();
  const base = `/astelpo_26/view/${memberId}`;

  return (
    <div className="border-b border-slate-800 overflow-x-auto">
      <div className="flex min-w-max">
        {TABS.map((tab) => {
          const href = tab.segment ? `${base}/${tab.segment}` : base;
          const active = tab.segment ? pathname.startsWith(href) : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                active
                  ? "text-white border-indigo-500"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-500"
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
