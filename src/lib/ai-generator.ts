/**
 * AI 图片生成服务 —— 双引擎机制
 *
 * Engine 1: Google AI Studio (Imagen 系列模型) —— 主引擎
 *   - 面向首页实时生成，产出皮克斯/迪士尼级线稿
 *   - 依赖 GEMINI_API_KEY（Google AI Studio 官方 Key）
 *   - 免费版有 ~15 RPM 频控
 *
 * Engine 2: Pollinations.ai (Flux 模型) —— 降级引擎 + pSEO 引擎
 *   - 完全免费、无限量、无 Key
 *   - 支持确定性 seed → 同一 seed + prompt = 同一张图
 *   - 用于：①Google AI Studio 超限时自动降级；②pSEO 页面静态产出
 */

import type { GenerationRequest, GenerationResult } from "@/types";
import { buildColoringPrompt } from "./prompt-engineering";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

/** Default image dimensions — 1024x1024（turbo 模型最优尺寸 + 更快） */
export const DEFAULT_WIDTH = 1024;
export const DEFAULT_HEIGHT = 1024;
/** turbo = 简笔画专用模型，比 flux 快 5 倍，绝不会出 3D 阴影 */
const DEFAULT_POLLINATIONS_MODEL = "turbo";

/** seed 强制偏移量 —— 打破 Pollinations CDN 历史缓存 */
const SEED_CACHE_BUST_OFFSET = 2026;

/** 线稿 Prompt —— 出版级工业线稿指令，严禁可爱/彩色诱导词 */
const LINEART_TEMPLATE =
  "uncolored coloring book page, black ink line art outline, stark black contour on pure white paper, stencil, coloring sheet, zero color, zero shading, hollow outline: ";

/** 构造 Pollinations 的完整 URL
 *
 * 三重保障：
 *   1. model=turbo —— 简笔画专用，快 5 倍，绝不会画 3D
 *   2. 简练 prompt 模板 —— 避免解析崩溃
 *   3. seed 偏移 +2026 + nologo=true
 */
export function buildPollinationsUrl(params: {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
}): string {
  const {
    prompt: rawPrompt,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    model = DEFAULT_POLLINATIONS_MODEL,
    seed,
  } = params;

  // 简练模板：避免过长 prompt 引起 turbo 解析崩溃
  const finalPrompt = `${LINEART_TEMPLATE}${rawPrompt}`;
  const encoded = encodeURIComponent(finalPrompt);

  const usp = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    nologo: "true",
  });

  // seed 偏移打破 CDN 缓存
  if (seed !== undefined) {
    const bustedSeed = ((seed + SEED_CACHE_BUST_OFFSET) % 2_147_483_646) + 1;
    usp.set("seed", String(bustedSeed));
  }

  return `${POLLINATIONS_BASE}/${encoded}?${usp.toString()}`;
}

/** 已废弃 —— 保留兼容，内部自动用新模板 */
export function wrapLineartPrompt(rawPrompt: string): string {
  return `${LINEART_TEMPLATE}${rawPrompt}`;
}

/* ============================================================
 * 前端 Canvas 脱色工具（PDF 导出用）
 * ============================================================ */

/**
 * 将任意图片 URL 加载到 Canvas，应用 CSS 滤镜强制纯黑白线稿，
 * 返回 PNG data URL —— 保证 PDF 导出绝对干净的黑白线条。
 *
 * 滤镜参数与 LineartImage 展示层完全一致：
 *   grayscale(100%) contrast(280%) brightness(108%)
 */
export async function desaturateImageToDataUrl(
  src: string,
  maxSize = 2048
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context not available"));
        return;
      }
      // 先铺白底（防止透明 PNG 被浏览器 filter 渲染成灰色）
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      // 强制脱色滤镜
      ctx.filter = "grayscale(100%) contrast(280%) brightness(108%)";
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image for PDF desaturation"));
    img.src = src;
  });
}

/** 生成随机 seed（Pollinations seed 范围 1 ~ 2^31-1） */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_646) + 1;
}

/** 将 base64 + mime 组装成 data URL */
function toDataUrl(base64: string, mime: string): string {
  return `data:${mime};base64,${base64}`;
}

/** Google Imagen 模型选择 —— 优先使用 Nano Banana 2 */
const GOOGLE_IMAGEN_MODELS = [
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-lite-image",
] as const;

