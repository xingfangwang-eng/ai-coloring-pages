/**
 * /coloring-pages/[slug]/page.tsx —— pSEO 动态着色页详情页
 *
 * GEO 双轨体系：
 *   🤖 AI 爬虫：GeoSchema JSON-LD（SoftwareApplication + WebPage + FAQPage + BreadcrumbList + ImageObject）
 *   👤 人类用户：BLUF 事实矩阵卡片（H1 正下方 60-80 词摘要 + 键值对事实）
 *
 * FAQ 实现：原生 <details>/<summary> —— 零 JS、可被爬虫直接读取、
 * Google Rich Results Test 可正确识别 FAQPage schema。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  parseSlug,
  buildEntry,
  getAllUSColoringSlugs,
  AUDIENCES,
  SUBJECTS,
} from "@/lib/us-coloring-data";
import type { ColoringEntry } from "@/lib/us-coloring-data";
import { PseoClientActions } from "./pseo-client-actions";
import LineartImage from "@/components/lineart-image";
import GeoSchema from "@/components/geo-schema";
import BlufSummary from "@/components/bluf-summary";
import { getHomepageSvg } from "@/lib/fallback-svgs";

const BASE_URL = "https://wangdadi.xyz";

/**
 * 判断 slug 是否为 audience slug（for-kids / for-toddlers / for-preschoolers / for-adults）
 */
function getAudienceFromSlug(slug: string) {
  return AUDIENCES.find((a) => a.slug === slug.toLowerCase());
}

/** 判断 slug 是否为 subject category（animals / holidays / vehicles / fantasy / nature / food / characters / education） */
function getCategoryFromSlug(slug: string) {
  const VALID_CATEGORIES = new Set([
    "animals", "holidays", "vehicles", "fantasy", "nature", "food", "characters", "education",
  ]);
  const lower = slug.toLowerCase();
  return VALID_CATEGORIES.has(lower) ? lower : null;
}

/**
 * 判断 slug 是否为 filter keyword（for-halloween / for-christmas / for-butterfly 等）
 * 语义：列出所有 subject slug 中包含 keyword 的着色页
 * 返回 filter keyword（去掉 "for-" 前缀后的值）
 */
function getFilterKeywordFromSlug(slug: string): string | null {
  const lower = slug.toLowerCase();
  if (!lower.startsWith("for-")) return null;
  const keyword = lower.slice(4);
  if (!keyword) return null;
  // 必须至少有一个 subject.slug 包含这个 keyword
  return SUBJECTS.some((s) => s.slug.includes(keyword)) ? keyword : null;
}

/* ============================================================
 * Generate Static Params
 * ============================================================ */

export function generateStaticParams() {
  const slugs = getAllUSColoringSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = true;

/* ============================================================
 * Generate Metadata —— SEO/GEO
 * ============================================================ */

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);

  // 1️⃣ 完整 slug → 详情页 metadata
  if (parsed) {
    const entry = buildEntry(parsed.subject, parsed.style, parsed.audience);
    const canonical = `${BASE_URL}/coloring-pages/${slug}`;
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

  // 2️⃣ Audience / Category / Filter slug → 聚合列表页 metadata
  const audience = !parsed ? getAudienceFromSlug(slug) : null;
  const category = !parsed && !audience ? getCategoryFromSlug(slug) : null;
  const filterKw = !parsed && !audience && !category ? getFilterKeywordFromSlug(slug) : null;

  if (audience) {
    const title = `Coloring Pages for ${audience.label} — 100% Free Printable`;
    const description = `Browse all free printable coloring pages for ${audience.label.toLowerCase()}. Clean black line art, bold outlines, US Letter & A4 PDF export, no sign-up required.`;
    return {
      title,
      description,
      alternates: { canonical: `${BASE_URL}/coloring-pages/${slug}` },
      openGraph: { title, description, url: `${BASE_URL}/coloring-pages/${slug}`, type: "website", siteName: "AI Coloring Pages - wangdadi.xyz" },
    };
  }

  if (category) {
    const title = `${category.replace(/\b\w/g, (c) => c.toUpperCase())} Coloring Pages — 100% Free Printable`;
    const description = `Browse all free printable ${category} coloring pages. Clean black line art, bold outlines for toddlers and kids, US Letter & A4 PDF export, no sign-up required.`;
    return {
      title,
      description,
      alternates: { canonical: `${BASE_URL}/coloring-pages/${slug}` },
      openGraph: { title, description, url: `${BASE_URL}/coloring-pages/${slug}`, type: "website", siteName: "AI Coloring Pages - wangdadi.xyz" },
    };
  }

  if (filterKw) {
    const title = `${filterKw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Coloring Pages — 100% Free Printable`;
    const description = `Browse all free printable ${filterKw.replace(/-/g, " ")} coloring pages. Clean black line art, US Letter & A4 PDF export, no sign-up required. Perfect for parties, classroom activities, and creative fun.`;
    return {
      title,
      description,
      alternates: { canonical: `${BASE_URL}/coloring-pages/${slug}` },
      openGraph: { title, description, url: `${BASE_URL}/coloring-pages/${slug}`, type: "website", siteName: "AI Coloring Pages - wangdadi.xyz" },
    };
  }

  return { title: "Coloring Page Not Found - wangdadi.xyz" };
}

