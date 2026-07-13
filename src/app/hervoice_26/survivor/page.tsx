"use client";

// HerVoice! — Survivor Portal
import React, { useState } from "react";
import {
  LayoutDashboard, FilePlus2, Route, HeartHandshake, BookOpen, ShieldCheck,
  Bus, Calendar, MessageCircle, MapPin, Mic, Camera, FileText, ChevronRight,
  ChevronLeft, CheckCircle2, Lock, Phone, Send, Square, QrCode, Sparkles,
  Clock, Eye, EyeOff, Trash2,
} from "lucide-react";
import { Shell } from "../_components/shell";
import {
  Card, Btn, Badge, statusTone, Modal, Field, Input, Textarea, Select,
  Toggle, WizardProgress, QRCode, PageTitle, cn, Avatar,
} from "../_components/ui";
import { useHV } from "../_lib/store";
import {
  REFERRALS, VOUCHERS, facilityById, fmtDate, fmtDateShort, relDays, daysAhead,
  VIOLENCE_TYPES, DISTRICTS,
} from "../_lib/data";

// The demo survivor's own records (stable slice of mock data)
const MY_REFERRALS = REFERRALS.slice(0, 4).map((r, i) => ({
  ...r,
  status: (["Completed", "In progress", "Accepted", "Pending"] as const)[i],
}));
const MY_VOUCHER = {
  ...VOUCHERS[0],
  status: "Active" as const,
  issuedAt: daysAhead(-1),
  expiresAt: daysAhead(6),
  amountMWK: 7500,
  mode: "Bicycle taxi" as const,
};

