"use client";

/**
 * LineartImage —— 着色页图片展示组件（Client Component）
 *
 * 核心机制：前端 Canvas 二值化引擎
 *   不管 AI 画的是 3D 毛绒小猫、彩色插画、还是带阴影的半线稿，
 *   图片加载完成后瞬间被强制转换为「纯白底 + 纯黑硬轮廓」，
 *   彻底脱离 Prompt 祈祷的不确定依赖。
 *
 * 四重防护：
 *   1. Canvas 二值化 —— 灰度 → 阈值 135 硬切割 → 强制纯黑/纯白
 *   2. CSS 裁切 —— overflow-hidden + scale(1.06) → 物理干掉底部 Logo
 *   3. onError 自动重试 —— 加载失败时 seed 偏移重试
 *   4. 加载骨架 + 失败降级 —— 永不显示裂图
 */
import { useState, useRef, useCallback } from "react";

/* ============================================================
 * Canvas 二值化引擎 —— 导出供 PDF 复用
 * ============================================================ */

/**
 * 专业涂色页二值化：灰度化 → 阈值硬切割 → 纯白底 + 纯黑轮廓
 *
 * @param imgElement 已加载完毕的 HTMLImageElement
 * @param threshold  二值化阈值 (0~255)，默认 90
 *                   低于阈值 → 纯黑(0)，高于阈值 → 纯白(255)
 *                   越低越激进（消掉更多灰点/阴影/边框）
 */
export function processToColoringPage(
  imgElement: HTMLImageElement,
  threshold = 90
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return imgElement.src;

  canvas.width = imgElement.naturalWidth || 1024;
  canvas.height = imgElement.naturalHeight || 1024;

  // 画白底（防止透明 PNG 出现灰色底）
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制原图
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // 灰度 + 硬阈值二值化
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // 人眼感知加权灰度
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // 强制二值化：低于阈值 → 纯黑(轮廓)，高于阈值 → 纯白(底色)
    const val = gray < threshold ? 0 : 255;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    // alpha 保持不变（白底已经 fillRect 铺好了）
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * 异步版：任意图片 URL → 二值化 data URL
 * 供 PDF 导出等非 React 场景使用。
 */
export async function urlToColoringDataUrl(
  src: string,
  threshold = 90
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(processToColoringPage(img, threshold));
    img.onerror = () => reject(new Error("Failed to load image for binarization"));
    img.src = src;
  });
}

/* ============================================================
 * LineartImage 组件
 * ============================================================ */

interface LineartImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  imgClassName?: string;
  /** 二值化阈值 —— 默认 135，越低保留越多细节 */
  threshold?: number;
}

export default function LineartImage({
  src,
  alt,
  fallbackSrc,
  className = "",
  imgClassName = "",
  threshold = 90,
}: LineartImageProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [binarizedSrc, setBinarizedSrc] = useState<string | null>(null);
  const triedRef = useRef<Set<string>>(new Set());

  const getRetrySrc = useCallback(() => {
    if (retryCount === 1 && fallbackSrc) return fallbackSrc;
    try {
      const url = new URL(src);
      const seed = url.searchParams.get("seed");
      if (seed) {
        const newSeed = Number(seed) + (retryCount + 1) * 1000;
        url.searchParams.set("seed", String(newSeed));
        return url.toString();
      }
    } catch {
      // 不是 URL
    }
    return src;
  }, [src, fallbackSrc, retryCount]);

  const currentSrc = getRetrySrc();

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // 图片加载完 → 立即 Canvas 二值化
    try {
      const binarized = processToColoringPage(img, threshold);
      setBinarizedSrc(binarized);
    } catch {
      // 二值化失败不影响展示（跨域等），仍展示原图
    }
    setLoaded(true);
  };

  const handleError = () => {
    if (retryCount >= 3 || triedRef.current.has(currentSrc)) {
      setFailed(true);
      return;
    }
    triedRef.current.add(currentSrc);
    setRetryCount((c) => c + 1);
    setLoaded(false);
  };

  // 展示用的 src（二值化完成后替换）
  const displaySrc = binarizedSrc ?? currentSrc;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* 加载骨架 */}
      {!loaded && !failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-500" />
            <span className="text-sm">Processing to line art...</span>
          </div>
        </div>
      )}

      {/* 失败降级 */}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-6 text-center">
          <div>
            <div className="mb-2 text-4xl">🎨</div>
            <p className="text-sm text-gray-500">
              Image loading failed. Please refresh the page.
            </p>
          </div>
        </div>
      )}

      {/* 主图 —— Canvas 二值化 + CSS 裁切 Logo */}
      {!failed && (
        <img
          key={displaySrc}
          src={displaySrc}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={`h-full w-full ${imgClassName}`}
          style={{
            objectFit: "cover",
            transform: "scale(1.06)",
            transformOrigin: "top center",
          }}
        />
      )}
    </div>
  );
}
