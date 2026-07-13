"use client";

// HerVoice! — client-side session store (demo only; no real authentication)
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { NOTIFICATIONS, Notification } from "./data";

export const ACCESS_CODE = "HV26-ASTELLIC";

export type Role = "survivor" | "advocate" | "facility" | "district" | "admin" | "citizen";

export interface DemoAccount {
  role: Role;
  label: string;
  name: string;
  email: string;
  password: string;
  home: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: "survivor", label: "Survivor", name: "Hope-013", email: "survivor@demo.hervoice.mw", password: "HerVoice2026", home: "/hervoice_26/survivor", description: "Report incidents, track referrals, chat with your advocate" },
  { role: "advocate", label: "Survivor Advocate", name: "Chisomo Banda", email: "advocate@demo.hervoice.mw", password: "HerVoice2026", home: "/hervoice_26/advocate", description: "Manage cases, create referrals, issue transport vouchers" },
  { role: "facility", label: "Health Facility", name: "Thyolo District Hospital", email: "facility@demo.hervoice.mw", password: "HerVoice2026", home: "/hervoice_26/facility", description: "Receive referrals, record services, close cases" },
  { role: "district", label: "District Officer", name: "Dorothy Kachingwe", email: "district@demo.hervoice.mw", password: "HerVoice2026", home: "/hervoice_26/district", description: "Live dashboards, complaints, analytics, AI insights" },
  { role: "admin", label: "Administrator", name: "System Admin", email: "admin@demo.hervoice.mw", password: "HerVoice2026", home: "/hervoice_26/admin", description: "Users, facilities, configuration, audit logs" },
  { role: "citizen", label: "Citizen", name: "Anonymous", email: "—", password: "—", home: "/hervoice_26/citizen", description: "Anonymous complaints via app, USSD or SMS" },
];

export type Lang = "en" | "ny" | "tum";

const DICT: Record<string, Record<Lang, string>> = {
  welcome: { en: "Welcome back", ny: "Takulandirani", tum: "Mwiza makora" },
  dashboard: { en: "Dashboard", ny: "Chithunzithunzi", tum: "Dashibodi" },
  reportIncident: { en: "Report incident", ny: "Nenani nkhanza", tum: "Kalata ya nkhaza" },
  myReferrals: { en: "My referrals", ny: "Matumizidwe anga", tum: "Vituma vyane" },
  peerSupport: { en: "Peer support", ny: "Chithandizo cha anzanu", tum: "Wovwiri wa ŵanyane" },
  resources: { en: "Resources", ny: "Zothandizira", tum: "Vyakovwira" },
  settings: { en: "Privacy & settings", ny: "Zachinsinsi", tum: "Vyamseri" },
  emergency: { en: "Emergency", ny: "Mwadzidzidzi", tum: "Mwaluŵiro" },
  youAreSafe: { en: "You are in control. Your information is encrypted and only shared with your consent.", ny: "Inu ndinu olamulira. Zambiri zanu ndi zachinsinsi.", tum: "Imwe ndimwe ŵakulongozga. Uthenga winu ngwamseri." },
  submitComplaint: { en: "Submit complaint", ny: "Perekani dandaulo", tum: "Perekani dandawulo" },
  trackComplaint: { en: "Track complaint", ny: "Tsatirani dandaulo", tum: "Londani dandawulo" },
};

interface Store {
  unlocked: boolean;
  unlock: (code: string) => boolean;
  account: DemoAccount | null;
  login: (email: string, password: string) => DemoAccount | null;
  loginAs: (role: Role) => DemoAccount;
  logout: () => void;
  ready: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  online: boolean;
  toggleOnline: () => void;
  notifications: Notification[];
  markAllRead: () => void;
  a11y: boolean;
  setA11y: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function HerVoiceProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [online, setOnline] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [a11y, setA11y] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem("hv-unlocked") === "1");
      const saved = sessionStorage.getItem("hv-account");
      if (saved) {
        const acc = DEMO_ACCOUNTS.find((a) => a.role === saved);
        if (acc) setAccount(acc);
      }
    } catch {}
    setReady(true);
  }, []);

  const unlock = useCallback((code: string) => {
    const ok = code.trim().toUpperCase() === ACCESS_CODE;
    if (ok) {
      setUnlocked(true);
      try { sessionStorage.setItem("hv-unlocked", "1"); } catch {}
    }
    return ok;
  }, []);

  const login = useCallback((email: string, password: string) => {
    const acc = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    );
    if (acc) {
      setAccount(acc);
      try { sessionStorage.setItem("hv-account", acc.role); } catch {}
    }
    return acc ?? null;
  }, []);

  const loginAs = useCallback((role: Role) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role)!;
    setAccount(acc);
    try {
      sessionStorage.setItem("hv-account", acc.role);
      sessionStorage.setItem("hv-unlocked", "1");
    } catch {}
    setUnlocked(true);
    return acc;
  }, []);

  const logout = useCallback(() => {
    setAccount(null);
    try { sessionStorage.removeItem("hv-account"); } catch {}
  }, []);

  const t = useCallback((key: string) => DICT[key]?.[lang] ?? DICT[key]?.en ?? key, [lang]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <Ctx.Provider
      value={{
        unlocked, unlock, account, login, loginAs, logout, ready,
        lang, setLang, t,
        online, toggleOnline: () => setOnline((o) => !o),
        notifications,
        markAllRead: () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true }))),
        a11y, setA11y,
        toast, showToast,
      }}
    >
      <div className={a11y ? "hv-a11y" : ""}>{children}</div>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-hv-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl animate-fade-up">
          {toast}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useHV(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHV must be used within HerVoiceProvider");
  return ctx;
}
