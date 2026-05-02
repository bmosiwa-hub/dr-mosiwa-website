import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DOMAIN = "https://www.azariahmosiwa.com";

export const metadata: Metadata = {
  title: {
    default: "Dr. Benjamin Azariah Mosiwa – International Health & Development Expert",
    template: "%s | Dr. Benjamin Azariah Mosiwa",
  },
  description:
    "Dr. Benjamin Azariah Mosiwa is a Senior Health Systems & Policy Consultant with 10+ years of experience across 9+ African countries. Expert in health systems strengthening, health financing, PHC reform, and programme evaluation for governments, donors, and NGOs.",
  keywords: [
    // Name variations — the most important for personal brand SEO
    "Benjamin Mosiwa",
    "Azariah Mosiwa",
    "Benjamin Azariah Mosiwa",
    "Dr Benjamin Mosiwa",
    "Dr Azariah Mosiwa",
    "Dr Benjamin Azariah Mosiwa",
    // Profession keywords
    "health policy consultant Africa",
    "health systems strengthening expert",
    "global health evaluation consultant",
    "PHC reform consultant",
    "health financing Africa",
    "USAID health consultant",
    "World Bank health advisor",
    "Malawi health policy consultant",
    "mixed methods evaluation Africa",
    "digital health policy Africa",
    "health systems consultant Malawi",
    "global health policy specialist",
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
      "Dr. Benjamin Azariah Mosiwa — Senior Health Systems & Policy Consultant with 10+ years of experience across 9+ African countries. Supporting governments, donors, and NGOs to design and evaluate high-impact health programmes.",
    siteName: "Dr. Benjamin Azariah Mosiwa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Benjamin Azariah Mosiwa – International Health & Development Expert",
    description:
      "Senior Health Systems & Policy Consultant with 10+ years of experience across Africa. Expert in health financing, PHC reform, and programme evaluation.",
    creator: "@azariahmosiwa",
  },
};

// JSON-LD structured data — tells Google exactly who this person is
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Benjamin Azariah Mosiwa",
  alternateName: ["Dr. Benjamin Mosiwa", "Azariah Mosiwa", "Dr. Azariah Mosiwa", "Benjamin Mosiwa"],
  honorificPrefix: "Dr.",
  jobTitle: "International Health & Development Expert",
  description:
    "Senior Health Systems & Policy Consultant with 10+ years of experience supporting governments and donors across Africa to design, evaluate, and implement high-impact health policies and programmes.",
  url: DOMAIN,
  sameAs: [
    "https://linkedin.com/in/azariahmosiwa",
  ],
  nationality: "Malawian",
  knowsAbout: [
    "Health Systems Strengthening",
    "Health Policy",
    "Health Financing",
    "Primary Health Care",
    "Programme Evaluation",
    "Digital Health",
    "HIV/AIDS",
    "Sexual and Reproductive Health",
    "MNCH",
    "Political Economy Analysis",
  ],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "University of Edinburgh",
      url: "https://www.ed.ac.uk",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "University of Malawi",
    },
  ],
  worksFor: {
    "@type": "Organization",
    name: "Independent Health Systems & Policy Consultant",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          id="json-ld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
