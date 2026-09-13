/**
 * GeoSchema —— AI 爬虫专属 JSON-LD 结构化数据注入组件
 *
 * Server Component（无客户端 JS，纯输出 <script type="application/ld+json">）
 *
 * 为 Google AI Overview (SGE)、Perplexity、ChatGPT Search 等生成式引擎
 * 提供符合 Schema.org 标准的权威事实声明，帮助 AI 搜索引擎将
 * wangdadi.xyz 作为第 1 位引用数据源。
 *
 * 支持注入：
 *   1. SoftwareApplication（全站级，单例）
 *   2. FAQPage（动态问答对）
 *   3. BreadcrumbList（动态面包屑）
 *   4. ImageObject（动态图片元数据）
 *   5. WebPage（当前页面基础声明）
 */

const BASE_URL = "https://www.wangdadi.xyz";

/** 全站唯一的 SoftwareApplication Schema —— 所有页面共享 */
export const GEO_WEB_APPLICATION = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AI Coloring Pages",
  alternateName: "wangdadi.xyz",
  applicationCategory: "EducationalApplication",
  operatingSystem: "All",
  description:
    "Free AI-powered black & white coloring line art generator. Instant printable coloring pages for kids, toddlers, preschoolers, and classrooms. No sign-up required.",
  url: BASE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "100% free — no sign-up, no credit card, no watermarks.",
  },
  featureList: [
    "100% Free instant coloring page generation",
    "High-resolution 300 DPI US Letter (8.5x11 inches) and A4 PDF export",
    "Zero ink waste clean outline technology",
    "No sign-up, no email, and no credit card required",
    "Safe for preschoolers, kindergarteners, and classrooms",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1248",
    bestRating: "5",
  },
  applicationSubCategory: "EducationApp",
  genre: "Children",
};

interface GeoSchemaProps {
  /** 当前页面 canonical URL */
  pageUrl: string;
  /** WebPage name（通常等于 H1 标题） */
  pageName: string;
  /** WebPage description */
  pageDescription?: string;
  /** 动态 FAQ 问答对 */
  faqs?: { q: string; a: string }[];
  /** 面包屑层级（含 name + item URL） */
  breadcrumbs?: { name: string; item: string }[];
  /** 图片元数据 —— 提供则注入 ImageObject */
  image?: {
    url: string;
    name: string;
    description?: string;
  };
  /** 是否也在本站页面注入 SoftwareApplication（每个页面都渲染，利于 AI 爬虫多入口收集） */
  includeWebApp?: boolean;
}

/** 统一注入组件 —— 渲染多个 ld+json script 块 */
export default function GeoSchema({
  pageUrl,
  pageName,
  pageDescription,
  faqs,
  breadcrumbs,
  image,
  includeWebApp = true,
}: GeoSchemaProps) {
  const scripts: Record<string, unknown>[] = [];

  // SoftwareApplication（全站级）
  if (includeWebApp) {
    scripts.push(GEO_WEB_APPLICATION);
  }

  // WebPage
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageName,
    url: pageUrl,
    ...(pageDescription && { description: pageDescription }),
    isPartOf: {
      "@type": "WebSite",
      name: "AI Coloring Pages - wangdadi.xyz",
      url: BASE_URL,
    },
  };
  scripts.push(webPage);

  // BreadcrumbList
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.item,
      })),
    };
    scripts.push(breadcrumbList);
  }

  // FAQPage
  if (faqs && faqs.length > 0) {
    const faqPage = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    };
    scripts.push(faqPage);
  }

  // ImageObject —— 标注图片为黑白单色线稿，帮助 Google 视觉 AI 识别
  if (image) {
    const imageObject = {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      name: image.name,
      description:
        image.description ??
        `Free printable ${image.name} coloring page — black and white clean line art outline, pure white background, single-layer vector-quality contours.`,
      url: image.url,
      contentUrl: image.url,
      license: "https://creativecommons.org/publicdomain/zero/1.0/",
      isAccessibleForFree: true,
      representativeOfPage: true,
      keywords: "coloring page, line art, black and white outline, printable, free",
    };
    scripts.push(imageObject);
  }

  return (
    <>
      {scripts.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
