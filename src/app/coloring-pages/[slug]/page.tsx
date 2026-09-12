/**
 * /coloring-pages/[slug]/page.tsx —— pSEO 动态着色页详情页
 *
 * 架构：
 *   - generateStaticParams 预渲染 156 个长尾 slug（52 主题 × 3 受众）
 *   - 使用 Pollinations 确定性 seed 保证同一 slug 每次同一张图
 *   - 注入 JSON-LD（WebPage + ImageObject + FAQPage）增强 GEO
 *   - 客户端组件处理双格式 PDF 导出（US Letter + A4）
 *
 * SEO 优化：
 *   - Title / Description 针对北美长尾词
 *   - FAQ Schema 覆盖 "safe for kids" / "classroom use" 等高意图问答
 *   - 面包屑 + 内部链接导流
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  parseSlug,
  buildEntry,
  getAllUSColoringSlugs,
} from "@/lib/us-coloring-data";
import type { ColoringEntry } from "@/lib/us-coloring-data";
import { PseoClientActions } from "./pseo-client-actions";
import LineartImage from "@/components/lineart-image";

/* ============================================================
 * Generate Static Params —— 预渲染所有 156 个 slug
 * ============================================================ */

export function generateStaticParams() {
  const slugs = getAllUSColoringSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** 开启动态参数 —— 预渲染列表外的 slug 也能实时解析渲染，不抛 404 */
export const dynamicParams = true;

/* ============================================================
 * Generate Metadata —— SEO/GEO 优化
 * ============================================================ */

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) {
    return {
      title: "Coloring Page Not Found - wangdadi.xyz",
    };
  }

  const entry = buildEntry(parsed.subject, parsed.style, parsed.audience);
  const canonical = `https://wangdadi.xyz/coloring-pages/${slug}`;

  return {
    title: entry.htmlTitle,
    description: entry.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: entry.htmlTitle,
      description: entry.metaDescription,
      url: canonical,
      type: "article",
      siteName: "AI Coloring Pages - wangdadi.xyz",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.htmlTitle,
      description: entry.metaDescription,
    },
  };
}

/* ============================================================
 * Page Component
 * ============================================================ */

