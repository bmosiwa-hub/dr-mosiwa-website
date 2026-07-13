"use client";

// HerVoice! — access gate + landing page
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock, ArrowRight, ShieldCheck, Smartphone, MessageSquare, Bus, Activity,
  Users, Building2, BarChart3, Sparkles, HeartHandshake, Globe2, PlayCircle,
  CheckCircle2, MapPin, Radio, FileText, Eye, WifiOff,
} from "lucide-react";
import { useHV } from "./_lib/store";
import { HVLogo } from "./_components/shell";
import { Btn, Card } from "./_components/ui";
import { KPIS } from "./_lib/data";

// ── Access gate ─────────────────────────────────────────────────────────────
function AccessGate() {
  const hv = useHV();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hv.unlock(code)) {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };
  return (
    <div className="min-h-screen bg-hv-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-hv-700/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-hv-500/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          <div className="flex justify-center mb-6"><HVLogo /></div>
          <div className="w-12 h-12 rounded-2xl bg-hv-50 text-hv-700 flex items-center justify-center mx-auto mb-4">
            <Lock size={22} />
          </div>
          <h1 className="text-lg font-bold text-gray-900 text-center">Restricted demonstration</h1>
          <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
            This environment is reserved for invited reviewers conducting due diligence.
            Enter the access code provided by Astellic.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Access code"
              autoFocus
              className={`w-full rounded-xl border px-4 py-3 text-sm text-center font-semibold tracking-[0.2em] uppercase outline-none transition focus:ring-2 focus:ring-hv-100 ${
                error ? "border-rose-400 bg-rose-50 animate-pulse" : "border-gray-200 focus:border-hv-500"
              }`}
            />
            {error && <p className="text-xs text-rose-600 text-center font-medium">Invalid access code. Please check your invitation.</p>}
            <Btn type="submit" className="w-full" size="lg">
              Enter secure environment <ArrowRight size={16} />
            </Btn>
          </form>
          <p className="text-[11px] text-gray-400 text-center mt-5 flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} /> Access is logged · All demonstration data is simulated
          </p>
        </div>
        <p className="text-center text-hv-300 text-xs mt-6">
          © 2026 Astellic — Research · Advisory · Implementation
        </p>
      </motion.div>
    </div>
  );
}

// ── Landing page ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Smartphone size={20} />, title: "Multi-channel reporting", body: "Survivors report safely via mobile app, USSD (*384#), SMS or hotline — designed for low-connectivity, low-literacy contexts." },
  { icon: <HeartHandshake size={20} />, title: "Advocate case management", body: "Trained community advocates receive, triage and manage cases with referrals, home-visit notes and follow-up scheduling." },
  { icon: <Bus size={20} />, title: "Emergency transport vouchers", body: "QR-coded transport vouchers remove the cost barrier between a survivor and the nearest One-Stop Centre." },
  { icon: <Building2 size={20} />, title: "Facility referral workflow", body: "Health facilities accept referrals, record services (PEP, EC, examination, counselling) and close the loop digitally." },
  { icon: <MessageSquare size={20} />, title: "Citizen accountability", body: "Anonymous complaints on service denial, stockouts and misconduct — with tracking IDs and 7-day escalation SLAs." },
  { icon: <BarChart3 size={20} />, title: "District intelligence", body: "Live dashboards, heat maps and AI-assisted insights give district officers the evidence to act — and donors the proof it works." },
];

