import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/privacy-policy", "/terms-and-conditions", "/refund-policy"],
        disallow: ["/dashboard", "/settings", "/exams/", "/exam", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://www.examklaar.nl/sitemap.xml",
  };
}
