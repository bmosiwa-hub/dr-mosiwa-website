/*
 * Kill switch for the old AstelPO service worker.
 *
 * AstelPO moved to https://astelpo.astellic.com. Any browser that installed
 * the app from /astelpo_26 still has the previous worker registered against
 * this origin, where the app no longer exists. A registered worker is not
 * removed by deleting the pages it served — it keeps control until something
 * replaces it, which is what this does.
 *
 * It takes over, drops the caches, unregisters itself, and sends any open
 * window to the new home. It has no fetch handler, so it stops intercepting
 * immediately. This file must keep being served from this path: the browser
 * only picks up a replacement if the old URL still responds.
 */

const NEW_HOME = "https://astelpo.astellic.com/today";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));

      await self.registration.unregister();

      const windows = await self.clients.matchAll({ type: "window" });
      for (const client of windows) {
        try {
          await client.navigate(NEW_HOME);
        } catch {
          // A client that refuses navigation still loses the worker above.
        }
      }
    })()
  );
});
