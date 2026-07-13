"use client";

// HerVoice! — Citizen Portal (anonymous accountability)
import React, { useState } from "react";
import {
  Megaphone, Search, Smartphone, MessageSquare, BookOpen, ChevronRight,
  ChevronLeft, CheckCircle2, ShieldCheck, Send, Copy, Phone,
} from "lucide-react";
import { Shell } from "../_components/shell";
import {
  Card, Btn, Badge, statusTone, Field, Input, Textarea, Select,
  WizardProgress, PageTitle, cn,
} from "../_components/ui";
import { useHV } from "../_lib/store";
import { COMPLAINT_CATEGORIES, DISTRICTS, FACILITIES, COMPLAINTS, relDays, fmtDateShort } from "../_lib/data";

// ── Complaint wizard ────────────────────────────────────────────────────────
const STEPS = ["Category", "Details", "Location", "Review"];
function ComplaintWizard() {
  const hv = useHV();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ category: "", details: "", district: "thyolo", ta: "", facility: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const district = DISTRICTS.find((d) => d.id === form.district)!;
  const trackingId = "CMP-11507";

  if (submitted) {
    return (
      <Card className="max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={30} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Complaint submitted anonymously</h2>
        <p className="text-sm text-gray-500 mt-2">Save your tracking ID — it's the only way to check progress. No personal details were collected.</p>
        <div className="flex items-center justify-center gap-2.5 mt-5">
          <span className="text-2xl font-bold tracking-widest text-hv-800 bg-hv-50 px-6 py-3 rounded-2xl">{trackingId}</span>
          <Btn variant="outline" size="sm" onClick={() => hv.showToast("Tracking ID copied")}><Copy size={14} /></Btn>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 mt-5 text-left space-y-1.5">
          {[
            "Routed to the District Gender Office within minutes",
            "If unresolved after 7 days it escalates automatically",
            "Check progress any time under “Track complaint”",
          ].map((t) => (
            <p key={t} className="text-xs text-gray-600 flex items-start gap-2"><CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" /> {t}</p>
          ))}
        </div>
        <Btn className="mt-6" onClick={() => { setSubmitted(false); setStep(0); setForm({ category: "", details: "", district: "thyolo", ta: "", facility: "" }); }}>
          Submit another
        </Btn>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageTitle title="Submit a complaint" subtitle="100% anonymous. No name, no phone number, no account." />
      <Card>
        <WizardProgress steps={STEPS} current={step} />
        <div className="mt-7 min-h-[260px]">
          {step === 0 && (
            <Field label="What is the complaint about?">
              <div className="grid sm:grid-cols-2 gap-2 mt-1">
                {COMPLAINT_CATEGORIES.map((c) => (
                  <button key={c} onClick={() => set("category", c)}
                    className={cn("text-left text-sm font-medium px-4 py-3 rounded-xl border transition",
                      form.category === c ? "border-hv-500 bg-hv-50 text-hv-900 ring-2 ring-hv-100" : "border-gray-100 hover:border-hv-200 text-gray-700")}>
                    {c}
                  </button>
                ))}
              </div>
            </Field>
          )}
          {step === 1 && (
            <Field label="Describe what happened" hint="Do not include your name or anyone's phone number. Facts, dates and places help the district act faster.">
              <Textarea placeholder="e.g. On Monday the clinic said there was no emergency medicine and told the family to travel to the district hospital at their own cost…"
                value={form.details} onChange={(e) => set("details", e.target.value)} className="min-h-[140px]" />
            </Field>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="District">
                  <Select value={form.district} onChange={(e) => set("district", e.target.value)}>
                    {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                </Field>
                <Field label="Traditional Authority">
                  <Select value={form.ta} onChange={(e) => set("ta", e.target.value)}>
                    <option value="">Select TA…</option>
                    {district.tas.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Facility involved (optional)">
                <Select value={form.facility} onChange={(e) => set("facility", e.target.value)}>
                  <option value="">Not about a specific facility</option>
                  {FACILITIES.filter((f) => f.district === form.district).map((f) => <option key={f.id}>{f.name}</option>)}
                </Select>
              </Field>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              {[
                ["Category", form.category || "Not selected"],
                ["Details", form.details ? `${form.details.slice(0, 90)}${form.details.length > 90 ? "…" : ""}` : "Not provided"],
                ["Location", `${district.name}${form.ta ? ` · TA ${form.ta}` : ""}`],
                ["Facility", form.facility || "—"],
                ["Your identity", "Not collected — anonymous by design"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-medium text-gray-400 shrink-0">{k}</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-50">
          <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft size={15} /> Back</Btn>
          {step < STEPS.length - 1 ? (
            <Btn onClick={() => setStep(step + 1)} disabled={step === 0 && !form.category}>Continue <ChevronRight size={15} /></Btn>
          ) : (
            <Btn variant="success" onClick={() => setSubmitted(true)}><Send size={15} /> Submit anonymously</Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Track complaint ─────────────────────────────────────────────────────────
function Track() {
  const [id, setId] = useState("");
  const [found, setFound] = useState<null | typeof COMPLAINTS[0]>(null);
  const [searched, setSearched] = useState(false);
  const search = () => {
    const c = COMPLAINTS.find((x) => x.id.toLowerCase() === id.trim().toLowerCase()) ?? (id.trim() !== "" ? COMPLAINTS[6] : null);
    setFound(c);
    setSearched(true);
  };
  return (
    <div className="max-w-xl mx-auto">
      <PageTitle title="Track a complaint" subtitle="Enter the tracking ID you received when submitting." />
      <Card>
        <div className="flex gap-2">
          <Input placeholder="e.g. CMP-10507" value={id} onChange={(e) => setId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
          <Btn onClick={search}><Search size={15} /></Btn>
        </div>
        {searched && found && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">{found.id}</p>
              <Badge tone={statusTone(found.status)}>{found.status}</Badge>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-2xl p-4">{found.summary}</p>
            <div className="space-y-0">
              {[
                { t: `Received via ${found.channel}`, d: fmtDateShort(found.submittedAt), done: true },
                { t: "Routed to District Gender Office", d: fmtDateShort(found.submittedAt), done: true },
                { t: found.assignedTo ? `Assigned to duty officer` : "Awaiting assignment", d: "", done: !!found.assignedTo },
                { t: found.status === "Escalated" ? "Escalated — 7-day SLA exceeded" : "Escalates automatically after 7 days", d: "", done: found.status === "Escalated" },
                { t: found.resolvedAt ? "Resolved" : "Resolution pending", d: found.resolvedAt ? fmtDateShort(found.resolvedAt) : "", done: !!found.resolvedAt },
              ].map((e, i, arr) => (
                <div key={i} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                      e.done ? "bg-hv-700 text-white" : "bg-gray-100 text-gray-300")}>
                      <CheckCircle2 size={12} />
                    </span>
                    {i < arr.length - 1 && <span className={cn("w-px flex-1 my-0.5", e.done ? "bg-hv-300" : "bg-gray-100")} />}
                  </div>
                  <div className="pb-4">
                    <p className={cn("text-sm", e.done ? "font-semibold text-gray-800" : "text-gray-400")}>{e.t}</p>
                    {e.d && <p className="text-[11px] text-gray-400">{e.d}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {searched && !found && <p className="text-sm text-gray-400 text-center mt-6">Enter a tracking ID to see its progress.</p>}
      </Card>
    </div>
  );
}

// ── USSD simulator ──────────────────────────────────────────────────────────
const USSD_FLOW: Record<string, { text: string; opts?: string[] }> = {
  start: { text: "HerVoice! — Mawu Anu\n\n1. Report a concern (anonymous)\n2. Track my complaint\n3. GBV help for me or someone\n4. Language / Chinenero", opts: ["1", "2", "3", "4"] },
  "1": { text: "Select concern:\n\n1. Denied service\n2. No medicine\n3. Long delays\n4. Police conduct\n5. No advocate\n6. Other", opts: ["1", "2", "3", "4", "5", "6"] },
  "1-2": { text: "Which district?\n\n1. Thyolo\n2. Mzimba", opts: ["1", "2"] },
  "1-2-1": { text: "Reply with facility number:\n\n1. Thyolo District Hosp\n2. Malamulo Mission\n3. Thekerani Rural\n4. Bvumbwe HC\n5. Khonjeni HC\n6. Other/skip", opts: ["1", "2", "3", "4", "5", "6"] },
  done: { text: "Zikomo! Complaint received.\n\nTracking ID: CMP-11508\n\nYou will NOT be identified. Dial *384*26# option 2 to track. SLA: 7 days." },
  "2": { text: "Enter tracking ID via SMS to 4646, or dial with ID:\n\nExample: *384*26*CMP10507#\n\nStatus lookups are free." },
  "3": { text: "If you or someone is in danger:\n\n📞 Call 5600 (free, 24hrs)\n\nAn advocate can meet you at a safe place. Reply 1 to request a call back.", opts: ["1"] },
  "3-1": { text: "Request received. A trained advocate will call this number within 1 hour from a private number.\n\nDelete this session for your safety: your dial history shows only *384*26#." },
  "4": { text: "Sankhani chinenero:\n\n1. English\n2. Chichewa\n3. Chitumbuka", opts: ["1", "2", "3"] },
  "4-2": { text: "Chinenero chasinthidwa kupita ku Chichewa.\n\nImbaninso *384*26# kuti muyambe." },
};
function UssdSim() {
  const [path, setPath] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [dialled, setDialled] = useState(false);
  const key = path.length === 0 ? "start" : path.join("-");
  const node = USSD_FLOW[key] ?? USSD_FLOW["done"];
  const send = () => {
    if (!input.trim()) return;
    const next = [...path, input.trim()];
    setPath(USSD_FLOW[next.join("-")] ? next : path.length >= 2 ? ["done"] : USSD_FLOW[next[0]] ? next : ["done"]);
    setInput("");
  };
  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-gray-900 rounded-[2.4rem] p-3 shadow-2xl">
        <div className="bg-gray-800 rounded-[2rem] overflow-hidden">
          <div className="h-7 flex items-center justify-center">
            <div className="w-20 h-4 bg-gray-900 rounded-full" />
          </div>
          <div className="bg-[#0F172A] min-h-[420px] p-5 flex flex-col">
            {!dialled ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Phone size={28} className="text-gray-500 mb-4" />
                <p className="text-gray-300 text-2xl font-mono tracking-wider">*384*26#</p>
                <p className="text-gray-500 text-xs mt-2">Works on any phone — no internet needed</p>
                <button onClick={() => setDialled(true)}
                  className="mt-8 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition">
                  <Phone size={22} className="text-white" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-xl p-4 text-[13px] leading-relaxed text-gray-900 whitespace-pre-line font-mono shadow-inner">
                    {node.text}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {node.opts ? (
                    <>
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        placeholder="Reply…"
                        className="flex-1 bg-gray-800 text-gray-100 text-sm rounded-xl px-4 py-2.5 outline-none border border-gray-700 focus:border-hv-500"
                      />
                      <button onClick={send} className="px-4 rounded-xl bg-hv-600 hover:bg-hv-500 text-white text-sm font-semibold transition">Send</button>
                    </>
                  ) : (
                    <button onClick={() => { setPath([]); setDialled(false); }}
                      className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition">
                      End session
                    </button>
                  )}
                </div>
                {node.opts && (
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {node.opts.map((o) => (
                      <button key={o} onClick={() => { setInput(o); }}
                        className="w-9 h-9 rounded-lg bg-gray-800 text-gray-200 text-sm font-bold hover:bg-hv-700 transition">{o}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">
        Interactive USSD simulation — identical menus run on live MNO gateways, zero-rated for callers.
      </p>
    </div>
  );
}

// ── SMS simulator ───────────────────────────────────────────────────────────
function SmsSim() {
  const [messages, setMessages] = useState<Array<{ me: boolean; text: string }>>([
    { me: false, text: "HerVoice!: Text your concern to this number (4646). Free & anonymous. Start with the word REPORT. Example: REPORT no medicine at Khonjeni clinic" },
  ]);
  const [draft, setDraft] = useState("");
  const send = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setMessages((m) => [...m, { me: true, text }]);
    setDraft("");
    setTimeout(() => {
      const reply = /^report/i.test(text)
        ? "Zikomo! Complaint received & routed to the District Gender Office.\n\nTracking ID: CMP-11509\nReply STATUS CMP-11509 anytime.\nEscalates automatically after 7 days."
        : /^status/i.test(text)
        ? "CMP-11509 — IN PROGRESS\nAssigned: District duty officer\nDay 2 of 7-day SLA.\nYou will receive an SMS when resolved."
        : "Sorry, we didn't understand. Start with REPORT to file a concern or STATUS <ID> to track one. This service is free.";
      setMessages((m) => [...m, { me: false, text: reply }]);
    }, 1100);
  };
  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-gray-900 rounded-[2.4rem] p-3 shadow-2xl">
        <div className="bg-white rounded-[2rem] overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-3.5 flex items-center gap-3 mt-1">
            <div className="w-9 h-9 rounded-full bg-hv-700 text-white flex items-center justify-center text-xs font-bold">HV</div>
            <div>
              <p className="text-sm font-bold text-gray-900">4646 · HerVoice!</p>
              <p className="text-[10px] text-gray-400">Free short code · all networks</p>
            </div>
          </div>
          <div className="p-4 space-y-3 min-h-[340px] max-h-[340px] overflow-y-auto bg-[#F8FAFC]">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.me ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line",
                  m.me ? "bg-hv-600 text-white rounded-br-md" : "bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm")}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder='Try: "REPORT no medicine…"'
              className="flex-1 bg-gray-50 text-sm rounded-full px-4 py-2.5 outline-none border border-gray-100 focus:border-hv-400"
            />
            <button onClick={send} className="w-10 h-10 rounded-full bg-hv-700 hover:bg-hv-600 text-white flex items-center justify-center transition">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">
        Interactive SMS simulation — reply parsing runs on the live gateway with the same keywords.
      </p>
    </div>
  );
}

// ── Awareness ───────────────────────────────────────────────────────────────
function Awareness() {
  const ITEMS = [
    { t: "You have the right to free GBV services", d: "Medical care, counselling and police support after GBV are free at all public facilities. Nobody may charge you.", tag: "Know your rights" },
    { t: "The 72-hour rule can prevent HIV", d: "After sexual violence, reaching a clinic within 72 hours means PEP medicine can prevent HIV. Every hour counts — transport support is available.", tag: "Health" },
    { t: "Reporting helps everyone", d: "Every anonymous complaint builds the picture district officials use to fix stockouts, staffing and misconduct. Your report last month redirected PEP stock to Khonjeni.", tag: "Accountability" },
    { t: "Child marriage is illegal in Malawi", d: "The Marriage Act sets 18 as the minimum age. Report suspected child marriages via *384*26# — community reports triggered 14 interventions this year.", tag: "Know your rights" },
  ];
  return (
    <div>
      <PageTitle title="Community awareness" subtitle="Share these messages at community meetings, markets and radio programmes." />
      <div className="grid sm:grid-cols-2 gap-4">
        {ITEMS.map((i) => (
          <Card key={i.t}>
            <Badge tone={i.tag === "Health" ? "green" : i.tag === "Accountability" ? "purple" : "blue"}>{i.tag}</Badge>
            <h3 className="font-bold text-gray-900 mt-3">{i.t}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{i.d}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function CitizenPortal() {
  const [view, setView] = useState("complaint");
  const nav = [
    { id: "complaint", label: "Submit complaint", icon: <Megaphone size={17} /> },
    { id: "track", label: "Track complaint", icon: <Search size={17} /> },
    { id: "ussd", label: "USSD (*384*26#)", icon: <Smartphone size={17} /> },
    { id: "sms", label: "SMS (4646)", icon: <MessageSquare size={17} /> },
    { id: "awareness", label: "Awareness", icon: <BookOpen size={17} /> },
  ];
  return (
    <Shell role="citizen" nav={nav} active={view} onNavigate={setView}>
      {view === "complaint" && <ComplaintWizard />}
      {view === "track" && <Track />}
      {view === "ussd" && <UssdSim />}
      {view === "sms" && <SmsSim />}
      {view === "awareness" && <Awareness />}
    </Shell>
  );
}
