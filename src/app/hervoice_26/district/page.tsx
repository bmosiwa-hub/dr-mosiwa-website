"use client";

// HerVoice! — District Command Centre
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, MessageSquareWarning, BarChart3, Sparkles, FileDown,
  Users, Clock, Route, CheckCircle2, AlertTriangle, Bus, Search, Send,
  ArrowUpRight, Bot, FileText, Download, TrendingDown, Filter,
} from "lucide-react";
import { Shell } from "../_components/shell";
import {
  Card, Btn, Badge, statusTone, Modal, Input, Select, Table, Td, PageTitle,
  cn, Stat,
} from "../_components/ui";
import { BarChart, LineChart, DonutChart, Heatmap, DistrictMap, ProgressRing } from "../_components/charts";
import { useHV } from "../_lib/store";
import {
  COMPLAINTS, FACILITIES, MONTHLY_TRENDS, WEEKLY_HEAT, DISTRICTS, KPIS,
  countBy, relDays, fmtDateShort, Complaint, facilityById, VIOLENCE_TYPES, SURVIVORS,
} from "../_lib/data";

const AI_INSIGHTS = [
  { severity: "red", title: "PEP stockouts driving complaint spike in Thyolo", body: "23 stockout complaints in 14 days — 3.2× the district baseline. Khonjeni HC and Chimaliro HC account for 74%. Recommend emergency redistribution from Thyolo District Hospital (428 doses in stock)." },
  { severity: "amber", title: "Response times rising in TA Kampingo Sibande", body: "Median first-contact time is 41 hrs vs the 18 hr district median. Two of five advocates in this TA are on leave — consider temporary reassignment from TA Mtwalo." },
  { severity: "green", title: "Voucher programme outperforming target", body: "83% of transport vouchers were redeemed within 48 hrs, and voucher-assisted referrals complete 2.1 days faster on average than non-assisted ones." },
];

