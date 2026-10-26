import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { dayKey, isAnalyticsConfigured, pageKey, runRedisCommands, utcDay } from "@/lib/page-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIMENSIONS = ["countries", "regions", "devices", "browsers", "referrers", "utm_sources", "utm_mediums", "utm_campaigns"] as const;
const HOUR_TTL_SECONDS = 60 * 60 * 24 * 90;
const VISITOR_TTL_SECONDS = 60 * 60 * 24 * 400;
const VISIT_IDLE_SECONDS = 30 * 60;
const EXCLUDED_PATHS = new Set(["/fm-financing-prototype"]);
const TRACK_VISITOR_SCRIPT = `
local isNewVisitor = redis.call("SET", KEYS[1], "1", "NX", "EX", ARGV[1])
local isNewVisit = redis.call("SET", KEYS[2], "1", "NX", "EX", ARGV[2])
if isNewVisitor then redis.call("INCR", KEYS[3]) end
if isNewVisit then
  if not isNewVisitor then redis.call("INCR", KEYS[4]) end
else
  redis.call("EXPIRE", KEYS[2], ARGV[2])
end
return {isNewVisitor and 1 or 0, isNewVisit and 1 or 0}
`;

function segmentKey(period: "total" | "daily" | "hourly", time: string | undefined, kind: "page" | "country" | "country-page", path: string | undefined, country: string | undefined) {
  const pathId = path ? pageKey(path).replace("pageviews:", "") : "";
  const segment = kind === "page" ? pathId : kind === "country" ? country : `${country}:${pathId}`;
  return `pageviews:segment:${period}:${time ? `${time}:` : ""}${kind}:${segment}`;
}

function segmentCommands(kind: "page" | "country" | "country-page", path: string | undefined, country: string | undefined, day: string, hour: string) {
  const totalKey = segmentKey("total", undefined, kind, path, country);
  const dailyKey = segmentKey("daily", day, kind, path, country);
  const hourlyKey = segmentKey("hourly", hour, kind, path, country);
  return [
    ["INCR", totalKey],
    ["INCR", dailyKey],
    ["INCR", hourlyKey],
    ["EXPIRE", hourlyKey, String(HOUR_TTL_SECONDS)],
  ];
}

function safeLabel(value: unknown) {
  if (typeof value !== "string") return undefined;
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value)) return undefined;
  const label = value.normalize("NFKC").replace(/[^\p{L}\p{N} ._-]/gu, " ").trim().replace(/\s+/g, " ").slice(0, 80);
  return label ? label.toLowerCase() : undefined;
}

function safeReferrer(value: unknown, host: string) {
  if (typeof value !== "string" || value.length > 300) return undefined;
  if (value.toLowerCase() === "direct / unknown") return "direct / unknown";
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const ownHost = host.toLowerCase().replace(/^www\./, "").split(":")[0];
    if (!hostname || hostname === ownHost || hostname === "azariahmosiwa.com" || hostname.endsWith(".azariahmosiwa.com")) return undefined;
    return hostname.slice(0, 253);
  } catch {
    return undefined;
  }
}

function classifyDevice(userAgent: string) {
  if (/iPad|Tablet/i.test(userAgent)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) return "mobile";
  return "desktop";
}

function classifyBrowser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return "edge";
  if (/OPR\//i.test(userAgent)) return "opera";
  if (/SamsungBrowser/i.test(userAgent)) return "samsung internet";
  if (/Firefox|FxiOS/i.test(userAgent)) return "firefox";
  if (/Chrome|CriOS/i.test(userAgent)) return "chrome";
  if (/Safari/i.test(userAgent)) return "safari";
  return "other";
}

