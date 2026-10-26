"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownToLine, ArrowUpRight, CalendarDays, Clock3, Eye, Globe2, MonitorSmartphone, RefreshCw, Search, Settings2, Share2, Tag, Users } from "lucide-react";

type DimensionRow = { label: string; views: number };
type Dimensions = {
  countries: DimensionRow[];
  regions: DimensionRow[];
  devices: DimensionRow[];
  browsers: DimensionRow[];
  referrers: DimensionRow[];
  utm_sources: DimensionRow[];
  utm_mediums: DimensionRow[];
  utm_campaigns: DimensionRow[];
};

type AnalyticsData = {
  configured: boolean;
  totalViews: number;
  unlistedPageViews?: number;
  todayViews: number;
  periodViews: number;
  pages: { path: string; views: number }[];
  chart: { time: string; views: number }[];
  chartMode: "hourly" | "daily";
  periodLabel: string;
  dimensions: Dimensions;
  visitorStats?: {
    firstTimeBrowsers: number;
    returningVisits: number;
  };
  filters?: {
    page: string;
    country: string;
    availablePages: { path: string; views: number; unattributed?: boolean }[];
    availableCountries: DimensionRow[];
    pageTotalViews?: number;
    countryUnattributedPageViews?: number;
  };
  filtered?: boolean;
};

const ranges = ["24h", 7, 30, 90] as const;

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function pageLabel(path: string) {
  if (path === "/") return "Home";
  return path
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(" / ");
}

function locationLabel(label: string) {
  const [country, region] = label.split("-");
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    const countryName = names.of(country) ?? country;
    return region ? `${countryName} · ${region}` : countryName;
  } catch {
    return label;
  }
}