/* ============================================================
 * Page Component
 * ============================================================ */

export default async function ColoringPageDetail(
  { params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }
) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1") || 1);

  const parsed = parseSlug(slug);

  // 1️⃣ Audience slug（for-kids / for-adults / ...）→ 聚合列表页
  const audience = !parsed ? getAudienceFromSlug(slug) : null;
  // 2️⃣ Category slug（animals / holidays / ...）→ 聚合列表页
  const category = !parsed && !audience ? getCategoryFromSlug(slug) : null;
  // 3️⃣ Filter keyword（for-halloween / for-christmas / ...）→ 聚合列表页
  const filterKw = !parsed && !audience && !category ? getFilterKeywordFromSlug(slug) : null;

  if (audience) return <AudienceListing audienceSlug={audience.slug} audienceLabel={audience.label} page={page} />;
  if (category) return <CategoryListing categorySlug={category} page={page} />;
  if (filterKw) return <FilterListing keyword={filterKw} page={page} />;

  // 4️⃣ 都不是 → 404
  if (!parsed) notFound();

  const entry = buildEntry(parsed.subject, parsed.style, parsed.audience);
  const { url: imageUrl } = await fetchImage(entry, parsed.subject.prompt);
  const canonical = `${BASE_URL}/coloring-pages/${slug}`;
  const faqs = buildGeosSchemaFaqs(entry);
  const breadcrumbs = [
    { name: "Home", item: `${BASE_URL}/` },
    { name: "Coloring Pages", item: `${BASE_URL}/coloring-pages/for-kids` },
    { name: entry.displayTitle, item: canonical },
  ];

  return (
    <main className="flex-1">
      {/* 🤖 AI 爬虫专属 JSON-LD 结构化数据 */}
      <GeoSchema
        pageUrl={canonical}
        pageName={entry.displayTitle}
        pageDescription={entry.metaDescription}
        faqs={faqs.map((f) => ({ q: f.q, a: f.a }))}
        breadcrumbs={breadcrumbs}
        image={{
          url: imageUrl,
          name: entry.displayTitle,
        }}
      />

      {/* 面包屑（人类可见 + 同步 BreadcrumbList JSON-LD） */}
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
          {/* Left: H1 + BLUF + Image + Actions */}
          <div className="lg:col-span-3">
            <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Free Printable {entry.displayTitle}
            </h1>

            {/* 🎯 GEO 核心：BLUF 事实矩阵 —— H1 正下方 80 词客观事实 + 键值对 */}
            <BlufSummary title={entry.displayTitle} />

            <p className="mb-6 text-muted-foreground">
              {entry.subject.description}
            </p>

            {/* 图片 —— LineartImage 自动裁切 + 容错 */}
            <LineartImage
              src={imageUrl}
              alt={`Free printable ${entry.displayTitle} coloring page`}
              className="border shadow-sm"
            />

            {/* Action buttons */}
            <PseoClientActions
              imageUrl={imageUrl}
              displayTitle={entry.displayTitle}
              seed={entry.deterministicSeed}
            />
          </div>

          {/* Right: Info + Related */}
          <aside className="space-y-6 lg:col-span-2">
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

            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Need a Different Version?
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link href={`/coloring-pages/${entry.style.slug}-${entry.subject.slug}-for-toddlers`} className="rounded-full border px-3 py-1 text-xs hover:bg-accent">For Toddlers</Link>
                <Link href={`/coloring-pages/${entry.style.slug}-${entry.subject.slug}-for-preschoolers`} className="rounded-full border px-3 py-1 text-xs hover:bg-accent">For Preschoolers</Link>
                <Link href={`/coloring-pages/${entry.style.slug}-${entry.subject.slug}-for-kids`} className="rounded-full border px-3 py-1 text-xs hover:bg-accent">For Kids</Link>
                <Link href={`/coloring-pages/${entry.style.slug}-${entry.subject.slug}-for-adults`} className="rounded-full border px-3 py-1 text-xs hover:bg-accent">For Adults</Link>
              </div>
            </div>

            <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Explore more coloring pages
            </Link>
          </aside>
        </div>

        {/* ============================================================
            FAQ Section —— 原生 <details>/<summary> + FAQPage JSON-LD 双轨
            HTML 层可交互展开/折叠，JSON-LD 层被 Google Rich Results 直接识别
            ============================================================ */}
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border bg-card open:shadow-sm"
              >
                <summary className="cursor-pointer select-none list-none px-5 py-4 pr-10 font-medium">
                  <span className="relative inline-block">
                    <span className="mr-2 text-primary">Q:</span>
                    {faq.q}
                    <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-muted-foreground transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <div className="border-t px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  <span className="mr-2 font-medium text-green-700">A:</span>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */

async function fetchImage(
  entry: ColoringEntry,
  pureSubject: string
): Promise<{ url: string; finalSeed: number }> {
  const promptText =
    `coloring book page of a ${pureSubject}, black line art outline, white background`;

  const encodedPrompt = encodeURIComponent(promptText);
  const finalSeed = ((entry.deterministicSeed + 9_999_999) % 2_147_483_646) + 1;
  const url =
    `https://image.pollinations.ai/prompt/${encodedPrompt}` +
    `?width=1024&height=1024&model=turbo&nologo=true&seed=${finalSeed}`;

  return { url, finalSeed };
}

interface Faq { q: string; a: string; }

/**
 * GEO 专项 FAQ —— 针对美国家长/老师搜索心智的 3 个高意图问题
 * 这 3 个问题会被同步到 FAQPage JSON-LD schema，
 * Google Rich Results Test 可直接识别。
 */
function buildGeosSchemaFaqs(entry: ColoringEntry): Faq[] {
  const title = entry.displayTitle;
  const lowerTitle = title.toLowerCase();

  return [
    {
      q: `Is this ${title} really free to print?`,
      a: `Yes. All coloring sheets on wangdadi.xyz — including this ${lowerTitle} — are completely free for personal use, homeschooling, and classroom educational use with zero registration, zero sign-up, and zero watermarks.`,
    },
    {
      q: `What size should I print this ${title} coloring page on?`,
      a: `It is natively formatted for standard North American US Letter paper (8.5 × 11 inches) as well as international A4 paper sizes. Both paper sizes are available as PDF export options directly below the preview.`,
    },
    {
      q: `Are the outlines easy enough for young toddlers?`,
      a: `Yes. The ${lowerTitle} line art is generated with bold, high-contrast single-layer contour borders to help toddlers and preschoolers stay confidently within the lines while coloring. For an even simpler version, look for the "for Toddlers" variant.`,
    },
  ];
}

/* ============================================================
 * Aggregate Listing Pages —— 拦截 audience/category slug
 * ============================================================ */

const CATEGORY_LABELS: Record<string, string> = {
  animals: "Animals",
  holidays: "Holidays",
  vehicles: "Vehicles",
  fantasy: "Fantasy & Characters",
  nature: "Nature & Landscapes",
  food: "Food & Sweets",
  characters: "Characters",
  education: "Educational",
};

/* ============================================================
 * ListingCard —— 统一卡片 + 骨架屏 + 懒加载
 *   1. 优先本地 SVG（data URL，零延迟零请求）
 *   2. 无本地 SVG → 优雅骨架屏占位 + 虚线描边，无 emoji 无黄板
 *   3. 统一 loading="lazy" + decoding="async"
 *   4. 点击直达详情页
 * ============================================================ */

function ListingCard({ slug }: { slug: string }) {
  const title = slug
    .replace(/^cute-|^simple-|^detailed-|^kawaii-|^easy-/g, "")
    .replace(/-(for-toddlers|for-preschoolers|for-kids|for-adults)$/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const localSvg = getHomepageSvg(slug);

  return (
    <Link
      href={`/coloring-pages/${slug}`}
      className="group block overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative overflow-hidden rounded-xl bg-white" style={{ aspectRatio: "1 / 1" }}>
        {/* 骨架屏底图 —— 永远存在（即使图片瞬间加载，骨架屏也只存在 1 帧） */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)" }}
        />
        {/* 骨架脉冲条纹 */}
        <div
          className="absolute inset-0 animate-pulse opacity-50"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)",
          }}
        />

        {localSvg ? (
          <img
            src={localSvg}
            alt={`${title} coloring page`}
            loading="lazy"
            decoding="async"
            className="relative h-full w-full"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              className="flex h-3/4 w-3/4 items-center justify-center rounded-lg"
              style={{ border: "2px dashed #d1d5db" }}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-300">
                Coming Soon
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="border-t bg-card px-3 py-2">
        <p className="truncate text-xs font-medium">{title}</p>
      </div>
    </Link>
  );
}

/** 分页控制器 —— URL query 驱动（无 JS） */
function Pagination({
  page,
  totalPages,
  buildUrl,
}: {
  page: number;
  totalPages: number;
  buildUrl: (p: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={buildUrl(page - 1)} className="flex h-9 items-center gap-1 rounded-lg border bg-card px-3 text-sm font-medium transition hover:border-primary/40 hover:shadow-sm">← Prev</Link>
      ) : (
        <span className="flex h-9 items-center gap-1 rounded-lg border bg-muted/50 px-3 text-sm text-muted-foreground">← Prev</span>
      )}

      <div className="flex gap-1">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="flex h-9 w-9 items-center justify-center text-muted-foreground">…</span>
          ) : (
            <Link
              key={p}
              href={buildUrl(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
                p === page
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "bg-card hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {page < totalPages ? (
        <Link href={buildUrl(page + 1)} className="flex h-9 items-center gap-1 rounded-lg border bg-card px-3 text-sm font-medium transition hover:border-primary/40 hover:shadow-sm">Next →</Link>
      ) : (
        <span className="flex h-9 items-center gap-1 rounded-lg border bg-muted/50 px-3 text-sm text-muted-foreground">Next →</span>
      )}
    </nav>
  );
}

