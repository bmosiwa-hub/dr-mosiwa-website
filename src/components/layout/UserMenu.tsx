"use client";

import { useState, useRef, useEffect } from "react";
import { logout } from "@/lib/actions/auth";
import { LogOut, User, Settings } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
      >
        AM
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
          <div className="px-3 py-2 border-b border-slate-700">
            <p className="text-white text-sm font-medium">Azariah Mosiwa</p>
            <p className="text-slate-400 text-xs truncate">azmosiwa@gmail.com</p>
          </div>

          <Link
            href="/astelpo_26/settings/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <Link
            href="/astelpo_26/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>

          <div className="border-t border-slate-700 mt-1 pt-1">
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