// ── Overview ────────────────────────────────────────────────────────────────
function Overview({ district, setDistrict, exportReport }: { district: string | null; setDistrict: (d: string | null) => void; exportReport: () => void }) {
  const complaints = district ? COMPLAINTS.filter((c) => c.district === district) : COMPLAINTS;
  const catData = countBy(complaints, (c) => c.category).slice(0, 5);
  const markers = FACILITIES.map((f) => ({
    id: f.id, name: f.name, district: f.district as "thyolo" | "mzimba",
    intensity: Math.min(f.complaintCount / 130, 1),
  }));
  return (
    <div className="space-y-5">
      <PageTitle
        title="District overview"
        subtitle={`Live operational picture — ${district ? DISTRICTS.find((d) => d.id === district)?.name : "all pilot districts"} · updated 2 min ago`}
        action={
          <div className="flex gap-2">
            <Select value={district ?? "all"} onChange={(e) => setDistrict(e.target.value === "all" ? null : e.target.value)} className="!w-auto">
              <option value="all">All districts</option>
              {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <Btn size="sm" variant="outline" onClick={exportReport}><FileDown size={14} /> Export report</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <Stat label="Survivors supported" value={KPIS.survivorsSupported} icon={<Users size={16} />} delta="+14%" deltaLabel="vs Q1" />
        <Stat label="Median response" value="18.4 hrs" icon={<Clock size={16} />} tone="green" delta="-32%" deltaLabel="faster vs Q1" />
        <Stat label="Active referrals" value={KPIS.activeReferrals} icon={<Route size={16} />} tone="blue" />
        <Stat label="Complaints resolved" value={`${Math.round((KPIS.resolvedComplaints / KPIS.totalComplaints) * 100)}%`} icon={<CheckCircle2 size={16} />} tone="green" delta="+9pt" deltaLabel="vs Q1" />
        <Stat label="Escalated (open)" value={KPIS.escalatedComplaints} icon={<AlertTriangle size={16} />} tone="red" delta="12 breaching SLA" deltaLabel="" />
        <Stat label="Vouchers issued" value={KPIS.vouchersIssued} icon={<Bus size={16} />} delta={`${Math.round((KPIS.vouchersRedeemed / KPIS.vouchersIssued) * 100)}% redeemed`} deltaLabel="" />
      </div>

      {/* AI insights */}
      <Card
        title="AI insights"
        subtitle="Automatically surfaced from the last 14 days of platform data"
        action={<Badge tone="purple"><Sparkles size={11} /> HerVoice Intelligence</Badge>}
      >
        <div className="grid md:grid-cols-3 gap-3">
          {AI_INSIGHTS.map((ins) => (
            <div key={ins.title} className={cn("rounded-2xl border p-4",
              ins.severity === "red" ? "border-rose-100 bg-rose-50/50" : ins.severity === "amber" ? "border-amber-100 bg-amber-50/50" : "border-emerald-100 bg-emerald-50/50")}>
              <p className="text-sm font-bold text-gray-900 leading-snug">{ins.title}</p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{ins.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Reports & complaints — 12-month trend" className="lg:col-span-2">
          <LineChart
            labels={MONTHLY_TRENDS.map((m) => m.label)}
            series={[
              { name: "Citizen complaints", values: MONTHLY_TRENDS.map((m) => m.complaints), color: "#7B61C8" },
              { name: "Resolved", values: MONTHLY_TRENDS.map((m) => m.resolved), color: "#10B981" },
              { name: "Survivor reports", values: MONTHLY_TRENDS.map((m) => m.reports), color: "#F59E0B" },
            ]}
          />
        </Card>
        <Card title="Pilot districts" subtitle="Complaint intensity by facility — click a district to filter">
          <DistrictMap markers={markers} activeDistrict={district} onSelect={(d) => setDistrict(district === d ? null : d)} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Top complaint categories" subtitle={district ? DISTRICTS.find((d) => d.id === district)?.name : "All districts"}>
          <BarChart horizontal data={catData} />
        </Card>
        <Card title="Report intensity heat map" subtitle="TA × week (last 8 weeks)">
          <Heatmap
            rows={[...DISTRICTS[0].tas.slice(0, 3).map((t) => `Thy · ${t}`), ...DISTRICTS[1].tas.slice(0, 3).map((t) => `Mzi · ${t}`)]}
            cols={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]}
            values={WEEKLY_HEAT.slice(0, 6)}
          />
        </Card>
        <Card title="Response-time trend" subtitle="Median hours from report to first contact">
          <LineChart
            height={180}
            labels={MONTHLY_TRENDS.map((m) => m.label)}
            series={[{ name: "Median response (hrs)", values: MONTHLY_TRENDS.map((m) => m.responseHrs), color: "#3E2A78" }]}
          />
          <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600 font-semibold">
            <TrendingDown size={14} /> 32% improvement since programme start
          </div>
        </Card>
      </div>

      <Card title="Facility performance league" subtitle="Referral completion, response time and citizen satisfaction">
        <Table headers={["Facility", "District", "Referrals", "Completion", "Avg. response", "Complaints", "Satisfaction"]}>
          {[...FACILITIES].sort((a, b) => b.satisfaction - a.satisfaction).map((f) => (
            <tr key={f.id} className="hover:bg-hv-50/30">
              <Td><b className="text-gray-900">{f.name}</b>{f.oneStopCentre && <Badge tone="purple" className="ml-2">OSC</Badge>}</Td>
              <Td className="text-xs capitalize">{f.district}</Td>
              <Td>{f.referralsReceived}</Td>
              <Td>
                <span className="inline-flex items-center gap-2">
                  <span className="w-16 bg-gray-100 rounded-full h-1.5"><span className="block h-1.5 rounded-full bg-hv-500" style={{ width: `${(f.referralsCompleted / f.referralsReceived) * 100}%` }} /></span>
                  <span className="text-xs font-semibold">{Math.round((f.referralsCompleted / f.referralsReceived) * 100)}%</span>
                </span>
              </Td>
              <Td className={cn("text-xs font-semibold", f.avgResponseHrs > 20 ? "text-rose-600" : "text-emerald-600")}>{f.avgResponseHrs} hrs</Td>
              <Td className="text-xs">{f.complaintCount}</Td>
              <Td><Badge tone={f.satisfaction > 80 ? "green" : f.satisfaction > 65 ? "amber" : "red"}>{f.satisfaction}%</Badge></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ── Complaints ──────────────────────────────────────────────────────────────
function Complaints() {
  const hv = useHV();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [actions, setActions] = useState<Record<string, string>>({});
  const PER = 12;

  const filtered = useMemo(
    () => COMPLAINTS.filter((c) =>
      (status === "All" || (actions[c.id] ?? c.status) === status) &&
      (cat === "All" || c.category === cat) &&
      (q === "" || c.id.toLowerCase().includes(q.toLowerCase()) || c.summary.toLowerCase().includes(q.toLowerCase()))
    ),
    [q, status, cat, actions]
  );
  const pageItems = filtered.slice(page * PER, (page + 1) * PER);

  return (
    <div>
      <PageTitle title="Citizen complaints" subtitle={`${COMPLAINTS.length.toLocaleString()} complaints received · ${KPIS.escalatedComplaints} currently escalated`} />
      <Card>
        <div className="flex flex-wrap gap-2.5 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <Input placeholder="Search ID or description…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className="!pl-9" />
          </div>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className="!w-auto">
            {["All", "New", "Assigned", "In progress", "Escalated", "Resolved"].map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }} className="!w-auto">
            <option>All</option>
            {["Service denied", "Medicine stockout", "Delayed care", "Police misconduct", "Advocate unavailable", "Facility conditions", "Other"].map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <Table headers={["ID", "Category", "Summary", "Location", "Channel", "Age", "Status", "Officer"]}>
          {pageItems.map((c) => (
            <tr key={c.id} className="hover:bg-hv-50/40 cursor-pointer" onClick={() => setSelected(c)}>
              <Td className="text-xs font-semibold text-hv-700">{c.id}</Td>
              <Td className="text-xs">{c.category}</Td>
              <Td className="text-xs max-w-[260px]"><span className="line-clamp-1">{c.summary}</span></Td>
              <Td className="text-xs capitalize">{c.district} · {c.ta}</Td>
              <Td><Badge tone={c.channel === "USSD" ? "purple" : c.channel === "SMS" ? "green" : "blue"}>{c.channel}</Badge></Td>
              <Td className={cn("text-xs font-semibold", c.daysOpen > 7 && (actions[c.id] ?? c.status) !== "Resolved" ? "text-rose-600" : "text-gray-500")}>{c.daysOpen}d</Td>
              <Td><Badge tone={statusTone(actions[c.id] ?? c.status)}>{actions[c.id] ?? c.status}</Badge></Td>
              <Td className="text-xs">{c.assignedTo ?? "—"}</Td>
            </tr>
          ))}
        </Table>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <p className="text-xs text-gray-400">{filtered.length.toLocaleString()} complaints · page {page + 1} of {Math.max(Math.ceil(filtered.length / PER), 1)}</p>
          <div className="flex gap-2">
            <Btn size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Btn>
            <Btn size="sm" variant="outline" disabled={(page + 1) * PER >= filtered.length} onClick={() => setPage(page + 1)}>Next</Btn>
          </div>
        </div>
      </Card>

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={`Complaint ${selected.id}`}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(actions[selected.id] ?? selected.status)}>{actions[selected.id] ?? selected.status}</Badge>
              <Badge tone="gray">{selected.category}</Badge>
              <Badge tone={selected.channel === "USSD" ? "purple" : "blue"}>{selected.channel}</Badge>
              {selected.daysOpen > 7 && (actions[selected.id] ?? selected.status) !== "Resolved" && <Badge tone="red">SLA breach — {selected.daysOpen} days</Badge>}
            </div>
            <p className="text-sm text-gray-800 bg-gray-50 rounded-2xl p-4">{selected.summary}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Location</p>
                <p className="font-semibold text-gray-900 mt-0.5 capitalize">{selected.district} · TA {selected.ta}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Facility</p>
                <p className="font-semibold text-gray-900 mt-0.5">{selected.facilityId ? facilityById(selected.facilityId).name : "Not facility-specific"}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Submitted</p>
                <p className="font-semibold text-gray-900 mt-0.5">{relDays(selected.submittedAt)}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Assigned officer</p>
                <p className="font-semibold text-gray-900 mt-0.5">{selected.assignedTo ?? "Unassigned"}</p>
              </div>
            </div>
            {/* Timeline */}
            <div className="space-y-2">
              {[
                [`Submitted anonymously via ${selected.channel}`, fmtDateShort(selected.submittedAt)],
                ...(selected.assignedTo ? [[`Assigned to ${selected.assignedTo}`, fmtDateShort(new Date(selected.submittedAt.getTime() + 86400000))]] : []),
                ...((actions[selected.id] ?? selected.status) === "Escalated" ? [["Auto-escalated — 7-day SLA exceeded", fmtDateShort(new Date(selected.submittedAt.getTime() + 7 * 86400000))]] : []),
                ...(selected.resolvedAt ? [["Resolution recorded · reporter notified via tracking ID", fmtDateShort(selected.resolvedAt)]] : []),
              ].map(([t, d]) => (
                <div key={t as string} className="flex items-center gap-3 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-hv-500 shrink-0" />
                  <span className="text-gray-700 flex-1">{t}</span>
                  <span className="text-gray-400">{d}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(actions[selected.id] ?? selected.status) === "New" && (
                <Btn size="sm" onClick={() => { setActions((a) => ({ ...a, [selected.id]: "Assigned" })); hv.showToast(`${selected.id} assigned to D. Kachingwe`); }}>Assign to officer</Btn>
              )}
              {(actions[selected.id] ?? selected.status) !== "Resolved" && (
                <>
                  <Btn size="sm" variant="outline" onClick={() => { setActions((a) => ({ ...a, [selected.id]: "Escalated" })); hv.showToast(`${selected.id} escalated to Regional Health Office`); }}>
                    <ArrowUpRight size={13} /> Escalate
                  </Btn>
                  <Btn size="sm" variant="success" onClick={() => { setActions((a) => ({ ...a, [selected.id]: "Resolved" })); hv.showToast(`${selected.id} marked resolved — reporter notified`); }}>
                    <CheckCircle2 size={13} /> Mark resolved
                  </Btn>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Analytics ───────────────────────────────────────────────────────────────
function Analytics() {
  const [district, setDistrict] = useState("all");
  const [range, setRange] = useState("6");
  const months = MONTHLY_TRENDS.slice(12 - parseInt(range));
  const survivors = district === "all" ? SURVIVORS : SURVIVORS.filter((s) => s.district === district);
  return (
    <div>
      <PageTitle title="Analytics" subtitle="Business-intelligence view across the pilot" />
      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Filter size={15} className="text-gray-400" />
          <Select value={range} onChange={(e) => setRange(e.target.value)} className="!w-auto">
            <option value="3">Last 3 months</option><option value="6">Last 6 months</option><option value="12">Last 12 months</option>
          </Select>
          <Select value={district} onChange={(e) => setDistrict(e.target.value)} className="!w-auto">
            <option value="all">All districts</option>
            {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select className="!w-auto"><option>All facilities</option>{FACILITIES.map((f) => <option key={f.id}>{f.name}</option>)}</Select>
          <Select className="!w-auto"><option>All violence types</option>{VIOLENCE_TYPES.map((v) => <option key={v}>{v}</option>)}</Select>
          <Select className="!w-auto"><option>All outcomes</option><option>Completed</option><option>In progress</option><option>Declined</option></Select>
        </div>
      </Card>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Survivor reports by month" subtitle="With referral conversion">
          <LineChart
            labels={months.map((m) => m.label)}
            series={[
              { name: "Reports", values: months.map((m) => m.reports), color: "#7B61C8" },
              { name: "Referrals", values: months.map((m) => m.referrals), color: "#38BDF8" },
            ]}
          />
        </Card>
        <Card title="Violence type distribution" subtitle={`${survivors.length} cases in scope`}>
          <DonutChart centerLabel="cases" data={countBy(survivors, (s) => s.violenceType).map((d) => ({ label: d.label, value: d.value }))} />
        </Card>
        <Card title="Reporting channels" subtitle="How survivors reach HerVoice!">
          <BarChart data={countBy(survivors, (s) => s.channel)} color="#3E2A78" height={200} />
        </Card>
        <Card title="Programme health" subtitle="Key ratios this quarter">
          <div className="grid grid-cols-2 gap-5">
            {[
              { pct: 78, label: "Referral completion", color: "#10B981" },
              { pct: 83, label: "Voucher redemption", color: "#7B61C8" },
              { pct: 61, label: "Complaints resolved ≤7 days", color: "#38BDF8" },
              { pct: 92, label: "Survivor consent to services", color: "#F59E0B" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <ProgressRing pct={r.pct} color={r.color} />
                <p className="text-xs font-medium text-gray-600 leading-snug">{r.label}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Age profile of survivors" subtitle="Highlights adolescent burden" className="lg:col-span-2">
          <BarChart
            height={190}
            data={[
              { label: "14–17", value: survivors.filter((s) => s.age < 18).length },
              { label: "18–24", value: survivors.filter((s) => s.age >= 18 && s.age < 25).length },
              { label: "25–34", value: survivors.filter((s) => s.age >= 25 && s.age < 35).length },
              { label: "35–44", value: survivors.filter((s) => s.age >= 35 && s.age < 45).length },
              { label: "45+", value: survivors.filter((s) => s.age >= 45).length },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

// ── AI Assistant ────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What are the major problems this month?",
  "Which facilities have delayed responses?",
  "Which areas require attention?",
  "Summarise unresolved complaints",
  "Generate an executive report",
];
const AI_ANSWERS: Array<[RegExp, string]> = [
  [/problem|major|month/i,
`**Top issues — July 2026 (first 13 days):**

1. **PEP stockouts (Thyolo)** — 23 complaints, concentrated at Khonjeni HC and Chimaliro HC. This is the single largest driver of unresolved complaints this month.
2. **Rising response times in TA Kampingo Sibande (Mzimba)** — median first contact is 41 hrs against a district median of 18.4 hrs, linked to advocate leave coverage.
3. **Police / VSU conduct** — 11 complaints alleging informal payments at case registration; 4 escalated to the Regional Office.

Overall complaint volume is up 12% month-on-month, but resolution within SLA has improved to 61% (from 52% in June).`],
  [/facilit(y|ies).*(delay|response)|delay.*facilit/i,
`**Facilities with the slowest referral response (30-day median):**

| Facility | Median acceptance | Trend |
|---|---|---|
| Kafukule Health Centre | 34.2 hrs | ▲ worsening |
| Chimaliro Health Centre | 29.8 hrs | ▲ worsening |
| Manyamula Health Centre | 24.1 hrs | ▬ stable |

For comparison, both district hospitals accept referrals in **under 4 hrs**. The three flagged facilities share two features: no One-Stop Centre and a single clinician covering OPD. Recommend task-shifting authorisation and a weekend on-call roster.`],
  [/area|district|attention|where/i,
`**Areas requiring attention this week:**

- **TA Kampingo Sibande (Mzimba)** — response-time SLA breaches ×6; advocate coverage down 40% due to leave.
- **TA Khonjeni (Thyolo)** — PEP stockout at the health centre for 3 consecutive days; nearest alternative is 17 km away.
- **TA Thekerani (Thyolo)** — complaint volume up 60% w/w, driven by facility-conditions reports after roof damage at the rural hospital.

The heat map on the Overview page reflects all three hotspots. I can draft reassignment or redistribution memos if helpful.`],
  [/unresolved|summar/i,
`**Unresolved complaints — snapshot (13 Jul 2026):**

- **Open total:** ${1000 - 600} complaints (${Math.round(((1000 - 600) / 1000) * 100)}% of all-time volume)
- **Escalated:** 80, of which **12 are breaching the 7-day SLA** — mostly medicine stockouts (Thyolo) and police-conduct cases (both districts)
- **Oldest open case:** CMP-10517 (Police misconduct, TA Mbelwa) — 38 days, awaiting Regional Office review

61% of complaints filed this quarter were resolved within 7 days, a 9-point improvement over Q1. The main bottleneck is items requiring action outside the health sector (police, judiciary).`],
  [/executive|report|generate/i,
`**Executive summary — HerVoice! pilot, July 2026**

**Reach.** 200 survivors supported to date across Thyolo and Mzimba; 340 referrals created, 78% completed. 120 transport vouchers issued (83% redeemed), removing the single most cited barrier to care.

**Speed.** Median report-to-first-contact time is **18.4 hrs, down 32%** since programme start. Voucher-assisted referrals complete 2.1 days faster than unassisted ones.

**Accountability.** 1,000 citizen complaints received — 60% resolved, with automatic 7-day escalation. Complaint data directly triggered a PEP stock redistribution and a VSU conduct review this quarter.

**Risks.** Commodity stockouts and advocate leave coverage remain the top operational risks; both are visible in real time on the Overview dashboard.

*Use Reports → Monthly report to export this as a formatted PDF.*`],
];

function AiAssistant() {
  const [messages, setMessages] = useState<Array<{ me: boolean; text: string }>>([
    { me: false, text: "Hello Dorothy 👋 I'm the HerVoice! intelligence assistant. Ask me about complaints, response times, facility performance or programme trends — or pick a suggestion below." },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMessages((m) => [...m, { me: true, text: q }]);
    setDraft("");
    setThinking(true);
    const answer = AI_ANSWERS.find(([re]) => re.test(q))?.[1] ??
      "I analysed the current pilot data but couldn't map that question to a metric I track. Try asking about complaints, response times, facilities, districts or an executive report.";
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, { me: false, text: answer }]);
    }, 1400);
  };

  // Minimal markdown-ish renderer (bold + tables + lists)
  const render = (text: string) =>
    text.split("\n").map((line, i) => {
      const bold = (s: string) =>
        s.split(/\*\*(.+?)\*\*/g).map((part, j) => (j % 2 === 1 ? <b key={j} className="text-gray-900">{part}</b> : part));
      if (line.startsWith("|")) {
        return <p key={i} className="font-mono text-[11px] text-gray-600 whitespace-pre">{line}</p>;
      }
      if (/^\d+\.\s/.test(line) || line.startsWith("- ")) {
        return <p key={i} className="pl-3 py-0.5">{bold(line)}</p>;
      }
      if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
        return <p key={i} className="text-[11px] text-gray-400 italic pt-1">{line.replaceAll("*", "")}</p>;
      }
      return <p key={i} className={line === "" ? "h-2" : "py-0.5"}>{bold(line)}</p>;
    });

  return (
    <div className="max-w-3xl mx-auto">
      <PageTitle title="AI decision support" subtitle="Natural-language answers grounded in live pilot data" />
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-hv-900 to-hv-700 text-white">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"><Bot size={18} /></div>
          <div>
            <p className="text-sm font-bold">HerVoice Intelligence</p>
            <p className="text-[11px] text-hv-200">Grounded in pilot data · answers cite live metrics · demo model</p>
          </div>
        </div>
        <div className="p-5 space-y-4 h-[420px] overflow-y-auto bg-[#FBFAFE]">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.me ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                m.me ? "bg-hv-700 text-white rounded-br-md" : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-md")}>
                {m.me ? m.text : render(m.text)}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
                <span className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-hv-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="px-4 pt-3 pb-1 flex gap-2 flex-wrap border-t border-gray-100 bg-white">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)}
              className="text-[11px] font-medium text-hv-700 bg-hv-50 hover:bg-hv-100 px-3 py-1.5 rounded-full transition">
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 p-3 bg-white">
          <Input placeholder="Ask about the pilot data…" value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(draft)} className="!rounded-full" />
          <Btn size="sm" className="!rounded-full !px-3.5" onClick={() => ask(draft)}><Send size={15} /></Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Reports ─────────────────────────────────────────────────────────────────
function Reports({ openMonthly }: { openMonthly: () => void }) {
  const hv = useHV();
  const REPORTS = [
    { t: "Monthly district report — June 2026", d: "KPIs, complaint analysis, facility league, programme narrative", type: "PDF", act: openMonthly },
    { t: "Referral register — Q2 2026", d: "Line-listed referrals with outcomes (de-identified)", type: "Excel", act: () => hv.showToast("Excel export generated — referral_register_Q2.xlsx") },
    { t: "Facility performance pack — June 2026", d: "One page per facility for supervision visits", type: "PDF", act: () => hv.showToast("PDF pack generated (12 facilities)") },
    { t: "Complaint SLA report — June 2026", d: "Resolution times, escalations and breaches by category", type: "Excel", act: () => hv.showToast("Excel export generated — complaint_sla_june.xlsx") },
    { t: "Donor results framework extract — Q2 2026", d: "Indicator table mapped to the programme logframe", type: "Excel", act: () => hv.showToast("Excel export generated — logframe_Q2.xlsx") },
    { t: "Transport voucher reconciliation — June 2026", d: "Issued vs redeemed vs reimbursed, by operator", type: "PDF", act: () => hv.showToast("PDF generated — voucher_reconciliation_june.pdf") },
  ];
  return (
    <div>
      <PageTitle title="Reports" subtitle="Generated from live data — export as PDF or Excel" />
      <div className="grid sm:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <Card key={r.t} className="hover:border-hv-200 transition">
            <div className="flex items-start gap-3.5">
              <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                r.type === "PDF" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                <FileText size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{r.t}</p>
                <p className="text-xs text-gray-500 mt-1">{r.d}</p>
                <Btn size="sm" variant="outline" className="mt-3" onClick={r.act}>
                  <Download size={13} /> Export {r.type}
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Monthly report modal ────────────────────────────────────────────────────
function MonthlyReport({ open, onClose }: { open: boolean; onClose: () => void }) {
  const hv = useHV();
  return (
    <Modal open={open} onClose={onClose} title="Monthly district report — June 2026" wide>
      <div className="border border-gray-100 rounded-2xl p-6 sm:p-8 bg-white">
        <div className="flex items-start justify-between pb-5 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-hv-600">HerVoice! · Ministry of Gender · Astellic</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">GBV Response & Accountability Report</h2>
            <p className="text-xs text-gray-400 mt-1">Thyolo & Mzimba districts · June 2026 · Generated 13 Jul 2026</p>
          </div>
          <Badge tone="purple">OFFICIAL</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-gray-100">
          {[["31", "new survivor reports"], ["27", "referrals completed"], ["148", "complaints received"], ["61%", "resolved within SLA"]].map(([v, l]) => (
            <div key={l}><p className="text-2xl font-bold text-hv-800">{v}</p><p className="text-[11px] text-gray-500">{l}</p></div>
          ))}
        </div>
        <div className="py-5 space-y-3 text-sm text-gray-700 leading-relaxed">
          <p><b className="text-gray-900">1. Summary.</b> June saw continued growth in reporting through USSD channels (up 18%), reflecting the community-radio awareness campaign in TA Mbelwa. Median response time held at 19.1 hrs despite a 12% rise in case volume.</p>
          <p><b className="text-gray-900">2. Accountability.</b> Citizen complaints identified a PEP stockout cluster in Thyolo eight days before routine LMIS reporting; 428 doses were redistributed as a direct result. Four police-conduct complaints were escalated to the Regional Office.</p>
          <p><b className="text-gray-900">3. Recommendations.</b> (i) Approve weekend on-call roster for the three lowest-performing health centres; (ii) extend advocate coverage in TA Kampingo Sibande; (iii) formalise the complaint-to-LMIS stock alert workflow.</p>
        </div>
        <p className="text-[10px] text-gray-300 pt-3 border-t border-gray-50">Page 1 of 9 · Confidential — all survivor data de-identified · HerVoice! v2.6</p>
      </div>
      <div className="flex gap-2.5 mt-5">
        <Btn className="flex-1" onClick={() => hv.showToast("PDF downloaded — district_report_june_2026.pdf")}><Download size={15} /> Download PDF</Btn>
        <Btn variant="outline" className="flex-1" onClick={() => hv.showToast("Report emailed to District Executive Committee")}>Email to DEC</Btn>
      </div>
    </Modal>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function DistrictPortal() {
  const [view, setView] = useState("overview");
  const [district, setDistrict] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const nav = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={17} /> },
    { id: "complaints", label: "Complaints", icon: <MessageSquareWarning size={17} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={17} /> },
    { id: "ai", label: "AI assistant", icon: <Sparkles size={17} /> },
    { id: "reports", label: "Reports", icon: <FileDown size={17} /> },
  ];
  return (
    <Shell role="district" nav={nav} active={view} onNavigate={setView}>
      {view === "overview" && <Overview district={district} setDistrict={setDistrict} exportReport={() => setReportOpen(true)} />}
      {view === "complaints" && <Complaints />}
      {view === "analytics" && <Analytics />}
      {view === "ai" && <AiAssistant />}
      {view === "reports" && <Reports openMonthly={() => setReportOpen(true)} />}
      <MonthlyReport open={reportOpen} onClose={() => setReportOpen(false)} />
    </Shell>
  );
}
