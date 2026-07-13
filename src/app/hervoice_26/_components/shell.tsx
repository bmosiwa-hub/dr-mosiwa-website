"use client";

// HerVoice! — portal shell: sidebar, topbar, notifications, panic button
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, LogOut, Menu, X, Wifi, WifiOff, Globe, ShieldAlert, Phone,
  Accessibility, PlayCircle, Lock, ChevronDown,
} from "lucide-react";
import { useHV, Role } from "../_lib/store";
import { cn, Badge, Btn, Modal, Avatar } from "./ui";
import { relDays } from "../_lib/data";

export function HVLogo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("rounded-xl bg-gradient-to-br from-hv-500 to-hv-800 flex items-center justify-center shadow-sm", small ? "w-7 h-7" : "w-9 h-9")}>
        <svg viewBox="0 0 24 24" width={small ? 15 : 19} height={small ? 15 : 19} fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21c-4.5-3.5-8-6.6-8-10.4C4 7.6 6.2 5.5 9 5.5c1.3 0 2.3.5 3 1.4.7-.9 1.7-1.4 3-1.4 2.8 0 5 2.1 5 5.1 0 3.8-3.5 6.9-8 10.4z" />
          <path d="M8 12h2l1.5-3 2 5 1.5-2.5H17" stroke="white" strokeWidth={1.6} />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn("font-bold tracking-tight block", small ? "text-sm" : "text-lg", light ? "text-white" : "text-hv-900")}>
          HerVoice<span className="text-hv-500">!</span>
        </span>
        {!small && (
          <span className={cn("text-[9px] font-semibold tracking-[0.14em] uppercase", light ? "text-hv-200" : "text-gray-400")}>
            by Astellic
          </span>
        )}
      </span>
    </span>
  );
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ROLE_META: Record<Role, { title: string; tone: string }> = {
  survivor: { title: "Survivor Portal", tone: "purple" },
  advocate: { title: "Advocate Workspace", tone: "blue" },
  facility: { title: "Facility Portal", tone: "green" },
  district: { title: "District Command Centre", tone: "purple" },
  admin: { title: "System Administration", tone: "gray" },
  citizen: { title: "Citizen Portal", tone: "amber" },
};

