import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.wangdadi.xyz';

  // 严格控制在 7 个最高权重、信息密度顶级的精锐页面，打破收录率死锁
  return [
    // 1. 核心首页
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // 2. 独立 30% 联邦退税计算器
    {
      url: `${baseUrl}/calculators/tax-credit`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // 3. 3 篇覆盖高出价黄金词的重型指南
    {
      url: `${baseUrl}/guides/best-solar-generator-for-whole-house`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/guides/ecoflow-delta-pro-whole-house-generator-review`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/guides/best-generator-for-off-grid-living`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    // 4. 仅保留 2 个已抓取且数据最完整的旗舰城市做单点突破
    {
      url: `${baseUrl}/power/florida-miami`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/power/texas-houston`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}