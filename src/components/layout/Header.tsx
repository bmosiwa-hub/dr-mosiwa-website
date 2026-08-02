"use client";

import { Search } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { SearchModal } from "./SearchModal";
import { NewDropdown } from "./NewDropdown";
import { NotificationsPanel } from "./NotificationsPanel";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  today: "Home",
  projects: "Projects",
  calendar: "Calendar",
  files: "Files",
  settings: "Settings",
};

type CurrentUser = { id: string; name: string; email: string; image: string | null; role: string };

export function Header({ currentUser }: { currentUser: CurrentUser }) {
  const pathname = usePathname();
  const segment = pathname.split("/")[2] ?? "";
  const title = PAGE_TITLES[segment] ?? "AstelPO";
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900 flex-shrink-0">
        <h1 className="text-white font-semibold text-base">{title}</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-8 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search…</span>
            <kbd className="hidden sm:inline text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">
              ⌘K
            </kbd>
          </button>

          <NewDropdown />
          <NotificationsPanel />
          <UserMenu currentUser={currentUser} />
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
