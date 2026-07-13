"use client";

// HerVoice! — Advocate Workspace
import React, { useMemo, useState } from "react";
import {
  LayoutDashboard, FolderOpen, Calendar as CalIcon, Map as MapIcon,
  AlertTriangle, Users, Clock, Bus, Route, StickyNote, ArrowUpRight,
  ChevronRight, Search, CheckCircle2, Plus, QrCode, Send,
} from "lucide-react";
import { Shell } from "../_components/shell";
import {
  Card, Btn, Badge, statusTone, Modal, Field, Input, Textarea, Select,
  Table, Td, PageTitle, cn, Avatar, Stat, QRCode,
} from "../_components/ui";
import { Sparkline, DistrictMap } from "../_components/charts";
import { useHV } from "../_lib/store";
import {
  SURVIVORS, REFERRALS, FACILITIES, facilityById, fmtDate, fmtDateShort,
  relDays, daysAhead, Survivor, countBy,
} from "../_lib/data";

// This advocate's caseload — a stable slice
const MY_CASES = SURVIVORS.filter((s) => s.district === "thyolo").slice(0, 14);

// ── Case detail modal ───────────────────────────────────────────────────────
function CaseDetail({ c, onClose }: { c: Survivor | null; onClose: () => void }) {
  const hv = useHV();
  const [tab, setTab] = useState<"timeline" | "referral" | "note" | "voucher">("timeline");
  if (!c) return null;
  const fac = facilityById(c.facilityId);
  const timeline = [
    { t: "Case reported via " + c.channel, d: fmtDate(c.reportDate), icon: <FolderOpen size={13} /> },
    { t: "Advocate assigned — first contact within 3 hours", d: fmtDate(c.reportDate), icon: <Users size={13} /> },
    { t: `Referral created → ${fac.name}`, d: fmtDate(new Date(c.reportDate.getTime() + 86400000)), icon: <Route size={13} /> },
    ...(c.hasVoucher ? [{ t: "Transport voucher issued (MWK 7,500)", d: fmtDate(new Date(c.reportDate.getTime() + 86400000)), icon: <Bus size={13} /> }] : []),
    { t: "Facility accepted referral · appointment confirmed", d: fmtDate(new Date(c.reportDate.getTime() + 2 * 86400000)), icon: <CheckCircle2 size={13} /> },
    { t: "Home visit note added", d: fmtDate(new Date(c.reportDate.getTime() + 4 * 86400000)), icon: <StickyNote size={13} /> },
  ];
  return (
    <Modal open onClose={onClose} title={`Case ${c.id}`} wide>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Avatar name={c.code} size="lg" />
        <div>
          <p className="font-bold text-gray-900">{c.code} <span className="text-gray-400 font-normal text-sm">· {c.initials} · {c.age} yrs</span></p>
          <p className="text-xs text-gray-500">TA {c.ta}, {c.district === "thyolo" ? "Thyolo" : "Mzimba"} · Reported {relDays(c.reportDate)} via {c.channel}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge tone={statusTone(c.risk)}>{c.risk} risk</Badge>
          <Badge tone={statusTone(c.status)}>{c.status}</Badge>
        </div>
      </div>

      <div className="flex gap-1.5 border-b border-gray-100 mb-5 overflow-x-auto">
        {([["timeline", "Timeline"], ["referral", "New referral"], ["voucher", "Transport voucher"], ["note", "Visit note"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition",
              tab === id ? "border-hv-700 text-hv-800" : "border-transparent text-gray-400 hover:text-gray-600")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "timeline" && (
        <div className="space-y-0">
          {timeline.map((e, i) => (
            <div key={i} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span className="w-7 h-7 rounded-full bg-hv-50 text-hv-700 flex items-center justify-center shrink-0">{e.icon}</span>
                {i < timeline.length - 1 && <span className="w-px flex-1 bg-gray-100 my-1" />}
              </div>
              <div className="pb-5">
                <p className="text-sm font-medium text-gray-800">{e.t}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{e.d}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Btn size="sm" variant="outline" onClick={() => { hv.showToast(`Case ${c.id} escalated to District Gender Officer`); onClose(); }}>
              <AlertTriangle size={14} /> Escalate urgent
            </Btn>
            <Btn size="sm" variant="outline" onClick={() => hv.showToast("Follow-up scheduled for " + fmtDateShort(daysAhead(7)))}>
              <CalIcon size={14} /> Schedule follow-up
            </Btn>
          </div>
        </div>
      )}

      {tab === "referral" && <NewReferral survivor={c} done={onClose} />}
      {tab === "voucher" && <IssueVoucher survivor={c} />}
      {tab === "note" && (
        <div className="space-y-4">
          <Field label="Visit type">
            <Select><option>Home visit</option><option>Facility accompaniment</option><option>Phone check-in</option></Select>
          </Field>
          <Field label="Note" hint="Notes are visible to you and the district officer only — never to third parties.">
            <Textarea placeholder="Observations, actions taken, survivor's wishes…" />
          </Field>
          <Btn onClick={() => { hv.showToast("Visit note saved to case file"); onClose(); }}><StickyNote size={15} /> Save note</Btn>
        </div>
      )}
    </Modal>
  );
}

function NewReferral({ survivor, done }: { survivor: Survivor; done: () => void }) {
  const hv = useHV();
  const [facility, setFacility] = useState(survivor.facilityId);
  const [service, setService] = useState("Medical examination");
  const [urgent, setUrgent] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Receiving facility">
          <Select value={facility} onChange={(e) => setFacility(e.target.value)}>
            {FACILITIES.filter((f) => f.district === survivor.district).map((f) => (
              <option key={f.id} value={f.id}>{f.name}{f.oneStopCentre ? " · OSC" : ""}</option>
            ))}
          </Select>
        </Field>
        <Field label="Service required">
          <Select value={service} onChange={(e) => setService(e.target.value)}>
            {["Medical examination", "PEP", "Emergency contraception", "Psychological support", "Police / Victim Support Unit", "Legal aid", "Safe shelter"].map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Appointment date"><Input type="date" defaultValue="2026-07-15" /></Field>
      <button onClick={() => setUrgent(!urgent)}
        className={cn("w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition",
          urgent ? "border-rose-300 bg-rose-50" : "border-gray-100 hover:border-rose-200")}>
        <AlertTriangle size={17} className={urgent ? "text-rose-600" : "text-gray-400"} />
        <span className="text-sm font-medium text-gray-800">Mark urgent — 72-hour clinical window (PEP/EC)</span>
        {urgent && <CheckCircle2 size={16} className="ml-auto text-rose-500" />}
      </button>
      <Btn onClick={() => { hv.showToast(`Referral sent to ${facilityById(facility).name}${urgent ? " — URGENT" : ""}`); done(); }}>
        <Send size={15} /> Send referral
      </Btn>
    </div>
  );
}

function IssueVoucher({ survivor }: { survivor: Survivor }) {
  const hv = useHV();
  const [issued, setIssued] = useState(false);
  const [amount, setAmount] = useState("7500");
  if (issued) {
    return (
      <div className="text-center py-4">
        <div className="inline-block p-4 bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm">
          <QRCode seed={`TV-NEW-${survivor.id}`} size={160} />
        </div>
        <p className="font-bold text-gray-900 mt-4">TV-4321 · MWK {parseInt(amount).toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">Sent to survivor by SMS & in-app · Valid 7 days · Single use</p>
        <Badge tone="green" className="mt-3">Active</Badge>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Vouchers are redeemed by registered transport operators and reimbursed weekly via mobile money.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Amount (MWK)">
          <Select value={amount} onChange={(e) => setAmount(e.target.value)}>
            {["3500", "5000", "7500", "10000", "15000"].map((a) => <option key={a} value={a}>MWK {parseInt(a).toLocaleString()}</option>)}
          </Select>
        </Field>
        <Field label="Transport mode">
          <Select><option>Bicycle taxi</option><option>Motorcycle taxi</option><option>Minibus</option><option>Ambulance (critical)</option></Select>
        </Field>
      </div>
      <Btn onClick={() => { setIssued(true); hv.showToast("Voucher generated & sent to survivor"); }}>
        <QrCode size={15} /> Generate voucher
      </Btn>
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ openCase }: { openCase: (c: Survivor) => void }) {
  const urgent = MY_CASES.filter((c) => c.risk === "Critical" || c.risk === "High")
    .sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime())
    .slice(0, 3);
  return (
    <div className="space-y-5">
      <PageTitle title="Good morning, Chisomo" subtitle="Monday, 13 July 2026 · TA Bvumbwe, Thyolo" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active cases" value={MY_CASES.filter((c) => c.status !== "Closed").length} icon={<FolderOpen size={17} />} delta="+2" deltaLabel="this week" />
        <Stat label="Follow-ups due" value={5} icon={<CalIcon size={17} />} tone="amber" delta="2 today" deltaLabel="" />
        <Stat label="Urgent (72-hr window)" value={urgent.length} icon={<AlertTriangle size={17} />} tone="red" />
        <Stat label="Median first contact" value="2.8 hrs" icon={<Clock size={17} />} tone="green" delta="-18%" deltaLabel="faster than June" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Priority cases" subtitle="Requiring action within 24 hours" className="lg:col-span-2">
          <div className="space-y-2.5">
            {urgent.map((c) => (
              <button key={c.id} onClick={() => openCase(c)}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 hover:border-hv-300 hover:bg-hv-50/40 transition text-left">
                <Avatar name={c.code} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{c.code}</p>
                    <Badge tone={statusTone(c.risk)}>{c.risk}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{c.violenceType} · TA {c.ta} · reported {relDays(c.reportDate)}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </Card>
        <Card title="Today's schedule">
          {[
            ["08:00", "Accompany Hope-013 to OSC", "Thyolo District Hospital"],
            ["10:30", "Home visit — Ruby-067", "TA Changata"],
            ["13:00", "Case review with District Officer", "Phone"],
            ["15:00", "Follow-up call — Iris-112", "Phone"],
          ].map(([time, t, loc]) => (
            <div key={t} className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-xs font-bold text-hv-700 w-11 shrink-0 pt-0.5">{time}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{t}</p>
                <p className="text-[10px] text-gray-400">{loc}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Caseload trend" subtitle="New cases assigned per week">
          <div className="flex items-end justify-between">
            <Sparkline values={[3, 5, 4, 6, 5, 8, 7, 9]} width={280} height={64} />
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">9</p>
              <p className="text-xs text-gray-400">this week</p>
            </div>
          </div>
        </Card>
        <Card title="Case mix" subtitle="Your active cases by type">
          {countBy(MY_CASES, (c) => c.violenceType).slice(0, 4).map((d) => (
            <div key={d.label} className="flex items-center gap-3 py-1.5">
              <span className="text-xs text-gray-500 w-40 truncate">{d.label}</span>
              <div className="flex-1 bg-gray-50 rounded-full h-2">
                <div className="h-2 rounded-full bg-hv-500" style={{ width: `${(d.value / MY_CASES.length) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-800 w-5 text-right">{d.value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Case list ───────────────────────────────────────────────────────────────
function Cases({ openCase }: { openCase: (c: Survivor) => void }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [risk, setRisk] = useState("All");
  const filtered = useMemo(
    () =>
      MY_CASES.filter(
        (c) =>
          (status === "All" || c.status === status) &&
          (risk === "All" || c.risk === risk) &&
          (q === "" || c.code.toLowerCase().includes(q.toLowerCase()) || c.id.toLowerCase().includes(q.toLowerCase()))
      ),
    [q, status, risk]
  );
  return (
    <div>
      <PageTitle title="My cases" subtitle={`${MY_CASES.length} survivors under your support`} />
      <Card>
        <div className="flex flex-wrap gap-2.5 mb-5">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <Input placeholder="Search by code or case ID…" value={q} onChange={(e) => setQ(e.target.value)} className="!pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="!w-auto">
            {["All", "New", "Active", "In referral", "Follow-up", "Closed"].map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select value={risk} onChange={(e) => setRisk(e.target.value)} className="!w-auto">
            {["All", "Critical", "High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <Table headers={["Survivor", "Case ID", "Type", "Location", "Risk", "Status", "Next follow-up", ""]}>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-hv-50/40 cursor-pointer transition" onClick={() => openCase(c)}>
              <Td><span className="flex items-center gap-2.5"><Avatar name={c.code} size="sm" /><b className="text-gray-900">{c.code}</b></span></Td>
              <Td className="text-gray-400 text-xs">{c.id}</Td>
              <Td className="text-xs">{c.violenceType}</Td>
              <Td className="text-xs">TA {c.ta}</Td>
              <Td><Badge tone={statusTone(c.risk)}>{c.risk}</Badge></Td>
              <Td><Badge tone={statusTone(c.status)}>{c.status}</Badge></Td>
              <Td className="text-xs">{c.nextFollowUp ? fmtDateShort(c.nextFollowUp) : "—"}</Td>
              <Td><ChevronRight size={15} className="text-gray-300" /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ── Calendar ────────────────────────────────────────────────────────────────
function CalendarView() {
  const hv = useHV();
  const days = ["Mon 13", "Tue 14", "Wed 15", "Thu 16", "Fri 17", "Sat 18", "Sun 19"];
  const events: Record<number, Array<[string, string, string]>> = {
    0: [["08:00", "OSC accompaniment — Hope-013", "purple"], ["13:00", "District case review", "blue"]],
    1: [["10:30", "Home visit — Ruby-067", "purple"]],
    2: [["09:00", "Counselling — Hope-013", "green"], ["14:00", "Home visit — Pearl-090", "purple"]],
    3: [["11:00", "Court accompaniment — Iris-112", "amber"]],
    4: [["09:30", "Follow-up calls (4)", "blue"]],
  };
  return (
    <div>
      <PageTitle title="Calendar" subtitle="Week of 13 – 19 July 2026"
        action={<Btn size="sm" onClick={() => hv.showToast("New appointment added to Wednesday")}><Plus size={14} /> New appointment</Btn>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((d, i) => (
          <Card key={d} className={cn("!p-3.5 min-h-[130px]", i === 0 && "ring-2 ring-hv-200")}>
            <p className={cn("text-xs font-bold mb-2.5", i === 0 ? "text-hv-800" : "text-gray-500")}>{d}{i === 0 && " · Today"}</p>
            <div className="space-y-1.5">
              {(events[i] ?? []).map(([time, t, tone]) => (
                <div key={t} className={cn("text-[10px] font-medium p-2 rounded-lg leading-snug",
                  tone === "purple" ? "bg-hv-50 text-hv-900" : tone === "green" ? "bg-emerald-50 text-emerald-800" : tone === "amber" ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800")}>
                  <b>{time}</b> · {t}
                </div>
              ))}
              {!(events[i]) && <p className="text-[10px] text-gray-300">No appointments</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Map ─────────────────────────────────────────────────────────────────────
function MapView() {
  const markers = FACILITIES.map((f) => ({
    id: f.id, name: f.name, district: f.district as "thyolo" | "mzimba",
    intensity: Math.min(f.referralsReceived / 220, 1),
  }));
  return (
    <div>
      <PageTitle title="Coverage map" subtitle="Your assigned area and facility network — Thyolo" />
      <div className="grid lg:grid-cols-[300px,1fr] gap-4">
        <Card><DistrictMap markers={markers} activeDistrict="thyolo" /></Card>
        <Card title="Facilities in Thyolo" subtitle="Marker size reflects referral volume">
          <Table headers={["Facility", "Type", "OSC", "Avg. response", "Distance"]}>
            {FACILITIES.filter((f) => f.district === "thyolo").map((f, i) => (
              <tr key={f.id}>
                <Td><b className="text-gray-900">{f.name}</b></Td>
                <Td className="text-xs">{f.type}</Td>
                <Td>{f.oneStopCentre ? <Badge tone="green">Yes</Badge> : <Badge>—</Badge>}</Td>
                <Td className="text-xs">{f.avgResponseHrs} hrs</Td>
                <Td className="text-xs">{[4, 11, 17, 6, 14, 9][i]} km</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function AdvocatePortal() {
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState<Survivor | null>(null);
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
    { id: "cases", label: "My cases", icon: <FolderOpen size={17} /> },
    { id: "calendar", label: "Calendar", icon: <CalIcon size={17} /> },
    { id: "map", label: "Coverage map", icon: <MapIcon size={17} /> },
  ];
  return (
    <Shell role="advocate" nav={nav} active={view} onNavigate={setView}>
      {view === "dashboard" && <Dashboard openCase={setSelected} />}
      {view === "cases" && <Cases openCase={setSelected} />}
      {view === "calendar" && <CalendarView />}
      {view === "map" && <MapView />}
      {selected && <CaseDetail c={selected} onClose={() => setSelected(null)} />}
    </Shell>
  );
}
