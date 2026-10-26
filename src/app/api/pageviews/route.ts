import { NextRequest, NextResponse } from "next/server";
import {
  dayKey,
  isAnalyticsConfigured,
  pageKey,
  runRedisCommands,
  utcDay,
} from "@/lib/page-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAnalyticsConfigured()) {
    return NextResponse.json({ error: "Analytics is not configured." }, { status: 503 });
  }

  let path: unknown;
  try {
    ({ path } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.length > 500 ||
    path.startsWith("/api/") ||
    path === "/clicks-tracker"
  ) {
    return NextResponse.json({ error: "Invalid page path." }, { status: 400 });
  }

  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, "") : path;
  const encoded = pageKey(normalizedPath).replace("pageviews:", "");
  const today = dayKey(utcDay());

  try {
    await runRedisCommands([
      ["INCR", `pageviews:total:${encoded}`],
      ["INCR", `pageviews:daily:${today}:total`],
      ["SADD", "pageviews:paths", normalizedPath],
    ]);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Could not record page view." }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAnalyticsConfigured()) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  const requestedDays = Number(request.nextUrl.searchParams.get("days") ?? "7");
  const days = Number.isFinite(requestedDays)
    ? Math.min(90, Math.max(1, Math.floor(requestedDays)))
    : 7;

  try {
    const [pathsResult] = await runRedisCommands([["SMEMBERS", "pageviews:paths"]]);
    const paths = Array.isArray(pathsResult) ? pathsResult.filter((path) => typeof path === "string") : [];
    const dates = Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - (days - index - 1));
      return utcDay(date);
    });
    const commands = [
      ...paths.map((path) => ["GET", `pageviews:total:${pageKey(path).replace("pageviews:", "")}`]),
      ...dates.map((date) => ["GET", `pageviews:daily:${dayKey(date)}:total`]),
    ];
    const values = commands.length ? await runRedisCommands(commands) : [];
    const pageValues = values.slice(0, paths.length);
    const dayValues = values.slice(paths.length);
    const pages = paths
      .map((path, index) => ({ path, views: Number(pageValues[index] ?? 0) }))
      .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path));
    const daily = dates.map((date, index) => ({ date, views: Number(dayValues[index] ?? 0) }));

    return NextResponse.json({
      configured: true,
      totalViews: pages.reduce((sum, page) => sum + page.views, 0),
      todayViews: daily.at(-1)?.views ?? 0,
      periodViews: daily.reduce((sum, day) => sum + day.views, 0),
      pages,
      daily,
      days,
    });
  } catch {
    return NextResponse.json({ configured: true, error: "Could not load analytics." }, { status: 503 });
  }
}
