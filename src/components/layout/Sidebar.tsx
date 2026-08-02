"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sun,
  FolderKanban,
  CalendarDays,
  Files,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

const BASE = "/astelpo_26";

const navItems = [
  { label: "Home", href: `${BASE}/today`, icon: Sun },
  { label: "Projects", href: `${BASE}/projects`, icon: FolderKanban },
  { label: "Calendar", href: `${BASE}/calendar`, icon: CalendarDays },
  { label: "Files", href: `${BASE}/files`, icon: Files },
];

const bottomItems = [
  { label: "Settings", href: `${BASE}/settings`, icon: Settings },
];

type Project = { id: string; name: string; colorLabel: string | null };
type SharedProject = { id: string; name: string; colorLabel: string | null; role: string };

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([]);

  useEffect(() => {
    fetch("/astelpo_26/api/projects-list-full")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProjects(data); })
      .catch(() => {});
    fetch("/astelpo_26/api/shared-projects")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSharedProjects(data); })
      .catch(() => {});
  }, [pathname]);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-slate-800 flex-shrink-0", collapsed && "justify-center px-0")}>
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-sm tracking-wide">AstelPO</span>
            <p className="text-slate-500 text-xs">Project Office</p>
          </div>
        )}
      </div>

      {/* Main nav + projects list */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== `${BASE}/today` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-600/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Invite Collaborator — shown below Files */}
          {!collapsed && (
            <Link
              href={`${BASE}/invite`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(`${BASE}/invite`)
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
            >
              <UserPlus className="w-4 h-4 flex-shrink-0" />
              <span>Invite Collaborator</span>
            </Link>
          )}
          {collapsed && (
            <Link
              href={`${BASE}/invite`}
              title="Invite Collaborator"
              className={cn(
                "flex items-center justify-center px-2 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(`${BASE}/invite`)
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
            >
              <UserPlus className="w-4 h-4 flex-shrink-0" />
            </Link>
          )}
        </nav>

        {/* Projects section */}
        {!collapsed && projects.length > 0 && (
          <div className="px-2 pb-3 border-t border-slate-800 pt-3">
            <button
              onClick={() => setProjectsOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800/50"
            >
              <span className="uppercase tracking-wider">Projects</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", !projectsOpen && "-rotate-90")} />
            </button>

            {projectsOpen && (
              <div className="mt-0.5 space-y-0.5">
                {projects.map(p => {
                  const active = pathname.startsWith(`${BASE}/projects/${p.id}`);
                  return (
                    <Link
                      key={p.id}
                      href={`${BASE}/projects/${p.id}`}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
                        active
                          ? "bg-indigo-600/15 text-indigo-300"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                      )}
                      title={p.name}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.colorLabel ?? "#6366f1" }}
                      />
                      <span className="truncate">{p.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Collapsed: show dots only */}
        {collapsed && projects.length > 0 && (
          <div className="px-2 pb-3 space-y-1.5 flex flex-col items-center">
            <div className="w-px h-3 bg-slate-700" />
            {projects.map(p => (
              <Link
                key={p.id}
                href={`${BASE}/projects/${p.id}`}
                title={p.name}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                  pathname.startsWith(`${BASE}/projects/${p.id}`) ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-900" : "hover:ring-2 hover:ring-slate-600 hover:ring-offset-1 hover:ring-offset-slate-900"
                )}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.colorLabel ?? "#6366f1" }} />
              </Link>
            ))}
          </div>
        )}

        {/* Shared Projects section */}
        {!collapsed && sharedProjects.length > 0 && (
          <div className="px-2 pb-3 border-t border-slate-800 pt-3">
            <p className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Shared with me</p>
            <div className="mt-0.5 space-y-0.5">
              {sharedProjects.map(p => {
                const active = pathname.startsWith(`${BASE}/projects/${p.id}`);
                return (
                  <Link
                    key={p.id}
                    href={`${BASE}/projects/${p.id}`}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
                      active
                        ? "bg-indigo-600/15 text-indigo-300"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    )}
                    title={p.name}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.colorLabel ?? "#6366f1" }}
                    />
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto text-slate-600 text-[10px] uppercase">{p.role === "EDITOR" ? "Ed" : "View"}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-slate-800 space-y-0.5 flex-shrink-0">
        {bottomItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                active
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