/** 统一网格 + 分页切片 —— PAGE_SIZE=12 杜绝高并发 */
function renderPaginatedGrid(slugs: string[], page: number) {
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(slugs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pagedSlugs = slugs.slice(start, start + PAGE_SIZE);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {pagedSlugs.map((slug) => (
        <ListingCard key={slug} slug={slug} />
      ))}
    </div>
  );
}

/* ============ AudienceListing（for-kids / for-adults / ...） ============ */
function AudienceListing({
  audienceSlug,
  audienceLabel,
  page,
}: {
  audienceSlug: string;
  audienceLabel: string;
  page: number;
}) {
  const slugs = getAllUSColoringSlugs().filter((s) => s.endsWith(`-${audienceSlug}`));
  const title = `Coloring Pages ${audienceLabel}`;
  const canonical = `${BASE_URL}/coloring-pages/${audienceSlug}`;
  const totalPages = Math.max(1, Math.ceil(slugs.length / 12));

  const faqs = [
    { q: `Is it really free to print all these ${audienceLabel.toLowerCase()} coloring pages?`, a: `Yes — every coloring page on wangdadi.xyz is 100% free for personal, classroom, and homeschooling use. No sign-up, no watermarks.` },
    { q: `What paper size works best?`, a: `All pages are optimized for both US Letter (8.5 × 11 inches) and A4 paper. Both PDF export options available.` },
    { q: `Can teachers print these for classroom use?`, a: `Absolutely — teachers, homeschoolers, and parents can print unlimited copies with zero restrictions.` },
  ];

  const buildUrl = (p: number) =>
    p === 1 ? canonical : `${canonical}?page=${p}`;

  return (
    <main className="flex-1">
      <GeoSchema pageUrl={canonical} pageName={title} pageDescription={`Browse free printable coloring pages ${audienceLabel.toLowerCase()}. Clean black line art, no sign-up.`} faqs={faqs} breadcrumbs={[{ name: "Home", item: `${BASE_URL}/` }, { name: "Coloring Pages", item: canonical }]} />
      <nav aria-label="Breadcrumb" className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link><span>/</span><span className="text-foreground">{title}</span>
        </div>
      </nav>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mb-4 max-w-2xl text-muted-foreground">Browse {slugs.length} free printable coloring pages {audienceLabel.toLowerCase()}. Bold clean outlines, US Letter & A4 PDF — no sign-up required.</p>
        {renderPaginatedGrid(slugs, page)}
        <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} buildUrl={buildUrl} />
        {faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-3">{faqs.map((faq, i) => (<details key={i} className="group rounded-xl border bg-card open:shadow-sm"><summary className="cursor-pointer select-none list-none px-5 py-4 font-medium">{faq.q}</summary><div className="border-t px-5 py-4 text-sm text-muted-foreground"><span className="mr-2 font-medium text-green-700">A:</span>{faq.a}</div></details>))}</div>
          </section>
        )}
      </section>
    </main>
  );
}

