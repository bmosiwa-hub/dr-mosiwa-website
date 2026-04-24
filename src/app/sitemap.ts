import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.drmosiwa.com"; // ← update to your actual domain

  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/experience`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/work-experience`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/publications`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/clients`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.7 },
  ];
}
