import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen">

      {/* 首屏 Hero 区域 */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-amber-500/30">
            2026 Emergency & Off-Grid Readiness
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Find the Right Backup Power for Your City & Storm Risks
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Compare battery capacity, solar charging speeds, and real-world appliance runtimes tailored for hurricane blackouts, winter freezes, and outdoor adventures.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#regional-guides" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-6 py-3 rounded-lg shadow-md transition">
              Browse Regional Guides
            </a>
            <a href="#sizing-guide" className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-lg border border-slate-700 transition">
              Calculate Capacity
            </a>
          </div>
        </div>
      </section>

      {/* 模块 1：带载参考计算表 */}
      <section id="sizing-guide" className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">How Much Capacity Do You Actually Need?</h2>
          <p className="text-slate-500 text-sm mt-1">Estimated runtimes during a residential power blackout.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Appliance</th>
                  <th className="p-4">Avg. Watts</th>
                  <th className="p-4">500Wh Station</th>
                  <th className="p-4">1000Wh Station</th>
                  <th className="p-4">2000Wh Station</th>
                  <th className="p-4">Detailed Guide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-4 font-medium text-slate-900">Full-Size Refrigerator</td>
                  <td className="p-4">150W – 250W</td>
                  <td className="p-4 text-red-500 font-medium">Not Recommended</td>
                  <td className="p-4 text-amber-600 font-medium">4 – 6 Hours</td>
                  <td className="p-4 text-green-600 font-medium">10 – 14 Hours</td>
                  <td className="p-4"><Link href="/appliances/run-refrigerator-on-solar-generator" className="text-amber-600 hover:underline">Sizing Guide →</Link></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">CPAP Medical Machine</td>
                  <td className="p-4">40W – 60W</td>
                  <td className="p-4 text-green-600">1 – 2 Nights</td>
                  <td className="p-4 text-green-600">3 – 4 Nights</td>
                  <td className="p-4 text-green-600">7+ Nights</td>
                  <td className="p-4"><Link href="/appliances/run-cpap-on-solar-generator" className="text-amber-600 hover:underline">Sizing Guide →</Link></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Basement Sump Pump</td>
                  <td className="p-4">700W – 900W</td>
                  <td className="p-4 text-red-500">Not Capable</td>
                  <td className="p-4 text-amber-600">30–50 Cycles</td>
                  <td className="p-4 text-green-600">90–120 Cycles</td>
                  <td className="p-4"><Link href="/appliances/run-sump-pump-on-solar-generator" className="text-amber-600 hover:underline">Sizing Guide →</Link></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Portable Air Conditioner</td>
                  <td className="p-4">900W – 1200W</td>
                  <td className="p-4 text-red-500">Not Capable</td>
                  <td className="p-4 text-red-500">45 Mins</td>
                  <td className="p-4 text-amber-600">2 – 2.5 Hours</td>
                  <td className="p-4"><Link href="/appliances/run-portable-ac-on-solar-generator" className="text-amber-600 hover:underline">Sizing Guide →</Link></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Electric Space Heater</td>
                  <td className="p-4">750W – 1500W</td>
                  <td className="p-4 text-red-500">Not Practical</td>
                  <td className="p-4 text-amber-600">1 – 1.3 Hours</td>
                  <td className="p-4 text-amber-600">2 – 2.8 Hours</td>
                  <td className="p-4"><Link href="/appliances/run-electric-space-heater-on-solar-generator" className="text-amber-600 hover:underline">Sizing Guide →</Link></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Wi-Fi Router + Starlink</td>
                  <td className="p-4">25W – 75W</td>
                  <td className="p-4 text-green-600">8 – 15 Hours</td>
                  <td className="p-4 text-green-600">18 – 35 Hours</td>
                  <td className="p-4 text-green-600">40 – 70+ Hours</td>
                  <td className="p-4"><Link href="/appliances/run-wifi-router-and-starlink-on-solar-generator" className="text-amber-600 hover:underline">Sizing Guide →</Link></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Microwave & Coffee Maker</td>
                  <td className="p-4">900W – 1400W</td>
                  <td className="p-4 text-red-500">Not Capable</td>
                  <td className="p-4 text-amber-600">15–25 Cycles</td>
                  <td className="p-4 text-green-600">40–60 Cycles</td>
                  <td className="p-4"><Link href="/appliances/run-microwave-and-coffee-maker-on-solar-generator" className="text-amber-600 hover:underline">Sizing Guide →</Link></td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Smart TV & Entertainment</td>
                  <td className="p-4">80W – 160W</td>
                  <td className="p-4 text-green-600">3 – 5 Hours</td>
                  <td className="p-4 text-green-600">7 – 11 Hours</td>
                  <td className="p-4 text-green-600">16 – 22 Hours</td>
                  <td className="p-4"><Link href="/appliances/run-smart-tv-and-entertainment-on-solar-generator" className="text-amber-600 hover:underline">Sizing Guide →</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 30% 联邦清洁能源退税横幅 */}
        <div className="mt-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-500/30 uppercase tracking-wider">
              IRS Section 25D Tax Savings
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Planning a 3kWh+ Home Battery? Claim a 30% Federal Tax Credit
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Standalone battery systems with 3.0 kWh (3000Wh) or greater qualify for an uncapped 30% federal clean energy refund on IRS Form 5695. Slash up to $1,000+ off upfront equipment costs.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto text-center">
            <Link
              href="/calculators/tax-credit"
              className="inline-block w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-md transition text-sm"
            >
              Calculate Your 30% Refund →
            </Link>
          </div>
        </div>
        {/* 模块 1.5：重型黄金词深度指南专区 (直接打通首页与三大高客单指南的内链通道) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">Whole-House Power</span>
              <h4 className="font-bold text-base text-slate-900 mt-2">Best Solar Generators for Whole House Backup</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Comprehensive 2026 engineering guide on running kitchen fridges, well pumps, and 120V/240V household loads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link href="/guides/best-solar-generator-for-whole-house" className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline">
                Read Sizing Guide →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Flagship Teardown</span>
              <h4 className="font-bold text-base text-slate-900 mt-2">EcoFlow DELTA Pro In-Depth Review</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Real-world runtime benchmarks and calculating your true cost after the 30% federal clean energy tax credit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link href="/guides/ecoflow-delta-pro-whole-house-generator-review" className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline">
                Read Review & Benchmarks →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">Off-Grid Homestead</span>
              <h4 className="font-bold text-base text-slate-900 mt-2">Best Generators for Off-Grid Living</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Evaluating solar input limits, LiFePO4 thermal durability, and multi-day cabin setups.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link href="/guides/best-generator-for-off-grid-living" className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline">
                Read Off-Grid Guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 模块 2：全美 20 大高风险城市全量内链网 (彻底消灭未识别死角) */}
      <section id="regional-guides" className="py-12 px-4 bg-slate-100 border-y border-slate-200 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Regional Power Outage & Emergency Guides</h2>
            <p className="text-slate-500 text-sm mt-1">Select your metropolitan area to see local grid vulnerabilities and recommended generator sizing.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* 栏目 1：佛罗里达飓风走廊 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-blue-600 text-base font-bold mb-2">🌀 Florida Hurricane Corridors</div>
              <ul className="text-xs space-y-2 text-slate-700">
                <li><Link href="/power/florida-miami" className="hover:text-amber-600 hover:underline">Miami, FL Emergency Backup</Link></li>
                <li><Link href="/power/florida-tampa" className="hover:text-amber-600 hover:underline">Tampa, FL Outage Guide</Link></li>
                <li><Link href="/power/florida-orlando" className="hover:text-amber-600 hover:underline">Orlando, FL Storm Backup</Link></li>
                <li><Link href="/power/florida-jacksonville" className="hover:text-amber-600 hover:underline">Jacksonville, FL Grid Prep</Link></li>
              </ul>
            </div>

            {/* 栏目 2：德克萨斯独立电网 (ERCOT) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-sky-600 text-base font-bold mb-2">❄️ Texas Freezes & Extreme Heat</div>
              <ul className="text-xs space-y-2 text-slate-700">
                <li><Link href="/power/texas-houston" className="hover:text-amber-600 hover:underline">Houston, TX Hurricane Prep</Link></li>
                <li><Link href="/power/texas-dallas" className="hover:text-amber-600 hover:underline">Dallas, TX Winter Storm Backup</Link></li>
                <li><Link href="/power/texas-austin" className="hover:text-amber-600 hover:underline">Austin, TX Grid Reliability</Link></li>
                <li><Link href="/power/texas-san-antonio" className="hover:text-amber-600 hover:underline">San Antonio, TX Heat & Freeze</Link></li>
                <li><Link href="/power/texas-fort-worth" className="hover:text-amber-600 hover:underline">Fort Worth, TX Tornado Sizing</Link></li>
              </ul>
            </div>

            {/* 栏目 3：加利福尼亚山火与大气河流 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-amber-600 text-base font-bold mb-2">🔥 California Wildfire & PSPS</div>
              <ul className="text-xs space-y-2 text-slate-700">
                <li><Link href="/power/california-los-angeles" className="hover:text-amber-600 hover:underline">Los Angeles, CA Fire Season Backup</Link></li>
                <li><Link href="/power/california-san-diego" className="hover:text-amber-600 hover:underline">San Diego, CA PSPS Shutoffs</Link></li>
                <li><Link href="/power/california-sacramento" className="hover:text-amber-600 hover:underline">Sacramento, CA Valley Floods</Link></li>
              </ul>
            </div>

            {/* 栏目 4：东南部、西南部与极地涡旋区域 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-indigo-600 text-base font-bold mb-2">🌪️ Gulf, Southwest & Polar Zones</div>
              <ul className="text-xs space-y-2 text-slate-700">
                <li><Link href="/power/louisiana-new-orleans" className="hover:text-amber-600 hover:underline">New Orleans, LA Direct Hits</Link></li>
                <li><Link href="/power/north-carolina-raleigh" className="hover:text-amber-600 hover:underline">Raleigh, NC Ice & Storms</Link></li>
                <li><Link href="/power/georgia-atlanta" className="hover:text-amber-600 hover:underline">Atlanta, GA Freezing Rain</Link></li>
                <li><Link href="/power/arizona-phoenix" className="hover:text-amber-600 hover:underline">Phoenix, AZ 115°F Heatwave</Link></li>
                <li><Link href="/power/nevada-las-vegas" className="hover:text-amber-600 hover:underline">Las Vegas, NV Grid Strain</Link></li>
                <li><Link href="/power/south-carolina-charleston" className="hover:text-amber-600 hover:underline">Charleston, SC King Tides</Link></li>
                <li><Link href="/power/minnesota-minneapolis" className="hover:text-amber-600 hover:underline">Minneapolis, MN -20°F Vortex</Link></li>
                <li><Link href="/power/colorado-denver" className="hover:text-amber-600 hover:underline">Denver, CO High Altitude</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 模块 3：旗舰标杆推荐 */}
      <section id="top-picks" className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Industry-Standard Benchmark Units</h2>
          <p className="text-slate-500 text-sm mt-1">LiFePO4 battery chemistry with 3,000+ lifecycle guarantees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Whole-Home Emergency</span>
              <h3 className="font-bold text-lg mt-2 text-slate-900">2000Wh Flagship Class</h3>
              <p className="text-xs text-slate-500 mt-1">EcoFlow DELTA 2 Max / Anker SOLIX F2000</p>
              <ul className="text-xs text-slate-600 mt-3 space-y-1">
                <li>✓ Runs full-size fridge 12+ hrs</li>
                <li>✓ 2400W AC pure sine output</li>
                <li>✓ Solar input up to 1000W</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Sweet Spot: RV & Camping</span>
              <h3 className="font-bold text-lg mt-2 text-slate-900">1000Wh Mid-Size Class</h3>
              <p className="text-xs text-slate-500 mt-1">Jackery 1000 v2 / Bluetti AC180</p>
              <ul className="text-xs text-slate-600 mt-3 space-y-1">
                <li>✓ Portable enough for trunk storage</li>
                <li>✓ Fast recharge under 70 mins</li>
                <li>✓ Powers coffee makers & CPAP</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Compact Essential</span>
              <h3 className="font-bold text-lg mt-2 text-slate-900">300Wh - 500Wh Class</h3>
              <p className="text-xs text-slate-500 mt-1">EcoFlow RIVER 2 Pro / Anker 521</p>
              <ul className="text-xs text-slate-600 mt-3 space-y-1">
                <li>✓ Lightweight handheld designs</li>
                <li>✓ Keeps phones & routers alive for days</li>
                <li>✓ Low-cost entry point</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}