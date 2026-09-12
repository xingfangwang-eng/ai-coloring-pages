"use client";

/**
 * LineartImage —— 着色页图片展示组件（Client Component）
 *
 * 三重防护：
 *   1. CSS 裁切 —— overflow-hidden + scale(1.06) → 物理干掉底部 Logo
 *   2. onError 自动重试 —— 加载失败时 seed 偏移重试
 *   3. 加载骨架 + 失败降级 —— 永不显示裂图
 *
 * 注意：不再使用 CSS filter（contrast/grayscale 会把浅灰烧成黑块）
 * 黑白线稿由 AI prompt 直接生成，PDF 导出走 Canvas 兜底。
 */
import { useState, useRef, useCallback } from "react";

interface LineartImageProps {
  src: string;
  alt: string;
  /** 备用 seed —— 主 seed 加载失败时，用此备用 seed 重试 */
  fallbackSrc?: string;
  className?: string;
  imgClassName?: string;
}

export default function LineartImage({
  src,
  alt,
  fallbackSrc,
  className = "",
  imgClassName = "",
}: LineartImageProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const triedRef = useRef<Set<string>>(new Set());

  // 生成带 retry 计数的新 src（在原 URL 后拼 &seed= 偏移）
  const getRetrySrc = useCallback(() => {
    if (retryCount === 1 && fallbackSrc) {
      // 第一次失败：用备用 seed
      return fallbackSrc;
    }
    // 之后：在原 URL 基础上做 seed 偏移重试
    try {
      const url = new URL(src);
      const seed = url.searchParams.get("seed");
      if (seed) {
        const newSeed = Number(seed) + (retryCount + 1) * 1000;
        url.searchParams.set("seed", String(newSeed));
        return url.toString();
      }
    } catch {
      // 不是 URL，直接返回
    }
    return src;
  }, [src, fallbackSrc, retryCount]);

  const currentSrc = getRetrySrc();

  const handleError = () => {
    // 防止无限重试
    if (retryCount >= 3 || triedRef.current.has(currentSrc)) {
      setFailed(true);
      return;
    }
    triedRef.current.add(currentSrc);
    setRetryCount((c) => c + 1);
    setLoaded(false);
  };

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
            <span className="text-sm">Generating line art...</span>
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

      {/* 主图 —— CSS 裁切干掉右下角 Logo */}
      {!failed && (
        <img
          key={currentSrc} // 强制重挂载触发重试
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
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
