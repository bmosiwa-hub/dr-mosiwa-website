import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "AstelPO", template: "%s | AstelPO" },
  description: "Astellic Project Office — Personal PMO",
};

export default function AstelPOLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full antialiased">
      {children}
    </div>
  );
}
