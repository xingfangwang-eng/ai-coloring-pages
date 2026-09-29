import type { MetadataRoute } from 'next';
// 自动导入你的城市数据
import citiesData from '@/data/cities.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.wangdadi.xyz';

  // 1. 核心基础页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0, // 首页最高权重
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

  // 2. 自动从 cities.json 提取所有城市页面生成 URL
  const cityPages: MetadataRoute.Sitemap = citiesData.map((city) => ({
    url: `${baseUrl}/power/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8, // 城市长尾页次高权重
  }));

  // 合并导出完整的站点地图
  return [...staticPages, ...cityPages];
}