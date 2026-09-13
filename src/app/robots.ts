/**
 * robots.ts —— Next.js App Router robots.txt
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/workspace", "/profile"],
      },
    ],
    sitemap: "https://www.wangdadi.xyz/sitemap.xml",
  };
}
