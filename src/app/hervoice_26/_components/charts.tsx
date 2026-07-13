"use client";

// HerVoice! — lightweight SVG chart library (no external deps)
import React, { useState } from "react";
import { cn } from "./ui";

const PALETTE = ["#7B61C8", "#3E2A78", "#38BDF8", "#F59E0B", "#10B981", "#F43F5E", "#94A3B8"];

// ── Bar chart ───────────────────────────────────────────────────────────────
export function BarChart({
  data, height = 220, color = "#7B61C8", horizontal = false, valueSuffix = "",
}: {
  data: Array<{ label: string; value: number }>;
  height?: number; color?: string; horizontal?: boolean; valueSuffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (horizontal) {
    return (
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-36 shrink-0 truncate text-right">{d.label}</span>
            <div className="flex-1 bg-gray-50 rounded-full h-5 overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                style={{ width: `${Math.max((d.value / max) * 100, 6)}%`, background: color }}
              >
                <span className="text-[10px] font-bold text-white">{d.value.toLocaleString()}{valueSuffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ height }} className="flex items-end gap-2">
      {data.map((d, i) => (
        <div key={d.label + i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0 group">
          <span className="text-[10px] font-semibold text-gray-600 opacity-0 group-hover:opacity-100 transition">{d.value.toLocaleString()}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-700 hover:opacity-80"
            style={{ height: `${(d.value / max) * (height - 44)}px`, background: color, minHeight: 4 }}
            title={`${d.label}: ${d.value.toLocaleString()}${valueSuffix}`}
          />
          <span className="text-[10px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Multi-series line / area chart ──────────────────────────────────────────
export function LineChart({
  labels, series, height = 240, area = true,
}: {
  labels: string[];
  series: Array<{ name: string; values: number[]; color?: string }>;
  height?: number; area?: boolean;
}) {
  const W = 640, H = height, PAD = { t: 16, r: 12, b: 28, l: 38 };
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1) * 1.1;
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (i / Math.max(labels.length - 1, 1)) * iw;
  const y = (v: number) => PAD.t + ih - (v / max) * ih;
  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const gridLines = 4;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.round(((px - PAD.l) / iw) * (labels.length - 1));
          setHover(Math.max(0, Math.min(labels.length - 1, idx)));
        }}
      >
        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const gy = PAD.t + (i / gridLines) * ih;
          const val = Math.round(max - (i / gridLines) * max);
          return (
            <g key={i}>
              <line x1={PAD.l} x2={W - PAD.r} y1={gy} y2={gy} stroke="#F1F5F9" strokeWidth={1} />
              <text x={PAD.l - 6} y={gy + 3} textAnchor="end" fontSize={9} fill="#94A3B8">{val}</text>
            </g>
          );
        })}
        {labels.map((l, i) =>
          i % Math.ceil(labels.length / 8) === 0 ? (
            <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="#94A3B8">{l}</text>
          ) : null
        )}
        {series.map((s, si) => {
          const c = s.color ?? PALETTE[si % PALETTE.length];
          return (
            <g key={s.name}>
              {area && (
                <path
                  d={`${path(s.values)} L${x(s.values.length - 1)},${PAD.t + ih} L${x(0)},${PAD.t + ih} Z`}
                  fill={c} opacity={0.08}
                />
              )}
              <path d={path(s.values)} fill="none" stroke={c} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              {hover !== null && (
                <circle cx={x(hover)} cy={y(s.values[hover])} r={4} fill={c} stroke="white" strokeWidth={2} />
              )}
            </g>
          );
        })}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="3 3" />
        )}
      </svg>
      <div className="flex flex-wrap items-center gap-4 mt-2">
        {series.map((s, si) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} />
            {s.name}
            {hover !== null && <b className="text-gray-900">{s.values[hover]?.toLocaleString()}</b>}
          </span>
        ))}
        {hover !== null && <span className="text-xs text-gray-400 ml-auto">{labels[hover]}</span>}
      </div>
    </div>
  );
}

