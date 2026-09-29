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

      {/* 模块 1：带载参考计算表 (增量价值核心，Google 最喜欢的结构化数据) */}
      <section id="sizing-guide" className="py-12 px-4 max-w-5xl mx-auto w-full">
        
        {/* Amazon Prime 免费试用赏金横幅 (Bounty 专区) */}
        <div className="bg-slate-900 border border-slate-700 border-l-4 border-l-amber-500 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-sm">
          <div className="text-sm">
            <strong className="text-amber-400">⚡ Severe Weather Warning:</strong> Need backup power gear delivered fast before the storm hits? 
            Get fast, free priority delivery with an Amazon Prime trial.
          </div>
          {/* 将 href 替换为下面这个完整带 tag 的官方网址 */}
<a
  href="https://www.amazon.com/amazonprime?tag=powerreadyhub-20"
  target="_blank"
  rel="noopener noreferrer nofollow sponsored"
  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs whitespace-nowrap shadow transition"
>
  Try 30-Day Prime Free →
</a>
        </div>

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
                  
                  {/* 500Wh 推广位 */}
                  <th className="p-4 text-center">
                    <div>500Wh Station</div>
                    <a 
                      href="https://amzn.to/4d7d8Ps" 
                      target="_blank" 
                      rel="noopener noreferrer nofollow sponsored"
                      className="inline-block mt-1 text-[11px] bg-white border border-slate-300 text-blue-600 font-medium px-2 py-0.5 rounded shadow-xs hover:bg-slate-50 hover:text-blue-700"
                    >
                      View on Amazon ↗
                    </a>
                  </th>

                  {/* 1000Wh 推广位 */}
                  <th className="p-4 text-center">
                    <div>1000Wh Station</div>
                    <a 
                      href="https://amzn.to/4hkcZKR" 
                      target="_blank" 
                      rel="noopener noreferrer nofollow sponsored"
                      className="inline-block mt-1 text-[11px] bg-white border border-slate-300 text-blue-600 font-medium px-2 py-0.5 rounded shadow-xs hover:bg-slate-50 hover:text-blue-700"
                    >
                      View on Amazon ↗
                    </a>
                  </th>

                  {/* 2000Wh 推广位 */}
                  <th className="p-4 text-center">
                    <div>2000Wh Station</div>
                    <a 
                      href="https://amzn.to/4xN98ep" 
                      target="_blank" 
                      rel="noopener noreferrer nofollow sponsored"
                      className="inline-block mt-1 text-[11px] bg-white border border-slate-300 text-blue-600 font-medium px-2 py-0.5 rounded shadow-xs hover:bg-slate-50 hover:text-blue-700"
                    >
                      View on Amazon ↗
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-4 font-medium text-slate-900">Full-Size Refrigerator</td>
                  <td className="p-4">150W – 250W</td>
                  <td className="p-4 text-center text-red-500 font-medium">Not Recommended</td>
                  <td className="p-4 text-center text-amber-600 font-medium">4 – 6 Hours</td>
                  <td className="p-4 text-center text-green-600 font-medium">10 – 14 Hours</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">CPAP Medical Machine</td>
                  <td className="p-4">40W – 60W</td>
                  <td className="p-4 text-center text-green-600">1 – 2 Nights</td>
                  <td className="p-4 text-center text-green-600">3 – 4 Nights</td>
                  <td className="p-4 text-center text-green-600">7+ Nights</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900">Wi-Fi Router + Phones</td>
                  <td className="p-4">15W – 30W</td>
                  <td className="p-4 text-center text-green-600">15 – 20 Hours</td>
                  <td className="p-4 text-center text-green-600">35 – 45 Hours</td>
                  <td className="p-4 text-center text-green-600">80+ Hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 模块 2：地域场景化导航 (内链枢纽，后续脚本生成城市页面后在此挂链接) */}
      <section id="regional-guides" className="py-12 px-4 bg-slate-100 border-y border-slate-200 w-full">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Regional Power Outage & Emergency Guides</h2>
            <p className="text-slate-500 text-sm mt-1">Select your area to see recommended generator setups based on local grid risks.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 飓风带分类 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-blue-600 text-lg font-bold mb-2">🌀 Hurricane & Storm Zones</div>
              <p className="text-xs text-slate-500 mb-3">High humidity, multi-day post-storm grid failures.</p>
              <ul className="text-sm space-y-2 text-slate-700">
                <li><Link href="/power/florida-miami" className="hover:text-amber-600 hover:underline">Miami, FL Emergency Backup</Link></li>
                <li><Link href="/power/florida-tampa" className="hover:text-amber-600 hover:underline">Tampa, FL Outage Guide</Link></li>
                <li><Link href="/power/texas-houston" className="hover:text-amber-600 hover:underline">Houston, TX Hurricane Prep</Link></li>
              </ul>
            </div>

            {/* 冬季极寒寒潮带 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-sky-600 text-lg font-bold mb-2">❄️ Winter Freeze & Ice Storms</div>
              <p className="text-xs text-slate-500 mb-3">Sub-zero temperatures and frozen utility lines.</p>
              <ul className="text-sm space-y-2 text-slate-700">
                <li><Link href="/power/texas-dallas" className="hover:text-amber-600 hover:underline">Dallas, TX Winter Storm Backup</Link></li>
                <li><Link href="/power/texas-austin" className="hover:text-amber-600 hover:underline">Austin, TX Grid Reliability</Link></li>
                <li><Link href="/power/minnesota-minneapolis" className="hover:text-amber-600 hover:underline">Minneapolis, MN Cold Weather Setup</Link></li>
              </ul>
            </div>

            {/* 山火拉闸限电与自驾露营 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-amber-600 text-lg font-bold mb-2">🔥 Wildfire PSPS & Off-Grid</div>
              <p className="text-xs text-slate-500 mb-3">Planned safety shutoffs and high-altitude dispersed camping.</p>
              <ul className="text-sm space-y-2 text-slate-700">
                <li><Link href="/power/california-los-angeles" className="hover:text-amber-600 hover:underline">Los Angeles, CA Fire Season Backup</Link></li>
                <li><Link href="/power/colorado-denver" className="hover:text-amber-600 hover:underline">Denver, CO High Altitude Camping</Link></li>
                <li><Link href="/power/utah-moab" className="hover:text-amber-600 hover:underline">Moab, UT Off-Grid Solar Gear</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 模块 3：旗舰标杆推荐 (展示选品矩阵与购买按钮) */}
      <section id="top-picks" className="py-12 px-4 max-w-5xl mx-auto w-full mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Industry-Standard Benchmark Units</h2>
          <p className="text-slate-500 text-sm mt-1">LiFePO4 battery chemistry with 3,000+ lifecycle guarantees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 2000Wh 卡片 */}
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
            <div className="mt-5 pt-3 border-t border-slate-100">
              <a
                href="https://amzn.to/4xN98ep"
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="block text-center bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2 rounded-lg transition"
              >
                Check Price on Amazon ↗
              </a>
            </div>
          </div>

          {/* 1000Wh 卡片 */}
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
            <div className="mt-5 pt-3 border-t border-slate-100">
              <a
                href="https://amzn.to/4hkcZKR"
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="block text-center bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2 rounded-lg transition"
              >
                Check Price on Amazon ↗
              </a>
            </div>
          </div>

          {/* 300Wh - 500Wh 卡片 */}
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
            <div className="mt-5 pt-3 border-t border-slate-100">
              <a
                href="https://amzn.to/4d7d8Ps"
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="block text-center bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2 rounded-lg transition"
              >
                Check Price on Amazon ↗
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}