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
import { Brush, Download, FileDown, Sparkles, BookOpen, School, Home, ArrowRight, Baby, GraduationCap, Crown, Palette } from "lucide-react";

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
import { getHomepageSvg } from "@/lib/fallback-svgs";
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

      {/* ============== BROWSE BY CATEGORY（整张卡片可点击 + 渐变背景 + 入口箭头） ============== */}
      <section className="border-t bg-gradient-to-b from-background to-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                📚 Browse by Category
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Find the perfect coloring page for any occasion — 8 curated categories
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_META.map((cat) => {
              const catThemes = THEMES.filter((t) => t.category === cat.key);
              const defaultStyle = STYLES.find((s) => s.slug === "cute") ?? STYLES[0];
              const defaultAudience = AUDIENCES.find((a) => a.slug === "for-kids") ?? AUDIENCES[1];
              const catSlugs = catThemes.map(
                (t) => `${defaultStyle.slug}-${t.slug}-${defaultAudience.slug}`
              );

              return (
                <Link
                  key={cat.key}
                  href={`/coloring-pages/${cat.key}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* 背景装饰渐变 */}
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 transition group-hover:opacity-20"
                    style={{ background: cat.bgGradient }}
                  />

                  {/* Emoji 大图标 */}
                  <div
                    className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm"
                    style={{ background: cat.iconBg }}
                  >
                    {cat.emoji}
                  </div>

                  <h3 className="mb-1 text-base font-semibold">{cat.label}</h3>
                  <p className="mb-4 text-xs text-muted-foreground">
                    {catThemes.length} coloring pages · updated weekly
                  </p>

                  {/* 预览标签 strip */}
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {catSlugs.slice(0, 4).map((s) => {
                      const slugParts = s.replace("-for-kids", "").replace(/^cute-/, "");
                      const subject = THEMES.find((t) => t.slug === slugParts);
                      return (
                        <span
                          key={s}
                          className="rounded-full border bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {subject?.title ?? slugParts}
                        </span>
                      );
                    })}
                  </div>

                  {/* 底部"查看全部"入口 */}
                  <div className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                    Browse all {catThemes.length} →
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== BROWSE BY AGE（4 张设计感强的年龄入口卡） ============== */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            👶 Browse by Age Group
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Find the right level — from bold toddler outlines to intricate adult designs
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AGE_CARDS.map((card) => (
              <Link
                key={card.slug}
                href={`/coloring-pages/${card.slug}`}
                className="group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-xl"
                style={{ background: card.cardBg }}
              >
                {/* 装饰图形 */}
                <div
                  className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full opacity-10 transition group-hover:opacity-20"
                  style={{ background: card.accentColor }}
                />

                <div
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: card.iconBg, color: card.iconColor }}
                >
                  {card.icon}
                </div>

                <h3 className="mb-1 text-lg font-bold" style={{ color: card.titleColor }}>
                  {card.title}
                </h3>
                <p className="mb-4 text-xs leading-relaxed" style={{ color: card.descColor }}>
                  {card.desc}
                </p>

                {/* 示例预览小标签 */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {card.examples.map((ex) => (
                    <span
                      key={ex}
                      className="rounded-full border bg-white/80 px-2 py-0.5 text-[10px] font-medium"
                      style={{ color: card.titleColor, borderColor: card.accentColor }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: card.titleColor }}>
                  Browse library →
                  <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOLIDAY & OCCASION（快条 strip） ============== */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            🎃 Holiday & Occasion
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Printable coloring pages for every season, holiday, and special occasion
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HOLIDAY_CARDS.map((card) => (
              <Link
                key={card.slug}
                href={`/coloring-pages/${card.slug}`}
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm"
                  style={{ background: card.bg }}
                >
                  {card.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{card.label}</h3>
                  <p className="text-[11px] text-muted-foreground">{card.count} pages</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            ))}
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

      {/* ============================================================
          🕸 SEO INTERNAL LINK MATRIX —— Googlebot 抓取深度加速
          密集内链图谱：人群分类 + 40+ 直达长尾页 + sitemap 入口
          ============================================================ */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            🗺 Explore All Coloring Collections
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Browse our complete library of free printable coloring pages — click any link to start coloring
          </p>

          {/* --- 按人群分类（Audience Hubs） --- */}
          <div className="mb-10">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Browse by Age Group
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/coloring-pages/for-toddlers"
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Coloring Pages for Toddlers
              </Link>
              <Link
                href="/coloring-pages/for-preschoolers"
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Coloring Pages for Preschoolers
              </Link>
              <Link
                href="/coloring-pages/for-kids"
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Coloring Pages for Kids
              </Link>
              <Link
                href="/coloring-pages/for-adults"
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Intricate Coloring Pages for Adults
              </Link>
            </div>
          </div>

          {/* --- 40+ 具体长尾页内链（纯文字 <a>，爬虫无障碍） --- */}
          <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Animals */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">🐾 Animals</h4>
              <ul className="space-y-1.5 text-sm">
                {[
                  { slug: "cute-cat-for-kids", label: "Cat Coloring Page" },
                  { slug: "cute-dog-for-kids", label: "Dog Coloring Page" },
                  { slug: "cute-puppy-for-kids", label: "Cute Puppy Coloring Sheet" },
                  { slug: "cute-kitten-for-kids", label: "Kitten Coloring Page" },
                  { slug: "cute-dinosaur-for-kids", label: "Dinosaur Coloring Page" },
                  { slug: "detailed-t-rex-for-adults", label: "T-Rex Dinosaur Zentangle" },
                  { slug: "cute-lion-for-kids", label: "Lion Coloring Page" },
                  { slug: "cute-tiger-for-kids", label: "Tiger Coloring Sheet" },
                  { slug: "cute-elephant-for-kids", label: "Elephant Coloring Page" },
                  { slug: "cute-butterfly-for-kids", label: "Butterfly Coloring Page" },
                  { slug: "detailed-butterfly-for-adults", label: "Intricate Butterfly Mandala" },
                ].map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/coloring-pages/${l.slug}`}
                      className="text-muted-foreground transition hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Holidays & Festivals */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">🎃 Holidays & Festivals</h4>
              <ul className="space-y-1.5 text-sm">
                {[
                  { slug: "cute-halloween-pumpkin-for-kids", label: "Halloween Pumpkin Coloring Sheet" },
                  { slug: "cute-halloween-ghost-for-kids", label: "Halloween Ghost Coloring Page" },
                  { slug: "cute-christmas-santa-for-kids", label: "Christmas Santa Coloring Page" },
                  { slug: "cute-christmas-tree-for-kids", label: "Christmas Tree Coloring Sheet" },
                  { slug: "cute-christmas-reindeer-for-kids", label: "Christmas Reindeer Coloring Page" },
                  { slug: "cute-easter-bunny-for-kids", label: "Easter Bunny Coloring Page" },
                  { slug: "cute-thanksgiving-turkey-for-kids", label: "Thanksgiving Turkey Coloring Sheet" },
                  { slug: "cute-valentines-heart-for-kids", label: "Valentine Heart Coloring Page" },
                  { slug: "cute-birthday-cake-for-kids", label: "Birthday Cake Coloring Sheet" },
                ].map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/coloring-pages/${l.slug}`}
                      className="text-muted-foreground transition hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fantasy & Characters */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">🦄 Fantasy & Characters</h4>
              <ul className="space-y-1.5 text-sm">
                {[
                  { slug: "cute-princess-for-kids", label: "Princess Coloring Page" },
                  { slug: "cute-mermaid-for-kids", label: "Mermaid Coloring Sheet" },
                  { slug: "cute-unicorn-for-kids", label: "Unicorn Coloring Page" },
                  { slug: "simple-superhero-for-kids", label: "Superhero Coloring Page" },
                  { slug: "detailed-superhero-for-adults", label: "Superhero Zentangle for Adults" },
                  { slug: "cute-fairy-for-kids", label: "Fairy Coloring Page" },
                  { slug: "detailed-dragon-for-adults", label: "Fantasy Dragon Zentangle" },
                  { slug: "cute-robot-for-kids", label: "Robot Coloring Sheet" },
                  { slug: "cute-pirate-for-kids", label: "Pirate Coloring Page" },
                  { slug: "detailed-mandala-for-adults", label: "Adult Mandala Coloring" },
                ].map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/coloring-pages/${l.slug}`}
                      className="text-muted-foreground transition hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vehicles, Nature & More */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">🚗 Vehicles, Nature & More</h4>
              <ul className="space-y-1.5 text-sm">
                {[
                  { slug: "cute-sports-car-for-kids", label: "Sports Car Coloring Page" },
                  { slug: "cute-monster-truck-for-kids", label: "Monster Truck Coloring Sheet" },
                  { slug: "cute-fire-truck-for-kids", label: "Fire Truck Coloring Page" },
                  { slug: "cute-school-bus-for-kids", label: "School Bus Coloring Sheet" },
                  { slug: "cute-rocket-for-kids", label: "Space Rocket Coloring Page" },
                  { slug: "cute-airplane-for-kids", label: "Airplane Coloring Sheet" },
                  { slug: "cute-princess-for-toddlers", label: "Princess for Toddlers" },
                  { slug: "detailed-mountain-for-adults", label: "Mountain Landscape Zentangle" },
                  { slug: "cute-beach-for-kids", label: "Beach Coloring Page" },
                  { slug: "cute-ice-cream-for-kids", label: "Ice Cream Coloring Sheet" },
                  { slug: "cute-pizza-for-kids", label: "Pizza Coloring Page" },
                  { slug: "cute-donut-for-kids", label: "Donut Coloring Sheet" },
                ].map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/coloring-pages/${l.slug}`}
                      className="text-muted-foreground transition hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- 语义化 Footer：Sitemap + 面包屑 --- */}
          <nav aria-label="Site navigation" className="border-t pt-6">
            <ol className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li>›</li>
              <li><Link href="/coloring-pages" className="hover:text-primary">Coloring Pages</Link></li>
              <li>›</li>
              <li className="text-foreground">Explore All Collections</li>
            </ol>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Link href="/coloring-pages" className="hover:text-primary">All Coloring Pages</Link>
              <Link href="/pricing" className="hover:text-primary">Pricing</Link>
              <Link href="/about" className="hover:text-primary">About</Link>
              <Link href="/sitemap.xml" className="hover:text-primary">HTML Sitemap</Link>
              <Link href="/robots.txt" className="hover:text-primary">Robots.txt</Link>
            </div>
          </nav>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
 * Sub-components
 * ============================================================ */

const CATEGORY_META: { key: string; label: string; emoji: string; iconBg: string; bgGradient: string }[] = [
  { key: "animals", label: "Animals", emoji: "🐶", iconBg: "#fef3c7", bgGradient: "linear-gradient(135deg, #fbbf24, #f59e0b)" },
  { key: "holidays", label: "Holidays", emoji: "🎄", iconBg: "#fee2e2", bgGradient: "linear-gradient(135deg, #ef4444, #dc2626)" },
  { key: "fantasy", label: "Fantasy & Characters", emoji: "🦄", iconBg: "#fae8ff", bgGradient: "linear-gradient(135deg, #a855f7, #9333ea)" },
  { key: "vehicles", label: "Vehicles", emoji: "🚗", iconBg: "#dbeafe", bgGradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
  { key: "nature", label: "Nature & Landscapes", emoji: "🌳", iconBg: "#dcfce7", bgGradient: "linear-gradient(135deg, #22c55e, #16a34a)" },
  { key: "food", label: "Food & Sweets", emoji: "🍕", iconBg: "#ffedd5", bgGradient: "linear-gradient(135deg, #f97316, #ea580c)" },
  { key: "characters", label: "Characters", emoji: "⭐", iconBg: "#fef9c3", bgGradient: "linear-gradient(135deg, #eab308, #ca8a04)" },
  { key: "education", label: "Educational", emoji: "🔤", iconBg: "#e0e7ff", bgGradient: "linear-gradient(135deg, #6366f1, #4f46e5)" },
];

const AGE_CARDS = [
  {
    slug: "for-toddlers",
    title: "Toddlers",
    desc: "Extra thick bold outlines, large simple shapes, big easy-to-color areas. Perfect ages 2–4.",
    examples: ["Puppy", "Butterfly", "Teddy Bear"],
    icon: <Baby className="h-5 w-5" />,
    iconBg: "#fce7f3",
    iconColor: "#db2777",
    cardBg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
    accentColor: "#f9a8d4",
    titleColor: "#9d174d",
    descColor: "#9d174d",
  },
  {
    slug: "for-preschoolers",
    title: "Preschoolers",
    desc: "Clean thick outlines, fun cartoon details. Ages 4–5, getting ready for crayons.",
    examples: ["Bunny", "Kitty", "Elephant"],
    icon: <GraduationCap className="h-5 w-5" />,
    iconBg: "#fef3c7",
    iconColor: "#b45309",
    cardBg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    accentColor: "#fcd34d",
    titleColor: "#92400e",
    descColor: "#92400e",
  },
  {
    slug: "for-kids",
    title: "Kids",
    desc: "Fun cartoon details, medium bold outlines. Ages 6–10, classic coloring experience.",
    examples: ["Dinosaur", "Unicorn", "Space Rocket"],
    icon: <Crown className="h-5 w-5" />,
    iconBg: "#dbeafe",
    iconColor: "#1d4ed8",
    cardBg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    accentColor: "#93c5fd",
    titleColor: "#1e40af",
    descColor: "#1e40af",
  },
  {
    slug: "for-adults",
    title: "Adults",
    desc: "Intricate fine line art, decorative patterns, stress-relieving designs.",
    examples: ["Mandala", "Geometric", "Nature Patterns"],
    icon: <Palette className="h-5 w-5" />,
    iconBg: "#f0fdf4",
    iconColor: "#15803d",
    cardBg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    accentColor: "#86efac",
    titleColor: "#166534",
    descColor: "#166534",
  },
];

const HOLIDAY_CARDS = [
  { slug: "for-halloween", label: "Halloween", emoji: "🎃", bg: "#fef3c7", count: 3 },
  { slug: "for-christmas", label: "Christmas", emoji: "🎄", bg: "#fee2e2", count: 3 },
  { slug: "for-easter", label: "Easter", emoji: "🐰", bg: "#fae8ff", count: 2 },
  { slug: "for-thanksgiving", label: "Thanksgiving", emoji: "🦃", bg: "#ffedd5", count: 1 },
];

/** 着色页卡片 —— 优先使用本地 SVG 兜底，彻底避免 Pollinations 429 并发 */
function ColoringCard({ slug }: { slug: string }) {
  const seed = slugToDeterministicSeed(slug);
  const title = slug
    .replace(/-for-toddlers$|-for-preschoolers$|-for-kids$|-for-adults$/g, "")
    .replace(/^cute-|^simple-|^detailed-|^kawaii-|^easy-/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // 🎯 优先检查是否有本地 SVG 兜底
  const localSvg = getHomepageSvg(slug);

  if (localSvg) {
    // 本地 SVG —— 0.1 秒内稳定展示，不发起任何外部请求
    return (
      <Link
        href={`/coloring-pages/${slug}`}
        className="group block overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="relative overflow-hidden rounded-xl bg-white" style={{ aspectRatio: "1 / 1" }}>
          <img
            src={localSvg}
            alt={`${title} coloring page`}
            loading="eager"
            className="h-full w-full"
          />
        </div>
        <div className="border-t bg-card px-3 py-2">
          <p className="truncate text-xs font-medium">{title}</p>
        </div>
      </Link>
    );
  }

  // 没有本地 SVG —— 回退到 Pollinations（带 LineartImage 的 retry 逻辑）
  const parsed = parseSlug(slug);
  const pureSubject = parsed?.subject.prompt ?? slug.split("-").slice(1, -1).join(" ");

  const imgUrl = buildPollinationsUrl({
    prompt: pureSubject,
    width: 400,
    height: 400,
    seed,
  });

  // 兜底：就算 LineartImage 的 Pollinations 也加载失败，显示空白底（不显示错误提示）
  const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="#ccc" stroke-width="2"><circle cx="100" cy="100" r="60"/><path d="M60 100 L140 100"/><path d="M100 60 L100 140"/></svg>`
  )}`;

  return (
    <Link
      href={`/coloring-pages/${slug}`}
      className="group block overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <LineartImage
        src={imgUrl}
        fallbackSrc={fallbackSvg}
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
