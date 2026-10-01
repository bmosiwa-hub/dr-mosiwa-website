/**
 * Due dates, start dates and milestone targets are calendar dates, not
 * instants: a date input stores them as UTC midnight (2026-09-30T00:00:00Z
 * means "the 30th", not "an instant in Greenwich"). Comparing those against a
 * window built from `new Date()` on the server means the server's clock
 * decides what "today" is — which on Vercel is UTC. For anyone east of
 * Greenwich that makes the first hours of their day still count as yesterday,
 * so a task due today shows up nowhere until the server's clock catches up.
 *
 * These helpers pin "today" to the viewer's own calendar date and compare it
 * against the stored UTC-midnight values, so the answer no longer depends on
 * where the server happens to be running.
 */

export const TIMEZONE_COOKIE = "astelpo_tz";

/** The viewer's current calendar date in `timezone`, as yyyy-MM-dd. */
export function calendarDateIn(timezone: string, ref: Date = new Date()): string {
  try {
    // en-CA formats as yyyy-MM-dd, which is exactly the key we want.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(ref);
  } catch {
    // An unknown zone should degrade to UTC, never throw a page.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(ref);
  }
}

/** The hour (0–23) it currently is for the viewer — for greetings and the like. */
export function hourIn(timezone: string, ref: Date = new Date()): number {
  try {
    return Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        hourCycle: "h23",
      }).format(ref)
    );
  } catch {
    return ref.getUTCHours();
  }
}

/** Renders a yyyy-MM-dd key as a label, independent of the server's zone. */
export function formatDayKey(
  dateKey: string,
  options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(dayStart(dateKey));
}

/** A stored date back to its yyyy-MM-dd key, read in UTC the way it was written. */
export function toDayKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

/** UTC midnight of a yyyy-MM-dd key, i.e. how that date is stored. */
export function dayStart(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** UTC midnight of the day after — an exclusive upper bound. */
export function dayEnd(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1));
}

export function addDaysToKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return shifted.toISOString().slice(0, 10);
}
