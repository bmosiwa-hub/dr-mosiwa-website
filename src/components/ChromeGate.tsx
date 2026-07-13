"use client";

import { usePathname } from "next/navigation";

/** Hides site chrome (e.g. Footer) on standalone app routes like /hervoice_26 */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/hervoice")) return null;
  return <>{children}</>;
}
