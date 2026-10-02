'use client';

import { useState } from 'react';

export function TaxCreditCalculator() {
  // 默认总价设为 $3,500（3kWh+ 设备的典型客单价）
  const [cost, setCost] = useState<number>(3500);

  const taxCredit = Math.round(cost * 0.3);
  const netCost = cost - taxCredit;

  return (
    <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900 block">
          Estimated Battery System Cost (USD)
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-slate-500">$</span>
          <input
            type="number"
            min={1000}
            max={15000}
            step={50}
            value={cost}
            onChange={(e) => setCost(Number(e.target.value) || 0)}
            className="w-full text-2xl font-extrabold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        {/* 动态滑块 */}
        <input
          type="range"
          min={2000}
          max={8000}
          step={100}
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer mt-2"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>$2,000 (Entry 3kWh)</span>
          <span>$5,000 (Expanded 6kWh)</span>
          <span>$8,000 (Whole-Home)</span>
        </div>
      </div>

      {/* 实时算账结果看板 (转化视觉焦点) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            IRS 30% Tax Credit (Refund)
          </span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-1">
            +${taxCredit.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            Direct reduction on IRS Form 5695
          </span>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 text-center">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Your True Out-of-Pocket Net Cost
          </span>
          <span className="text-3xl font-extrabold text-white block mt-1">
            ${netCost.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            After federal residential tax credit
          </span>
        </div>
      </div>

      {/* 3kWh 法定资格核验清单 */}
      <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-2 border border-slate-200">
        <span className="font-bold text-slate-900 block">
          ✓ IRS Section 25D Statutory Requirements:
        </span>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Minimum Capacity:</strong> Must be 3.0 kWh (3,000 Wh) or greater to qualify standalone without rooftop solar.</li>
          <li><strong>Eligible Property:</strong> Installed at an existing primary or secondary US residence.</li>
          <li><strong>Form 5695:</strong> Filed under Part I (Residential Clean Energy Credit) on your federal tax return.</li>
        </ul>
      </div>
    </div>
  );
}