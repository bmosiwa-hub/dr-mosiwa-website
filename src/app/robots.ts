import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.drmosiwa.com/sitemap.xml", // ← update to your actual domain
  };
}
