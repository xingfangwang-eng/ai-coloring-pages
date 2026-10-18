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
    title: `Best Solar Generators for ${city.cityName}, ${city.stateCode}: 2026 Emergency Power Outage Guide`,
    description: `Complete engineering analysis of household battery backups and solar generator runtimes tailored for ${city.cityName}, ${city.stateName} to handle ${city.primaryThreat}. Utility: ${city.localUtility}.`,
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

  // 1. Google 官方认可的面包屑结构化数据
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

  // 2. Google 官方认可的 FAQPage 结构化数据 (增加富媒体摘要展示概率)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Can I legally run a portable power station inside a ${city.cityName} apartment or condo?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Unlike traditional combustion generators powered by gasoline or diesel—which emit deadly carbon monoxide and are strictly banned inside living spaces, balconies, and near windows by ${city.cityName} fire codes—battery-powered solar generators produce zero toxic emissions and can be safely operated inside bedrooms, kitchens, and living spaces.`,
        },
      },
      {
        '@type': 'Question',
        name: `How long can a 2000Wh battery run my refrigerator during an outage in ${city.cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `A standard residential kitchen refrigerator draws between 150W and 250W when cycling. With a standard 35% to 50% compressor duty cycle, a 2000Wh LiFePO4 station will sustain fresh food and freezer items for approximately 12 to 16 hours continuously without solar input, or indefinitely when paired with 400W+ solar panels during clear daylight.`,
        },
      },
      {
        '@type': 'Question',
        name: `Does a home battery system qualify for federal tax credits in ${city.stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Under the federal Inflation Reduction Act (Section 25D), standalone home battery storage technology with a manufacturer-rated capacity of 3.0 kWh (3,000 Wh) or greater qualifies for an uncapped 30% federal clean energy tax credit on IRS Form 5695.`,
        },
      },
      {
        '@type': 'Question',
        name: `Who should I contact to report electrical outages in ${city.cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The primary electric distribution utility serving ${city.cityName} is ${city.localUtility}. Residents should report localized wire downs, transformer arcing, or substation outages immediately to their emergency dispatch hotline at ${city.utilityPhone}.`,
        },
      },
    ],
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4">
      {/* 注入双重 JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        
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
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500/10 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded border border-amber-500/20">
              Regional Grid & Storm Analysis
            </span>
            <span className="bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1 rounded">
              Updated for 2026 Season
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Best Solar Generators for {city.cityName}, {city.stateCode}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            An engineering teardown of household battery backup capacities, inverter surge limits, and clean energy storage solutions designed to survive {city.primaryThreat.toLowerCase()} across {city.cityName} and surrounding metropolitan districts.
          </p>
        </header>

        {/* 模块 1：地缘气候与电网风险指标 */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-medium">Primary Threat Vector</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">{city.primaryThreat}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-medium">Vulnerability Tier</span>
            <span className="text-sm font-bold text-red-600 mt-1 block">{city.riskLevel}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-medium">Recommended Baseline</span>
            <span className="text-sm font-bold text-amber-600 mt-1 block">{city.recommendedCapacity}</span>
          </div>
        </div>

        {/* 模块 2：当地供电局与电网基础设施深度报告 */}
        <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">Electrical Infrastructure</span>
              <h2 className="text-xl font-bold text-white mt-1">{city.cityName} Grid & Utility Profile</h2>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3.5 py-1.5 rounded-full border border-slate-700 w-fit">
              Avg. Retail Rate: {city.avgKwhRate}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <span className="text-slate-400 block font-medium">Regional Transmission Operator</span>
              <span className="text-white font-bold text-base block">{city.localUtility}</span>
              <p className="text-slate-300 pt-1">
                Emergency Hotline: <strong className="text-amber-400 font-mono text-sm">{city.utilityPhone}</strong>
              </p>
              <p className="text-slate-400 text-[11px]">
                In the event of downed distribution lines, maintain a minimum 30-foot clearance and report immediate hazards to local dispatch.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <span className="text-slate-400 block font-medium">Historical Extreme Outage Events</span>
              <span className="text-white font-bold text-base block">{city.historicalStorms}</span>
              <p className="text-slate-300 pt-1">
                Data benchmarked against NOAA storm reports and EIA statutory reliability filings.
              </p>
              <p className="text-slate-400 text-[11px]">
                Prolonged restoration delays in {city.cityName} typically stem from mutual-aid crews needing to clear access roads before replacing damaged distribution poles.
              </p>
            </div>
          </div>
        </section>

        {/* 模块 3：深度工程分析 (字数支撑与本地痛点) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Why Conventional Backup Systems Fall Short in {city.cityName}
          </h2>
          <div className="prose text-slate-600 text-sm leading-relaxed space-y-4">
            <p>
              {city.localAnalysis}
            </p>
            <p>
              During widespread meteorological disturbances across {city.stateName}, retail gasoline stations frequently lose pump operational power or exhaust fuel supplies within 24 hours. Gasoline storage also carries shelf-life degradation risks (typically requiring fuel stabilizer additives after 90 days) and dangerous volatile vapor accumulation in residential garages.
            </p>
            <p>
              Modern portable solar generators utilizing <strong>Lithium Iron Phosphate (LiFePO4 / LFP)</strong> cell chemistry eliminate combustion hazards completely. With a rated lifespan exceeding 3,000 full discharge cycles to 80% original capacity (equivalent to nearly a decade of daily usage), these solid-state storage systems can remain permanently on standby inside a home office or hallway closet without safety degradation.
            </p>
          </div>
        </section>

        {/* 模块 4：全量家电带载测算大表 (高信息密度核心) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Household Appliance Load Sizing Benchmarks for {city.cityName} Outages
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Estimated runtime based on pure sine wave inverter efficiency (0.85) and standard 90% battery depth of discharge.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Critical Appliance</th>
                  <th className="p-3">Continuous Draw</th>
                  <th className="p-3">Starting Inrush Surge</th>
                  <th className="p-3">1000Wh Station</th>
                  <th className="p-3">2000Wh Station</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-medium text-slate-900">Full-Size Refrigerator</td>
                  <td className="p-3">150W – 250W</td>
                  <td className="p-3 text-amber-600 font-medium">800W – 1200W</td>
                  <td className="p-3">4 – 6 Hours</td>
                  <td className="p-3 text-emerald-600 font-semibold">12 – 16 Hours (Cycles)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Medical CPAP / BiPAP</td>
                  <td className="p-3">35W – 60W (DC)</td>
                  <td className="p-3">Minimal (Steady)</td>
                  <td className="p-3 text-emerald-600">3 – 4 Full Nights</td>
                  <td className="p-3 text-emerald-600 font-semibold">7+ Full Nights</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Basement Sump Pump (1/3 HP)</td>
                  <td className="p-3">700W – 900W</td>
                  <td className="p-3 text-red-600 font-medium">2000W – 2500W</td>
                  <td className="p-3 text-amber-600">30 – 50 Cycles</td>
                  <td className="p-3 text-emerald-600 font-semibold">90 – 120 Cycles</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Portable AC (8000 BTU)</td>
                  <td className="p-3">900W – 1100W</td>
                  <td className="p-3 text-red-600 font-medium">2200W – 2800W</td>
                  <td className="p-3 text-red-500">Not Practical (45m)</td>
                  <td className="p-3 text-amber-600">2 – 2.5 Hours</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Wi-Fi Router + Starlink Dish</td>
                  <td className="p-3">25W – 75W</td>
                  <td className="p-3">None</td>
                  <td className="p-3 text-emerald-600">18 – 35 Hours</td>
                  <td className="p-3 text-emerald-600 font-semibold">40 – 70+ Hours</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <strong className="block font-semibold">Need to power larger household subpanels or whole-home air conditioning?</strong>
              <span className="text-emerald-800 text-[11px]">Systems with 3.0 kWh (3,000Wh) or greater qualify for an uncapped 30% federal clean energy tax credit on IRS Form 5695.</span>
            </div>
            <Link
              href="/calculators/tax-credit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs shrink-0 transition"
            >
              Calculate 30% Tax Savings →
            </Link>
          </div>
        </section>

        {/* 模块 5：精选推荐方案 (带真实联盟 Tag: powerreadyhub-20) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Recommended Emergency Power Setups for {city.cityName} Homes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 旗舰大容量方案 */}
            <div className="bg-white border-2 border-amber-500/30 rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded font-semibold">Whole-Home Priority Pick</span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">{city.topPickName}</h3>
                <p className="text-xs text-slate-500 mt-1">Class: {city.topPickClass}</p>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{city.topPickReason}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`https://www.amazon.com/dp/${city.topPickAsin}?tag=powerreadyhub-20`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-sm transition"
                >
                  Check Best Price on Amazon
                </a>
              </div>
            </div>

            {/* 高性价比便携方案 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-medium">Portable / Evacuation Pick</span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">{city.budgetPickName}</h3>
                <p className="text-xs text-slate-500 mt-1">Class: {city.budgetPickClass}</p>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{city.budgetPickReason}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`https://www.amazon.com/dp/${city.budgetPickAsin}?tag=powerreadyhub-20`}
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

        {/* 模块 6：本地化常见问答 FAQ (契合 FAQPage 结构化数据) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Frequently Asked Questions: Emergency Power in {city.cityName}
          </h2>

          <div className="space-y-4 text-sm text-slate-600 divide-y divide-slate-100">
            <div className="pt-3">
              <h3 className="font-semibold text-slate-900 text-base">
                Can I legally run a portable power station inside a {city.cityName} apartment or condo?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Yes. Unlike traditional combustion generators powered by gasoline or diesel—which emit deadly carbon monoxide and are strictly banned inside living spaces, balconies, and near windows by {city.cityName} fire codes—battery-powered solar generators produce zero toxic emissions and can be safely operated inside bedrooms, kitchens, and living spaces.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="font-semibold text-slate-900 text-base">
                How long can a 2000Wh battery run my refrigerator during an outage in {city.cityName}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                A standard residential kitchen refrigerator draws between 150W and 250W when cycling. With a standard 35% to 50% compressor duty cycle, a 2000Wh LiFePO4 station will sustain fresh food and freezer items for approximately 12 to 16 hours continuously without solar input, or indefinitely when paired with 400W+ solar panels during clear daylight.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="font-semibold text-slate-900 text-base">
                Does a home battery system qualify for federal tax credits in {city.stateName}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Yes. Under the federal Inflation Reduction Act (Section 25D), standalone home battery storage technology with a manufacturer-rated capacity of 3.0 kWh (3,000 Wh) or greater qualifies for an uncapped 30% federal clean energy tax credit on IRS Form 5695.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="font-semibold text-slate-900 text-base">
                Who should I contact to report electrical outages in {city.cityName}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                The primary electric distribution utility serving {city.cityName} is {city.localUtility}. Residents should report localized wire downs, transformer arcing, or substation outages immediately to their emergency dispatch hotline at <strong className="text-slate-800">{city.utilityPhone}</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* 底部内链回流闭环 */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-amber-600 hover:underline">
            ← Back to National Emergency Outage Map
          </Link>
          <Link href="/appliances/run-refrigerator-on-solar-generator" className="text-amber-600 font-semibold hover:underline">
            Explore Appliance Load Sizing Benchmarks →
          </Link>
        </div>

      </div>
    </div>
  );
}