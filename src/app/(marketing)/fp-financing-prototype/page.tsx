import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FP Financing Hub Prototype",
  description:
    "Interactive prototype of a Family Planning Financing Hub: financing trends, country profiles, mechanisms, scenario tools and practices.",
};

export default function FpFinancingPrototypePage() {
  return (
    // The prototype is a standalone HTML app with its own styles and fixed
    // sidebar, so it is framed below the site header rather than inlined.
    <div className="pt-16 md:pt-20 bg-navy-900">
      <iframe
        src="/prototypes/fp-financing-hub.html"
        title="FP Financing Hub prototype"
        className="block w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] border-0 bg-white"
      />
    </div>
  );
}
