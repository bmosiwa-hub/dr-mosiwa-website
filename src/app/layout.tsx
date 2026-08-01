import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const DOMAIN = "https://www.azariahmosiwa.com";

export const metadata: Metadata = {
  title: {
    default: "Dr. Benjamin Azariah Mosiwa – International Health & Development Expert",
    template: "%s | Dr. Benjamin Azariah Mosiwa",
  },
  description:
    "Dr. Benjamin Azariah Mosiwa is a Senior International Health & Development Expert with 10+ years of experience across 9+ African countries. Expert in health and development systems strengthening, health financing, policy reform, and programme evaluation for governments, donors, and NGOs.",
  keywords: [
    "Benjamin Mosiwa",
    "Azariah Mosiwa",
    "Benjamin Azariah Mosiwa",
    "Dr Benjamin Mosiwa",
    "Dr Azariah Mosiwa",
    "Dr Benjamin Azariah Mosiwa",
    "international health and development expert",
    "health and development policy consultant Africa",
    "health and development systems strengthening",
    "global health and development evaluation consultant",
    "health financing Africa",
    "USAID health consultant",
    "World Bank health advisor",
    "Malawi health and development consultant",
    "mixed methods evaluation Africa",
    "digital health policy Africa",
    "health development consultant Malawi",
    "global health development specialist",
  ],
  authors: [{ name: "Dr. Benjamin Azariah Mosiwa" }],
  creator: "Dr. Benjamin Azariah Mosiwa",
  metadataBase: new URL(DOMAIN),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: DOMAIN,
    title: "Dr. Benjamin Azariah Mosiwa – International Health & Development Expert",
    description:
      "Dr. Benjamin Azariah Mosiwa — Senior International Health & Development Expert with 10+ years of experience across 9+ African countries. Supporting governments, donors, and NGOs to design and evaluate high-impact health and development programmes.",
    siteName: "Dr. Benjamin Azariah Mosiwa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Benjamin Azariah Mosiwa – International Health & Development Expert",
    description:
      "Senior International Health & Development Expert with 10+ years of experience across Africa. Expert in health and development systems, financing, policy reform, and programme evaluation.",
    creator: "@azariahmosiwa",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Benjamin Azariah Mosiwa",
  alternateName: ["Dr. Benjamin Mosiwa", "Azariah Mosiwa", "Dr. Azariah Mosiwa", "Benjamin Mosiwa"],
  honorificPrefix: "Dr.",
  jobTitle: "International Health & Development Expert",
  description:
    "Senior International Health & Development Expert with 10+ years of experience supporting governments and donors across Africa to design, evaluate, and implement high-impact health and development policies and programmes.",
  url: DOMAIN,
  sameAs: ["https://linkedin.com/in/azariahmosiwa"],
  nationality: "Malawian",
  knowsAbout: [
    "Health and Development Systems Strengthening",
    "Health and Development Policy",
    "Health Financing",
    "Primary Health Care",
    "Programme Evaluation",
    "Digital Health",
    "HIV/AIDS",
    "Sexual and Reproductive Health",
    "MNCH",
    "Political Economy Analysis",
    "Governance",
    "Social Development",
  ],
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Edinburgh", url: "https://www.ed.ac.uk" },
    { "@type": "CollegeOrUniversity", name: "University of Malawi" },
  ],
  worksFor: {
    "@type": "Organization",
    name: "Independent International Health & Development Expert",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <Script
          id="json-ld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
