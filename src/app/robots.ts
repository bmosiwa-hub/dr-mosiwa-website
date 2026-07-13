import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/hervoice_26/" },
    sitemap: "https://www.azariahmosiwa.com/sitemap.xml",
  };
}