function chartLabel(time: string, hourly: boolean) {
  const date = new Date(time);
  return hourly
    ? date.toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", timeZone: "UTC" }) + " UTC"
    : date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function ClicksTracker() {
  const [range, setRange] = useState<(typeof ranges)[number]>(7);
  const [selectedPage, setSelectedPage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installHelp, setInstallHelp] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)));
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      setInstallHelp((open) => !open);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(range === "24h" ? { period: "24h" } : { days: String(range) });
      if (selectedPage) params.set("page", selectedPage);
      if (selectedCountry) params.set("country", selectedCountry);
      const response = await fetch(`/api/pageviews?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Analytics data could not be loaded.");
      const result = await response.json();
      setData(result);
    } catch {
      setError("We couldn’t load page view data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [range, selectedPage, selectedCountry]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.pages ?? []).filter((page) =>
      !query || page.path.toLowerCase().includes(query) || pageLabel(page.path).toLowerCase().includes(query),
    );
  }, [data?.pages, search]);
  const pageOnlyFilter = Boolean(data?.filters?.page && !data?.filters?.country);
  const countryFilter = Boolean(data?.filters?.country);
  const pageKnownCountryViews = (data?.filters?.availableCountries ?? []).reduce((sum, row) => sum + row.views, 0);
  const unattributedPageViews = selectedPage && data?.filters?.page === selectedPage
    ? Math.max(0, (data.filters.pageTotalViews ?? data.totalViews) - pageKnownCountryViews)
    : 0;
  const peak = Math.max(1, ...(data?.chart.map((item) => item.views) ?? [0]));

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-16">
      <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-end justify-center gap-0.5 rounded-xl bg-navy-900 pb-2.5">
              <span className="h-2 w-1.5 rounded-t-sm bg-gold-500" />
              <span className="h-4 w-1.5 rounded-t-sm bg-gold-500" />
              <span className="h-3 w-1.5 rounded-t-sm bg-gold-500" />
            </div>
            <div>
              <p className="text-sm font-bold leading-4 text-navy-900">Viewcount</p>
              <p className="mt-0.5 text-[11px] leading-3 text-gray-500">Website analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {installed && <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:inline-flex"><span className="size-1.5 rounded-full bg-emerald-500" /> App installed</span>}
            {!installed && <button type="button" onClick={() => void installApp()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-navy-900 shadow-sm transition hover:border-navy-200 hover:bg-gray-50">
              <ArrowDownToLine size={15} /> Install app
            </button>}
            <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            aria-label="Refresh analytics"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-navy-900 shadow-sm transition hover:border-navy-200 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          </div>
        </div>
        {installHelp && <div className="border-t border-gray-100 bg-navy-50/70 px-4 py-3 text-center text-xs text-navy-900">To install, open your browser menu and choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>.<button type="button" onClick={() => setInstallHelp(false)} className="ml-3 font-semibold underline">Got it</button></div>}
      </header>
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold-600">azariahmosiwa.com</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">Page views</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Page opens and traffic insights, updated as visitors browse.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm ring-1 ring-gray-200/80 sm:self-auto"><span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Live data</div>
        </div>

        {data && !data.configured && (
          <div className="mb-6 flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <Settings2 className="mt-0.5 shrink-0 text-amber-700" size={20} />
            <div>
              <h2 className="font-semibold">Analytics storage needs to be connected</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                Add <code className="rounded bg-amber-100 px-1 py-0.5">UPSTASH_REDIS_REST_URL</code> and <code className="rounded bg-amber-100 px-1 py-0.5">UPSTASH_REDIS_REST_TOKEN</code> to the deployment environment. Page views will be collected once both values are set.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            {error}
            <button type="button" onClick={() => void loadData()} className="font-semibold underline underline-offset-2">Retry</button>
          </div>
        )}

        <section aria-label="Filter page views" className="mb-6 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-navy-900">Filter views</h2>
              <p className="mt-1 text-xs text-gray-500">Choose a page, a country, or both.</p>
            </div>
            {(selectedPage || selectedCountry) && <button type="button" onClick={() => { setSelectedPage(""); setSelectedCountry(""); }} className="text-xs font-semibold text-navy-700 underline underline-offset-2">Clear filters</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-gray-600">
              Page
              <select value={selectedPage} onChange={(event) => { setSelectedPage(event.target.value); setSelectedCountry(""); }} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-navy-900 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100">
                <option value="">All pages</option>
                {(data?.filters?.availablePages ?? []).map((page) => page.unattributed
                  ? <option key={page.path} value={page.path} disabled>Not matched to a page · {formatNumber(page.views)} {page.views === 1 ? "view" : "views"}</option>
                  : <option key={page.path} value={page.path}>{pageLabel(page.path)} · {formatNumber(page.views)} {selectedCountry ? "views for this country" : "views"}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-gray-600">
              Country
              <select value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-navy-900 outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-100">
                <option value="">All countries</option>
                {(data?.filters?.availableCountries ?? []).map((row) => <option key={row.label} value={row.label}>{locationLabel(row.label)} · {formatNumber(row.views)} {selectedPage ? "views for this page" : "views"}</option>)}
              </select>
            </label>
          </div>
          {selectedPage && data?.filters?.page === selectedPage
            ? <p className="mt-3 text-xs leading-5 text-gray-500">
                {formatNumber(unattributedPageViews)} of {formatNumber(data.filters.pageTotalViews ?? data.totalViews)} all-time views for this page have no country attribution. Earlier views cannot be assigned to a country retroactively.
              </p>
            : countryFilter
              ? <p className="mt-3 text-xs leading-5 text-gray-400">{formatNumber(data?.filters?.countryUnattributedPageViews ?? 0)} {data?.filters?.countryUnattributedPageViews === 1 ? "view is" : "views are"} not matched to a page. These may have been recorded before page-by-country tracking began.</p>
              : null}
        </section>

        <section aria-label="Page view summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label={pageOnlyFilter ? "All-time page opens" : countryFilter ? "Matching page opens" : "Total page opens"} value={data?.totalViews ?? 0} detail={pageOnlyFilter ? "Historical total for selected page" : countryFilter && data?.filters?.countryUnattributedPageViews ? `${formatNumber(data.filters.countryUnattributedPageViews)} not matched to a page` : countryFilter ? "Since country tracking began" : data?.unlistedPageViews ? `Includes ${formatNumber(data.unlistedPageViews)} retired page view(s), hidden from the list` : "Across all tracked pages"} icon={<Eye size={18} />} />
          <SummaryCard label="Today" value={data?.todayViews ?? 0} detail="Since midnight UTC" icon={<Activity size={18} />} />
          <SummaryCard label={data?.periodLabel ?? (range === "24h" ? "Last 24 hours" : `Last ${range} days`)} value={data?.periodViews ?? 0} detail="Page opens in selected range" icon={<CalendarDays size={18} />} />
        </section>

        <section className="mt-6" aria-labelledby="visitor-returning-heading">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">Visitor continuity</p>
            <h2 id="visitor-returning-heading" className="mt-1 font-display text-2xl font-bold text-navy-900">First-time and returning</h2>
            <p className="mt-1 text-sm text-gray-500">All-time counts, independent of the page and country filters.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard label="First-time browsers" value={data?.visitorStats?.firstTimeBrowsers ?? 0} detail="Browsers first recorded since this feature launched" icon={<Users size={18} />} />
            <SummaryCard label="Returning visits" value={data?.visitorStats?.returningVisits ?? 0} detail="New visits from browsers seen before, after 30 minutes of inactivity" icon={<RefreshCw size={18} />} />
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-400">A random ID stays in the browser; the server stores only its hash for up to 400 days. Clearing browser storage or switching browsers/devices counts as first-time. Earlier page views can’t be classified.</p>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900">Traffic over time</h2>
                <p className="mt-1 text-sm text-gray-500">{data?.filtered ? "Matching page opens · UTC" : range === "24h" ? "Hourly page opens · UTC" : "Daily page opens · UTC"}</p>
              </div>
              <div className="inline-flex self-start rounded-lg bg-gray-100 p-1" aria-label="Chart date range">
                {ranges.map((days) => (
                  <button
                    key={days}
                    type="button"
                    aria-pressed={range === days}
                    onClick={() => setRange(days)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${range === days ? "bg-white text-navy-900 shadow-sm" : "text-gray-500 hover:text-navy-900"}`}
                  >
                    {days === "24h" ? "24h" : `${days}d`}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex h-52 items-end gap-1.5 sm:gap-2" role="img" aria-label={`${range === "24h" ? "24 hour" : `${range} day`} page views chart`}>
              {(data?.chart ?? []).map((item) => {
                const height = item.views ? Math.max(5, (item.views / peak) * 100) : 2;
                return (
                  <div key={item.time} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end" title={`${chartLabel(item.time, data?.chartMode === "hourly")}: ${formatNumber(item.views)} opens`}>
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-950 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block group-focus-within:block">
                      {chartLabel(item.time, data?.chartMode === "hourly")}: {formatNumber(item.views)}
                    </div>
                    <div
                      className={`w-full rounded-t-sm transition-colors ${item.views ? "bg-gold-500 group-hover:bg-gold-600" : "bg-gray-100"}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
              {!data?.chart.length && <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">{loading ? "Loading activity…" : "No page views in this period"}</div>}
            </div>
            <div className="mt-3 flex justify-between text-xs text-gray-400">
              <span>{data?.chart[0] ? chartLabel(data.chart[0].time, data.chartMode === "hourly") : ""}</span>
              <span>{data?.chart.at(-1) ? chartLabel(data.chart.at(-1)!.time, data.chartMode === "hourly") : ""}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900">Top pages</h2>
                <p className="mt-1 text-sm text-gray-500">{countryFilter ? "Matching views since filters were added" : pageOnlyFilter ? "Selected page total" : "Ranked by total opens"}</p>
              </div>
              <div className="rounded-lg bg-gold-50 p-2.5 text-gold-700"><Activity size={18} /></div>
            </div>
            {(data?.pages.length ?? 0) > 0 ? (
              <div className="space-y-5">
                {(data?.pages.slice(0, 5) ?? []).map((page, index) => {
                  const max = data?.pages[0]?.views || 1;
                  return (
                    <div key={page.path}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[11px] font-bold text-gray-500">{index + 1}</span>
                          <span className="truncate font-medium text-gray-700">{pageLabel(page.path)}</span>
                        </div>
                        <span className="shrink-0 font-semibold tabular-nums text-navy-900">{formatNumber(page.views)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.max(2, (page.views / max) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400">
                  <Clock3 size={13} /> All time
                </div>
              </div>
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center text-center">
                <Eye size={22} className="mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No page opens recorded yet</p>
                <p className="mt-1 text-xs text-gray-400">Page activity will appear here.</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6" aria-labelledby="traffic-insights-heading">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">Visitor context</p>
            <h2 id="traffic-insights-heading" className="mt-1 font-display text-2xl font-bold text-navy-900">Overall visitor context</h2>
            <p className="mt-1 text-sm text-gray-500">{data?.filtered ? "These summaries cover all views, independently of the filters above." : "Aggregate patterns from page opens and browser visits."}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <BreakdownPanel
              title="Entry sources"
              description="Referring site on landing"
              icon={<Share2 size={17} />}
              rows={data?.dimensions?.referrers ?? []}
            />
            <BreakdownPanel
              title="Country & region"
              description="Approximate IP-based location"
              icon={<Globe2 size={17} />}
              rows={[
                ...(data?.dimensions?.countries ?? []).map((row) => ({ ...row, label: `Country · ${locationLabel(row.label)}` })),
                ...(data?.dimensions?.regions ?? []).map((row) => ({ ...row, label: `Region · ${locationLabel(row.label)}` })),
              ].sort((a, b) => b.views - a.views)}
            />
            <BreakdownPanel
              title="Devices & browsers"
              description="Broad device and browser type"
              icon={<MonitorSmartphone size={17} />}
              rows={[
                ...(data?.dimensions?.devices ?? []).map((row) => ({ ...row, label: `Device · ${row.label}` })),
                ...(data?.dimensions?.browsers ?? []).map((row) => ({ ...row, label: `Browser · ${row.label}` })),
              ].sort((a, b) => b.views - a.views).slice(0, 6)}
            />
            <BreakdownPanel
              title="Campaigns"
              description="UTM campaign tags"
              icon={<Tag size={17} />}
              rows={data?.dimensions?.utm_campaigns?.length ? data.dimensions.utm_campaigns : data?.dimensions?.utm_sources ?? []}
              emptyLabel="No campaign tags recorded"
              footer={[
                ...(data?.dimensions?.utm_sources ?? []).slice(0, 2).map((row) => `source: ${row.label}`),
                ...(data?.dimensions?.utm_mediums ?? []).slice(0, 2).map((row) => `medium: ${row.label}`),
              ].join(" · ")}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-400">
            Referral data stores website hostnames only. Location is approximate; raw IP addresses and names are not stored. These breakdowns start with this update; earlier page totals remain available.
          </p>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900">{data?.filtered ? "Pages matching filters" : "All pages"}</h2>
              <p className="mt-1 text-sm text-gray-500">{data?.filtered ? "Page opens for the selected country and page" : "Every page path with recorded activity"}</p>
            </div>
            <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 px-3 text-gray-400 sm:w-64">
              <Search size={16} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pages"
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500">
                <tr><th className="px-5 py-3.5 font-semibold sm:px-7">Page</th><th className="px-5 py-3.5 font-semibold">Path</th><th className="px-5 py-3.5 text-right font-semibold sm:px-7">Total opens</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPages.map((page) => (
                  <tr key={page.path} className="transition hover:bg-gray-50/70">
                    <td className="px-5 py-4 font-medium text-navy-900 sm:px-7">{pageLabel(page.path)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{page.path}</td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-navy-900 sm:px-7">{formatNumber(page.views)}</td>
                  </tr>
                ))}
                {!loading && filteredPages.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-12 text-center text-sm text-gray-400">{search ? "No matching pages" : "No page opens recorded yet"}</td></tr>
                )}
                {loading && !data && <tr><td colSpan={3} className="px-5 py-12 text-center text-sm text-gray-400">Loading page data…</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5 text-xs text-gray-400 sm:px-7">
            <span>{formatNumber(filteredPages.length)} {filteredPages.length === 1 ? "page" : "pages"}</span>
            <span className="inline-flex items-center gap-1"><ArrowUpRight size={13} /> Counts update as pages are opened{!data?.filtered && data?.unlistedPageViews ? ` · ${formatNumber(data.unlistedPageViews)} retired page view(s) hidden` : ""}</span>
          </div>
        </section>

        <p className="mt-5 flex items-center justify-center gap-1 text-center text-xs text-gray-400">
          No names or raw IP addresses are stored. A random browser ID is used only to count first-time browsers and returning visits.
        </p>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="rounded-lg bg-navy-50 p-2.5 text-navy-800">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-navy-900">{formatNumber(value)}</p>
      <p className="mt-1.5 text-xs text-gray-400">{detail}</p>
    </div>
  );
}

function BreakdownPanel({
  title,
  description,
  icon,
  rows,
  emptyLabel = "No detail recorded yet",
  footer,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  rows: DimensionRow[];
  emptyLabel?: string;
  footer?: string;
}) {
  const visibleRows = rows.slice(0, 5);
  const max = Math.max(1, ...visibleRows.map((row) => row.views));

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy-900">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        <div className="rounded-lg bg-gold-50 p-2 text-gold-700">{icon}</div>
      </div>
      {visibleRows.length ? (
        <div className="space-y-3">
          {visibleRows.map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-gray-600">{row.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-navy-900">{formatNumber(row.views)}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.max(2, (row.views / max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-24 items-center justify-center text-center text-xs text-gray-400">{emptyLabel}</div>
      )}
      {footer && <p className="mt-4 border-t border-gray-100 pt-3 text-[11px] leading-5 text-gray-400">{footer}</p>}
    </div>
  );
}