export default async function ColoringPageDetail(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const entry = buildEntry(parsed.subject, parsed.style, parsed.audience);
  const { url: imageUrl, finalSeed } = await fetchImage(entry, parsed.subject.prompt);

  // FAQ questions — 针对北美家长/老师
  const faqs = buildFaqs(entry);

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/coloring-pages/for-kids" className="hover:text-primary">Coloring Pages</Link>
          <span>/</span>
          <span className="text-foreground">{entry.displayTitle}</span>
        </div>
      </nav>

      {/* Main content */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Image + Actions */}
          <div className="lg:col-span-3">
            <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Free Printable {entry.displayTitle}
            </h1>
            <p className="mb-6 text-muted-foreground">
              {entry.subject.description}
            </p>

            {/* Image container — LineartImage 自动裁切水印 + 容错重试 */}
            <LineartImage
              src={imageUrl}
              alt={`Free printable ${entry.displayTitle} coloring page`}
              className="border shadow-sm"
            />

            {/* 调试信息 —— 确认代码是否真正生效 */}
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Seed: {finalSeed} | Model: Flux-LineArt
            </p>

            {/* Action buttons (client component handles PDF export) */}
            <PseoClientActions
              imageUrl={imageUrl}
              displayTitle={entry.displayTitle}
              seed={entry.deterministicSeed}
            />
          </div>

          {/* Right: Info + Related */}
          <aside className="space-y-6 lg:col-span-2">
            {/* Category badge */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                About This Page
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Theme</dt>
                  <dd className="font-medium capitalize">{entry.subject.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Perfect For</dt>
                  <dd className="font-medium">{entry.audience.label}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Line Style</dt>
                  <dd className="font-medium">
                    {entry.audience.complexity === "kids" ? "Thick & Bold" : "Intricate"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">File Size</dt>
                  <dd className="font-medium">2048 × 2048 px</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Completely Free</dt>
                  <dd className="font-medium text-green-600">No sign-up!</dd>
                </div>
              </dl>
            </div>

            {/* All audience variants for this theme */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Need a Different Version?
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/coloring-pages/${entry.style.slug}-${entry.subject.slug}-for-toddlers`}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
                >
                  For Toddlers
                </Link>
                <Link
                  href={`/coloring-pages/${entry.style.slug}-${entry.subject.slug}-for-preschoolers`}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
                >
                  For Preschoolers
                </Link>
                <Link
                  href={`/coloring-pages/${entry.style.slug}-${entry.subject.slug}-for-kids`}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
                >
                  For Kids
                </Link>
                <Link
                  href={`/coloring-pages/${entry.style.slug}-${entry.subject.slug}-for-adults`}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
                >
                  For Adults
                </Link>
              </div>
            </div>

            {/* Back to all coloring pages */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Explore more coloring pages
            </Link>
          </aside>
        </div>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <h3
                  className="px-5 py-4 font-medium"
                  itemProp="name"
                >
                  {faq.q}
                </h3>
                <div
                  className="border-t px-5 py-4 text-sm text-muted-foreground"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p itemProp="text">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(entry, faqs)),
        }}
      />
    </main>
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */

/** 获取图片 —— 极简纯净 prompt + turbo 模型
 *
 * 反写实终极原则：
 *   1. 严禁出现任何否定词（no X 会激活 X 的权重！Flux/Turbo 都有这个 bug）
 *   2. 只用正向词堆砌最核心的线稿概念
 *   3. model=turbo（SDXL-Turbo 简笔画专家）
 *   4. seed + 9999999 彻底砸烂历史 CDN 缓存
 */
async function fetchImage(
  entry: ColoringEntry,
  pureSubject: string
): Promise<{ url: string; finalSeed: number }> {
  // 100% 正向词，无任何否定式
  const promptText =
    `coloring book page of a ${pureSubject}, black line art outline, simple vector contour, white background`;

  const encodedPrompt = encodeURIComponent(promptText);
  const finalSeed = ((entry.deterministicSeed + 9_999_999) % 2_147_483_646) + 1;
  const url =
    `https://image.pollinations.ai/prompt/${encodedPrompt}` +
    `?width=1024&height=1024&model=turbo&nologo=true&seed=${finalSeed}`;

  return { url, finalSeed };
}

interface Faq { q: string; a: string; }

function buildFaqs(entry: ColoringEntry): Faq[] {
  const title = entry.displayTitle;
  return [
    {
      q: `Is this ${title} safe for young kids?`,
      a: entry.audience.complexity === "kids"
        ? `Yes! This ${title.toLowerCase()} features thick, clean outlines designed specifically for crayons, markers, and preschool coloring. No small details to frustrate little hands.`
        : `This ${title.toLowerCase()} works well for kids aged 8+ who enjoy more detailed coloring. If you're looking for simpler designs, check out the "for Toddlers" version.`,
    },
    {
      q: `Can I use this ${title} for classroom use?`,
      a: "Absolutely! All coloring pages on wangdadi.xyz are 100% free for teachers, homeschoolers, parents, and classroom use. Print as many copies as you need for your students.",
    },
    {
      q: "Do I need to sign up or create an account?",
      a: "No sign-up required. No email needed. Just click download and start coloring — completely free, forever.",
    },
    {
      q: "What paper size should I use?",
      a: "Our coloring pages are optimized for both US Letter (8.5 × 11 inches / 216 × 279 mm) and A4 paper. The PDF buttons below let you choose your preferred format.",
    },
    {
      q: "Can I use these with digital coloring apps?",
      a: "Yes! The high-resolution PNG (2048 × 2048 px) downloads work perfectly with Procreate, GoodNotes, Notability, or any digital coloring app on tablet or desktop.",
    },
  ];
}

function buildJsonLd(
  entry: ColoringEntry,
  faqs: Faq[]
): Record<string, unknown>[] {
  const url = `https://wangdadi.xyz/coloring-pages/${entry.slug}`;

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: entry.displayTitle,
    description: entry.metaDescription,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "AI Coloring Pages - wangdadi.xyz",
      url: "https://wangdadi.xyz",
    },
  };

  const imageObject = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: entry.displayTitle,
    description: `Free printable ${entry.displayTitle} coloring page in black and white line art`,
    url,
    contentUrl: url,
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    isAccessibleForFree: true,
  };

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

  return [webPage, imageObject, faqPage];
}
