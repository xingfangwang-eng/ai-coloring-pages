"use client";

import { useEffect, useState } from "react";

/** 生成过程中的多阶段提示（依次切换，制造进度感） */
const LOADING_STAGES = [
  "Sketches rough outlines…",
  "Refines bold line art…",
  "Cleans up the edges…",
  "Almost there…",
];

interface Props {
  /** 用户原始输入，可选显示在提示里 */
  prompt?: string;
}

/**
 * 优雅的"AI 正在绘制线稿"Loading 动画：
 *   - SVG 画笔图标做 stroke-dashoffset 描边动画
 *   - 墨滴做 pulse 呼吸
 *   - 提示文案每 1.8s 切换一次，暗示进度
 */
export function PolishingLoader({ prompt }: Props) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStage((s) => (s + 1) % LOADING_STAGES.length);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-lg border border-dashed bg-muted/15">
      {/* 背景装饰：随机散点 */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-[18%] top-[22%] h-1.5 w-1.5 rounded-full bg-primary/30 animate-ink-pulse [animation-delay:0.1s]" />
        <div className="absolute left-[74%] top-[28%] h-1 w-1 rounded-full bg-primary/25 animate-ink-pulse [animation-delay:0.4s]" />
        <div className="absolute left-[30%] top-[68%] h-1.5 w-1.5 rounded-full bg-primary/30 animate-ink-pulse [animation-delay:0.7s]" />
        <div className="absolute left-[62%] top-[72%] h-1 w-1 rounded-full bg-primary/25 animate-ink-pulse [animation-delay:1.0s]" />
        <div className="absolute left-[50%] top-[48%] h-2 w-2 rounded-full bg-primary/20 animate-ink-pulse [animation-delay:0.2s]" />
      </div>

      {/* 画笔 SVG + 描边动画 */}
      <div className="animate-float-y">
        <svg
          viewBox="0 0 80 80"
          width="84"
          height="84"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-hidden
        >
          {/* 墨水瓶 */}
          <rect x="22" y="42" width="24" height="28" rx="3" className="animate-brush-draw [animation-delay:0.2s]" />
          <rect x="28" y="36" width="12" height="8" rx="1.5" className="animate-brush-draw [animation-delay:0.4s]" />
          {/* 墨滴 */}
          <path d="M34 50 Q34 55 34 56 Q34 58 32 58 Q30 58 30 56 Q30 55 30 50 Q32 46 34 50Z" className="animate-brush-draw [animation-delay:0.6s]" />
          {/* 画笔 */}
          <path d="M48 48 L64 32" className="animate-brush-draw [animation-delay:0.1s]" />
          <path d="M64 32 L68 28 L72 32 L68 36 Z" className="animate-brush-draw [animation-delay:0.3s]" />
          <path d="M48 48 Q44 52 42 56" className="animate-brush-draw [animation-delay:0.8s]" />
          {/* 正在绘制的小线条 */}
          <path d="M10 70 L20 66 L28 72 L38 66" strokeDasharray="10 8" className="animate-brush-draw [animation-delay:0.0s]" />
        </svg>
      </div>

      {/* 进度提示文案 */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium text-foreground/80">
          AI is sketching your coloring page
        </p>
        <p
          key={stage}
          className="animate-float-y text-xs text-muted-foreground transition-all"
          style={{ animationDuration: "0.6s" }}
        >
          {LOADING_STAGES[stage]}
        </p>
        {prompt && (
          <p className="mt-1 max-w-[240px] truncate rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
            &ldquo;{prompt}&rdquo;
          </p>
        )}
      </div>

      {/* 底部横条 shimmer 效果 */}
      <div className="absolute bottom-3 left-1/2 h-1 w-36 -translate-x-1/2 overflow-hidden rounded-full bg-muted/50">
        <div className="h-full w-1/2 bg-shimmer rounded-full" />
      </div>
    </div>
  );
}
