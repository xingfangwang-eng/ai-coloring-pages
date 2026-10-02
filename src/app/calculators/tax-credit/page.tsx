import Link from 'next/link';
import { TaxCreditCalculator } from '@/components/tax-credit-calculator';

export const metadata = {
  title: '30% Federal Clean Energy Battery Tax Credit Calculator (IRS Form 5695 Guide 2026)',
  description: 'Calculate your exact IRS Section 25D tax savings on 3kWh+ standalone home battery storage systems and portable solar generators.',
  alternates: {
    canonical: 'https://www.wangdadi.xyz/calculators/tax-credit',
  },
};

export default function TaxCreditPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '30% Federal Battery Tax Credit Calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    url: 'https://www.wangdadi.xyz/calculators/tax-credit',
    description: 'Calculates the 30% IRS residential clean energy credit for home battery systems.',
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* 面包屑 */}
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:underline hover:text-amber-600 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Tax Credit Calculator</span>
        </nav>

        {/* 头部标题 */}
        <header className="space-y-3">
          <span className="inline-block bg-emerald-500/10 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-500/20">
            Inflation Reduction Act · Section 25D
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            30% Federal Solar Generator & Battery Tax Credit Calculator
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Under IRS Form 5695, standalone home battery storage systems with a capacity of <strong>3.0 kWh (3,000Wh) or greater</strong> qualify for an uncapped 30% federal tax credit through 2032. Calculate your exact refund below.
          </p>
        </header>

        {/* 核心交互计算器组件 */}
        <TaxCreditCalculator />

        {/* 核心变现区：3kWh+ 具备退税资格的亚马逊旗舰巨无霸 */}
        <section className="space-y-6 pt-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Tax-Credit-Ready Batteries on Amazon (≥ 3.0 kWh)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              These industry-leading systems meet the statutory 3000Wh storage minimum required for the 30% Section 25D deduction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 标杆 1：EcoFlow DELTA Pro (3.6kWh) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  Qualifies for ~ $840+ Tax Credit
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">EcoFlow DELTA Pro (3600Wh)</h3>
                <p className="text-xs text-slate-500 mt-1">Capacity: 3.6 kWh · 3600W AC Pure Sine Output</p>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  The gold standard for standalone home backup. Featuring expandable capacity up to 25kWh and 240V split-phase capability to run central air and well pumps.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="https://www.amazon.com/dp/B09FL57F4F?tag=powerreadyhub-20"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition"
                >
                  Check Price on Amazon
                </a>
              </div>
            </div>

            {/* 标杆 2：Anker SOLIX F3800 (3.84kWh) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  Qualifies for ~ $1,000+ Tax Credit
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-2">Anker SOLIX F3800 (3840Wh)</h3>
                <p className="text-xs text-slate-500 mt-1">Capacity: 3.84 kWh · Direct EV & RV Connection</p>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  Massive 3.84kWh single-unit capacity with dual 120V/240V output. Can directly recharge electric vehicles and plug into home subpanels.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="https://www.amazon.com/dp/B0CQXF288Z?tag=powerreadyhub-20"
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

        {/* 权威法条问答 */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Frequently Asked Questions (IRS Form 5695)
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <h3 className="font-semibold text-slate-900">Do portable power stations need solar panels to qualify?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Under the pre-2023 rules, batteries had to be 100% solar-charged. However, the updated Inflation Reduction Act now allows standalone battery storage technology to qualify without solar, provided capacity is at least 3 kWh (3,000 Wh).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Is there a maximum credit dollar cap?</h3>
              <p className="text-xs text-slate-500 mt-1">
                No. Unlike previous energy efficiency programs capped at $500 or $1,200, Section 25D clean energy credits have no maximum dollar ceiling—you receive a full 30% on qualified equipment costs.
              </p>
            </div>
          </div>
        </section>

        {/* 回流内链 */}
        <div className="pt-6 border-t border-slate-200 text-center">
          <Link href="/" className="text-sm text-amber-600 hover:underline">
            ← Return to Regional Disaster & Backup Power Guides
          </Link>
        </div>

      </div>
    </div>
  );
}