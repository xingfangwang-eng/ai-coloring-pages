import Link from 'next/link';
import { notFound } from 'next/navigation';
import citiesData from '@/data/cities.json';

interface CityPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CityPageProps) {
  const { slug } = await params;
  const city = citiesData.find((item) => item.slug === slug);

  if (!city) {
    return {
      title: 'Guide Not Found | PowerReady Hub',
    };
  }

  return {
    title: `Best Solar Generators for ${city.cityName}, ${city.stateCode} (${city.riskType} Outages 2026)`,
    description: `Compare portable battery backups and solar generator runtimes tailored for ${city.cityName}, ${city.stateName} to handle ${city.primaryThreat}. Local utility: ${city.localUtility}.`,
    alternates: {
      canonical: `https://www.wangdadi.xyz/power/${city.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return citiesData.map((city) => ({
    slug: city.slug,
  }));
}

export default async function CityGuidePage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = citiesData.find((item) => item.slug === slug);

  if (!city) {
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
        name: `${city.stateName} Outage Guides`,
        item: 'https://www.wangdadi.xyz/#regional-guides',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${city.cityName}, ${city.stateCode} Backup Power`,
        item: `https://www.wangdadi.xyz/power/${city.slug}`,
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
          <Link href="/#regional-guides" className="hover:underline hover:text-amber-600 transition text-slate-600 font-medium">
            {city.stateName}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{city.cityName}</span>
        </nav>

        {/* 页面主标题 H1 */}
        <header className="space-y-3">
          <span className="inline-block bg-amber-500/10 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded border border-amber-500/20">
            Regional Grid & Storm Analysis
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Best Solar Generators for {city.cityName}, {city.stateCode}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Detailed backup sizing recommendations to survive {city.primaryThreat.toLowerCase()} and localized power blackouts.
          </p>
        </header>

        {/* 模块 1：地缘气候与电网风险看板 */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Primary Risk Factor</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">{city.primaryThreat}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Grid Outage Vulnerability</span>
            <span className="text-sm font-bold text-red-600 mt-1 block">{city.riskLevel}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 block">Recommended Min. Capacity</span>
            <span className="text-sm font-bold text-amber-600 mt-1 block">{city.recommendedCapacity}</span>
          </div>
        </div>

        {/* 👉 动作二核心增重：当地供电局与历史灾害权威看板 (彻底打破模板同质化) 👈 */}
        <section className="bg-slate-900 text-white rounded-xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">Local Grid Infrastructure</span>
              <h2 className="text-lg font-bold text-white mt-0.5">{city.cityName} Utility & Hazard Profile</h2>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 w-fit">
              Avg. Retail Rate: {city.avgKwhRate}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
              <span className="text-slate-400 block font-medium">Primary Electric Utility Provider</span>
              <span className="text-white font-bold text-sm block">{city.localUtility}</span>
              <span className="text-slate-400 block text-[11px] pt-1">
                Emergency Outage Hotline: <strong className="text-amber-400">{city.utilityPhone}</strong>
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
              <span className="text-slate-400 block font-medium">Historical Extreme Weather Precedents</span>
              <span className="text-white font-bold text-sm block">{city.historicalStorms}</span>
              <span className="text-slate-400 block text-[11px] pt-1">
                Data benchmarked against NOAA & EIA statutory outage filings.
              </span>
            </div>
          </div>
        </section>

        {/* 模块 2：针对该城市的具体痛点分析 */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Why Standard Power Solutions Fail in {city.cityName}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {city.localAnalysis}
          </p>
        </section>

        {/* 模块 3：推荐的亚马逊选品（带专属转化 Tag: powerreadyhub-20） */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Recommended Backup Setups for {city.cityName} Residents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 旗舰大容量方案 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">Whole-Home Priority Pick</span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">{city.topPickName}</h3>
                <p className="text-xs text-slate-500 mt-1">Class: {city.topPickClass}</p>
                <p className="text-sm text-slate-600 mt-3">{city.topPickReason}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`https://www.amazon.com/dp/${city.topPickAsin}?tag=powerreadyhub-20`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition"
                >
                  Check Price on Amazon
                </a>
              </div>
            </div>

            {/* 高性价比便携方案 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Portable / Budget Pick</span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">{city.budgetPickName}</h3>
                <p className="text-xs text-slate-500 mt-1">Class: {city.budgetPickClass}</p>
                <p className="text-sm text-slate-600 mt-3">{city.budgetPickReason}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`https://www.amazon.com/dp/${city.budgetPickAsin}?tag=powerreadyhub-20`}
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

        {/* 金字塔内链闭环 */}
        <div className="pt-8 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Comparing broader backup systems for your household?
          </p>
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
            >
              <span>Explore Top-Rated Portable Solar Generators for Home Emergency Backup (2026 Guide)</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}