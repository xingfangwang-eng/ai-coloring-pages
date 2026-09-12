import type { GenerationRequest, GenerationResult } from "@/types";
import { buildColoringPrompt } from "./prompt-engineering";

/**
 * Pollinations.ai 免费图片生成 API 封装
 *
 * 端点: https://image.pollinations.ai/prompt/{url_encoded_prompt}
 * 可选 query:
 *   width, height, model, seed, nologo, enhance, referrer
 *
 * 特点：
 *   - 完全免费，无需 API Key
 *   - GET 请求即可返回图片
 *   - 服务端代理后可隐藏 prompt 细节并避免 CORS
 */

/**
 * Pollinations.ai free image generation API wrapper
 *
 * Endpoint: https://image.pollinations.ai/prompt/{url_encoded_prompt}
 * Optional query: width, height, model, seed, nologo, enhance, referrer
 *
 * Notes:
 *   - 100% free, no API key required
 *   - Default 2048x2048 — suitable for A4 printing at 300dpi
 */

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

/** Default image dimensions — 2048x2048 = A4-ready print quality */
const DEFAULT_WIDTH = 2048;
const DEFAULT_HEIGHT = 2048;
const DEFAULT_MODEL = "flux";

/** 生成随机 seed（Pollinations seed 范围 1 ~ 2^31-1） */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_646) + 1;
}

/**
 * 构造 Pollinations 的完整 URL（仅字符串拼接，不发起请求）
 */
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
    model = DEFAULT_MODEL,
    seed,
  } = params;

  const encoded = encodeURIComponent(prompt);
  const usp = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    nologo: "true", // 去掉 Pollinations 的 logo
  });
  if (seed !== undefined) usp.set("seed", String(seed));

  return `${POLLINATIONS_BASE}/${encoded}?${usp.toString()}`;
}

/**
 * 服务端/客户端通用的"生成图片"函数。
 * 在 Route Handler 里会被调用：fetch Pollinations -> 返回 Blob。
 * 在浏览器侧，一般不直接用，而是走 /api/generate 代理。
 */
export async function fetchColoringImage(
  req: GenerationRequest
): Promise<GenerationResult> {
  const enhancedPrompt = buildColoringPrompt(req.prompt, req.complexity);
  const seed = req.seed ?? randomSeed();

  const targetUrl = buildPollinationsUrl({
    prompt: enhancedPrompt,
    width: req.width,
    height: req.height,
    model: req.model,
    seed,
  });

  const resp = await fetch(targetUrl, {
    // Pollinations 免费端偶尔慢，给足 60s
    signal: AbortSignal.timeout?.(60_000),
  });

  if (!resp.ok) {
    throw new Error(
      `Pollinations API error: ${resp.status} ${resp.statusText}`
    );
  }

  // 生成一个 data URL 形式的 imageUrl，方便前端直接 <img src> 使用
  // （这样前端不需要额外 fetch 就能拿到可显示的 URL）
  const blob = await resp.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mime = resp.headers.get("content-type") || "image/png";
  const dataUrl = `data:${mime};base64,${base64}`;

  return {
    imageUrl: dataUrl,
    prompt: req.prompt,
    enhancedPrompt,
    seed,
    createdAt: Date.now(),
  };
}
