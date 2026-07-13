"use client";

// HerVoice! — shared UI kit
import React, { useEffect } from "react";
import { X, Check } from "lucide-react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ── Card ────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-1 sm:px-6">
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5 sm:p-6 pt-4">{children}</div>
    </div>
  );
}

// ── Buttons ─────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
export function Btn({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
}) {
  const variants: Record<BtnVariant, string> = {
    primary: "bg-hv-800 hover:bg-hv-700 text-white shadow-sm",
    secondary: "bg-hv-50 hover:bg-hv-100 text-hv-800",
    ghost: "hover:bg-gray-100 text-gray-700",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
    outline: "border border-gray-200 hover:border-hv-300 hover:bg-hv-50 text-gray-700",
  };
  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
    md: "text-sm px-4 py-2.5 rounded-xl gap-2",
    lg: "text-base px-6 py-3 rounded-xl gap-2",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────
const BADGE_TONES: Record<string, string> = {
  purple: "bg-hv-50 text-hv-800 ring-hv-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  gray: "bg-gray-100 text-gray-600 ring-gray-200",
};
export function Badge({ children, tone = "gray", className }: { children: React.ReactNode; tone?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ring-1 ring-inset whitespace-nowrap", BADGE_TONES[tone] ?? BADGE_TONES.gray, className)}>
      {children}
    </span>
  );
}

export function statusTone(status: string): string {
  const map: Record<string, string> = {
    New: "blue", Active: "purple", "In referral": "amber", "Follow-up": "blue", Closed: "gray",
    Pending: "amber", Accepted: "blue", "In progress": "purple", Completed: "green", Declined: "gray",
    Assigned: "blue", Escalated: "red", Resolved: "green",
    Critical: "red", High: "amber", Medium: "blue", Low: "gray",
    Redeemed: "green", Expired: "gray", Adequate: "green", Stockout: "red",
  };
  return map[status] ?? "gray";
}

// ── Stat tile ───────────────────────────────────────────────────────────────
export function Stat({
  label, value, delta, deltaLabel, icon, tone = "purple",
}: {
  label: string; value: string | number; delta?: string; deltaLabel?: string;
  icon?: React.ReactNode; tone?: "purple" | "green" | "amber" | "red" | "blue";
}) {
  const tones = {
    purple: "bg-hv-50 text-hv-700",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-rose-50 text-rose-600",
    blue: "bg-sky-50 text-sky-600",
  };
  const deltaGood = delta?.startsWith("-") ? deltaLabel?.includes("faster") || deltaLabel?.includes("better") : true;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        {icon && <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", tones[tone])}>{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-1.5 tracking-tight">{value}</p>
      {delta && (
        <p className="text-xs mt-1.5">
          <span className={cn("font-semibold", deltaGood ? "text-emerald-600" : "text-rose-600")}>{delta}</span>
          {deltaLabel && <span className="text-gray-400 ml-1">{deltaLabel}</span>}
        </p>
      )}
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────
export function Modal({
  open, onClose, title, children, wide,
}: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-hv-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn(
        "relative bg-white w-full sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-fade-up",
        wide ? "sm:max-w-3xl" : "sm:max-w-lg"
      )}>
        <div className="sticky top-0 bg-white/95 backdrop-blur flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl z-10">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Form inputs ─────────────────────────────────────────────────────────────
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {hint && <span className="block text-xs text-gray-400 mt-0.5">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-hv-500 focus:ring-2 focus:ring-hv-100 outline-none transition";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "min-h-[100px]", props.className)} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, "appearance-none", props.className)} />;
}
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3"
      aria-pressed={checked}
    >
      <span className={cn("w-10 h-6 rounded-full transition relative", checked ? "bg-hv-700" : "bg-gray-200")}>
        <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", checked ? "left-[18px]" : "left-0.5")} />
      </span>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </button>
  );
}

// ── Wizard progress ─────────────────────────────────────────────────────────
export function WizardProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              i < current ? "bg-hv-700 text-white" : i === current ? "bg-hv-800 text-white ring-4 ring-hv-100" : "bg-gray-100 text-gray-400"
            )}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={cn("text-[10px] mt-1.5 font-medium hidden sm:block truncate max-w-[72px] text-center", i <= current ? "text-hv-800" : "text-gray-400")}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("flex-1 h-0.5 rounded mb-4 sm:mb-6", i < current ? "bg-hv-600" : "bg-gray-100")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Table ───────────────────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
            {headers.map((h) => (
              <th key={h} className="py-2.5 pr-4 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">{children}</tbody>
      </table>
    </div>
  );
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 pr-4 text-gray-700 align-middle", className)}>{children}</td>;
}

// ── Avatar ──────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["bg-hv-600", "bg-emerald-600", "bg-sky-600", "bg-amber-500", "bg-rose-500", "bg-indigo-600"];
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(/[\s-]+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const color = AVATAR_COLORS[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length];
  const sizes = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-sm" };
  return (
    <span className={cn("rounded-full flex items-center justify-center font-bold text-white shrink-0", color, sizes[size])}>
      {initials}
    </span>
  );
}

// ── Fake QR code (deterministic per seed string) ────────────────────────────
export function QRCode({ seed, size = 120 }: { seed: string; size?: number }) {
  const n = 21;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const cells: boolean[] = [];
  let state = h >>> 0;
  for (let i = 0; i < n * n; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    cells.push((state & 0xff) > 118);
  }
  const finder = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`}>
      <rect x={cx} y={cy} width={7} height={7} fill="#1D1238" />
      <rect x={cx + 1} y={cy + 1} width={5} height={5} fill="white" />
      <rect x={cx + 2} y={cy + 2} width={3} height={3} fill="#1D1238" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} className="rounded-lg" aria-label="QR code">
      <rect width={n} height={n} fill="white" />
      {cells.map((c, i) => {
        const x = i % n, y = Math.floor(i / n);
        const inFinder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
        return c && !inFinder ? <rect key={i} x={x} y={y} width={1} height={1} fill="#1D1238" /> : null;
      })}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────
export function Empty({ icon, title, body }: { icon?: React.ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="w-12 h-12 rounded-2xl bg-hv-50 text-hv-600 flex items-center justify-center mb-3">{icon}</div>}
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {body && <p className="text-xs text-gray-500 mt-1 max-w-xs">{body}</p>}
    </div>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────
export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
