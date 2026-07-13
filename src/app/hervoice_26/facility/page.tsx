"use client";

// HerVoice! — Health Facility Portal (Thyolo District Hospital)
import React, { useState } from "react";
import {
  LayoutDashboard, Inbox, ClipboardList, Activity, AlertTriangle, CheckCircle2,
  Clock, Pill, FlaskConical, HeartPulse, FileText, ChevronRight, XCircle, Send,
} from "lucide-react";
import { Shell } from "../_components/shell";
import {
  Card, Btn, Badge, statusTone, Modal, Field, Input, Textarea, Select,
  Table, Td, PageTitle, cn, Stat, Toggle,
} from "../_components/ui";
import { DonutChart, Sparkline } from "../_components/charts";
import { useHV } from "../_lib/store";
import { REFERRALS, survivorById, relDays, fmtDateShort, Referral } from "../_lib/data";

// Referrals addressed to this facility (fac-1 = Thyolo District Hospital)
const INCOMING = REFERRALS.filter((r) => r.facilityId === "fac-1").slice(0, 18);

function ReferralRow({ r, onOpen, decided }: { r: Referral; onOpen: (r: Referral) => void; decided?: string }) {
  const s = survivorById(r.survivorId);
  const status = decided ?? r.status;
  return (
    <button onClick={() => onOpen(r)}
      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 hover:border-hv-300 hover:bg-hv-50/40 transition text-left">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        r.urgent ? "bg-rose-50 text-rose-600" : "bg-hv-50 text-hv-700")}>
        {r.urgent ? <AlertTriangle size={17} /> : <Inbox size={17} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{r.id}</p>
          <Badge tone={statusTone(status)}>{status}</Badge>
          {r.urgent && <Badge tone="red">72-hr window</Badge>}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {r.service} · Survivor {s?.code ?? r.survivorId} · {relDays(r.createdAt)}
          {r.appointment ? ` · Appt ${fmtDateShort(r.appointment)}` : ""}
        </p>
      </div>
      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  );
}

// ── Referral detail / accept ────────────────────────────────────────────────
function ReferralDetail({
  r, onClose, decide, decided,
}: {
  r: Referral; onClose: () => void; decide: (id: string, status: string) => void; decided?: string;
}) {
  const hv = useHV();
  const s = survivorById(r.survivorId);
  const status = decided ?? r.status;
  return (
    <Modal open onClose={onClose} title={`Referral ${r.id}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{r.service}</p>
            <p className="text-xs text-gray-500 mt-0.5">Survivor {s?.code} · {s?.age} yrs · TA {s?.ta}</p>
          </div>
          <Badge tone={statusTone(status)}>{status}</Badge>
        </div>
        {r.urgent && (
          <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 rounded-2xl p-3.5">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <p className="text-xs text-rose-800 font-medium">Urgent — within 72-hour clinical window for PEP / emergency contraception.</p>
          </div>
        )}
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Advocate notes</p>
          <p className="text-sm text-gray-700">{r.notes}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-gray-100 p-3">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Referred</p>
            <p className="font-semibold text-gray-900 mt-0.5">{relDays(r.createdAt)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 p-3">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Consent on file</p>
            <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1"><CheckCircle2 size={13} /> Services + evidence</p>
          </div>
        </div>
        {status === "Pending" ? (
          <div className="flex gap-2.5 pt-1">
            <Btn variant="success" className="flex-1" onClick={() => { decide(r.id, "Accepted"); hv.showToast(`${r.id} accepted — advocate & survivor notified`); onClose(); }}>
              <CheckCircle2 size={15} /> Accept referral
            </Btn>
            <Btn variant="outline" className="flex-1" onClick={() => { decide(r.id, "Declined"); hv.showToast(`${r.id} declined — rerouted to Malamulo Mission Hospital`); onClose(); }}>
              <XCircle size={15} /> Cannot accept
            </Btn>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center pt-1">Use “Record services” to document care and close this referral.</p>
        )}
      </div>
    </Modal>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ open, decisions }: { open: (r: Referral) => void; decisions: Record<string, string> }) {
  const pending = INCOMING.filter((r) => (decisions[r.id] ?? r.status) === "Pending");
  const urgent = INCOMING.filter((r) => r.urgent && (decisions[r.id] ?? r.status) === "Pending");
  return (
    <div className="space-y-5">
      <PageTitle title="Thyolo District Hospital" subtitle="One-Stop Centre · GBV referral desk" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Pending referrals" value={pending.length} icon={<Inbox size={17} />} tone="amber" />
        <Stat label="Emergency queue" value={urgent.length} icon={<AlertTriangle size={17} />} tone="red" />
        <Stat label="Completed this month" value={34} icon={<CheckCircle2 size={17} />} tone="green" delta="+21%" deltaLabel="vs June" />
        <Stat label="Avg. acceptance time" value="3.1 hrs" icon={<Clock size={17} />} delta="-40%" deltaLabel="faster since pilot start" />
      </div>

      {urgent.length > 0 && (
        <Card title="⚡ Emergency queue" subtitle="72-hour clinical window — respond first" className="ring-2 ring-rose-100">
          <div className="space-y-2.5">
            {urgent.map((r) => <ReferralRow key={r.id} r={r} onOpen={open} decided={decisions[r.id]} />)}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Service mix" subtitle="Services provided — last 30 days">
          <DonutChart
            centerLabel="services"
            data={[
              { label: "Medical examination", value: 42 },
              { label: "PEP", value: 26 },
              { label: "Emergency contraception", value: 19 },
              { label: "Psychological support", value: 31 },
              { label: "STI treatment", value: 14 },
            ]}
          />
        </Card>
        <Card title="Commodity status" subtitle="GBV-critical stock levels">
          {[
            ["PEP (HIV post-exposure prophylaxis)", "Adequate", "428 doses"],
            ["Emergency contraception", "Adequate", "212 doses"],
            ["Rape kits (forensic)", "Low", "9 kits"],
            ["STI treatment packs", "Adequate", "156 packs"],
          ].map(([n, s, q]) => (
            <div key={n} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2.5">
                <Pill size={15} className="text-hv-500" />
                <p className="text-sm text-gray-700">{n}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{q}</span>
                <Badge tone={statusTone(s)}>{s}</Badge>
              </div>
            </div>
          ))}
          <div className="flex items-end justify-between mt-4 pt-3 border-t border-gray-50">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Referral volume trend</p>
              <Sparkline values={[8, 11, 9, 14, 12, 16, 15, 19]} width={180} height={40} />
            </div>
            <p className="text-xs text-gray-400">weekly</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Referral queue ──────────────────────────────────────────────────────────
function Queue({ open, decisions }: { open: (r: Referral) => void; decisions: Record<string, string> }) {
  const [tab, setTab] = useState("Pending");
  const tabs = ["Pending", "Accepted", "In progress", "Completed"];
  const filtered = INCOMING.filter((r) => (decisions[r.id] ?? r.status) === tab);
  return (
    <div>
      <PageTitle title="Incoming referrals" subtitle={`${INCOMING.length} referrals routed to this facility`} />
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition",
              tab === t ? "bg-hv-800 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-100 hover:border-hv-200")}>
            {t}
            <span className={cn("ml-1.5 text-[10px] font-bold", tab === t ? "text-hv-300" : "text-gray-300")}>
              {INCOMING.filter((r) => (decisions[r.id] ?? r.status) === t).length}
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card><p className="text-sm text-gray-400 text-center py-8">No referrals in this queue.</p></Card>
        ) : (
          filtered.map((r) => <ReferralRow key={r.id} r={r} onOpen={open} decided={decisions[r.id]} />)
        )}
      </div>
    </div>
  );
}

// ── Record services ─────────────────────────────────────────────────────────
function RecordServices() {
  const hv = useHV();
  const [saved, setSaved] = useState(false);
  const [services, setServices] = useState<Record<string, boolean>>({
    exam: true, pep: false, ec: false, psych: false, sti: false, forensic: false,
  });
  const toggle = (k: string) => setServices((s) => ({ ...s, [k]: !s[k] }));
  const SERVICE_OPTS = [
    { k: "exam", t: "Medical examination", icon: <Activity size={16} /> },
    { k: "pep", t: "PEP initiated (28-day course)", icon: <Pill size={16} /> },
    { k: "ec", t: "Emergency contraception", icon: <Pill size={16} /> },
    { k: "psych", t: "Psychological first aid / counselling", icon: <HeartPulse size={16} /> },
    { k: "sti", t: "STI screening & treatment", icon: <FlaskConical size={16} /> },
    { k: "forensic", t: "Forensic documentation (MOH form)", icon: <FileText size={16} /> },
  ];
  if (saved) {
    return (
      <Card className="max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={30} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Referral closed</h2>
        <p className="text-sm text-gray-500 mt-2">
          Services recorded for REF-2611. The advocate and district dashboard have been updated
          automatically, and a follow-up reminder has been scheduled.
        </p>
        <Btn className="mt-6" onClick={() => setSaved(false)}>Record another</Btn>
      </Card>
    );
  }
  return (
    <div className="max-w-2xl mx-auto">
      <PageTitle title="Record services" subtitle="Document care provided and close the referral loop." />
      <Card>
        <div className="space-y-5">
          <Field label="Referral">
            <Select>
              <option>REF-2611 — Hope-013 · Medical examination · accepted today</option>
              <option>REF-2640 — Pearl-090 · PEP · accepted yesterday</option>
              <option>REF-2652 — Iris-112 · Psychological support · in progress</option>
            </Select>
          </Field>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Services provided</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {SERVICE_OPTS.map((o) => (
                <button key={o.k} onClick={() => toggle(o.k)}
                  className={cn("flex items-center gap-2.5 p-3 rounded-xl border text-left transition",
                    services[o.k] ? "border-hv-500 bg-hv-50 ring-2 ring-hv-100" : "border-gray-100 hover:border-hv-200")}>
                  <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    services[o.k] ? "bg-hv-800 text-white" : "bg-gray-50 text-gray-400")}>{o.icon}</span>
                  <span className="text-xs font-semibold text-gray-800">{o.t}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Medication dispensed"><Input placeholder="e.g. TDF/3TC/DTG 28-day pack" /></Field>
            <Field label="Laboratory requests"><Input placeholder="e.g. HIV rapid, HBsAg, RPR" /></Field>
          </div>
          <Field label="Clinical notes" hint="Stored under medical confidentiality — visible to clinicians only.">
            <Textarea placeholder="Findings, treatment plan, follow-up requirements…" />
          </Field>
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Upload completed MOH GBV form</p>
              <p className="text-xs text-gray-400 mt-0.5">Scanned form is encrypted and linked to the case</p>
            </div>
            <Btn size="sm" variant="outline" onClick={() => hv.showToast("Form GBV-01 uploaded & encrypted")}>Upload</Btn>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-hv-50">
            <div>
              <p className="text-sm font-semibold text-hv-900">Close referral after saving</p>
              <p className="text-xs text-hv-700/70 mt-0.5">Notifies advocate · updates district dashboard</p>
            </div>
            <Toggle checked onChange={() => {}} />
          </div>
          <Btn size="lg" className="w-full" onClick={() => { setSaved(true); }}>
            <Send size={16} /> Save & close referral
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function FacilityPortal() {
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState<Referral | null>(null);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
    { id: "queue", label: "Incoming referrals", icon: <Inbox size={17} /> },
    { id: "record", label: "Record services", icon: <ClipboardList size={17} /> },
  ];
  return (
    <Shell role="facility" nav={nav} active={view} onNavigate={setView}>
      {view === "dashboard" && <Dashboard open={setSelected} decisions={decisions} />}
      {view === "queue" && <Queue open={setSelected} decisions={decisions} />}
      {view === "record" && <RecordServices />}
      {selected && (
        <ReferralDetail
          r={selected}
          decided={decisions[selected.id]}
          onClose={() => setSelected(null)}
          decide={(id, status) => setDecisions((d) => ({ ...d, [id]: status }))}
        />
      )}
    </Shell>
  );
}
