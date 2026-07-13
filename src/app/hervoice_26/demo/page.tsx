"use client";

// HerVoice! — Donor Demo Mode: three guided end-to-end scenarios
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, PlayCircle, Heart, Megaphone, BarChart3,
  CheckCircle2, ExternalLink, Radio, Users, Bus, Building2, Route,
  AlertTriangle, FileDown, Sparkles, Clock,
} from "lucide-react";
import { useHV, Role } from "../_lib/store";
import { HVLogo } from "../_components/shell";
import { Btn, Badge, cn } from "../_components/ui";

interface DemoStep {
  title: string;
  narrative: string;
  detail: string;
  role: Role;
  cta: string;
  icon: React.ReactNode;
}
interface Scenario {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  headline: string;
  outcome: string;
  steps: DemoStep[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "survivor",
    label: "Survivor journey",
    icon: <Heart size={18} />,
    color: "from-hv-700 to-hv-500",
    headline: "From a frightening night to care within 24 hours",
    outcome: "Report → advocate notified → transport voucher → facility care completed",
    steps: [
      {
        title: "A survivor reports — safely, on her terms",
        narrative: "“Hope” opens the disguised app after an assault and completes the 5-step report wizard: what happened, where, optional evidence, and granular consent choices.",
        detail: "Notice the consent step — nothing is shared with police or the facility unless she chooses. The report is encrypted on-device and works fully offline.",
        role: "survivor", cta: "Open the Survivor Portal & try the report wizard", icon: <Radio size={16} />,
      },
      {
        title: "An advocate is notified within minutes",
        narrative: "Chisomo, the trained advocate covering TA Bvumbwe, sees the new case flagged High-risk on her dashboard and makes first contact in under 3 hours.",
        detail: "Open a priority case to see the full timeline, then use the New referral and Transport voucher tabs — this is the workflow that beat the 72-hour PEP window 78% of the time in the pilot data.",
        role: "advocate", cta: "Open the Advocate Workspace & open a priority case", icon: <Users size={16} />,
      },
      {
        title: "A QR transport voucher removes the cost barrier",
        narrative: "Chisomo issues a MWK 7,500 voucher. Hope shows the QR code to a registered bicycle-taxi operator — no cash changes hands; the operator is reimbursed weekly by mobile money.",
        detail: "On the Survivor dashboard, click “Show QR code” on the voucher card. 83% of vouchers are redeemed within 48 hours.",
        role: "survivor", cta: "View the voucher & QR code as the survivor", icon: <Bus size={16} />,
      },
      {
        title: "The facility closes the loop",
        narrative: "Thyolo District Hospital accepted the referral before Hope arrived. After treatment, the clinician records services (examination, PEP, counselling) and closes the referral — updating everyone instantly.",
        detail: "Try the Incoming referrals queue: accept a pending referral, then use Record services to close it. The advocate and district dashboard update automatically.",
        role: "facility", cta: "Open the Facility Portal & accept a referral", icon: <Building2 size={16} />,
      },
    ],
  },
  {
    id: "citizen",
    label: "Citizen accountability",
    icon: <Megaphone size={18} />,
    color: "from-amber-500 to-hv-600",
    headline: "A stockout reported by SMS becomes a district action",
    outcome: "Anonymous complaint → officer assigned → 7-day auto-escalation → resolution recorded",
    steps: [
      {
        title: "A citizen reports a stockout — from a basic phone",
        narrative: "A guardian is turned away because PEP is out of stock. She dials *384*26# on a feature phone (or texts REPORT to 4646) and files an anonymous complaint in 90 seconds.",
        detail: "Use the interactive USSD simulator — press the number keys to walk the real menu flow. She receives tracking ID CMP-11508 with no identity collected.",
        role: "citizen", cta: "Try the USSD simulator yourself", icon: <Radio size={16} />,
      },
      {
        title: "The district officer assigns it the same day",
        narrative: "The complaint appears on Dorothy's live dashboard, tagged Medicine stockout · Khonjeni HC. She assigns it to the duty officer with two clicks.",
        detail: "In the Complaints view, open any New complaint and use Assign / Escalate / Resolve — the full timeline and SLA counter are visible on every record.",
        role: "district", cta: "Open Complaints & assign one", icon: <AlertTriangle size={16} />,
      },
      {
        title: "No resolution in 7 days? It escalates automatically",
        narrative: "The SLA engine escalates unresolved complaints to the Regional Health Office — no complaint can quietly disappear. 12 breaches are visible right now on the dashboard.",
        detail: "Filter the complaints table by Escalated and note the red SLA-breach chips on complaints open beyond 7 days.",
        role: "district", cta: "Filter escalated complaints", icon: <Clock size={16} />,
      },
      {
        title: "Resolution recorded — and the citizen is told",
        narrative: "PEP stock is redistributed from the district hospital within 48 hours. The officer marks the complaint resolved and the reporter gets an SMS against her tracking ID.",
        detail: "Use Track complaint in the Citizen portal with any CMP- ID to see the citizen-facing timeline of the same record.",
        role: "citizen", cta: "Track a complaint as the citizen", icon: <CheckCircle2 size={16} />,
      },
    ],
  },
  {
    id: "district",
    label: "District oversight",
    icon: <BarChart3 size={18} />,
    color: "from-hv-800 to-sky-500",
    headline: "Evidence that moves — from dashboards to decisions",
    outcome: "Live KPIs → AI-surfaced bottlenecks → exported monthly report",
    steps: [
      {
        title: "One screen shows the whole pilot",
        narrative: "Six live KPIs, 12-month trends, a TA-level heat map and a facility league table — response time is down 32% and it's visible, not anecdotal.",
        detail: "Click a district on the schematic map to filter the dashboard. Note the facility league table ranking completion, response time and satisfaction.",
        role: "district", cta: "Open the District Overview", icon: <BarChart3 size={16} />,
      },
      {
        title: "AI surfaces the bottlenecks humans miss",
        narrative: "The intelligence assistant answers plain-language questions — “Which facilities have delayed responses?” — with tables and recommendations grounded in the live data.",
        detail: "Try the suggested prompts. The stockout insight on the Overview page was surfaced 8 days before routine LMIS reporting would have caught it.",
        role: "district", cta: "Ask the AI assistant a question", icon: <Sparkles size={16} />,
      },
      {
        title: "A donor-ready report in one click",
        narrative: "The monthly district report — KPIs, complaint analysis, recommendations — is generated from live data and exported as PDF for the District Executive Committee and funders.",
        detail: "Open Reports → Monthly district report to preview the formatted document, then Export.",
        role: "district", cta: "Preview & export the monthly report", icon: <FileDown size={16} />,
      },
    ],
  },
];

