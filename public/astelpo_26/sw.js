/*
 * AstelPO service worker.
 *
 * Scope is /astelpo_26/ only — the marketing site is deliberately untouched.
 *
 * It caches the static shell (hashed build assets, icons, the offline page) and
 * nothing else. Pages are NOT cached: every AstelPO route is a signed-in,
 * server-rendered view of personal project data, and stashing that HTML on the
 * device would leave it readable after sign-out. Navigations therefore go to
 * the network, falling back to the offline page when there is none.
 */

const VERSION = "v1";
const SHELL_CACHE = `astelpo-shell-${VERSION}`;
const OFFLINE_URL = "/astelpo_26/offline";

const PRECACHE = [
  OFFLINE_URL,
  "/astelpo_26/manifest.webmanifest",
  "/astelpo_26/icons/icon-192.png",
  "/astelpo_26/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // One bad URL must not fail the whole install, so add them individually.
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => {})
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith("astelpo-") && k !== SHELL_CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/** Hashed build output and icons — immutable, so cache-first is safe. */
function isShellAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/astelpo_26/icons/") ||
    url.pathname === "/astelpo_26/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never touch auth or API traffic.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/astelpo_26/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          const offline = await cache.match(OFFLINE_URL);
          return (
            offline ??
            new Response("You are offline.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }
      })()
    );
    return;
  }

  if (isShellAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })()
    );
  }
});

// Lets the page activate a waiting worker immediately after an update.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
