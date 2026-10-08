import type { MetadataRoute } from "next";
import { isLiveSite, siteUrl } from "@/lib/seo";

// Only the live site is crawled; previews and local builds must never
// compete with it in search results. Private links are also sent
// X-Robots-Tag: noindex (next.config.ts), since a disallow alone does not
// stop a linked URL being indexed.
export default function robots(): MetadataRoute.Robots {
  if (!isLiveSite()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/session/",
        "/my/session/",
        "/manage/",
        "/my/manage/",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
