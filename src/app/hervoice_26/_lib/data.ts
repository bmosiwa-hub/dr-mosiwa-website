// ─────────────────────────────────────────────────────────────────────────────
// HerVoice! — Deterministic mock-data engine
// All data is generated with a seeded PRNG so server & client renders match
// exactly (no hydration mismatch) and the demo looks identical on every load.
// ─────────────────────────────────────────────────────────────────────────────

// Fixed "today" anchor for the demo so charts/dates never drift mid-demo.
export const DEMO_TODAY = new Date(2026, 6, 13); // 13 July 2026

// ── Seeded PRNG (mulberry32) ────────────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(260713);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const chance = (p: number) => rand() < p;

// ── Date helpers ────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function daysAgo(n: number): Date {
  return new Date(DEMO_TODAY.getTime() - n * 86400000);
}
export function daysAhead(n: number): Date {
  return new Date(DEMO_TODAY.getTime() + n * 86400000);
}
export function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function fmtDateShort(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export function fmtTime(d: Date): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
export function relDays(d: Date): string {
  const diff = Math.round((DEMO_TODAY.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 0) return `In ${-diff} day${diff === -1 ? "" : "s"}`;
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} wk ago`;
  return fmtDateShort(d);
}

// ── Name pools (Malawian) ───────────────────────────────────────────────────
const FEMALE_FIRST = [
  "Chisomo", "Tamanda", "Thoko", "Mphatso", "Takondwa", "Pemphero", "Dalitso",
  "Chikondi", "Mayamiko", "Limbani", "Tadala", "Mwai", "Alinafe", "Yamikani",
  "Chimwemwe", "Tiyamike", "Madalitso", "Fatsani", "Vitumbiko", "Temwa",
  "Wezi", "Towera", "Nkhawazga", "Tione", "Zikomo", "Angella", "Grace",
  "Mercy", "Ruth", "Esnart", "Loveness", "Memory", "Beatrice", "Agnes",
];
const MALE_FIRST = [
  "Blessings", "Precious", "Gift", "Kondwani", "Mavuto", "Chifundo",
  "Mtendere", "Lusungu", "Wongani", "Kingsley", "Frank", "Isaac", "Peter",
];
const SURNAMES = [
  "Banda", "Phiri", "Mwale", "Nyirenda", "Chirwa", "Gondwe", "Mhango",
  "Kumwenda", "Moyo", "Jere", "Ngwira", "Munthali", "Kachala", "Sibande",
  "Nkhoma", "Mbewe", "Zimba", "Kaunda", "Chisale", "Msukwa", "Kamanga",
  "Lungu", "Soko", "Tembo", "Mkandawire", "Nyasulu", "Chavula", "Harawa",
];

// ── Districts, TAs, Facilities ──────────────────────────────────────────────
export interface District {
  id: string;
  name: string;
  region: string;
  population: number;
  tas: string[]; // Traditional Authorities
}
export const DISTRICTS: District[] = [
  {
    id: "thyolo",
    name: "Thyolo",
    region: "Southern Region",
    population: 721456,
    tas: ["Bvumbwe", "Changata", "Nsabwe", "Thekerani", "Khonjeni", "Nchilamwela"],
  },
  {
    id: "mzimba",
    name: "Mzimba",
    region: "Northern Region",
    population: 940184,
    tas: ["Mbelwa", "Mzukuzuku", "Kampingo Sibande", "Mtwalo", "Chindi", "Mabulabo"],
  },
];

export interface Facility {
  id: string;
  name: string;
  type: "District Hospital" | "Mission Hospital" | "Rural Hospital" | "Health Centre";
  district: string; // district id
  ta: string;
  oneStopCentre: boolean;
  phone: string;
  services: string[];
  avgResponseHrs: number;
  referralsReceived: number;
  referralsCompleted: number;
  complaintCount: number;
  satisfaction: number; // 0-100
  stockPEP: "Adequate" | "Low" | "Stockout";
  stockEC: "Adequate" | "Low" | "Stockout";
}

const FACILITY_SEED: Array<[string, Facility["type"], string, string, boolean]> = [
  ["Thyolo District Hospital", "District Hospital", "thyolo", "Bvumbwe", true],
  ["Malamulo Mission Hospital", "Mission Hospital", "thyolo", "Thekerani", true],
  ["Thekerani Rural Hospital", "Rural Hospital", "thyolo", "Thekerani", false],
  ["Bvumbwe Health Centre", "Health Centre", "thyolo", "Bvumbwe", false],
  ["Khonjeni Health Centre", "Health Centre", "thyolo", "Khonjeni", false],
  ["Chimaliro Health Centre", "Health Centre", "thyolo", "Changata", false],
  ["Mzimba District Hospital", "District Hospital", "mzimba", "Mbelwa", true],
  ["Embangweni Mission Hospital", "Mission Hospital", "mzimba", "Mzukuzuku", true],
  ["Ekwendeni Mission Hospital", "Mission Hospital", "mzimba", "Mtwalo", false],
  ["Euthini Rural Hospital", "Rural Hospital", "mzimba", "Chindi", false],
  ["Manyamula Health Centre", "Health Centre", "mzimba", "Kampingo Sibande", false],
  ["Kafukule Health Centre", "Health Centre", "mzimba", "Mabulabo", false],
];

export const FACILITIES: Facility[] = FACILITY_SEED.map(([name, type, district, ta, osc], i) => {
  const received = int(60, 220);
  return {
    id: `fac-${i + 1}`,
    name,
    type,
    district,
    ta,
    oneStopCentre: osc,
    phone: `+265 ${chance(0.5) ? "88" : "99"}${int(10, 99)} ${int(100, 999)} ${int(100, 999)}`,
    services: [
      "Medical examination",
      ...(osc ? ["One-Stop Centre", "Forensic documentation"] : []),
      "PEP (HIV post-exposure prophylaxis)",
      "Emergency contraception",
      "Psychological first aid",
      type !== "Health Centre" ? "STI treatment & lab" : "STI screening",
    ],
    avgResponseHrs: Math.round((type === "Health Centre" ? 4 + rand() * 30 : 2 + rand() * 10) * 10) / 10,
    referralsReceived: received,
    referralsCompleted: Math.floor(received * (0.62 + rand() * 0.3)),
    complaintCount: int(18, 130),
    satisfaction: int(58, 94),
    stockPEP: chance(0.72) ? "Adequate" : chance(0.6) ? "Low" : "Stockout",
    stockEC: chance(0.68) ? "Adequate" : chance(0.6) ? "Low" : "Stockout",
  };
});

export const facilityById = (id: string) => FACILITIES.find((f) => f.id === id)!;
export const districtById = (id: string) => DISTRICTS.find((d) => d.id === id)!;

// ── Advocates ───────────────────────────────────────────────────────────────
export interface Advocate {
  id: string;
  name: string;
  phone: string;
  district: string;
  ta: string;
  activeCases: number;
  closedCases: number;
  rating: number;
  status: "Active" | "On leave" | "Training";
  languages: string[];
}
export const ADVOCATES: Advocate[] = Array.from({ length: 30 }, (_, i) => {
  const district = i < 16 ? DISTRICTS[0] : DISTRICTS[1];
  const first = chance(0.85) ? pick(FEMALE_FIRST) : pick(MALE_FIRST);
  return {
    id: `adv-${i + 1}`,
    name: `${first} ${pick(SURNAMES)}`,
    phone: `+265 ${chance(0.5) ? "88" : "99"}${int(10, 99)} ${int(100, 999)} ${int(100, 999)}`,
    district: district.id,
    ta: pick(district.tas),
    activeCases: int(3, 11),
    closedCases: int(8, 46),
    rating: Math.round((3.9 + rand() * 1.1) * 10) / 10,
    status: chance(0.85) ? "Active" : chance(0.5) ? "On leave" : "Training",
    languages: district.id === "thyolo" ? ["Chichewa", "English"] : ["Chitumbuka", "Chichewa", "English"],
  };
});

// ── Survivors & cases ───────────────────────────────────────────────────────
export type ViolenceType =
  | "Physical violence"
  | "Sexual violence"
  | "Emotional / psychological"
  | "Economic abuse"
  | "Child marriage"
  | "Trafficking";
export const VIOLENCE_TYPES: ViolenceType[] = [
  "Physical violence",
  "Sexual violence",
  "Emotional / psychological",
  "Economic abuse",
  "Child marriage",
  "Trafficking",
];
export type Channel = "Mobile app" | "USSD" | "SMS" | "Walk-in" | "Hotline";
export type CaseStatus = "New" | "Active" | "In referral" | "Follow-up" | "Closed";
export type Risk = "Critical" | "High" | "Medium" | "Low";

export interface Survivor {
  id: string; // HV-2026-0001
  code: string; // privacy pseudonym e.g. "Flame-042"
  initials: string;
  age: number;
  district: string;
  ta: string;
  violenceType: ViolenceType;
  channel: Channel;
  reportDate: Date;
  status: CaseStatus;
  risk: Risk;
  advocateId: string;
  facilityId: string;
  hasVoucher: boolean;
  consentEvidence: boolean;
  consentPolice: boolean;
  nextFollowUp: Date | null;
}

const PSEUDO = ["Hope", "Dawn", "Lotus", "Ruby", "Amber", "Willow", "Pearl", "Iris", "Luna", "Nova", "Sage", "Fern"];

export const SURVIVORS: Survivor[] = Array.from({ length: 200 }, (_, i) => {
  const district = chance(0.52) ? DISTRICTS[0] : DISTRICTS[1];
  const advocates = ADVOCATES.filter((a) => a.district === district.id);
  const facilities = FACILITIES.filter((f) => f.district === district.id);
  const reportDate = daysAgo(int(0, 180));
  const statusRoll = rand();
  const status: CaseStatus =
    statusRoll < 0.08 ? "New" : statusRoll < 0.3 ? "Active" : statusRoll < 0.52 ? "In referral" : statusRoll < 0.68 ? "Follow-up" : "Closed";
  const riskRoll = rand();
  const first = pick(FEMALE_FIRST);
  const last = pick(SURNAMES);
  return {
    id: `HV-2026-${(i + 1).toString().padStart(4, "0")}`,
    code: `${pick(PSEUDO)}-${(i + 13).toString().padStart(3, "0")}`,
    initials: `${first[0]}.${last[0]}.`,
    age: int(14, 52),
    district: district.id,
    ta: pick(district.tas),
    violenceType: pick([...VIOLENCE_TYPES, "Physical violence", "Sexual violence", "Physical violence", "Emotional / psychological"] as ViolenceType[]),
    channel: pick(["Mobile app", "Mobile app", "USSD", "SMS", "Walk-in", "Hotline", "USSD"] as Channel[]),
    reportDate,
    status,
    risk: riskRoll < 0.07 ? "Critical" : riskRoll < 0.28 ? "High" : riskRoll < 0.68 ? "Medium" : "Low",
    advocateId: pick(advocates).id,
    facilityId: pick(facilities).id,
    hasVoucher: chance(0.34),
    consentEvidence: chance(0.81),
    consentPolice: chance(0.55),
    nextFollowUp: status === "Closed" ? null : daysAhead(int(1, 21)),
  };
});

// ── Referrals ───────────────────────────────────────────────────────────────
export type ReferralStatus = "Pending" | "Accepted" | "In progress" | "Completed" | "Declined";
export type ReferralService =
  | "Medical examination"
  | "PEP"
  | "Emergency contraception"
  | "Psychological support"
  | "Police / Victim Support Unit"
  | "Legal aid"
  | "Safe shelter";

export interface Referral {
  id: string;
  survivorId: string;
  facilityId: string;
  service: ReferralService;
  status: ReferralStatus;
  urgent: boolean;
  createdAt: Date;
  appointment: Date | null;
  notes: string;
}

const REFERRAL_NOTES = [
  "Survivor consented to full medical examination and documentation.",
  "Requires PEP within 72-hour window — flagged urgent.",
  "Transport voucher issued; survivor travelling from remote TA.",
  "Second visit — continuation of counselling sessions.",
  "Referred following USSD report; advocate accompanied survivor.",
  "Survivor requested female clinician; facility confirmed availability.",
  "Follow-up examination after initial treatment completed.",
  "Coordination with Victim Support Unit requested by survivor.",
];

export const REFERRALS: Referral[] = Array.from({ length: 340 }, (_, i) => {
  const survivor = pick(SURVIVORS);
  const created = new Date(survivor.reportDate.getTime() + int(0, 5) * 86400000);
  const statusRoll = rand();
  const status: ReferralStatus =
    statusRoll < 0.14 ? "Pending" : statusRoll < 0.3 ? "Accepted" : statusRoll < 0.46 ? "In progress" : statusRoll < 0.94 ? "Completed" : "Declined";
  return {
    id: `REF-${(2600 + i).toString()}`,
    survivorId: survivor.id,
    facilityId: survivor.facilityId,
    service: pick([
      "Medical examination", "Medical examination", "PEP", "Emergency contraception",
      "Psychological support", "Psychological support", "Police / Victim Support Unit", "Legal aid", "Safe shelter",
    ] as ReferralService[]),
    status,
    urgent: chance(0.18),
    createdAt: created,
    appointment: status === "Declined" ? null : new Date(created.getTime() + int(0, 6) * 86400000),
    notes: pick(REFERRAL_NOTES),
  };
});

// ── Transport vouchers ──────────────────────────────────────────────────────
export type VoucherStatus = "Active" | "Redeemed" | "Expired";
export interface Voucher {
  id: string;
  survivorId: string;
  facilityId: string;
  amountMWK: number;
  issuedAt: Date;
  expiresAt: Date;
  status: VoucherStatus;
  mode: "Bicycle taxi" | "Minibus" | "Motorcycle taxi" | "Ambulance";
}
export const VOUCHERS: Voucher[] = Array.from({ length: 120 }, (_, i) => {
  const survivor = pick(SURVIVORS);
  const issued = new Date(survivor.reportDate.getTime() + int(0, 3) * 86400000);
  const statusRoll = rand();
  return {
    id: `TV-${(4200 + i).toString()}`,
    survivorId: survivor.id,
    facilityId: survivor.facilityId,
    amountMWK: pick([3500, 5000, 7500, 10000, 15000]),
    issuedAt: issued,
    expiresAt: new Date(issued.getTime() + 7 * 86400000),
    status: statusRoll < 0.58 ? "Redeemed" : statusRoll < 0.85 ? "Active" : "Expired",
    mode: pick(["Bicycle taxi", "Minibus", "Motorcycle taxi", "Minibus", "Ambulance"]),
  };
});

// ── Citizen complaints ──────────────────────────────────────────────────────
export type ComplaintCategory =
  | "Service denied"
  | "Medicine stockout"
  | "Delayed care"
  | "Police misconduct"
  | "Advocate unavailable"
  | "Facility conditions"
  | "Other";
export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  "Service denied", "Medicine stockout", "Delayed care", "Police misconduct",
  "Advocate unavailable", "Facility conditions", "Other",
];
export type ComplaintStatus = "New" | "Assigned" | "In progress" | "Escalated" | "Resolved";

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  district: string;
  ta: string;
  facilityId: string | null;
  channel: Channel;
  status: ComplaintStatus;
  submittedAt: Date;
  resolvedAt: Date | null;
  daysOpen: number;
  summary: string;
  assignedTo: string | null;
}

const COMPLAINT_SUMMARIES: Record<ComplaintCategory, string[]> = {
  "Service denied": [
    "Survivor turned away at outpatient department without examination.",
    "Guardian told to return next week for a survivor consultation.",
    "Clinic refused service because survivor had no health passport book.",
  ],
  "Medicine stockout": [
    "PEP reported out of stock for the third consecutive day.",
    "Emergency contraception unavailable; survivor referred 40km away.",
    "Painkillers and antibiotics out of stock at OPD pharmacy.",
  ],
  "Delayed care": [
    "Survivor waited over six hours before being seen by a clinician.",
    "Referral not processed for two days after initial report.",
    "Ambulance requested but did not arrive; family arranged transport.",
  ],
  "Police misconduct": [
    "Victim Support Unit officer demanded payment to open a case file.",
    "Officer discouraged survivor from filing a formal report.",
    "Case file reported missing when survivor followed up.",
  ],
  "Advocate unavailable": [
    "No advocate reachable in this area for over a week.",
    "Advocate did not attend the scheduled home visit.",
    "Phone number listed for advocate is not going through.",
  ],
  "Facility conditions": [
    "No private consultation room available for survivor examinations.",
    "One-Stop Centre closed during posted operating hours.",
    "No female clinician available on weekends.",
  ],
  Other: [
    "Community requests awareness session on referral procedures.",
    "Suggestion to extend USSD service to additional languages.",
    "Request for youth-friendly reporting channel at secondary school.",
  ],
};

const OFFICERS = ["D. Kachingwe", "S. Mwanza", "L. Nyondo", "P. Chikhosi", "M. Kaira"];

export const COMPLAINTS: Complaint[] = Array.from({ length: 1000 }, (_, i) => {
  const district = chance(0.54) ? DISTRICTS[0] : DISTRICTS[1];
  const category = pick([
    ...COMPLAINT_CATEGORIES,
    "Medicine stockout", "Delayed care", "Delayed care", "Service denied",
  ] as ComplaintCategory[]);
  const submitted = daysAgo(int(0, 210));
  const statusRoll = rand();
  const status: ComplaintStatus =
    statusRoll < 0.08 ? "New" : statusRoll < 0.2 ? "Assigned" : statusRoll < 0.32 ? "In progress" : statusRoll < 0.4 ? "Escalated" : "Resolved";
  const resolved = status === "Resolved" ? new Date(submitted.getTime() + int(1, 14) * 86400000) : null;
  return {
    id: `CMP-${(10500 + i).toString()}`,
    category,
    district: district.id,
    ta: pick(district.tas),
    facilityId: chance(0.7) ? pick(FACILITIES.filter((f) => f.district === district.id)).id : null,
    channel: pick(["USSD", "USSD", "SMS", "Mobile app", "Hotline", "USSD", "SMS"] as Channel[]),
    status,
    submittedAt: submitted,
    resolvedAt: resolved,
    daysOpen: resolved
      ? Math.round((resolved.getTime() - submitted.getTime()) / 86400000)
      : Math.min(Math.round((DEMO_TODAY.getTime() - submitted.getTime()) / 86400000), 60),
    summary: pick(COMPLAINT_SUMMARIES[category]),
    assignedTo: status === "New" ? null : pick(OFFICERS),
  };
});

// ── Time series for charts (last 12 months) ─────────────────────────────────
export interface MonthPoint { label: string; [k: string]: number | string }
function monthLabel(offset: number): string {
  const d = new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth() - offset, 1);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
}
export const MONTHLY_TRENDS = Array.from({ length: 12 }, (_, i) => {
  const idx = 11 - i;
  const growth = 1 + i * 0.09;
  return {
    label: monthLabel(idx),
    reports: Math.round((14 + rand() * 10) * growth),
    referrals: Math.round((10 + rand() * 8) * growth),
    complaints: Math.round((52 + rand() * 30) * growth),
    resolved: Math.round((38 + rand() * 26) * growth),
    responseHrs: Math.round((36 - i * 1.7 + rand() * 6) * 10) / 10,
  };
});

export const WEEKLY_HEAT: number[][] = Array.from({ length: 12 }, () =>
  Array.from({ length: 8 }, () => int(0, 14))
);

// ── Notifications ───────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  kind: "SMS" | "Email" | "Push" | "System";
  title: string;
  body: string;
  at: Date;
  read: boolean;
}
export const NOTIFICATIONS: Notification[] = [
  { id: "n1", kind: "Push", title: "Referral accepted", body: "Thyolo District Hospital accepted referral REF-2611. Appointment: tomorrow 09:00.", at: daysAgo(0), read: false },
  { id: "n2", kind: "SMS", title: "Transport voucher issued", body: "Voucher TV-4231 (MWK 7,500) is active. Show the QR code to the driver.", at: daysAgo(0), read: false },
  { id: "n3", kind: "System", title: "Escalation notice", body: "Complaint CMP-10892 auto-escalated after 7 days without resolution.", at: daysAgo(1), read: false },
  { id: "n4", kind: "Email", title: "Monthly report ready", body: "June 2026 district report generated and ready for export.", at: daysAgo(2), read: true },
  { id: "n5", kind: "Push", title: "Follow-up reminder", body: "Follow-up visit with advocate scheduled for 15 Jul, 10:30.", at: daysAgo(2), read: true },
  { id: "n6", kind: "SMS", title: "PEP stock alert", body: "Khonjeni Health Centre reported PEP stockout. District pharmacist notified.", at: daysAgo(3), read: true },
];

// ── Audit log ───────────────────────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  at: Date;
  actor: string;
  role: string;
  action: string;
  target: string;
  ip: string;
}
const AUDIT_ACTIONS: Array<[string, string, string]> = [
  ["admin@astellic.org", "Administrator", "Updated SMS gateway sender ID"],
  ["d.kachingwe", "District Officer", "Exported monthly district report (PDF)"],
  ["adv-7", "Advocate", "Created referral REF-2811 for HV-2026-0057"],
  ["fac-1", "Facility", "Recorded services for referral REF-2798"],
  ["admin@astellic.org", "Administrator", "Created user account for Ekwendeni Mission Hospital"],
  ["s.mwanza", "District Officer", "Escalated complaint CMP-11204 to Regional Office"],
  ["adv-12", "Advocate", "Issued transport voucher TV-4302 (MWK 5,000)"],
  ["system", "System", "Auto-escalated 3 complaints exceeding 7-day SLA"],
  ["adv-3", "Advocate", "Updated case status HV-2026-0114 → Follow-up"],
  ["admin@astellic.org", "Administrator", "Modified role permissions: Facility → can close referrals"],
  ["fac-7", "Facility", "Accepted urgent referral REF-2843"],
  ["system", "System", "Nightly encrypted backup completed (2.4 GB)"],
];
export const AUDIT_LOG: AuditEntry[] = Array.from({ length: 36 }, (_, i) => {
  const [actor, role, action] = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length];
  return {
    id: `audit-${i}`,
    at: new Date(DEMO_TODAY.getTime() - i * int(2, 9) * 3600000),
    actor,
    role,
    action,
    target: "",
    ip: `10.20.${int(0, 40)}.${int(2, 250)}`,
  };
});

// ── Aggregate KPIs ──────────────────────────────────────────────────────────
export const KPIS = {
  survivorsSupported: SURVIVORS.length,
  activeCases: SURVIVORS.filter((s) => s.status !== "Closed").length,
  avgResponseHrs: 18.4,
  responseImprovement: -32, // % vs previous quarter
  activeReferrals: REFERRALS.filter((r) => r.status === "Pending" || r.status === "Accepted" || r.status === "In progress").length,
  completedReferrals: REFERRALS.filter((r) => r.status === "Completed").length,
  totalComplaints: COMPLAINTS.length,
  resolvedComplaints: COMPLAINTS.filter((c) => c.status === "Resolved").length,
  escalatedComplaints: COMPLAINTS.filter((c) => c.status === "Escalated").length,
  vouchersIssued: VOUCHERS.length,
  vouchersRedeemed: VOUCHERS.filter((v) => v.status === "Redeemed").length,
};

// ── Helpers for grouped chart data ──────────────────────────────────────────
export function countBy<T>(items: T[], key: (t: T) => string): Array<{ label: string; value: number }> {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export const survivorById = (id: string) => SURVIVORS.find((s) => s.id === id);
export const advocateById = (id: string) => ADVOCATES.find((a) => a.id === id);
