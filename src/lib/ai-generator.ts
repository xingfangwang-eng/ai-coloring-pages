/**
 * AI 图片生成服务 —— Pollinations.ai (Turbo)
 *
 * 单一引擎：Pollinations.ai model=turbo
 *   - 完全免费、无限量、无 Key
 *   - 支持确定性 seed → 同一 seed + prompt = 同一张图
 *   - 用于：①Studio 工作台实时生成；②pSEO 页面静态产出；③首页实时生成
 *
 * Prompt 规则（用户实测验证 100% 稳定）：
 *   - 统一模板："coloring book page of a ${pureSubject}, black line art outline, white background"
 *   - 严禁任何否定式（no X 会反向激活 X 权重）
 *   - 严禁冗余词堆砌（simple vector contour / no shading 等都去掉）
 */

import type { GenerationRequest, GenerationResult } from "@/types";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

/** Default image dimensions — 1024x1024 */
export const DEFAULT_WIDTH = 1024;
export const DEFAULT_HEIGHT = 1024;

/** 强制使用 turbo —— 用户实测最稳定生成线稿 */
const POLLINATIONS_MODEL = "turbo";

/** seed 强制偏移量 —— 砸烂 Pollinations 历史 CDN 缓存 */
const SEED_CACHE_BUST_OFFSET = 88888;

/**
 * 精简短句 Prompt 模板 —— 用户实测验证可稳定生成完美黑白手绘线稿
 *
 * 严禁添加任何：
 *   - 否定词（no X / without X）—— 会反向激活权重
 *   - 冗余描述（simple vector contour / clean sharp edges 等）
 *   - 风格标签堆砌
 */
const LINEART_PROMPT =
  "coloring book page of a {{SUBJECT}}, black line art outline, white background";

/** 构造 Pollinations 的完整 URL
 *
 * @param params.prompt  —— 纯净主体词（如 "cat"、"cute unicorn"）
 *                         函数内部会自动套 LINEART_PROMPT 模板，
 *                         调用方绝对不要预包装！
 * @param params.width   —— 默认 1024
 * @param params.height  —— 默认 1024
 * @param params.model   —— 强制 "turbo"，忽略任何传入值
 * @param params.seed    —— 确定性种子（1 ~ 2^31-1）
 */
export function buildPollinationsUrl(params: {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
}): string {
  const {
    prompt: pureSubject,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    seed,
  } = params;

  // 精简短句模板 —— 纯净主体词 → 套模板 → 编码
  const finalPrompt = LINEART_PROMPT.replace(/\{\{SUBJECT\}\}/g, pureSubject);
  const encoded = encodeURIComponent(finalPrompt);

  const usp = new URLSearchParams({
    width: String(width),
    height: String(height),
    model: POLLINATIONS_MODEL,
    nologo: "true",
  });

  if (seed !== undefined) {
    const bustedSeed = ((seed + SEED_CACHE_BUST_OFFSET) % 2_147_483_646) + 1;
    usp.set("seed", String(bustedSeed));
  }

  return `${POLLINATIONS_BASE}/${encoded}?${usp.toString()}`;
}

/** 保留兼容 —— 给需要手动构建完整 prompt 文本的场景 */
export function wrapLineartPrompt(rawPrompt: string): string {
  return LINEART_PROMPT.replace(/\{\{SUBJECT\}\}/g, rawPrompt);
}

/** 生成随机 seed（Pollinations seed 范围 1 ~ 2^31-1） */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_646) + 1;
}

/** 将 base64 + mime 组装成 data URL */
function toDataUrl(base64: string, mime: string): string {
  return `data:${mime};base64,${base64}`;
}

/**
 * 调用 Pollinations Turbo 生成图片
 *
 * @param pureSubject  纯净主体词（如 "cat"、"cute unicorn"）
 *                     函数内部会自动套 LINEART_PROMPT 模板
 * @param seed         确定性种子
 * @param req          原始请求参数（用于 width/height 等）
 *
 * 注意：调用方传 pureSubject，不要预包装成完整 prompt！
 */
async function fetchFromPollinations(
  pureSubject: string,
  seed: number,
  req: GenerationRequest
): Promise<GenerationResult> {
  // buildPollinationsUrl 内部会把 pureSubject 套入 LINEART_PROMPT 模板
  const targetUrl = buildPollinationsUrl({
    prompt: pureSubject,
    width: req.width,
    height: req.height,
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

  const enhancedPrompt = wrapLineartPrompt(pureSubject);

  return {
    imageUrl: toDataUrl(base64, mime),
    prompt: pureSubject,
    enhancedPrompt,
    seed,
    createdAt: Date.now(),
  };
}

/* ============================================================
 * 统一入口 —— Pollinations Turbo
 * ============================================================ */

export type EngineName = "pollinations";

/** 生成图片结果（含引擎信息，方便调试） */
export interface GenerationResultWithEngine extends GenerationResult {
  engine: EngineName;
}

/**
 * 核心生成函数 —— Pollinations Turbo
 *
 * 直接用用户输入的纯净主体词，内部套 LINEART_PROMPT 模板。
 * 不再走 buildColoringPrompt 的复杂标签堆砌。
 */
export async function fetchColoringImage(
  req: GenerationRequest
): Promise<GenerationResultWithEngine> {
  const seed = req.seed ?? randomSeed();

  const result = await fetchFromPollinations(req.prompt, seed, req);
  return {
    ...result,
    engine: "pollinations",
  };
}

/* ============================================================
 * 快速 API —— pSEO 页面确定性生成
 * ============================================================ */

/**
 * pSEO 专用 —— 用确定性 seed 调用 Pollinations Turbo
 * 保证同一 slug 每次生成同一张线稿（抗 Google 爬虫扫描）
 *
 * @param pureSubject  纯净主体词（如 "cat"）
 */
export async function fetchDeterministicColoringImage(
  pureSubject: string,
  seed: number,
  complexity: "kids" | "adults" = "kids"
): Promise<GenerationResult> {
  const req: GenerationRequest = {
    prompt: pureSubject,
    complexity,
    seed,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  };

  return fetchFromPollinations(pureSubject, seed, req);
}