export default function DemoMode() {
  const hv = useHV();
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [step, setStep] = useState(0);

  // Demo mode implies access — unlock silently for invited reviewers arriving via deep link
  useEffect(() => {
    if (hv.ready && !hv.unlocked) hv.loginAs("citizen");
  }, [hv.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = scenario.steps[step];
  const openStep = () => {
    const acc = hv.loginAs(current.role);
    router.push(acc.home);
  };

  return (
    <div className="min-h-screen bg-hv-950 text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/hervoice_26"><HVLogo light /></Link>
          <Link href="/hervoice_26" className="inline-flex items-center gap-1.5 text-sm font-medium text-hv-300 hover:text-white transition">
            <ArrowLeft size={15} /> Exit demo mode
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-white/10 text-hv-100 text-xs font-bold px-3.5 py-1.5 rounded-full">
            <PlayCircle size={13} /> Donor Demo Mode
          </span>
          <h1 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">Three stories. One connected system.</h1>
          <p className="mt-4 text-hv-300 leading-relaxed">
            Each scenario walks you through a real end-to-end journey. At every step you can jump
            into the live prototype in the right role — we'll sign you in automatically.
          </p>
        </div>

        {/* Scenario tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-9">
          {SCENARIOS.map((s) => (
            <button key={s.id} onClick={() => { setScenario(s); setStep(0); }}
              className={cn("inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all",
                scenario.id === s.id ? "bg-white text-hv-900 shadow-lg" : "bg-white/5 text-hv-200 hover:bg-white/10")}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Scenario card */}
        <motion.div
          key={scenario.id + step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-3xl overflow-hidden shadow-2xl text-gray-900"
        >
          <div className={cn("px-7 sm:px-10 py-7 bg-gradient-to-r text-white", scenario.color)}>
            <p className="text-xs font-bold uppercase tracking-[0.15em] opacity-80">{scenario.label}</p>
            <h2 className="text-xl sm:text-2xl font-bold mt-1.5">{scenario.headline}</h2>
            <p className="text-sm opacity-90 mt-2 flex items-center gap-2"><Route size={14} /> {scenario.outcome}</p>
          </div>

          <div className="grid lg:grid-cols-[260px,1fr]">
            {/* Step list */}
            <div className="border-b lg:border-b-0 lg:border-r border-gray-100 p-5 space-y-1.5">
              {scenario.steps.map((s, i) => (
                <button key={i} onClick={() => setStep(i)}
                  className={cn("w-full text-left flex items-start gap-3 p-3.5 rounded-2xl transition",
                    i === step ? "bg-hv-50 ring-1 ring-hv-200" : "hover:bg-gray-50")}>
                  <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                    i < step ? "bg-hv-700 text-white" : i === step ? "bg-hv-800 text-white" : "bg-gray-100 text-gray-400")}>
                    {i < step ? <CheckCircle2 size={13} /> : i + 1}
                  </span>
                  <span className={cn("text-xs font-semibold leading-snug", i === step ? "text-hv-900" : "text-gray-500")}>
                    {s.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Step detail */}
            <div className="p-7 sm:p-10">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-9 h-9 rounded-xl bg-hv-50 text-hv-700 flex items-center justify-center">{current.icon}</span>
                <Badge tone="purple">Step {step + 1} of {scenario.steps.length}</Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{current.title}</h3>
              <p className="text-gray-600 leading-relaxed mt-3">{current.narrative}</p>
              <div className="mt-5 bg-hv-50 rounded-2xl p-4.5 p-4 flex gap-3">
                <Sparkles size={16} className="text-hv-600 shrink-0 mt-0.5" />
                <p className="text-sm text-hv-900 leading-relaxed"><b>What to look for:</b> {current.detail}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-7">
                <Btn size="lg" onClick={openStep}>
                  <ExternalLink size={16} /> {current.cta}
                </Btn>
                {step < scenario.steps.length - 1 ? (
                  <Btn size="lg" variant="outline" onClick={() => setStep(step + 1)}>
                    Next step <ArrowRight size={16} />
                  </Btn>
                ) : (
                  <Btn size="lg" variant="outline" onClick={() => {
                    const idx = SCENARIOS.findIndex((s) => s.id === scenario.id);
                    const next = SCENARIOS[(idx + 1) % SCENARIOS.length];
                    setScenario(next); setStep(0);
                  }}>
                    Next scenario: {SCENARIOS[(SCENARIOS.findIndex((s) => s.id === scenario.id) + 1) % SCENARIOS.length].label} <ArrowRight size={16} />
                  </Btn>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-5">
                Tip: use “Donor demo mode” in any portal's sidebar to return here at any time.
              </p>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-hv-400 mt-10">
          HerVoice! demonstration prototype · Astellic · All data simulated · Built for donor due diligence
        </p>
      </div>
    </div>
  );
}
