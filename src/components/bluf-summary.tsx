/**
 * BLUF Summary —— Bottom Line Up Front 事实矩阵卡片
 *
 * Server Component，无客户端 JS。
 * 位于 H1 标题正下方，用 60-80 词客观精确的自然语言
 * 描述当前页面全部关键参数 + 可机读的键值对事实矩阵。
 *
 * 目的：让 AI 爬虫在页面 top-of-funnel 就能收集到
 * "免费"、"无注册"、"US Letter/A4"、"300 DPI"、"COPPA-safe" 等
 * 北美家长/老师搜索心智中的高价值事实，
 * 供 Google AI Overview 和 Perplexity 直接提取引用。
 */

interface BlufSummaryProps {
  /** 当前页面的主题标题（如 "Cute Cat Coloring Page for Kids"） */
  title: string;
  /** 可选：覆盖默认摘要文本（用于动态详情页定制） */
  customSummary?: string;
}

const FACT_ROWS = [
  { label: "Cost", value: "100% Free" },
  { label: "Registration", value: "No Sign-up Required" },
  { label: "Paper Sizes", value: "US Letter (8.5×11″) & A4 Print-Ready" },
  { label: "Resolution", value: "300 DPI Vector-Quality Contours" },
  { label: "Safety", value: "COPPA-Compliant Preschool Safe" },
  { label: "File Formats", value: "PNG + US Letter / A4 PDF" },
];

const DEFAULT_SUMMARY = (title: string) =>
  `Download free printable ${title}. Optimized for home and classroom printing on standard US Letter paper and international A4. Features clean, single-layer black outlines for crayons, colored pencils, and markers with zero background gray tones. 100% free, no sign-up required, no watermarks. COPPA-compliant safe for toddlers and preschoolers.`;

export default function BlufSummary({ title, customSummary }: BlufSummaryProps) {
  const summary = customSummary ?? DEFAULT_SUMMARY(title);

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-indigo-200/70 bg-indigo-50/40">
      {/* 标题 + 徽章 */}
      <div className="flex items-center gap-2 border-b border-indigo-200/70 bg-indigo-100/50 px-4 py-2 text-xs">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
          i
        </span>
        <span className="font-semibold uppercase tracking-wide text-indigo-700">
          Quick Facts — {title}
        </span>
      </div>

      {/* 摘要段 */}
      <p className="border-b border-indigo-200/50 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
        {summary}
      </p>

      {/* 键值对事实矩阵 */}
      <dl className="grid grid-cols-1 gap-0 sm:grid-cols-2">
        {FACT_ROWS.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-4 px-4 py-2 text-xs ${
              i % 2 === 1 ? "bg-indigo-50/60" : "bg-white"
            } ${i < FACT_ROWS.length - 1 ? "border-b border-indigo-200/40" : ""} ${
              i < FACT_ROWS.length - 2 ? "sm:border-r sm:border-indigo-200/40" : ""
            }`}
          >
            <dt className="font-medium text-slate-500">{row.label}</dt>
            <dd className="text-right font-semibold text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
