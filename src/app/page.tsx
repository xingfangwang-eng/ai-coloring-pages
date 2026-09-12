/**
 * Homepage —— 美式极简 + 内嵌实时生成器 + pSEO 推荐流
 *
 * 结构：
 *   ┌─ Hero: 大标题 + 实时生成器（LiveGenerator Client Component）
 *   ├─ Popular Categories: 热门分类标签，每个分类链接到 /coloring-pages/[slug]
 *   ├─ Featured Pages: 精选 pSEO 着色页预览网格
 *   └─ Features: 产品卖点
 */

import Link from "next/link";
import { Brush, Download, FileDown, Sparkles, BookOpen, School, Home } from "lucide-react";

import { LiveGenerator } from "@/components/homepage/live-generator";
import {
  getPopularThemeSlugs,
  getAllUSColoringSlugs,
  THEMES,
  AUDIENCES,
  STYLES,
  buildEntry,
  parseSlug,
  slugToDeterministicSeed,
} from "@/lib/us-coloring-data";
import { buildPollinationsUrl } from "@/lib/ai-generator";
import LineartImage from "@/components/lineart-image";

export const metadata = {
  title:
    "Free AI Coloring Pages Generator (No Sign-up, Printable) - wangdadi.xyz",
  description:
    "Generate unique coloring pages from any description. 100% free, no sign-up required. Printable US Letter & A4 PDF. Perfect for kids, teachers, and adults.",
};

export default function HomePage() {
  const popularSlugs = getPopularThemeSlugs(4); // 每个分类 4 个
  const allSlugs = getAllUSColoringSlugs();

  // 精选展示 —— 取前 24 个 for-kids（最流行的受众）
  const featuredSlugs = allSlugs.filter((s) => s.endsWith("-for-kids")).slice(0, 24);

  return (
    <main className="flex-1">
      {/* ============== HERO + LIVE GENERATOR ============== */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.2),transparent)]" />

        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            100% Free · No Sign-up · Printable PDF
          </div>

          {/* Title */}
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Free AI Coloring Pages
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Instantly Generate & Print
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Describe anything — a puppy, a princess, a spaceship — and AI turns it into a beautiful
            black & white coloring page. Download as US Letter or A4 PDF. Perfect for toddlers, kids,
            and adults.
          </p>

          {/* Live Generator */}
          <div className="mt-10">
            <LiveGenerator />
          </div>

          {/* Target audience badges */}
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Home className="h-4 w-4" /> Parents & Families
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1.5">
              <School className="h-4 w-4" /> Teachers & Classrooms
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> Homeschoolers
            </span>
          </div>
        </div>
      </section>

      {/* ============== FEATURED COLORING PAGES ============== */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              🔥 Most Popular Coloring Pages
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-curated coloring sheets loved by thousands of kids and teachers
            </p>
          </div>
          <Link
            href="/coloring-pages/for-kids"
            className="hidden text-sm text-primary hover:underline sm:inline-block"
          >
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {featuredSlugs.slice(0, 18).map((slug) => (
            <ColoringCard key={slug} slug={slug} />
          ))}
        </div>
      </section>

      {/* ============== CATEGORIES ============== */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            📚 Browse by Category
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Find the perfect coloring page for any occasion — holidays, animals, fantasy, and more
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_META.map((cat) => {
              const catThemes = THEMES.filter((t) => t.category === cat.key);
              const defaultStyle = STYLES.find((s) => s.slug === "cute") ?? STYLES[0];
              const defaultAudience = AUDIENCES.find((a) => a.slug === "for-kids") ?? AUDIENCES[1];
              const catSlugs = catThemes.map(
                (t) => `${defaultStyle.slug}-${t.slug}-${defaultAudience.slug}`
              );

              return (
                <div key={cat.key} className="rounded-xl border bg-card p-5">
                  <div className="mb-3 text-3xl">{cat.emoji}</div>
                  <h3 className="mb-1 font-semibold">{cat.label}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {catThemes.length} coloring pages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {catSlugs.slice(0, 3).map((s) => {
                      // 从 slug 反向解析 subject title
                      const slugParts = s.replace("-for-kids", "").replace(/^cute-/, "").replace(/^simple-/, "").replace(/^detailed-/, "").replace(/^kawaii-/, "").replace(/^easy-/, "");
                      const subject = THEMES.find((t) => t.slug === slugParts);
                      return (
                        <Link
                          key={s}
                          href={`/coloring-pages/${s}`}
                          className="rounded-full border bg-background px-2.5 py-0.5 text-[11px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
                        >
                          {subject?.title ?? slugParts}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Why Parents & Teachers Love Us
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="AI-Powered"
            desc="Type any idea — our AI transforms it into beautiful, clean line art in seconds."
          />
          <FeatureCard
            icon={<FileDown className="h-5 w-5" />}
            title="Print Ready"
            desc="Every page fits perfectly on US Letter or A4 paper, ready for crayons or markers."
          />
          <FeatureCard
            icon={<Brush className="h-5 w-5" />}
            title="For All Ages"
            desc="Thick toddler lines, fun kids pages, and intricate adult mandalas — pick your style."
          />
          <FeatureCard
            icon={<Download className="h-5 w-5" />}
            title="100% Free"
            desc="No sign-up, no watermarks, no limits. Just download and enjoy. Forever free."
          />
        </div>
      </section>
    </main>
  );
}

/* ============================================================
 * Sub-components
 * ============================================================ */

const CATEGORY_META: { key: string; label: string; emoji: string }[] = [
  { key: "holidays", label: "Holidays", emoji: "🎄" },
  { key: "fantasy", label: "Fantasy & Characters", emoji: "🦄" },
  { key: "animals", label: "Animals", emoji: "🐶" },
  { key: "nature", label: "Nature & Landscapes", emoji: "🌳" },
  { key: "vehicles", label: "Vehicles", emoji: "🚗" },
  { key: "characters", label: "Characters", emoji: "⭐" },
  { key: "education", label: "Educational", emoji: "🔤" },
  { key: "food", label: "Food & Sweets", emoji: "🍕" },
];

/** 着色页卡片 —— 用净化后的主体词 + turbo 模型 */
function ColoringCard({ slug }: { slug: string }) {
  const seed = slugToDeterministicSeed(slug);
  const title = slug
    .replace(/-for-toddlers$|-for-preschoolers$|-for-kids$|-for-adults$/g, "")
    .replace(/^cute-|^simple-|^detailed-|^kawaii-|^easy-/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // 🎯 关键：从 slug 中提取纯净主体词（如 "cat"），
  // 绝对不把 "cute-cat-for-toddlers" 整个喂给 AI！
  const parsed = parseSlug(slug);
  const pureSubject = parsed?.subject.prompt ?? slug.split("-").slice(1, -1).join(" ");

  const imgUrl = buildPollinationsUrl({
    prompt: pureSubject, // 只传纯净主体词
    width: 400,
    height: 400,
    // 不传 model —— 走默认值 turbo
    seed,
  });

  return (
    <Link
      href={`/coloring-pages/${slug}`}
      className="group block overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <LineartImage
        src={imgUrl}
        alt={`${title} coloring page`}
        className="rounded-none border-0"
      />
      <div className="border-t bg-card px-3 py-2">
        <p className="truncate text-xs font-medium">{title}</p>
      </div>
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
