import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/privacy-policy", "/terms-and-conditions", "/refund-policy"],
        disallow: ["/dashboard", "/settings", "/exams/", "/exam", "/api/", "/auth/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
