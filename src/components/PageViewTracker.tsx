"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const ATTRIBUTION_KEY = "site-analytics-attribution";

type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>>;

function getAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const current: Attribution = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value && !/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value)) current[key] = value.slice(0, 80);
  }

  try {
    if (Object.keys(current).length) {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current));
      return current;
    }
    return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "{}") as Attribution;
  } catch {
    return current;
  }
}

function getExternalReferrer() {
  if (!document.referrer) return undefined;
  try {
    const hostname = new URL(document.referrer).hostname.toLowerCase();
    if (hostname === "azariahmosiwa.com" || hostname.endsWith(".azariahmosiwa.com")) return undefined;
    return hostname;
  } catch {
    return undefined;
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef("");

  useEffect(() => {
    const normalizedPath = pathname?.replace(/\/+$/, "") || "/";
    if (!pathname || normalizedPath === "/clicks-tracker" || pathname.startsWith("/api/") || lastTrackedPath.current === pathname) return;
    const isInitialPage = lastTrackedPath.current === "";
    lastTrackedPath.current = pathname;

    void fetch("/api/pageviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: isInitialPage ? getExternalReferrer() ?? "direct / unknown" : undefined,
        ...getAttribution(),
      }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never interrupt page navigation.
    });
  }, [pathname]);

  return null;
}
