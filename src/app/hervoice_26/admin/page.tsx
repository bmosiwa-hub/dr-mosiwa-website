"use client";

// HerVoice! — System Administration
import React, { useState } from "react";
import {
  Users, Building2, Settings, ScrollText, KeyRound, Plus, Search,
  MessageSquare, Smartphone, Database, ShieldCheck, CheckCircle2, Globe2,
} from "lucide-react";
import { Shell } from "../_components/shell";
import {
  Card, Btn, Badge, statusTone, Modal, Field, Input, Select, Table, Td,
  PageTitle, cn, Avatar, Toggle, Stat,
} from "../_components/ui";
import { useHV } from "../_lib/store";
import { ADVOCATES, FACILITIES, DISTRICTS, AUDIT_LOG, fmtDateShort, fmtTime } from "../_lib/data";

// ── Users ───────────────────────────────────────────────────────────────────
function UsersView() {
  const hv = useHV();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const USERS = [
    { name: "Dorothy Kachingwe", role: "District Officer", district: "Thyolo", status: "Active", last: "Today 08:12" },
    { name: "Stanley Mwanza", role: "District Officer", district: "Mzimba", status: "Active", last: "Today 07:55" },
    ...ADVOCATES.slice(0, 8).map((a, i) => ({
      name: a.name, role: "Advocate", district: a.district === "thyolo" ? "Thyolo" : "Mzimba",
      status: a.status === "Active" ? "Active" : "Suspended", last: i < 4 ? "Today" : "Yesterday",
    })),
    { name: "Thyolo District Hospital", role: "Facility", district: "Thyolo", status: "Active", last: "Today 09:02" },
    { name: "Embangweni Mission Hospital", role: "Facility", district: "Mzimba", status: "Active", last: "Yesterday" },
  ];
  const filtered = USERS.filter((u) =>
    (role === "All" || u.role === role) && (q === "" || u.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <PageTitle title="User management" subtitle={`${234} registered accounts across all roles`}
        action={<Btn size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Add user</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Stat label="Total users" value={234} icon={<Users size={16} />} />
        <Stat label="Advocates" value={30} icon={<Users size={16} />} tone="blue" />
        <Stat label="Facility accounts" value={12} icon={<Building2 size={16} />} tone="green" />
        <Stat label="Pending approval" value={3} icon={<KeyRound size={16} />} tone="amber" />
      </div>
      <Card>
        <div className="flex flex-wrap gap-2.5 mb-5">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <Input placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} className="!pl-9" />
          </div>
          <Select value={role} onChange={(e) => setRole(e.target.value)} className="!w-auto">
            {["All", "District Officer", "Advocate", "Facility"].map((r) => <option key={r}>{r}</option>)}
          </Select>
        </div>
        <Table headers={["User", "Role", "District", "Status", "Last active", ""]}>
          {filtered.map((u) => (
            <tr key={u.name} className="hover:bg-hv-50/30">
              <Td><span className="flex items-center gap-2.5"><Avatar name={u.name} size="sm" /><b className="text-gray-900">{u.name}</b></span></Td>
              <Td className="text-xs">{u.role}</Td>
              <Td className="text-xs">{u.district}</Td>
              <Td><Badge tone={u.status === "Active" ? "green" : "red"}>{u.status}</Badge></Td>
              <Td className="text-xs text-gray-400">{u.last}</Td>
              <Td><Btn size="sm" variant="ghost" onClick={() => hv.showToast(`Editing ${u.name} (simulated)`)}>Edit</Btn></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add user">
        <div className="space-y-4">
          <Field label="Full name"><Input placeholder="e.g. Tamanda Nyirenda" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role"><Select><option>Advocate</option><option>District Officer</option><option>Facility</option><option>Administrator</option></Select></Field>
            <Field label="District"><Select>{DISTRICTS.map((d) => <option key={d.id}>{d.name}</option>)}</Select></Field>
          </div>
          <Field label="Phone (for SMS onboarding)"><Input placeholder="+265 …" /></Field>
          <Btn className="w-full" onClick={() => { setAddOpen(false); hv.showToast("User created — onboarding SMS sent"); }}>Create account</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ── Facilities ──────────────────────────────────────────────────────────────
function FacilitiesView() {
  const hv = useHV();
  return (
    <div>
      <PageTitle title="Facility management" subtitle="12 facilities enrolled across 2 districts"
        action={<Btn size="sm" onClick={() => hv.showToast("Facility enrolment wizard opened (simulated)")}><Plus size={14} /> Enrol facility</Btn>} />
      <Card>
        <Table headers={["Facility", "Type", "District", "One-Stop Centre", "PEP stock", "EC stock", "Status"]}>
          {FACILITIES.map((f) => (
            <tr key={f.id} className="hover:bg-hv-50/30">
              <Td><b className="text-gray-900">{f.name}</b><p className="text-[10px] text-gray-400">{f.phone}</p></Td>
              <Td className="text-xs">{f.type}</Td>
              <Td className="text-xs capitalize">{f.district}</Td>
              <Td>{f.oneStopCentre ? <Badge tone="purple">Yes</Badge> : <Badge>No</Badge>}</Td>
              <Td><Badge tone={statusTone(f.stockPEP)}>{f.stockPEP}</Badge></Td>
              <Td><Badge tone={statusTone(f.stockEC)}>{f.stockEC}</Badge></Td>
              <Td><Badge tone="green">Live</Badge></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ── Districts config ────────────────────────────────────────────────────────
function DistrictsView() {
  const hv = useHV();
  return (
    <div>
      <PageTitle title="District configuration" subtitle="Pilot geography, escalation rules and SLAs" />
      <div className="grid lg:grid-cols-2 gap-4">
        {DISTRICTS.map((d) => (
          <Card key={d.id} title={d.name} subtitle={`${d.region} · population ${(d.population / 1000).toFixed(0)}k`}>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {d.tas.map((t) => <Badge key={t} tone="purple">TA {t}</Badge>)}
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                ["Complaint SLA before auto-escalation", "7 days"],
                ["Urgent referral response target", "4 hours"],
                ["Escalation recipient", d.id === "thyolo" ? "Regional Health Office (South)" : "Regional Health Office (North)"],
                ["Advocates enrolled", d.id === "thyolo" ? "16" : "14"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{k}</span>
                  <span className="text-xs font-bold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <Btn size="sm" variant="outline" className="mt-4" onClick={() => hv.showToast(`${d.name} configuration opened (simulated)`)}>Edit configuration</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── System settings ─────────────────────────────────────────────────────────
function SystemView() {
  const hv = useHV();
  const [s, setS] = useState({ sms: true, ussd: true, offline: true, backup: true, mfa: false });
  const set = (k: keyof typeof s, v: boolean) => { setS((x) => ({ ...x, [k]: v })); hv.showToast("System setting saved"); };
  return (
    <div className="max-w-3xl">
      <PageTitle title="System settings" subtitle="Channels, security and infrastructure" />
      <div className="space-y-4">
        <Card title="SMS gateway" subtitle="Africa's Talking · sender ID: HERVOICE">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Short code"><Input defaultValue="4646" /></Field>
            <Field label="Sender ID"><Input defaultValue="HERVOICE" /></Field>
          </div>
          <div className="flex items-center justify-between mt-4 p-3.5 rounded-2xl bg-gray-50">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={16} className="text-hv-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">SMS channel enabled</p>
                <p className="text-[11px] text-gray-400">14,203 messages sent this month · 99.2% delivery</p>
              </div>
            </div>
            <Toggle checked={s.sms} onChange={(v) => set("sms", v)} />
          </div>
        </Card>
        <Card title="USSD service" subtitle="*384*26# · zero-rated with all three MNOs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50">
            <div className="flex items-center gap-2.5">
              <Smartphone size={16} className="text-hv-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">USSD channel enabled</p>
                <p className="text-[11px] text-gray-400">3 languages · avg session 94 seconds · 41% of all complaints</p>
              </div>
            </div>
            <Toggle checked={s.ussd} onChange={(v) => set("ussd", v)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            {["English", "Chichewa", "Chitumbuka"].map((l) => (
              <div key={l} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100">
                <Globe2 size={14} className="text-hv-500" />
                <span className="text-xs font-semibold text-gray-800">{l}</span>
                <CheckCircle2 size={13} className="text-emerald-500 ml-auto" />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Security & data">
          {[
            { k: "offline" as const, t: "Offline-first sync", d: "Field devices queue encrypted records and sync when connected.", icon: <Database size={15} /> },
            { k: "backup" as const, t: "Nightly encrypted backups", d: "AES-256 at rest · in-country data centre · 30-day retention.", icon: <ShieldCheck size={15} /> },
            { k: "mfa" as const, t: "Enforce MFA for staff accounts", d: "TOTP or SMS one-time codes for district and admin roles.", icon: <KeyRound size={15} /> },
          ].map((o) => (
            <div key={o.k} className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
              <div className="flex gap-3">
                <span className="w-9 h-9 rounded-xl bg-hv-50 text-hv-700 flex items-center justify-center shrink-0">{o.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{o.t}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.d}</p>
                </div>
              </div>
              <Toggle checked={s[o.k]} onChange={(v) => set(o.k, v)} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Permissions matrix ──────────────────────────────────────────────────────
function PermissionsView() {
  const ROLES = ["Survivor", "Advocate", "Facility", "District", "Admin"];
  const PERMS: Array<[string, boolean[]]> = [
    ["Submit incident report", [true, true, false, false, false]],
    ["View own case file", [true, false, false, false, false]],
    ["View assigned cases (de-identified)", [false, true, false, false, false]],
    ["Create referrals", [false, true, false, false, false]],
    ["Accept / close referrals", [false, false, true, false, false]],
    ["Issue transport vouchers", [false, true, false, false, false]],
    ["View identified survivor data", [false, true, true, false, false]],
    ["View aggregate dashboards", [false, true, true, true, true]],
    ["Assign / escalate complaints", [false, false, false, true, true]],
    ["Export reports", [false, false, false, true, true]],
    ["Manage users & configuration", [false, false, false, false, true]],
  ];
  return (
    <div>
      <PageTitle title="Role permissions" subtitle="Privacy-by-design: least-privilege access to survivor data" />
      <Card>
        <Table headers={["Permission", ...ROLES]}>
          {PERMS.map(([perm, flags]) => (
            <tr key={perm} className="hover:bg-hv-50/30">
              <Td className="text-xs font-medium text-gray-800">{perm}</Td>
              {flags.map((f, i) => (
                <Td key={i}>
                  {f ? <CheckCircle2 size={15} className="text-emerald-500" /> : <span className="text-gray-200">—</span>}
                </Td>
              ))}
            </tr>
          ))}
        </Table>
        <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1.5">
          <ShieldCheck size={12} /> District officers see aggregate and de-identified data only. Survivor identity is visible solely to the assigned advocate and treating facility, with survivor consent.
        </p>
      </Card>
    </div>
  );
}

// ── Audit log ───────────────────────────────────────────────────────────────
function AuditView() {
  return (
    <div>
      <PageTitle title="Audit log" subtitle="Every read and write of survivor data is recorded immutably" />
      <Card>
        <Table headers={["Timestamp", "Actor", "Role", "Action", "IP"]}>
          {AUDIT_LOG.map((e) => (
            <tr key={e.id} className="hover:bg-hv-50/30">
              <Td className="text-xs text-gray-400 whitespace-nowrap">{fmtDateShort(e.at)} · {fmtTime(e.at)}</Td>
              <Td className="text-xs font-semibold text-gray-800">{e.actor}</Td>
              <Td><Badge tone={e.role === "System" ? "gray" : e.role === "Administrator" ? "purple" : "blue"}>{e.role}</Badge></Td>
              <Td className="text-xs">{e.action}</Td>
              <Td className="text-[11px] text-gray-400 font-mono">{e.ip}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [view, setView] = useState("users");
  const nav = [
    { id: "users", label: "Users", icon: <Users size={17} /> },
    { id: "facilities", label: "Facilities", icon: <Building2 size={17} /> },
    { id: "districts", label: "Districts", icon: <Settings size={17} /> },
    { id: "system", label: "System settings", icon: <Smartphone size={17} /> },
    { id: "permissions", label: "Permissions", icon: <KeyRound size={17} /> },
    { id: "audit", label: "Audit log", icon: <ScrollText size={17} /> },
  ];
  return (
    <Shell role="admin" nav={nav} active={view} onNavigate={setView}>
      {view === "users" && <UsersView />}
      {view === "facilities" && <FacilitiesView />}
      {view === "districts" && <DistrictsView />}
      {view === "system" && <SystemView />}
      {view === "permissions" && <PermissionsView />}
      {view === "audit" && <AuditView />}
    </Shell>
  );
}