const SAFEGUARDS = [
  { icon: <Eye size={16} />, text: "Survivor-controlled consent & evidence" },
  { icon: <Lock size={16} />, text: "End-to-end AES-256 encryption" },
  { icon: <WifiOff size={16} />, text: "Offline-first — syncs when connected" },
  { icon: <Globe2 size={16} />, text: "English · Chichewa · Chitumbuka" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <HVLogo />
          <div className="flex items-center gap-3">
            <Link href="/hervoice_26/demo" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-hv-700 hover:text-hv-900 transition">
              <PlayCircle size={16} /> Guided demo
            </Link>
            <Link href="/hervoice_26/login">
              <Btn size="sm">Sign in <ArrowRight size={14} /></Btn>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-hv-50 via-white to-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-hv-100/60 blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 bg-hv-100 text-hv-800 text-xs font-bold px-3.5 py-1.5 rounded-full">
                <Sparkles size={13} /> Donor demonstration · Pilot: Thyolo & Mzimba, Malawi
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.08]">
                Every survivor heard.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-hv-600 to-hv-800">Every service accountable.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
                HerVoice! is a survivor-led GBV response and citizen accountability platform.
                It connects survivors to advocates, transport and care within hours — while
                giving communities and district authorities real-time visibility into service quality.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/hervoice_26/demo">
                  <Btn size="lg"><PlayCircle size={18} /> Start guided demo</Btn>
                </Link>
                <Link href="/hervoice_26/login">
                  <Btn size="lg" variant="outline">Explore the platform</Btn>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {SAFEGUARDS.map((s) => (
                  <span key={s.text} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <span className="text-hv-600">{s.icon}</span> {s.text}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-hv-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { v: KPIS.survivorsSupported.toLocaleString(), l: "Survivors supported", d: "across 2 pilot districts" },
            { v: "18.4 hrs", l: "Median response time", d: "down 32% this quarter" },
            { v: KPIS.totalComplaints.toLocaleString(), l: "Citizen reports received", d: `${Math.round((KPIS.resolvedComplaints / KPIS.totalComplaints) * 100)}% resolved` },
            { v: KPIS.vouchersIssued.toLocaleString(), l: "Transport vouchers issued", d: `${KPIS.vouchersRedeemed} redeemed at facilities` },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center lg:text-left"
            >
              <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{s.v}</p>
              <p className="text-sm font-semibold text-hv-200 mt-1">{s.l}</p>
              <p className="text-xs text-hv-400 mt-0.5">{s.d}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-[10px] text-hv-500 mt-8">Simulated pilot data for demonstration purposes</p>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-hv-600">Why HerVoice!</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              GBV response fails in the gaps between services
            </h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              A survivor in rural Malawi may need to reach a health facility within 72 hours for
              post-exposure prophylaxis — yet faces transport costs, broken referral chains and no way
              to hold services to account. HerVoice! closes those gaps with one connected system:
              survivor support on one side, citizen accountability on the other, and district
              intelligence binding the two together.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="h-full hover:shadow-md hover:border-hv-200 transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-hv-50 text-hv-700 flex items-center justify-center mb-4">{f.icon}</div>
                  <h3 className="font-bold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{f.body}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-hv-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-hv-600">The survivor journey</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 tracking-tight">From report to care in four steps</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            {[
              { icon: <Radio size={20} />, t: "1 · Report", b: "App, USSD *384#, SMS or hotline. Anonymous options. Works offline." },
              { icon: <Users size={20} />, t: "2 · Advocate assigned", b: "A trained advocate in the survivor's TA is notified within minutes." },
              { icon: <Bus size={20} />, t: "3 · Transport & referral", b: "QR voucher issued; the facility accepts the referral before arrival." },
              { icon: <Activity size={20} />, t: "4 · Care & follow-up", b: "Services recorded, follow-ups scheduled, the loop closed — visibly." },
            ].map((s, i) => (
              <motion.div
                key={s.t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-2xl border border-hv-100 p-6 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-hv-800 text-white flex items-center justify-center mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm">{s.t}</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{s.b}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accountability strip */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-hv-600">Citizen accountability</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 tracking-tight">
              When communities can see, services improve
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Any citizen can anonymously report a denied service, a stockout, a delayed referral or
              misconduct — from a basic phone. Every complaint receives a tracking ID, is routed to
              the district officer, and auto-escalates if unresolved after seven days.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "1,000+ complaints simulated across 7 categories",
                "Automatic 7-day SLA escalation to district level",
                "Facility league tables & response-time monitoring",
                "Monthly exportable reports for councils and donors",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 size={17} className="text-emerald-500 mt-0.5 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <Card className="bg-gradient-to-br from-hv-900 to-hv-800 border-0 text-white">
            <div className="flex items-center gap-2 text-hv-200 text-xs font-bold uppercase tracking-wider mb-5">
              <MapPin size={14} /> Live district signal — Thyolo
            </div>
            {[
              ["PEP stockout — Khonjeni Health Centre", "Escalated", "bg-rose-400"],
              ["6-hour OPD wait — Bvumbwe HC", "Assigned", "bg-amber-300"],
              ["VSU officer demanded payment", "In progress", "bg-sky-300"],
              ["Referral delayed 2 days — Thekerani", "Resolved", "bg-emerald-400"],
            ].map(([t, s, dot]) => (
              <div key={t as string} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-sm text-hv-50 flex-1">{t}</span>
                <span className="text-[10px] font-bold text-hv-200 uppercase tracking-wide">{s}</span>
              </div>
            ))}
            <p className="text-[10px] text-hv-300 mt-4 flex items-center gap-1.5">
              <FileText size={11} /> Complaints route automatically to the District Gender Office
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-hv-950 relative overflow-hidden px-8 py-14 text-center">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-hv-600/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">See HerVoice! in action</h2>
            <p className="mt-4 text-hv-200 max-w-xl mx-auto">
              Walk through three end-to-end scenarios — a survivor's journey, a citizen complaint,
              and district oversight — or sign in with any of six demonstration roles.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/hervoice_26/demo"><Btn size="lg"><PlayCircle size={18} /> Guided donor demo</Btn></Link>
              <Link href="/hervoice_26/login">
                <Btn size="lg" className="!bg-white !text-hv-900 hover:!bg-hv-50">Sign in to a role</Btn>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <HVLogo small />
          <p className="text-xs text-gray-400 text-center">
            © 2026 Astellic · Research · Advisory · Implementation — Bridging evidence, policy and delivery across Africa.
          </p>
          <p className="text-[10px] text-gray-300">Restricted demonstration · All data simulated</p>
        </div>
      </footer>
    </div>
  );
}

export default function HerVoiceHome() {
  const hv = useHV();
  if (!hv.ready) {
    return <div className="min-h-screen bg-hv-950 flex items-center justify-center"><div className="animate-pulse"><HVLogo light /></div></div>;
  }
  return hv.unlocked ? <Landing /> : <AccessGate />;
}