function dimensionRows(value: unknown) {
  const rows: { label: string; views: number }[] = [];
  if (Array.isArray(value)) {
    for (let index = 0; index + 1 < value.length; index += 2) {
      rows.push({ label: String(value[index]), views: Number(value[index + 1] ?? 0) });
    }
  } else if (value && typeof value === "object") {
    for (const [label, count] of Object.entries(value)) rows.push({ label, views: Number(count ?? 0) });
  }
  return rows.sort((a, b) => b.views - a.views || a.label.localeCompare(b.label));
}

export async function POST(request: NextRequest) {
  if (!isAnalyticsConfigured()) {
    return NextResponse.json({ error: "Analytics is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const payload = body as Record<string, unknown>;

  const path = payload.path;
  const normalizedPath = typeof path === "string" ? (path.length > 1 ? path.replace(/\/+$/, "") : path) : "";
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.length > 500 ||
    path.startsWith("/api/") ||
    normalizedPath === "/clicks-tracker" ||
    normalizedPath.startsWith("/clicks-tracker/") ||
    EXCLUDED_PATHS.has(normalizedPath)
  ) {
    return NextResponse.json({ error: "Invalid page path." }, { status: 400 });
  }

  const encoded = pageKey(normalizedPath).replace("pageviews:", "");
  const now = new Date();
  const today = dayKey(utcDay(now));
  const hour = now.toISOString().slice(0, 13).replace(/[-T]/g, "");
  const countryHeader = request.headers.get("x-vercel-ip-country") ?? "";
  const country = /^[a-z]{2}$/i.test(countryHeader) ? countryHeader.toUpperCase() : undefined;
  const regionHeader = request.headers.get("x-vercel-ip-country-region") ?? "";
  const region: string | undefined = country && /^[a-z0-9-]{1,25}$/i.test(regionHeader)
    ? `${country}-${regionHeader.toUpperCase()}`
    : undefined;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const referrer = safeReferrer(payload.referrer, host);
  const device = classifyDevice(request.headers.get("user-agent") ?? "");
  const browser = classifyBrowser(request.headers.get("user-agent") ?? "");
  const utmSource = safeLabel(payload.utm_source);
  const utmMedium = safeLabel(payload.utm_medium);
  const utmCampaign = safeLabel(payload.utm_campaign);
  const visitorId = typeof payload.visitorId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.visitorId)
    ? payload.visitorId.toLowerCase()
    : undefined;
  const visitorHash = visitorId ? createHash("sha256").update(visitorId).digest("hex") : undefined;
  const commands = [
    ["INCR", `pageviews:total:${encoded}`],
    ["INCR", `pageviews:daily:${today}:total`],
    ["INCR", `pageviews:hourly:${hour}:total`],
    ["EXPIRE", `pageviews:hourly:${hour}:total`, String(HOUR_TTL_SECONDS)],
    ["SADD", "pageviews:paths", normalizedPath],
    ...segmentCommands("page", normalizedPath, undefined, today, hour),
    ...(country ? [
      ...segmentCommands("country", undefined, country, today, hour),
      ...segmentCommands("country-page", normalizedPath, country, today, hour),
    ] : []),
    ["HINCRBY", "pageviews:devices", device, "1"],
    ["HINCRBY", "pageviews:browsers", browser, "1"],
    ...(country ? [["HINCRBY", "pageviews:countries", country, "1"]] : []),
    ...(region ? [["HINCRBY", "pageviews:regions", region, "1"]] : []),
    ...(referrer ? [["HINCRBY", "pageviews:referrers", referrer, "1"]] : []),
    ...(utmSource ? [["HINCRBY", "pageviews:utm_sources", utmSource, "1"]] : []),
    ...(utmMedium ? [["HINCRBY", "pageviews:utm_mediums", utmMedium, "1"]] : []),
    ...(utmCampaign ? [["HINCRBY", "pageviews:utm_campaigns", utmCampaign, "1"]] : []),
    ...(visitorHash ? [[
      "EVAL",
      TRACK_VISITOR_SCRIPT,
      "4",
      `pageviews:visitor:${visitorHash}`,
      `pageviews:visit-session:${visitorHash}`,
      "pageviews:visitors:first_time_browsers",
      "pageviews:visitors:returning_visits",
      String(VISITOR_TTL_SECONDS),
      String(VISIT_IDLE_SECONDS),
    ]] : []),
  ];

  try {
    await runRedisCommands(commands);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Could not record page view." }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAnalyticsConfigured()) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  const isHourly = request.nextUrl.searchParams.get("period") === "24h";
  const requestedDays = Number(request.nextUrl.searchParams.get("days") ?? "7");
  const days = Number.isFinite(requestedDays) ? Math.min(90, Math.max(1, Math.floor(requestedDays))) : 7;
  const now = new Date();
  const today = dayKey(utcDay(now));
  const timeline = isHourly
    ? Array.from({ length: 24 }, (_, index) => {
        const date = new Date(now);
        date.setUTCHours(date.getUTCHours() - (23 - index), 0, 0, 0);
        return { key: date.toISOString().slice(0, 13).replace(/[-T]/g, ""), time: date.toISOString() };
      })
    : Array.from({ length: days }, (_, index) => {
        const date = new Date(now);
        date.setUTCDate(date.getUTCDate() - (days - index - 1));
        const day = utcDay(date);
        return { key: dayKey(day), time: `${day}T00:00:00.000Z` };
      });

  try {
    const [pathsResult] = await runRedisCommands([["SMEMBERS", "pageviews:paths"]]);
    const allPaths = Array.isArray(pathsResult)
      ? pathsResult.filter((path): path is string => typeof path === "string")
      : [];
    const paths = allPaths.filter((path) => !EXCLUDED_PATHS.has(path));
    const commands = [
      ...allPaths.map((path) => ["GET", `pageviews:total:${pageKey(path).replace("pageviews:", "")}`]),
      ...timeline.map(({ key }) => ["GET", `pageviews:${isHourly ? "hourly" : "daily"}:${key}:total`]),
      ["GET", `pageviews:daily:${today}:total`],
      ...DIMENSIONS.map((dimension) => ["HGETALL", `pageviews:${dimension}`]),
      ["GET", "pageviews:visitors:first_time_browsers"],
      ["GET", "pageviews:visitors:returning_visits"],
    ];
    const values = await runRedisCommands(commands);
    const pageValues = values.slice(0, allPaths.length);
    const timelineValues = values.slice(allPaths.length, allPaths.length + timeline.length);
    const todayViews = Number(values[allPaths.length + timeline.length] ?? 0);
    const dimensionValues = values.slice(allPaths.length + timeline.length + 1);
    const visitorValues = values.slice(allPaths.length + timeline.length + 1 + DIMENSIONS.length);
    const visitorStats = {
      firstTimeBrowsers: Number(visitorValues[0] ?? 0),
      returningVisits: Number(visitorValues[1] ?? 0),
    };
    const pages = paths
      .map((path) => ({ path, views: Number(pageValues[allPaths.indexOf(path)] ?? 0) }))
      .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path));
    const unlistedPageViews = allPaths
      .filter((path) => EXCLUDED_PATHS.has(path))
      .reduce((sum, path) => sum + Number(pageValues[allPaths.indexOf(path)] ?? 0), 0);
    const chart = timeline.map(({ time }, index) => ({ time, views: Number(timelineValues[index] ?? 0) }));
    const dimensions = Object.fromEntries(DIMENSIONS.map((name, index) => [name, dimensionRows(dimensionValues[index])]));

    const requestedPath = request.nextUrl.searchParams.get("page");
    const selectedPath = requestedPath && paths.includes(requestedPath) ? requestedPath : undefined;
    const allCountries = dimensions.countries as { label: string; views: number }[];
    const pageCountryCounts = selectedPath && allCountries.length
      ? await runRedisCommands(allCountries.map((row) => ["GET", segmentKey("total", undefined, "country-page", selectedPath, row.label)]))
      : [];
    const pageCountries = selectedPath
      ? allCountries
          .map((row, index) => ({ ...row, views: Number(pageCountryCounts[index] ?? 0) }))
          .filter((row) => row.views > 0)
      : allCountries;
    const requestedCountry = request.nextUrl.searchParams.get("country")?.toUpperCase();
    const selectedCountry = requestedCountry && /^[A-Z]{2}$/.test(requestedCountry) && pageCountries.some((row) => row.label === requestedCountry)
      ? requestedCountry
      : undefined;
    const isFiltered = Boolean(selectedPath || selectedCountry);

    if (isFiltered) {
      const kind = selectedPath ? (selectedCountry ? "country-page" : "page") : "country";
      const pageKind = selectedCountry ? "country-page" : "page";
      const filteredPaths = selectedPath ? [selectedPath] : paths;
      const segmentPath = kind === "page" || kind === "country-page" ? selectedPath : undefined;
      const segmentCountry = selectedCountry;
      const filteredCommands = [
        ...filteredPaths.map((path) => ["GET", segmentKey("total", undefined, pageKind, path, segmentCountry)]),
        ...timeline.map(({ key }) => ["GET", segmentKey(isHourly ? "hourly" : "daily", key, kind, segmentPath, segmentCountry)]),
        ["GET", segmentKey("daily", today, kind, segmentPath, segmentCountry)],
      ];
      const filteredValues = await runRedisCommands(filteredCommands);
      const filteredPageValues = filteredValues.slice(0, filteredPaths.length);
      const filteredTimelineValues = filteredValues.slice(filteredPaths.length, filteredPaths.length + timeline.length);
      const filteredTodayViews = Number(filteredValues[filteredPaths.length + timeline.length] ?? 0);
      const filteredPages = filteredPaths
        .map((path, index) => ({
          path,
          views: selectedPath && !selectedCountry
            ? Number(pageValues[allPaths.indexOf(path)] ?? 0)
            : Number(filteredPageValues[index] ?? 0),
        }))
        .filter((page) => page.views > 0 || page.path === selectedPath)
        .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path));
      const filteredChart = timeline.map(({ time }, index) => ({ time, views: Number(filteredTimelineValues[index] ?? 0) }));

      return NextResponse.json({
        configured: true,
        totalViews: filteredPages.reduce((sum, page) => sum + page.views, 0),
        todayViews: filteredTodayViews,
        periodViews: filteredChart.reduce((sum, item) => sum + item.views, 0),
        unlistedPageViews: 0,
        pages: filteredPages,
        chart: filteredChart,
        chartMode: isHourly ? "hourly" : "daily",
        periodLabel: isHourly ? "Last 24 hours" : `Last ${days} days`,
        dimensions,
        visitorStats,
        filters: {
          page: selectedPath ?? "",
          country: selectedCountry ?? "",
          availablePages: selectedCountry ? filteredPages : pages,
          availableCountries: pageCountries,
          ...(selectedPath ? { pageTotalViews: Number(pageValues[allPaths.indexOf(selectedPath)] ?? 0) } : {}),
        },
        filtered: true,
      });
    }

    return NextResponse.json({
      configured: true,
      totalViews: pageValues.reduce((sum, value) => sum + Number(value ?? 0), 0),
      todayViews,
      periodViews: chart.reduce((sum, item) => sum + item.views, 0),
      unlistedPageViews,
      pages,
      chart,
      chartMode: isHourly ? "hourly" : "daily",
      periodLabel: isHourly ? "Last 24 hours" : `Last ${days} days`,
      dimensions,
      visitorStats,
      filters: { page: "", country: "", availablePages: pages, availableCountries: allCountries },
      filtered: false,
    });
  } catch {
    return NextResponse.json({ configured: true, error: "Could not load analytics." }, { status: 503 });
  }
}