// ── Donut chart ─────────────────────────────────────────────────────────────
export function DonutChart({
  data, size = 180, centerLabel,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  size?: number; centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 42, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
          {data.map((d, i) => {
            const frac = d.value / total;
            const seg = (
              <circle
                key={d.label}
                cx={50} cy={50} r={R} fill="none"
                stroke={d.color ?? PALETTE[i % PALETTE.length]}
                strokeWidth={13}
                strokeDasharray={`${frac * C} ${C}`}
                strokeDashoffset={-offset * C}
                strokeLinecap="butt"
              />
            );
            offset += frac;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{total.toLocaleString()}</span>
          {centerLabel && <span className="text-[10px] text-gray-400 font-medium">{centerLabel}</span>}
        </div>
      </div>
      <div className="space-y-1.5 min-w-0">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color ?? PALETTE[i % PALETTE.length] }} />
            <span className="text-gray-600 truncate">{d.label}</span>
            <span className="font-semibold text-gray-900 ml-auto pl-3">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Heatmap grid ────────────────────────────────────────────────────────────
export function Heatmap({
  rows, cols, values, maxHint,
}: {
  rows: string[]; cols: string[]; values: number[][]; maxHint?: number;
}) {
  const max = maxHint ?? Math.max(...values.flat(), 1);
  const shade = (v: number) => {
    const t = v / max;
    if (t === 0) return "#F8FAFC";
    if (t < 0.25) return "#E9E3FB";
    if (t < 0.5) return "#B7A3EA";
    if (t < 0.75) return "#7B61C8";
    return "#3E2A78";
  };
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: `88px repeat(${cols.length}, minmax(28px, 1fr))` }}>
          <div />
          {cols.map((c) => (
            <div key={c} className="text-[9px] text-gray-400 text-center font-medium truncate">{c}</div>
          ))}
          {rows.map((r, ri) => (
            <React.Fragment key={r}>
              <div className="text-[10px] text-gray-500 font-medium truncate pr-2 flex items-center">{r}</div>
              {cols.map((c, ci) => (
                <div
                  key={c}
                  className="aspect-square rounded-md transition hover:ring-2 hover:ring-hv-400 cursor-default"
                  style={{ background: shade(values[ri]?.[ci] ?? 0) }}
                  title={`${r} · ${c}: ${values[ri]?.[ci] ?? 0} reports`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-400">
          Fewer
          {["#F8FAFC", "#E9E3FB", "#B7A3EA", "#7B61C8", "#3E2A78"].map((c) => (
            <span key={c} className="w-4 h-3 rounded" style={{ background: c }} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}

// ── Sparkline ───────────────────────────────────────────────────────────────
export function Sparkline({ values, color = "#7B61C8", width = 120, height = 32 }: { values: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...values, 1), min = Math.min(...values, 0);
  const x = (i: number) => (i / (values.length - 1)) * width;
  const y = (v: number) => height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={2.5} fill={color} />
    </svg>
  );
}

// ── Schematic pilot-district map ────────────────────────────────────────────
export function DistrictMap({
  markers, activeDistrict, onSelect,
}: {
  markers: Array<{ id: string; name: string; district: "thyolo" | "mzimba"; intensity: number }>;
  activeDistrict?: string | null;
  onSelect?: (district: string) => void;
}) {
  // Stylized Malawi silhouette with the two pilot districts highlighted.
  const spots: Record<string, Array<[number, number]>> = {
    mzimba: [[118, 118], [96, 138], [132, 150], [110, 168], [88, 158], [124, 132]],
    thyolo: [[152, 372], [136, 388], [166, 390], [148, 404], [128, 376], [160, 360]],
  };
  return (
    <svg viewBox="0 0 240 460" className="w-full max-w-[240px] mx-auto">
      {/* Malawi body */}
      <path
        d="M96,20 C120,26 128,48 124,72 C120,96 136,104 132,128 C128,156 100,164 96,192 C92,220 116,232 120,260 C124,284 108,300 116,324 C124,346 148,350 156,372 C164,394 152,416 136,432 C124,444 104,440 100,424 C96,408 108,396 104,380 C100,362 80,356 84,336 C88,318 104,310 100,292 C96,272 72,266 76,244 C80,222 100,214 96,192 M96,20 C80,30 72,52 76,76 C80,100 68,112 72,136 C76,160 92,168 96,192"
        fill="#EDE9FA" stroke="#D5C9F5" strokeWidth={2} strokeLinejoin="round"
      />
      {/* Lake Malawi hint */}
      <path d="M118,40 C130,58 126,86 130,110 C134,134 128,150 124,166" fill="none" stroke="#BAE6FD" strokeWidth={10} strokeLinecap="round" opacity={0.9} />
      {/* Mzimba region */}
      <g className="cursor-pointer" onClick={() => onSelect?.("mzimba")}>
        <ellipse cx={110} cy={146} rx={40} ry={36}
          fill={activeDistrict === "mzimba" ? "#7B61C8" : "#B7A3EA"}
          opacity={activeDistrict && activeDistrict !== "mzimba" ? 0.35 : 0.55} />
        <text x={110} y={106} textAnchor="middle" fontSize={11} fontWeight={700} fill="#3E2A78">Mzimba</text>
      </g>
      {/* Thyolo region */}
      <g className="cursor-pointer" onClick={() => onSelect?.("thyolo")}>
        <ellipse cx={148} cy={384} rx={34} ry={30}
          fill={activeDistrict === "thyolo" ? "#7B61C8" : "#B7A3EA"}
          opacity={activeDistrict && activeDistrict !== "thyolo" ? 0.35 : 0.55} />
        <text x={148} y={430} textAnchor="middle" fontSize={11} fontWeight={700} fill="#3E2A78">Thyolo</text>
      </g>
      {/* Facility markers */}
      {markers.map((m, i) => {
        const pos = spots[m.district][i % spots[m.district].length];
        const r = 3 + m.intensity * 5;
        return (
          <g key={m.id}>
            <circle cx={pos[0]} cy={pos[1]} r={r} fill="#3E2A78" opacity={0.85}>
              <title>{`${m.name}`}</title>
            </circle>
            <circle cx={pos[0]} cy={pos[1]} r={r + 3} fill="none" stroke="#3E2A78" opacity={0.25} />
          </g>
        );
      })}
      <text x={12} y={452} fontSize={8} fill="#94A3B8">Schematic map — pilot districts, Malawi</text>
    </svg>
  );
}

// ── Progress ring ───────────────────────────────────────────────────────────
export function ProgressRing({ pct, size = 64, color = "#7B61C8", label }: { pct: number; size?: number; color?: string; label?: string }) {
  const R = 26, C = 2 * Math.PI * R;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} className="-rotate-90">
        <circle cx={32} cy={32} r={R} fill="none" stroke="#F1F5F9" strokeWidth={7} />
        <circle cx={32} cy={32} r={R} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${(pct / 100) * C} ${C}`} strokeLinecap="round" />
      </svg>
      <span className={cn("absolute text-xs font-bold text-gray-900")}>{label ?? `${pct}%`}</span>
    </div>
  );
}
