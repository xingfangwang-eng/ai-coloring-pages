"use client";

/**
 * LineartImage —— 极简着色页图片展示组件
 *
 * 纯原生 <img> —— 彻底移除 Canvas（Pollinations 无 CORS 头，
 * Tainted Canvas 浏览器安全拦截会导致 toDataURL 崩溃）。
 *
 * 三重防护：
 *   1. CSS 裁切 —— overflow-hidden + scale(1.06) → 物理干掉底部 Logo
 *   2. onError 自动重试 —— 加载失败时 seed 偏移重试
 *   3. fallbackSrc 优雅降级 —— 重试耗尽后切换到内嵌 SVG，
 *      绝不向用户展示丑陋的"加载失败"文字提示
 */
import { useState, useRef, useCallback } from "react";

interface LineartImageProps {
  src: string;
  alt: string;
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
  const [usingFallback, setUsingFallback] = useState(false);
  const triedRef = useRef<Set<string>>(new Set());

  /** 计算当前 src —— 根据重试次数偏移 seed */
  const getRetrySrc = useCallback(() => {
    try {
      const url = new URL(src);
      const seed = url.searchParams.get("seed");
      if (seed) {
        const newSeed = Number(seed) + (retryCount + 1) * 1000;
        url.searchParams.set("seed", String(newSeed));
        return url.toString();
      }
    } catch {
      // 不是 URL（如 data: 开头的 SVG fallback）—— 直接返回
    }
    return src;
  }, [src, retryCount]);

  // 如果已经切到 fallbackSrc，就用 fallbackSrc 作为当前 src
  const currentSrc = usingFallback
    ? fallbackSrc ?? src
    : getRetrySrc();

  const handleError = () => {
    // 如果已经在用 fallbackSrc 了还失败 —— 静默隐藏，不显示错误
    if (usingFallback) {
      setFailed(true);
      return;
    }

    // 优先尝试 fallbackSrc（如果有）
    if (fallbackSrc) {
      setUsingFallback(true);
      setLoaded(false);
      return;
    }

    // 没有 fallbackSrc —— 走 seed 偏移重试
    if (retryCount >= 3 || triedRef.current.has(currentSrc)) {
      setFailed(true);
      return;
    }
    triedRef.current.add(currentSrc);
    setRetryCount((c) => c + 1);
    setLoaded(false);
  };

  // 如果用 fallbackSrc 还在加载，loaded 要重新计算
  const showSkeleton = !loaded && !failed;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* 加载骨架（首次加载才显示） */}
      {showSkeleton && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-500" />
          </div>
        </div>
      )}

      {/* 失败降级 —— 静默隐藏，不显示任何错误文字
          只有 fallbackSrc 也失败才会到这里 */}
      {failed && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-4xl text-gray-300">🎨</div>
        </div>
      )}

      {/* 主图 —— CSS 裁切干掉 Pollinations 右下角 Logo */}
      {!failed && (
        <img
          key={currentSrc}
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
