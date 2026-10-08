"use client";

import { useEffect } from "react";

/**
 * Registers the AstelPO service worker, which is what makes the app
 * installable to a home screen. Renders nothing.
 *
 * Development is skipped on purpose: a worker caching dev assets survives
 * rebuilds and serves stale chunks, which looks exactly like a broken app.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/astelpo_26/sw.js", { scope: "/astelpo_26/" })
        .catch(() => {
          // An unavailable worker costs the install prompt, not the app.
        });
    };

    // Registering after load keeps it off the critical path for first paint.
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
