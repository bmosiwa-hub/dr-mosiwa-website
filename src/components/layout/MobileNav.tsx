"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, FolderKanban, CalendarDays, Files, Settings, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const BASE = "/astelpo_26";

const NAV = [
  { label: "Home",     href: `${BASE}/today`,    icon: Sun },
  { label: "Projects", href: `${BASE}/projects`,  icon: FolderKanban },
  { label: "Calendar", href: `${BASE}/calendar`,  icon: CalendarDays },
  { label: "Files",    href: `${BASE}/files`,     icon: Files },
];

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 flex items-stretch h-16 safe-area-bottom">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== `${BASE}/today` && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
              active ? "text-indigo-400" : "text-slate-500 hover:text-slate-200"
            )}
          >
            <item.icon className={cn("w-5 h-5", active && "text-indigo-400")} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* More menu */}
      <div ref={ref} className="flex-1 flex flex-col items-center justify-center relative">
        <button
          onClick={() => setMoreOpen(o => !o)}
          className={cn(
            "flex flex-col items-center gap-0.5 text-xs font-medium transition-colors w-full h-full justify-center",
            moreOpen ? "text-indigo-400" : "text-slate-500 hover:text-slate-200"
          )}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>

        {moreOpen && (
          <div className="absolute bottom-16 right-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {isAdmin && (
              <Link
                href={`${BASE}/settings`}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  pathname.startsWith(`${BASE}/settings`)
                    ? "text-indigo-400 bg-indigo-900/20"
                    : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            )}
            <Link
              href={`${BASE}/settings/profile`}
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <span className="w-4 h-4 text-center text-xs">👤</span>
              Profile
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
