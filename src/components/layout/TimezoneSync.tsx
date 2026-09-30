"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TIMEZONE_COOKIE } from "@/lib/dates";

/**
 * Tells the server which timezone the viewer is actually in, so "today" is
 * their today rather than the server's. Renders nothing.
 *
 * The server can only read this on the *next* request, so when the value
 * changes — first visit, or travelling — we refresh once to re-render the
 * page's date buckets with the correct day.
 */
export function TimezoneSync({ current }: { current: string | null }) {
  const router = useRouter();

  useEffect(() => {
    let timezone: string;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!timezone || timezone === current) return;

    // A year is plenty; it is rewritten whenever the browser reports a change.
    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timezone)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [current, router]);

  return null;
}