// ── Dashboard view ──────────────────────────────────────────────────────────
function Dashboard({ go }: { go: (v: string) => void }) {
  const hv = useHV();
  const [voucherOpen, setVoucherOpen] = useState(false);
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-hv-800 to-hv-600 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <p className="text-hv-200 text-sm font-medium">{hv.t("welcome")}, Hope-013</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Your space. Your pace. Your voice.</h1>
        <p className="text-hv-100 text-sm mt-3 max-w-lg leading-relaxed">{hv.t("youAreSafe")}</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Btn className="!bg-white !text-hv-900 hover:!bg-hv-50" onClick={() => go("report")}>
            <FilePlus2 size={16} /> {hv.t("reportIncident")}
          </Btn>
          <Btn variant="ghost" className="!text-white hover:!bg-white/10 border border-white/25" onClick={() => go("support")}>
            <MessageCircle size={16} /> Chat with my advocate
          </Btn>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Case card */}
        <Card title="My case" subtitle="HV-2026-0013">
          <div className="flex items-center justify-between">
            <Badge tone="purple">In referral</Badge>
            <Badge tone="green"><Lock size={10} /> Evidence encrypted</Badge>
          </div>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5 text-gray-600">
              <Avatar name="Chisomo Banda" size="sm" />
              <div>
                <p className="font-semibold text-gray-900 text-xs">Chisomo Banda</p>
                <p className="text-[11px] text-gray-400">Your advocate · TA Bvumbwe</p>
              </div>
              <button onClick={() => go("support")} className="ml-auto text-hv-600 hover:text-hv-800"><MessageCircle size={16} /></button>
            </div>
          </div>
          <Btn variant="secondary" size="sm" className="w-full mt-4" onClick={() => go("referrals")}>
            View case timeline <ChevronRight size={13} />
          </Btn>
        </Card>

        {/* Next appointment */}
        <Card title="Upcoming follow-up">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-hv-50 text-hv-700 flex flex-col items-center justify-center shrink-0">
              <span className="text-base font-bold leading-none">{daysAhead(2).getDate()}</span>
              <span className="text-[9px] font-semibold uppercase">Jul</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Counselling session</p>
              <p className="text-xs text-gray-500 mt-0.5">Thyolo District Hospital · One-Stop Centre</p>
              <p className="text-xs text-gray-400 mt-1 inline-flex items-center gap-1"><Clock size={11} /> 09:00 – 10:00</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Btn size="sm" variant="secondary" className="flex-1" onClick={() => hv.showToast("Reminder set — you'll receive an SMS the evening before")}>Remind me</Btn>
            <Btn size="sm" variant="outline" className="flex-1" onClick={() => hv.showToast("Reschedule request sent to your advocate")}>Reschedule</Btn>
          </div>
        </Card>

        {/* Voucher */}
        <Card title="Transport voucher" subtitle={MY_VOUCHER.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">MWK {MY_VOUCHER.amountMWK.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Valid until {fmtDateShort(MY_VOUCHER.expiresAt)} · {MY_VOUCHER.mode}</p>
            </div>
            <Badge tone="green">Active</Badge>
          </div>
          <Btn size="sm" className="w-full mt-4" onClick={() => setVoucherOpen(true)}>
            <QrCode size={14} /> Show QR code
          </Btn>
        </Card>
      </div>

      {/* Referral status strip */}
      <Card title="Referral progress" subtitle="Your active referral — Thyolo District Hospital"
        action={<Btn size="sm" variant="ghost" onClick={() => go("referrals")}>All referrals <ChevronRight size={13} /></Btn>}>
        <div className="flex items-center gap-1">
          {["Reported", "Advocate assigned", "Referral sent", "Facility accepted", "Care received"].map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center",
                  i < 4 ? "bg-hv-700 text-white" : "bg-gray-100 text-gray-400 ring-4 ring-hv-50")}>
                  {i < 4 ? <CheckCircle2 size={14} /> : <Clock size={13} />}
                </div>
                <span className={cn("text-[10px] mt-1.5 text-center font-medium leading-tight", i < 4 ? "text-hv-800" : "text-gray-400")}>{s}</span>
              </div>
              {i < 4 && <div className={cn("flex-1 h-0.5 mb-5 rounded", i < 3 ? "bg-hv-600" : "bg-gray-100")} />}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Quick actions">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: <FilePlus2 size={16} />, label: hv.t("reportIncident"), act: () => go("report") },
              { icon: <Bus size={16} />, label: "Request transport", act: () => hv.showToast("Transport request sent to your advocate") },
              { icon: <HeartHandshake size={16} />, label: hv.t("peerSupport"), act: () => go("support") },
              { icon: <BookOpen size={16} />, label: hv.t("resources"), act: () => go("resources") },
            ].map((a) => (
              <button key={a.label} onClick={a.act}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-gray-100 hover:border-hv-300 hover:bg-hv-50/50 transition text-left">
                <span className="w-9 h-9 rounded-xl bg-hv-50 text-hv-700 flex items-center justify-center shrink-0">{a.icon}</span>
                <span className="text-xs font-semibold text-gray-800">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card title="Recent updates">
          <div className="space-y-3">
            {[
              ["Your referral was accepted by Thyolo District Hospital", "Today"],
              ["Chisomo (advocate) added a visit note to your case", "Yesterday"],
              ["Transport voucher TV-4200 issued — MWK 7,500", "Yesterday"],
              ["Counselling follow-up scheduled for 15 Jul", "2 days ago"],
            ].map(([t, d]) => (
              <div key={t} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-hv-500 mt-1.5 shrink-0" />
                <p className="text-xs text-gray-600 flex-1">{t}</p>
                <span className="text-[10px] text-gray-400 shrink-0">{d}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* QR modal */}
      <Modal open={voucherOpen} onClose={() => setVoucherOpen(false)} title="Transport voucher">
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm">
            <QRCode seed={MY_VOUCHER.id} size={180} />
          </div>
          <p className="font-bold text-gray-900 mt-4">{MY_VOUCHER.id} · MWK {MY_VOUCHER.amountMWK.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Show this code to any registered {MY_VOUCHER.mode.toLowerCase()} operator.<br />Valid until {fmtDate(MY_VOUCHER.expiresAt)}.</p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-emerald-600 font-medium">
            <ShieldCheck size={12} /> Single-use · Verified at redemption
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Report wizard ───────────────────────────────────────────────────────────
const WIZARD_STEPS = ["Incident", "Location", "Evidence", "Consent", "Review"];
function ReportWizard({ done }: { done: () => void }) {
  const hv = useHV();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [photos, setPhotos] = useState(0);
  const [voiceLen, setVoiceLen] = useState(0);
  const [form, setForm] = useState({
    type: "", date: "", narrative: "", district: "thyolo", ta: "", gps: false,
    consentServices: true, consentEvidence: false, consentPolice: false,
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const district = DISTRICTS.find((d) => d.id === form.district)!;

  if (submitted) {
    return (
      <Card className="max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={30} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Report received safely</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Reference <b className="text-gray-900">HV-2026-0201</b>. An advocate in your area has been
          notified and will contact you through your chosen safe channel within a few hours.
        </p>
        <div className="bg-hv-50 rounded-2xl p-4 mt-5 text-left space-y-2">
          {[
            "Your report is encrypted end-to-end",
            "Evidence is stored under your control — nothing is shared without your consent",
            "You can withdraw or edit your report at any time",
          ].map((t) => (
            <p key={t} className="text-xs text-hv-900 flex items-start gap-2"><Lock size={12} className="mt-0.5 shrink-0 text-hv-600" /> {t}</p>
          ))}
        </div>
        <Btn className="mt-6" onClick={done}>Back to my dashboard</Btn>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageTitle title={hv.t("reportIncident")} subtitle="Take your time. You can save and come back at any point — nothing is sent until you choose." />
      <Card>
        <WizardProgress steps={WIZARD_STEPS} current={step} />
        <div className="mt-7 min-h-[300px]">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="What happened?" hint="Select the option that best describes the incident.">
                <div className="grid sm:grid-cols-2 gap-2">
                  {VIOLENCE_TYPES.map((t) => (
                    <button key={t} onClick={() => set("type", t)}
                      className={cn("text-left text-sm font-medium px-4 py-3 rounded-xl border transition",
                        form.type === t ? "border-hv-500 bg-hv-50 text-hv-900 ring-2 ring-hv-100" : "border-gray-100 hover:border-hv-200 text-gray-700")}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="When did it happen?">
                <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} max="2026-07-13" />
              </Field>
              <Field label="Tell us in your own words" hint="Only share what you feel comfortable sharing. This can be updated later.">
                <Textarea
                  placeholder="Describe what happened…"
                  value={form.narrative}
                  onChange={(e) => set("narrative", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
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
              <button
                onClick={() => { set("gps", !form.gps); if (!form.gps) hv.showToast("Approximate GPS location captured (−16.07, 35.14)"); }}
                className={cn("w-full flex items-center gap-3 p-4 rounded-2xl border transition text-left",
                  form.gps ? "border-emerald-300 bg-emerald-50" : "border-gray-100 hover:border-hv-200")}
              >
                <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center", form.gps ? "bg-emerald-100 text-emerald-600" : "bg-hv-50 text-hv-700")}>
                  <MapPin size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{form.gps ? "GPS location captured" : "Capture my GPS location"}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {form.gps ? "−16.0692, 35.1401 (±40 m) — helps your advocate reach you faster" : "Optional. Shared only with your advocate."}
                  </span>
                </span>
                {form.gps && <CheckCircle2 size={18} className="ml-auto text-emerald-500" />}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Evidence is optional and always remains under <b>your</b> control. It is encrypted on
                this device before upload.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <button onClick={() => { setPhotos((p) => p + 1); hv.showToast("Photo encrypted & attached"); }}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-dashed border-gray-200 hover:border-hv-400 hover:bg-hv-50/40 transition">
                  <Camera size={22} className="text-hv-600" />
                  <span className="text-xs font-semibold text-gray-700">Add photo</span>
                  {photos > 0 && <Badge tone="purple">{photos} attached</Badge>}
                </button>
                <button onClick={() => hv.showToast("Document encrypted & attached")}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-dashed border-gray-200 hover:border-hv-400 hover:bg-hv-50/40 transition">
                  <FileText size={22} className="text-hv-600" />
                  <span className="text-xs font-semibold text-gray-700">Add document</span>
                </button>
                <button
                  onClick={() => {
                    if (recording) { setRecording(false); setVoiceLen(38); hv.showToast("Voice note saved (0:38) — encrypted"); }
                    else setRecording(true);
                  }}
                  className={cn("flex flex-col items-center gap-2 p-5 rounded-2xl border transition",
                    recording ? "border-rose-300 bg-rose-50" : "border-dashed border-gray-200 hover:border-hv-400 hover:bg-hv-50/40")}
                >
                  {recording ? <Square size={22} className="text-rose-500 animate-pulse" /> : <Mic size={22} className="text-hv-600" />}
                  <span className="text-xs font-semibold text-gray-700">{recording ? "Recording… tap to stop" : "Record voice note"}</span>
                  {voiceLen > 0 && !recording && <Badge tone="purple">0:38 saved</Badge>}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                <Lock size={11} /> AES-256 encryption · Files never leave the country's data centre · You can delete evidence at any time
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">You choose exactly what happens with your report. Each permission can be changed later.</p>
              {[
                { k: "consentServices", t: "Connect me with support services", d: "An advocate may contact you and arrange health, counselling or shelter referrals.", locked: false },
                { k: "consentEvidence", t: "Share my evidence with the health facility", d: "Clinicians can view attached photos/documents to inform your care.", locked: false },
                { k: "consentPolice", t: "Share my case with the Police Victim Support Unit", d: "Only if you want to pursue a formal case. You can decide later.", locked: false },
              ].map((c) => (
                <div key={c.k} className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.t}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.d}</p>
                  </div>
                  <Toggle checked={form[c.k as keyof typeof form] as boolean} onChange={(v) => set(c.k, v)} />
                </div>
              ))}
              <div className="bg-hv-50 rounded-2xl p-4 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-hv-700 mt-0.5 shrink-0" />
                <p className="text-xs text-hv-900 leading-relaxed">
                  <b>Digital consent record:</b> your choices are time-stamped and stored with your case.
                  Nothing beyond your selections is ever shared — not with police, family or community members.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Please review before submitting.</p>
              {[
                ["Incident type", form.type || "Not specified"],
                ["Date", form.date || "Not specified"],
                ["Location", `${district.name}${form.ta ? ` · TA ${form.ta}` : ""}${form.gps ? " · GPS attached" : ""}`],
                ["Evidence", `${photos} photo${photos === 1 ? "" : "s"}${voiceLen ? " · 1 voice note" : ""}` || "None"],
                ["Consent", [form.consentServices && "Support services", form.consentEvidence && "Evidence to facility", form.consentPolice && "Police VSU"].filter(Boolean).join(" · ") || "Report only"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-medium text-gray-400">{k}</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-50">
          <Btn variant="ghost" onClick={() => (step === 0 ? done() : setStep(step - 1))}>
            <ChevronLeft size={15} /> {step === 0 ? "Cancel" : "Back"}
          </Btn>
          {step < WIZARD_STEPS.length - 1 ? (
            <Btn onClick={() => setStep(step + 1)}>Continue <ChevronRight size={15} /></Btn>
          ) : (
            <Btn variant="success" onClick={() => setSubmitted(true)}>
              <Send size={15} /> Submit securely
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Referrals view ──────────────────────────────────────────────────────────
function Referrals() {
  return (
    <div>
      <PageTitle title="My referrals" subtitle="Every step of your care journey, in one place." />
      <div className="space-y-4">
        {MY_REFERRALS.map((r) => {
          const fac = facilityById(r.facilityId);
          return (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start gap-4">
                <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                  r.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-hv-50 text-hv-700")}>
                  <Route size={19} />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{r.service}</p>
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    {r.urgent && <Badge tone="red">Urgent</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{fac.name} · {fac.ta}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.id} · Created {relDays(r.createdAt)}{r.appointment ? ` · Appointment ${fmtDateShort(r.appointment)}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 max-w-[220px]">{r.notes}</p>
                </div>
              </div>
              {/* Mini timeline */}
              <div className="flex items-center gap-1.5 mt-4 pl-1">
                {["Sent", "Accepted", "Attended", "Closed"].map((s, i) => {
                  const activeIdx = r.status === "Completed" ? 4 : r.status === "In progress" ? 3 : r.status === "Accepted" ? 2 : 1;
                  return (
                    <React.Fragment key={s}>
                      <span className={cn("w-2 h-2 rounded-full", i < activeIdx ? "bg-hv-600" : "bg-gray-200")} />
                      <span className={cn("text-[10px] font-medium", i < activeIdx ? "text-hv-800" : "text-gray-400")}>{s}</span>
                      {i < 3 && <span className={cn("flex-1 h-px", i < activeIdx - 1 ? "bg-hv-300" : "bg-gray-100")} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Peer support / chat ─────────────────────────────────────────────────────
const CHAT_SEED = [
  { me: false, text: "Hello Hope, this is Chisomo, your advocate. How are you feeling today?", time: "09:12" },
  { me: true, text: "A bit better. The counselling session yesterday helped.", time: "09:15" },
  { me: false, text: "I'm really glad to hear that. Your voucher for Thursday's appointment is active — the driver will meet you at the trading centre at 08:00.", time: "09:16" },
  { me: true, text: "Thank you. Will you be at the facility too?", time: "09:18" },
  { me: false, text: "Yes, I'll meet you at the One-Stop Centre entrance so you don't wait alone. 💜", time: "09:19" },
];
function Support() {
  const hv = useHV();
  const [tab, setTab] = useState<"advocate" | "peer">("advocate");
  const [messages, setMessages] = useState(CHAT_SEED);
  const [draft, setDraft] = useState("");
  const [matched, setMatched] = useState(false);
  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { me: true, text: draft.trim(), time: "now" }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [...m, { me: false, text: "Thank you for sharing that with me. I'm here whenever you need to talk.", time: "now" }]);
    }, 1200);
  };
  return (
    <div className="max-w-2xl mx-auto">
      <PageTitle title="Support & connection" subtitle="Safe, moderated spaces — with your advocate or a trained peer supporter." />
      <div className="flex gap-2 mb-4">
        <Btn size="sm" variant={tab === "advocate" ? "primary" : "outline"} onClick={() => setTab("advocate")}>My advocate</Btn>
        <Btn size="sm" variant={tab === "peer" ? "primary" : "outline"} onClick={() => setTab("peer")}>Peer support</Btn>
      </div>

      {tab === "advocate" ? (
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-hv-50/50">
            <Avatar name="Chisomo Banda" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Chisomo Banda</p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online · replies in ~5 min
              </p>
            </div>
            <button className="ml-auto p-2 rounded-lg hover:bg-white text-hv-700" onClick={() => hv.showToast("Secure voice call requested")}>
              <Phone size={16} />
            </button>
          </div>
          <div className="p-5 space-y-3 max-h-[380px] overflow-y-auto bg-white">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.me ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  m.me ? "bg-hv-700 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md")}>
                  {m.text}
                  <span className={cn("block text-[9px] mt-1", m.me ? "text-hv-200" : "text-gray-400")}>{m.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-gray-100">
            <Input placeholder="Write a message…" value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()} className="!rounded-full" />
            <Btn size="sm" className="!rounded-full !px-3.5" onClick={send}><Send size={15} /></Btn>
          </div>
          <p className="text-[10px] text-gray-400 text-center pb-3 px-4">
            Messages are end-to-end encrypted. If you delete a chat, it is removed from both devices.
          </p>
        </Card>
      ) : !matched ? (
        <Card className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-hv-50 text-hv-700 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake size={26} />
          </div>
          <h3 className="font-bold text-gray-900">Talk to someone who understands</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Peer supporters are trained survivors who volunteer to listen. Matching is anonymous —
            you'll both use chosen names only.
          </p>
          <Btn className="mt-6" onClick={() => { hv.showToast("Matching you with an available peer supporter…"); setTimeout(() => setMatched(true), 1500); }}>
            <Sparkles size={15} /> Request a peer match
          </Btn>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Avatar name="Hope 013" size="lg" /><span className="text-hv-400 text-xl">↔</span><Avatar name="Willow 208" size="lg" />
          </div>
          <h3 className="font-bold text-gray-900">You've been matched with "Willow"</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Willow has supported 12 survivors and speaks Chichewa & English. Your chat opens in a
            moderated, anonymous space.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 mt-5 max-w-sm mx-auto">
            <p className="text-[11px] text-amber-800">
              <b>Safety reminder:</b> never share your real name, address or phone number in peer
              chats. Moderators review flagged conversations.
            </p>
          </div>
          <Btn className="mt-5" variant="secondary" onClick={() => hv.showToast("Peer chat opened (simulated)")}>Open chat</Btn>
        </Card>
      )}
    </div>
  );
}

// ── Resources ───────────────────────────────────────────────────────────────
const RESOURCES = [
  { t: "Understanding your rights after GBV", d: "Plain-language guide to Malawi's Prevention of Domestic Violence Act.", tag: "Legal", time: "6 min read" },
  { t: "What happens at a One-Stop Centre?", d: "Step-by-step of a facility visit: examination, PEP, counselling and your choices.", tag: "Health", time: "4 min read" },
  { t: "The 72-hour window: PEP explained", d: "Why timing matters for HIV post-exposure prophylaxis and how HerVoice! gets you there.", tag: "Health", time: "3 min read" },
  { t: "Safety planning at home", d: "Practical steps to prepare a personal safety plan for you and your children.", tag: "Safety", time: "8 min read" },
  { t: "Healing after trauma — audio series", d: "Five short guided sessions in Chichewa and English, developed with clinical psychologists.", tag: "Wellbeing", time: "Audio · 5 parts" },
  { t: "Money of your own", d: "Village savings groups and economic-empowerment programmes in Thyolo and Mzimba.", tag: "Livelihoods", time: "5 min read" },
];
function Resources() {
  const hv = useHV();
  return (
    <div>
      <PageTitle title={hv.t("resources")} subtitle="Verified information — available offline once opened." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESOURCES.map((r) => (
          <Card key={r.t} className="hover:border-hv-200 hover:shadow-md transition cursor-pointer" title="">
            <Badge tone={r.tag === "Health" ? "green" : r.tag === "Legal" ? "blue" : r.tag === "Safety" ? "red" : "purple"}>{r.tag}</Badge>
            <h3 className="font-bold text-gray-900 text-sm mt-3">{r.t}</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{r.d}</p>
            <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1"><BookOpen size={11} /> {r.time}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Privacy & settings ──────────────────────────────────────────────────────
function Settings() {
  const hv = useHV();
  const [s, setS] = useState({ disguise: true, sms: true, biometric: false, shareEvidence: false, sharePolice: false, peer: true });
  const set = (k: keyof typeof s, v: boolean) => { setS((x) => ({ ...x, [k]: v })); hv.showToast("Privacy setting updated"); };
  return (
    <div className="max-w-2xl mx-auto">
      <PageTitle title="Privacy & settings" subtitle="You decide who sees what — always." />
      <div className="space-y-4">
        <Card title="App safety">
          {[
            { k: "disguise" as const, t: "Disguise app icon", d: "HerVoice! appears as a calculator app on your phone.", icon: <EyeOff size={16} /> },
            { k: "biometric" as const, t: "Fingerprint lock", d: "Require your fingerprint every time the app opens.", icon: <Lock size={16} /> },
            { k: "sms" as const, t: "SMS notifications", d: "Receive appointment reminders by SMS (no sensitive details included).", icon: <MessageCircle size={16} /> },
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
        <Card title="Consent controls" subtitle="Changes take effect immediately and are recorded in your consent history.">
          {[
            { k: "shareEvidence" as const, t: "Share evidence with my health facility", d: "Photos and documents attached to your case." },
            { k: "sharePolice" as const, t: "Share my case with Police VSU", d: "Enables a formal criminal case if you choose to pursue one." },
            { k: "peer" as const, t: "Allow peer-support matching", d: "Trained peer supporters may be suggested to you." },
          ].map((o) => (
            <div key={o.k} className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-900">{o.t}</p>
                <p className="text-xs text-gray-500 mt-0.5">{o.d}</p>
              </div>
              <Toggle checked={s[o.k]} onChange={(v) => set(o.k, v)} />
            </div>
          ))}
        </Card>
        <Card title="Your data">
          <div className="flex flex-wrap gap-2.5">
            <Btn variant="outline" size="sm" onClick={() => hv.showToast("Consent history exported (simulated)")}><Eye size={14} /> View consent history</Btn>
            <Btn variant="outline" size="sm" onClick={() => hv.showToast("Data download prepared — check notifications")}>Download my data</Btn>
            <Btn variant="outline" size="sm" className="!text-rose-600 !border-rose-200 hover:!bg-rose-50" onClick={() => hv.showToast("Deletion request requires advocate confirmation for your safety")}>
              <Trash2 size={14} /> Delete my account
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function SurvivorPortal() {
  const hv = useHV();
  const [view, setView] = useState("dashboard");
  const nav = [
    { id: "dashboard", label: hv.t("dashboard"), icon: <LayoutDashboard size={17} /> },
    { id: "report", label: hv.t("reportIncident"), icon: <FilePlus2 size={17} /> },
    { id: "referrals", label: hv.t("myReferrals"), icon: <Route size={17} /> },
    { id: "support", label: hv.t("peerSupport"), icon: <HeartHandshake size={17} /> },
    { id: "resources", label: hv.t("resources"), icon: <BookOpen size={17} /> },
    { id: "settings", label: hv.t("settings"), icon: <ShieldCheck size={17} /> },
  ];
  return (
    <Shell role="survivor" nav={nav} active={view} onNavigate={setView}>
      {view === "dashboard" && <Dashboard go={setView} />}
      {view === "report" && <ReportWizard done={() => setView("dashboard")} />}
      {view === "referrals" && <Referrals />}
      {view === "support" && <Support />}
      {view === "resources" && <Resources />}
      {view === "settings" && <Settings />}
    </Shell>
  );
}
