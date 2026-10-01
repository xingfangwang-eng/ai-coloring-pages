import type { MetadataRoute } from 'next';
import citiesData from '@/data/cities.json';
import appliancesData from '@/data/appliances.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.wangdadi.xyz';

  // 1. 核心静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
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

  // 2. 20 个高风险城市页面
  const cityPages: MetadataRoute.Sitemap = citiesData.map((city) => ({
    url: `${baseUrl}/power/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. 8 大核心家电带载专属页面 (高意图转化词)
  const appliancePages: MetadataRoute.Sitemap = appliancesData.map((item) => ({
    url: `${baseUrl}/appliances/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9, // 给家电痛点词更高的权重优先级
  }));

  return [...staticPages, ...cityPages, ...appliancePages];
}