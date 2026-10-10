import Link from 'next/link';
import { notFound } from 'next/navigation';
import guidesData from '@/data/guides.json';

interface GuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = guidesData.find((g) => g.slug === slug);

  if (!guide) {
    return { title: 'Guide Not Found | PowerReady Hub' };
  }

  return {
    title: guide.title,
    description: guide.summary,
    alternates: {
      canonical: `https://www.wangdadi.xyz/guides/${guide.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return guidesData.map((g) => ({
    slug: g.slug,
  }));
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = guidesData.find((g) => g.slug === slug);

  if (!guide) {
    notFound();
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.wangdadi.xyz',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Emergency Guides',
        item: 'https://www.wangdadi.xyz',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: `https://www.wangdadi.xyz/guides/${guide.slug}`,
      },
    ],
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 面包屑 */}
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:underline hover:text-amber-600 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">In-Depth Guides</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate">{guide.title}</span>
        </nav>

        {/* 主标题与摘要 */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/10 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded border border-amber-500/20">
              Authority Engineering Review
            </span>
            <span className="text-xs text-slate-400">{guide.readingTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {guide.title}
          </h1>
          <p className="text-slate-600 text-base leading-relaxed bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            {guide.summary}
          </p>
        </header>

        {/* 关键规格看板 */}
        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold block">Recommended System Baseline</span>
            <span className="text-xl font-bold text-white mt-1 block">{guide.recommendedCapacity}</span>
          </div>
          <Link
            href="/calculators/tax-credit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-lg transition"
          >
            Check 30% IRS Tax Credit Sizing →
          </Link>
        </div>

        {/* 深度选品卡片与亚马逊转化 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Top-Rated Solutions for This Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 核心第一推荐位 */}
            <div className="bg-white border-2 border-amber-500/30 rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded font-semibold">
                  #1 Top Recommendation
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-3">{guide.topPickTitle}</h3>
                <span className="text-base font-extrabold text-amber-600 block mt-1">{guide.topPickPrice}</span>
                <ul className="text-xs text-slate-600 mt-4 space-y-2">
                  {guide.topPickPros.map((pro, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`https://www.amazon.com/dp/${guide.topPickAsin}?tag=powerreadyhub-20`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-sm transition"
                >
                  Check Best Price on Amazon
                </a>
              </div>
            </div>

            {/* 备选第二推荐位 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-medium">
                  High-Value Alternative
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-3">{guide.altPickTitle}</h3>
                <span className="text-base font-extrabold text-slate-900 block mt-1">{guide.altPickPrice}</span>
                <ul className="text-xs text-slate-600 mt-4 space-y-2">
                  {guide.altPickPros.map((pro, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`https://www.amazon.com/dp/${guide.altPickAsin}?tag=powerreadyhub-20`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block w-full text-center bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-lg text-sm transition"
                >
                  Check Best Price on Amazon
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 底部内链回流网 */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-amber-600 hover:underline">
            ← Back to National Emergency Outage Map
          </Link>
          <Link href="/appliances/run-refrigerator-on-solar-generator" className="text-amber-600 font-semibold hover:underline">
            Explore Appliance Load Benchmarks →
          </Link>
        </div>

      </div>
    </div>
  );
}