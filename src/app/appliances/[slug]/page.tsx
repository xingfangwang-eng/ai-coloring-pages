import Link from 'next/link';
import { notFound } from 'next/navigation';
import appliancesData from '@/data/appliances.json';

interface AppliancePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AppliancePageProps) {
  const { slug } = await params;
  const item = appliancesData.find((a) => a.slug === slug);

  if (!item) {
    return { title: 'Appliance Guide Not Found | PowerReady Hub' };
  }

  return {
    title: `Can You Run a ${item.applianceName} on a Solar Generator? (Watts & Hours 2026)`,
    description: `Complete wattage draw, surge requirements, and battery runtime calculations for running a ${item.applianceName.toLowerCase()} during power outages.`,
  };
}

export async function generateStaticParams() {
  return appliancesData.map((item) => ({
    slug: item.slug,
  }));
}

export default async function ApplianceGuidePage({ params }: AppliancePageProps) {
  const { slug } = await params;
  const item = appliancesData.find((a) => a.slug === slug);

  if (!item) {
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
        name: 'Appliance Sizing Calculators',
        item: 'https://www.wangdadi.xyz/#sizing-guide',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: item.applianceName,
        item: `https://www.wangdadi.xyz/appliances/${item.slug}`,
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
        
        {/* 面包屑导航 */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:underline hover:text-amber-600 transition">Home</Link>
          <span>/</span>
          <Link href="/#sizing-guide" className="hover:underline hover:text-amber-600 transition text-slate-600 font-medium">
            Appliances
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{item.applianceName}</span>
        </nav>

        {/* 主标题 */}
        <header className="space-y-3">
          <span className="inline-block bg-amber-500/10 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded border border-amber-500/20">
            Electrical Load & Runtime Benchmark
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            How to Run a {item.applianceName} on a Solar Generator
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Exact running watts, compressor inrush surge ratings, and estimated backup runtimes during extended blackouts.
          </p>
        </header>

        {/* 关键电气参数看板 */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Running Draw</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">{item.runningWatts}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Starting Surge</span>
            <span className="text-sm font-bold text-amber-600 mt-1 block">{item.surgeWatts}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Operating Cycle</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">{item.dutyCycle}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Recommended Class</span>
            <span className="text-sm font-bold text-green-600 mt-1 block">{item.recommendedCapacity}</span>
          </div>
        </div>

        {/* 核心带载时间测算表 (Google 极其喜爱的特色摘要数据) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Real-World Runtime by Battery Capacity
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Battery Size</th>
                  <th className="p-3">Estimated Continuous Runtime</th>
                  <th className="p-3">Suitability Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-medium text-slate-900">500Wh Station</td>
                  <td className="p-3">{item.hours500Wh}</td>
                  <td className="p-3 text-xs">Light emergency & mobile survival</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">1000Wh Station</td>
                  <td className="p-3 font-medium text-amber-600">{item.hours1000Wh}</td>
                  <td className="p-3 text-xs">Recommended for short rolling blackouts</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">2000Wh Station</td>
                  <td className="p-3 font-semibold text-green-600">{item.hours2000Wh}</td>
                  <td className="p-3 text-xs">Full multi-day storm security</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 深度电工分析与防踩坑建议 */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            Technical Sizing Analysis
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {item.painPointAnalysis}
          </p>
        </section>

        {/* 推荐的亚马逊发电机方案 */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Top Portable Solar Generators for Powering a {item.applianceName}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">Optimal Performance Choice</span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">{item.topPickName}</h3>
                <p className="text-xs text-slate-500 mt-1">Class: {item.topPickClass}</p>
                <p className="text-sm text-slate-600 mt-3">{item.topPickReason}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`https://www.amazon.com/dp/${item.topPickAsin}?tag=wangdadi-20`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition"
                >
                  Check Price on Amazon
                </a>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Budget Alternative</span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">{item.budgetPickName}</h3>
                <p className="text-xs text-slate-500 mt-1">Class: {item.budgetPickClass}</p>
                <p className="text-sm text-slate-600 mt-3">{item.budgetPickReason}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`https://www.amazon.com/dp/${item.budgetPickAsin}?tag=wangdadi-20`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block w-full text-center bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-lg text-sm transition"
                >
                  Check Price on Amazon
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 内链回流闭环 */}
        <div className="pt-8 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Preparing your household for specific localized storm threats?
          </p>
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
            >
              <span>Explore All Regional Grid Outage & Emergency Power Guides</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}