/** 调用 Pollinations 生成图片（始终可用） */
async function fetchFromPollinations(
  enhancedPrompt: string,
  seed: number,
  req: GenerationRequest
): Promise<GenerationResult> {
  const targetUrl = buildPollinationsUrl({
    prompt: enhancedPrompt,
    width: req.width,
    height: req.height,
    model: req.model,
    seed,
  });

  const resp = await fetch(targetUrl, {
    signal: AbortSignal.timeout?.(60_000),
  });

  if (!resp.ok) {
    throw new Error(`Pollinations API error: ${resp.status} ${resp.statusText}`);
  }

  const blob = await resp.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mime = resp.headers.get("content-type") || "image/png";

  return {
    imageUrl: toDataUrl(base64, mime),
    prompt: req.prompt,
    enhancedPrompt,
    seed,
    createdAt: Date.now(),
  };
}

/* ============================================================
 * Engine 1: Google AI Studio (Imagen) —— 主引擎
 * ============================================================ */

/**
 * 调用 Google AI Studio Nano Banana / Gemini 图片生成模型
 * 使用 generateContent API（Imagen 已弃用）
 * 需要 GEMINI_API_KEY 环境变量
 *
 * 文档参考：https://ai.google.dev/gemini-api/docs/image-generation
 */
async function fetchFromGoogleImagen(
  enhancedPrompt: string,
  req: GenerationRequest
): Promise<{ imageDataUrl: string; seed: number; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  // 动态 import —— 避免没有 API key 时 SDK 加载开销
  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({ apiKey });

  // 尝试多个图片生成模型，直到成功
  let lastError: unknown = null;
  for (const model of GOOGLE_IMAGEN_MODELS) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: enhancedPrompt,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      // 从 response.candidates[0].content.parts 中找 image
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      let imageBytes: string | undefined;
      let mime = "image/png";

      for (const part of parts) {
        const img = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
        if (img?.data && (img.mimeType?.startsWith("image/") || img.mimeType === "image/png")) {
          imageBytes = img.data;
          mime = img.mimeType || "image/png";
          break;
        }
      }

      if (!imageBytes) {
        throw new Error(`Google ${model} returned no image in response (${parts.length} parts)`);
      }

      const dataUrl = toDataUrl(imageBytes, mime);

      return {
        imageDataUrl: dataUrl,
        seed: randomSeed(),
        model,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[Google GenAI] Model ${model} failed:`, err instanceof Error ? err.message : err);
      // 继续尝试下一个模型
    }
  }

  throw new Error(
    `All Google image models failed: ${lastError instanceof Error ? lastError.message : "unknown"}`
  );
}

/* ============================================================
 * 统一入口 —— 自动降级
 * ============================================================ */

export type EngineName = "google-imagen" | "pollinations";

/** 生成图片结果（含引擎信息，方便调试） */
export interface GenerationResultWithEngine extends GenerationResult {
  engine: EngineName;
}

/**
 * 核心生成函数 —— 自动降级策略
 *
 * 1. 如果配置了 GEMINI_API_KEY，优先尝试 Google AI Studio Imagen 模型
 * 2. 如果 Imagen 失败（限流 / 模型问题 / 无 Key），自动降级到 Pollinations Flux
 * 3. 永远保证返回可用图片 URL（双引擎兜底）
 */
export async function fetchColoringImage(
  req: GenerationRequest
): Promise<GenerationResultWithEngine> {
  const enhancedPrompt = buildColoringPrompt(req.prompt, req.complexity);
  const seed = req.seed ?? randomSeed();

  // 先尝试 Google AI Studio
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  if (hasGeminiKey && !req.seed) {
    // 只有实时生成（无 seed）才走 Google Imagen
    // pSEO 页（有确定性 seed）直接走 Pollinations
    try {
      const result = await fetchFromGoogleImagen(enhancedPrompt, req);
      return {
        imageUrl: result.imageDataUrl,
        prompt: req.prompt,
        enhancedPrompt,
        seed: result.seed,
        createdAt: Date.now(),
        engine: "google-imagen",
      };
    } catch (err) {
      console.warn("[ai-generator] Google Imagen failed, falling back to Pollinations:",
        err instanceof Error ? err.message : err);
      // 降级继续
    }
  }

  // Pollinations（降级 / pSEO 确定性生成）
  const pollinationsResult = await fetchFromPollinations(enhancedPrompt, seed, req);
  return {
    ...pollinationsResult,
    engine: "pollinations",
  };
}

/* ============================================================
 * 快速 API —— pSEO 页面确定性生成
 * ============================================================ */

/**
 * pSEO 专用 —— 用确定性 seed 调用 Pollinations
 * 保证同一 slug 每次生成同一张线稿（抗 Google 爬虫扫描）
 */
export async function fetchDeterministicColoringImage(
  fullPrompt: string,
  seed: number,
  complexity: "kids" | "adults" = "kids"
): Promise<GenerationResult> {
  const req: GenerationRequest = {
    prompt: fullPrompt,
    complexity,
    seed,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    model: "flux",
  };

  return fetchFromPollinations(fullPrompt, seed, req);
}
