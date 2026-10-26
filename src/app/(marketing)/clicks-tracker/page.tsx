import type { Metadata } from "next";
import ClicksTracker from "@/components/ClicksTracker";

export const metadata: Metadata = {
  title: "Clicks Tracker",
  description: "Anonymous page opens, traffic sources, and visitor context across azariahmosiwa.com.",
  alternates: { canonical: "/clicks-tracker" },
};

export default function ClicksTrackerPage() {
  return <ClicksTracker />;
}
