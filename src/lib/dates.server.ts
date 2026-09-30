import { cookies } from "next/headers";
import { TIMEZONE_COOKIE, calendarDateIn, dayEnd, dayStart } from "@/lib/dates";

// Server-only: reading cookies is not available to client bundles, so the
// resolver lives apart from the pure date helpers in ./dates.

export type DayWindow = {
  /** The viewer's today, as yyyy-MM-dd. */
  todayKey: string;
  /** Inclusive start of today (UTC midnight of todayKey). */
  start: Date;
  /** Exclusive end of today (UTC midnight of tomorrow). */
  end: Date;
  timezone: string;
};

/**
 * Resolve the viewer's day. The browser-set cookie wins because it reflects
 * where they actually are; the stored profile timezone is the fallback for the
 * very first render, and UTC is the last resort.
 */
export async function resolveDayWindow(profileTimezone?: string | null): Promise<DayWindow> {
  const store = await cookies();
  const fromCookie = store.get(TIMEZONE_COOKIE)?.value;
  const timezone = fromCookie || profileTimezone || "UTC";
  const todayKey = calendarDateIn(timezone);

  return { todayKey, start: dayStart(todayKey), end: dayEnd(todayKey), timezone };
}
