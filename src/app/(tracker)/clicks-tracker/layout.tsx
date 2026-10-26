import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Viewcount · Website analytics",
  description: "A private dashboard for aggregate page views across azariahmosiwa.com.",
  manifest: "/clicks-tracker/manifest.webmanifest",
  alternates: { canonical: "/clicks-tracker" },
  appleWebApp: {
    capable: true,
    title: "Viewcount",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f7fa",
  width: "device-width",
  initialScale: 1,
};

export default function TrackerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
