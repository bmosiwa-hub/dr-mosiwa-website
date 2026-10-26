"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef("");

  useEffect(() => {
    if (!pathname || pathname === "/clicks-tracker" || pathname.startsWith("/api/") || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    void fetch("/api/pageviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never interrupt page navigation.
    });
  }, [pathname]);

  return null;
}
