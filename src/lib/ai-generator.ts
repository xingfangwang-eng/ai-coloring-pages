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

/** Default image dimensions — 2048x2048 = US Letter / A4 print quality */
export const DEFAULT_WIDTH = 2048;
export const DEFAULT_HEIGHT = 2048;
const DEFAULT_POLLINATIONS_MODEL = "flux";

/** Google Imagen 模型选择 —— 优先使用 4.0，回退 3.0 */
const GOOGLE_IMAGEN_MODELS = [
  "gemini-3.1-flash-image",       // 最新 Nano Banana 2（免费额度友好）
  "gemini-2.5-flash-image",       // Nano Banana 1（稳定）
  "gemini-3.1-flash-lite-image",  // 轻量化版本
] as const;

/* ============================================================
 * 通用工具
 * ============================================================ */

/** 生成随机 seed（Pollinations seed 范围 1 ~ 2^31-1） */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_646) + 1;
}

/** 将 base64 + mime 组装成 data URL */
function toDataUrl(base64: string, mime: string): string {
  return `data:${mime};base64,${base64}`;
}

/* ============================================================
 * Engine 2: Pollinations（降级 + pSEO 主引擎）
 * ============================================================ */

/** 构造 Pollinations 的完整 URL（仅字符串拼接，不发起请求） */
export function buildPollinationsUrl(params: {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
}): string {
  const {
    prompt,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    model = DEFAULT_POLLINATIONS_MODEL,
    seed,
  } = params;

  const encoded = encodeURIComponent(prompt);
  const usp = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    nologo: "true",
  });
  if (seed !== undefined) usp.set("seed", String(seed));

  return `${POLLINATIONS_BASE}/${encoded}?${usp.toString()}`;
}

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
