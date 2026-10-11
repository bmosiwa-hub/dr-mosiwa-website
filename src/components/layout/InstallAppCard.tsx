"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Smartphone, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Install button plus a readout of why the browser may not be offering one.
 *
 * Chrome keeps its installability verdict to itself: the menu entry simply
 * does not appear, with no error anywhere. Everything the server controls can
 * be verified from outside, so when an install does not show up the answer is
 * always on the device — hence this, which reports the browser's own view.
 */

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Check = { label: string; ok: boolean | null; detail: string };

export function InstallAppCard() {
  const [promptEvent, setPromptEvent] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Keep the event so the install can happen on a real user gesture.
      e.preventDefault();
      setPromptEvent(e as PromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setResult("Installed.");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    (async () => {
      const next: Check[] = [];

      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true;
      if (standalone) setInstalled(true);
      next.push({
        label: "Running as",
        ok: null,
        detail: standalone ? "installed app" : "browser tab",
      });

      next.push({
        label: "Secure context",
        ok: window.isSecureContext,
        detail: window.isSecureContext ? window.location.origin : "needs HTTPS",
      });

      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration("/astelpo_26/");
          next.push({
            label: "Service worker",
            ok: !!reg?.active,
            detail: reg?.active
              ? `active, scope ${new URL(reg.scope).pathname}`
              : reg
                ? "registered but not active yet — reload once"
                : "not registered yet — reload once",
          });
        } catch {
          next.push({ label: "Service worker", ok: false, detail: "registration failed" });
        }
      } else {
        next.push({ label: "Service worker", ok: false, detail: "unsupported in this browser" });
      }

      try {
        const res = await fetch("/astelpo_26/manifest.webmanifest", { cache: "no-store" });
        const body = res.ok ? await res.json() : null;
        next.push({
          label: "Manifest",
          ok: res.ok,
          detail: res.ok ? `${body?.short_name ?? "loaded"}, ${body?.display ?? "?"}` : `HTTP ${res.status}`,
        });
      } catch {
        next.push({ label: "Manifest", ok: false, detail: "could not be fetched" });
      }

      setChecks(next);
    })();

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setResult(outcome === "accepted" ? "Installing…" : "Install dismissed.");
    setPromptEvent(null);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-1">
        <Smartphone className="w-4 h-4 text-indigo-400" />
        Install on this device
      </h3>
      <p className="text-slate-500 text-xs mb-4">
        Adds AstelPO to the home screen and opens it without browser chrome.
      </p>

      {installed ? (
        <p className="text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Installed on this device.
        </p>
      ) : promptEvent ? (
        <button
          onClick={install}
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Install app
        </button>
      ) : (
        <p className="text-slate-400 text-xs leading-relaxed">
          This browser has not offered an install. Chrome on Android usually needs one reload after
          the first visit, and will not offer it at all in a private tab or in Firefox. On desktop
          Chrome, look for the install icon at the right of the address bar.
        </p>
      )}

      {result && <p className="text-slate-400 text-xs mt-2">{result}</p>}

      {checks.length > 0 && (
        <dl className="mt-4 pt-4 border-t border-slate-800 space-y-1.5">
          {checks.map((c) => (
            <div key={c.label} className="flex items-start gap-2 text-xs">
              {c.ok === null ? (
                <span className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
              ) : c.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-px" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-px" />
              )}
              <dt className="text-slate-500 w-28 flex-shrink-0">{c.label}</dt>
              <dd className={cn("text-slate-400 min-w-0 break-words", c.ok === false && "text-red-400")}>
                {c.detail}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