export function Shell({
  role, nav, active, onNavigate, children,
}: {
  role: Role;
  nav: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  children: React.ReactNode;
}) {
  const hv = useHV();
  const router = useRouter();
  const [mobileNav, setMobileNav] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [panicOpen, setPanicOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const unread = hv.notifications.filter((n) => !n.read).length;

  // Guard: must be unlocked & logged in with the right role
  useEffect(() => {
    if (!hv.ready) return;
    if (!hv.unlocked) { router.replace("/hervoice_26"); return; }
    if (!hv.account) { router.replace("/hervoice_26/login"); return; }
    if (hv.account.role !== role) router.replace(hv.account.home);
  }, [hv.ready, hv.unlocked, hv.account, role, router]);

  if (!hv.ready || !hv.account || hv.account.role !== role) {
    return (
      <div className="min-h-screen bg-hv-50 flex items-center justify-center">
        <div className="animate-pulse"><HVLogo /></div>
      </div>
    );
  }

  const meta = ROLE_META[role];

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-hv-800/60">
        <Link href="/hervoice_26"><HVLogo light /></Link>
        <p className="text-[11px] text-hv-300 font-medium mt-2.5">{meta.title}</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); setMobileNav(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              active === item.id
                ? "bg-white/10 text-white shadow-sm"
                : "text-hv-200 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className={cn(active === item.id ? "text-hv-300" : "text-hv-400")}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-hv-800/60 space-y-1">
        <Link
          href="/hervoice_26/demo"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-hv-200 hover:bg-white/5 hover:text-white transition"
        >
          <PlayCircle size={17} className="text-hv-400" /> Donor demo mode
        </Link>
        <button
          onClick={() => { hv.logout(); router.push("/hervoice_26/login"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-hv-200 hover:bg-white/5 hover:text-white transition"
        >
          <LogOut size={17} className="text-hv-400" /> Sign out
        </button>
        <div className="px-3 pt-2 pb-1 flex items-center gap-2">
          <Lock size={11} className="text-hv-500" />
          <span className="text-[10px] text-hv-400">AES-256 encrypted · Demo environment</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F6FB] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-hv-950 flex-col fixed inset-y-0 z-40">{sidebar}</aside>
      {/* Mobile sidebar */}
      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-hv-950/60" onClick={() => setMobileNav(false)} />
          <aside className="relative w-72 bg-hv-950 h-full animate-fade-in">{sidebar}</aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
            <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600" onClick={() => setMobileNav(true)}>
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{meta.title}</p>
              <p className="text-[11px] text-gray-400 hidden sm:block">Pilot districts: Thyolo · Mzimba — Malawi</p>
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {/* Online / offline */}
              <button
                onClick={hv.toggleOnline}
                title="Toggle offline simulation"
                className={cn(
                  "hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-full ring-1 ring-inset transition",
                  hv.online ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"
                )}
              >
                {hv.online ? <Wifi size={12} /> : <WifiOff size={12} />}
                {hv.online ? "Online" : "Offline — will sync"}
              </button>

              {/* Language */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen((o) => !o)}
                  className="inline-flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-xs font-semibold"
                >
                  <Globe size={16} />
                  <span className="hidden sm:inline uppercase">{hv.lang}</span>
                  <ChevronDown size={12} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    {([["en", "English"], ["ny", "Chichewa"], ["tum", "Chitumbuka"]] as const).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => { hv.setLang(code); setLangOpen(false); }}
                        className={cn("w-full text-left px-3.5 py-2 text-sm hover:bg-hv-50", hv.lang === code ? "text-hv-800 font-semibold" : "text-gray-600")}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accessibility */}
              <button
                onClick={() => hv.setA11y(!hv.a11y)}
                title="Accessibility mode — larger text"
                className={cn("p-2 rounded-lg transition", hv.a11y ? "bg-hv-100 text-hv-800" : "hover:bg-gray-100 text-gray-500")}
              >
                <Accessibility size={17} />
              </button>

              {/* Notifications */}
              <button onClick={() => setNotifOpen(true)} className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <Bell size={17} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>

              {/* Panic (survivor only) */}
              {role === "survivor" && (
                <button
                  onClick={() => setPanicOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition"
                >
                  <ShieldAlert size={14} /> <span className="hidden sm:inline">Emergency</span>
                </button>
              )}

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-100">
                <Avatar name={hv.account.name} size="sm" />
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-gray-900">{hv.account.name}</p>
                  <p className="text-[10px] text-gray-400">{hv.account.label}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] w-full mx-auto">
          {!hv.online && (
            <div className="mb-4 flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2.5 rounded-xl">
              <WifiOff size={14} />
              You are working offline. Reports and updates are stored securely on this device and will sync automatically when connectivity returns.
            </div>
          )}
          {children}
        </main>

        <footer className="px-6 py-4 text-center">
          <p className="text-[10px] text-gray-400">
            HerVoice! — Survivor-led GBV Response & Accountability Platform · Demonstration prototype by Astellic · Data shown is simulated
          </p>
        </footer>
      </div>

      {/* Notifications drawer */}
      <Modal open={notifOpen} onClose={() => setNotifOpen(false)} title="Notification centre">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">SMS · Email · Push — delivery simulated</p>
          <Btn size="sm" variant="secondary" onClick={() => { hv.markAllRead(); }}>Mark all read</Btn>
        </div>
        <div className="space-y-3">
          {hv.notifications.map((n) => (
            <div key={n.id} className={cn("flex gap-3 p-3.5 rounded-xl border", n.read ? "border-gray-100 bg-white" : "border-hv-200 bg-hv-50/60")}>
              <Badge tone={n.kind === "SMS" ? "green" : n.kind === "Email" ? "blue" : n.kind === "Push" ? "purple" : "gray"}>{n.kind}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">{relDays(n.at)}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Panic modal */}
      <Modal open={panicOpen} onClose={() => setPanicOpen(false)} title="Emergency assistance">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShieldAlert size={30} />
          </div>
          <p className="text-sm text-gray-700 font-medium">
            If you are in immediate danger, help is available now.
          </p>
          <div className="grid gap-3 mt-5">
            <Btn variant="danger" size="lg" onClick={() => { setPanicOpen(false); hv.showToast("Silent alert sent to your advocate with your GPS location"); }}>
              <ShieldAlert size={18} /> Send silent alert to my advocate
            </Btn>
            <Btn variant="outline" size="lg" onClick={() => { setPanicOpen(false); hv.showToast("Dialling GBV Crisis Line 5600 (toll-free)…"); }}>
              <Phone size={18} /> Call GBV Crisis Line — 5600 (toll-free)
            </Btn>
            <button
              onClick={() => router.push("/hervoice_26")}
              className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
            >
              Quick exit — leave this site immediately
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">
            Your alert includes your approximate GPS location and is sent silently — the screen will not change.
          </p>
        </div>
      </Modal>
    </div>
  );
}