/* ============ CategoryListing（animals / holidays / ...） ============ */
function CategoryListing({ categorySlug, page }: { categorySlug: string; page: number }) {
  const subjects = SUBJECTS.filter((s) => s.category === categorySlug);
  const slugs = subjects.map((s) => `cute-${s.slug}-for-kids`);
  const label = CATEGORY_LABELS[categorySlug] ?? categorySlug;
  const title = `${label} Coloring Pages`;
  const canonical = `${BASE_URL}/coloring-pages/${categorySlug}`;
  const totalPages = Math.max(1, Math.ceil(slugs.length / 12));

  const faqs = [
    { q: `Is it free to print all these ${label.toLowerCase()} coloring pages?`, a: `Yes — every page is 100% free with zero registration and zero watermarks.` },
    { q: `What age group are these best for?`, a: `These ${label.toLowerCase()} pages use bold thick outlines designed for kids ages 4–8.` },
  ];

  const buildUrl = (p: number) => p === 1 ? canonical : `${canonical}?page=${p}`;

  return (
    <main className="flex-1">
      <GeoSchema pageUrl={canonical} pageName={title} pageDescription={`Browse ${slugs.length} free printable ${label.toLowerCase()} coloring pages. US Letter & A4 PDF, no sign-up.`} faqs={faqs} breadcrumbs={[{ name: "Home", item: `${BASE_URL}/` }, { name: "Coloring Pages", item: canonical }]} />
      <nav aria-label="Breadcrumb" className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link><span>/</span><span className="text-foreground">{title}</span>
        </div>
      </nav>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mb-4 max-w-2xl text-muted-foreground">Browse {slugs.length} free printable {label.toLowerCase()} coloring pages. Clean black line art — no sign-up required.</p>
        {renderPaginatedGrid(slugs, page)}
        <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} buildUrl={buildUrl} />
        {faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-3">{faqs.map((faq, i) => (<details key={i} className="group rounded-xl border bg-card open:shadow-sm"><summary className="cursor-pointer select-none list-none px-5 py-4 font-medium">{faq.q}</summary><div className="border-t px-5 py-4 text-sm text-muted-foreground"><span className="mr-2 font-medium text-green-700">A:</span>{faq.a}</div></details>))}</div>
          </section>
        )}
      </section>
    </main>
  );
}

