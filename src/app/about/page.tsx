import Link from "next/link";
import { Zap, ShieldCheck, BatteryCharging, Mail } from "lucide-react";

export const metadata = {
  title: "About Us | PowerReady Hub",
  description: "Independent guides, runtime estimates, and regional emergency power planning.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 text-slate-800">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* 头部标题 */}
        <div className="space-y-3">
          <span className="inline-block bg-amber-500/10 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded border border-amber-500/20">
            About PowerReady Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Preparing Families & Adventurers for Real-World Outages
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            PowerReady Hub is an independent informational resource dedicated to helping homeowners, renters, and outdoor enthusiasts navigate extreme weather blackouts and off-grid power solutions.
          </p>
        </div>

        {/* 我们的使命 */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Our Mission
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            From Gulf Coast hurricanes and Texas winter freezes to California wildfire safety shutoffs (PSPS), power grid vulnerabilities have become an annual reality across North America.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our mission is simple: cut through misleading marketing claims and provide realistic, data-backed battery runtime benchmarks so you know exactly which equipment can keep your family safe, your food cold, and your medical devices powered during an emergency.
          </p>
        </section>

        {/* 我们的评估准则 (增加权威度与合规度) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            How We Evaluate Equipment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-sm text-slate-900 mb-1">Battery Chemistry</h3>
              <p className="text-xs text-slate-500">
                We prioritize LiFePO4 (LFP) cells offering 3,000+ lifecycle guarantees over older NCM lithium technologies.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-sm text-slate-900 mb-1">Pure Sine Wave Inverters</h3>
              <p className="text-xs text-slate-500">
                We verify surge power ratings to ensure sensitive medical CPAP units and compressor-driven refrigerators run safely.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-sm text-slate-900 mb-1">Regional Adaptation</h3>
              <p className="text-xs text-slate-500">
                A backup system needed for sub-zero Minnesota winters requires different charging safeguards than one for humid Florida storms.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-sm text-slate-900 mb-1">Solar Input Efficiency</h3>
              <p className="text-xs text-slate-500">
                We evaluate real-world MPPT controller efficiency for prolonged multi-day off-grid scenarios.
              </p>
            </div>
          </div>
        </section>

        {/* 联盟透明声明 (亚马逊审核必看) */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm space-y-3">
          <h2 className="font-bold text-amber-900 flex items-center gap-2">
            <BatteryCharging className="h-5 w-5 text-amber-600" />
            Affiliate Transparency & Support
          </h2>
          <p className="text-amber-800/90 text-xs leading-relaxed">
            PowerReady Hub is supported by our readers. When you purchase through links on our site, we may earn an affiliate commission through the Amazon Associates program at no additional cost to you. We only recommend products and specifications we believe offer genuine utility and safety value.
          </p>
        </section>

        {/* 联系方式 */}
        <section className="pt-2 text-sm text-slate-600 space-y-2">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-500" />
            Get in Touch
          </h2>
          <p className="text-xs">
            Have questions, feedback, or regional hazard data updates? Contact our editorial team directly at:
          </p>
          <a
            href="mailto:xingfang.wang@gmail.com"
            className="text-amber-600 hover:underline font-medium text-xs block"
          >
            xingfang.wang@gmail.com
          </a>
        </section>

      </div>
    </div>
  );
}