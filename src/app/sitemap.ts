/**
 * sitemap.ts —— 自动遍历所有 pSEO slugs
 *
 * 基础 URL：https://wangdadi.xyz
 * 覆盖：首页 + 156 个着色页 + 其它静态页面
 */

import type { MetadataRoute } from "next";
import { getAllUSColoringSlugs } from "@/lib/us-coloring-data";

const BASE_URL = "https://wangdadi.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // pSEO 着色页 —— 每个 slug 一个条目
  const coloringSlugs = getAllUSColoringSlugs();
  const coloringPages: MetadataRoute.Sitemap = coloringSlugs.map((slug) => ({
    url: `${BASE_URL}/coloring-pages/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...coloringPages];
}