/* ============ FilterListing（for-halloween / for-christmas / ...） ============ */
function FilterListing({ keyword, page }: { keyword: string; page: number }) {
  const label = keyword.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const subjects = SUBJECTS.filter((s) => s.slug.includes(keyword));
  const slugs = subjects.map((s) => `cute-${s.slug}-for-kids`);
  const slug = `for-${keyword}`;
  const title = `${label} Coloring Pages`;
  const canonical = `${BASE_URL}/coloring-pages/${slug}`;
  const totalPages = Math.max(1, Math.ceil(slugs.length / 12));

  const faqs = [
    { q: `Is it free to print all these ${label.toLowerCase()} coloring pages?`, a: `Yes — every page is 100% free with zero registration and zero watermarks. Download as US Letter or A4 PDF.` },
    { q: `What age group are these best for?`, a: `These ${label.toLowerCase()} pages use bold thick outlines designed for kids ages 4–8, but adults enjoy them too.` },
    { q: `Can I use these for party/classroom activities?`, a: `Absolutely — print unlimited copies for classroom activities, party favors, or homeschooling. No restrictions, ever.` },
  ];

  const buildUrl = (p: number) => p === 1 ? canonical : `${canonical}?page=${p}`;

  return (
    <main className="flex-1">
      <GeoSchema pageUrl={canonical} pageName={title} pageDescription={`Browse ${slugs.length} free printable ${label.toLowerCase()} coloring pages. US Letter & A4 PDF, no sign-up.`} faqs={faqs} breadcrumbs={[{ name: "Home", item: `${BASE_URL}/` }, { name: "Coloring Pages", item: canonical }]} />
      <nav aria-label="Breadcrumb" className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link><span>/</span><span className="text-foreground">{title}</span>
        </div>
      </nav>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mb-4 max-w-2xl text-muted-foreground">Browse {slugs.length} free printable {label.toLowerCase()} coloring pages. Clean black line art — no sign-up required.</p>
        {renderPaginatedGrid(slugs, page)}
        <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} buildUrl={buildUrl} />
        {faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-3">{faqs.map((faq, i) => (<details key={i} className="group rounded-xl border bg-card open:shadow-sm"><summary className="cursor-pointer select-none list-none px-5 py-4 font-medium">{faq.q}</summary><div className="border-t px-5 py-4 text-sm text-muted-foreground"><span className="mr-2 font-medium text-green-700">A:</span>{faq.a}</div></details>))}</div>
          </section>
        )}
      </section>
    </main>
  );
}
