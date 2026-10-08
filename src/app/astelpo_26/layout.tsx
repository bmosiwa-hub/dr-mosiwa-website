import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistrar } from "@/components/layout/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: { default: "AstelPO", template: "%s | AstelPO" },
  description: "Astellic Project Office — Personal PMO",
  // Scoped to /astelpo_26 so the marketing site stays a plain website.
  manifest: "/astelpo_26/manifest.webmanifest",
  applicationName: "AstelPO",
  appleWebApp: {
    capable: true,
    title: "AstelPO",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/astelpo_26/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/astelpo_26/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/astelpo_26/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  // An installed app is not a search result.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  // Keeps the shell under the status bar on phones with a notch.
  viewportFit: "cover",
};

export default function AstelPOLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full antialiased">
      {children}
      <ServiceWorkerRegistrar />
    </div>
  );
}
