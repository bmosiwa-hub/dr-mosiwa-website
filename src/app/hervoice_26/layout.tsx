import type { Metadata } from "next";
import { HerVoiceProvider } from "./_lib/store";

export const metadata: Metadata = {
  title: {
    absolute: "HerVoice! — Survivor-led GBV Response & Accountability Platform",
    template: "%s | HerVoice!",
  },
  description:
    "HerVoice! by Astellic — a survivor-led GBV response and citizen accountability platform. Restricted demonstration environment.",
  robots: { index: false, follow: false },
};

export default function HerVoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <HerVoiceProvider>
      <div className="hv-root font-sans text-gray-900 antialiased">
        {children}
      </div>
      {/* Accessibility mode: scale up type inside HerVoice only */}
      <style>{`.hv-a11y .hv-root { font-size: 112.5%; } .hv-a11y .hv-root .text-xs { font-size: 0.8rem; } .hv-a11y .hv-root .text-sm { font-size: 0.95rem; }`}</style>
    </HerVoiceProvider>
  );
}
