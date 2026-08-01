"use client";

import { Bell, Search, Plus } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  today: "Today",
  dashboard: "Dashboard",
  projects: "Projects",
  calendar: "Calendar",
  files: "Files",
  settings: "Settings",
};

export function Header() {
  const pathname = usePathname();
  const segment = pathname.split("/")[2] ?? "";
  const title = PAGE_TITLES[segment] ?? "AstelPO";

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900 flex-shrink-0">
      <h1 className="text-white font-semibold text-base">{title}</h1>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 h-8 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 text-sm transition-colors">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="hidden sm:inline text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">
            ⌘K
          </kbd>
        </button>

        <button className="flex items-center gap-1.5 h-8 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
