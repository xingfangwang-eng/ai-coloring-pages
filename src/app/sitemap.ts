import type { MetadataRoute } from 'next';
import citiesData from '@/data/cities.json';
import appliancesData from '@/data/appliances.json';
import guidesData from '@/data/guides.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.wangdadi.xyz';

  // 1. 核心静态页面与理财工具
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calculators/tax-credit`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. 3 篇覆盖 ¥167 高客单黄金词的重型指南
  const guidePages: MetadataRoute.Sitemap = guidesData.map((g) => ({
    url: `${baseUrl}/guides/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.95,
  }));

  // 3. 20 个高断电风险城市页面
  const cityPages: MetadataRoute.Sitemap = citiesData.map((city) => ({
    url: `${baseUrl}/power/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. 8 大家电带载专属页面
  const appliancePages: MetadataRoute.Sitemap = appliancesData.map((item) => ({
    url: `${baseUrl}/appliances/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticPages, ...guidePages, ...cityPages, ...appliancePages];
}