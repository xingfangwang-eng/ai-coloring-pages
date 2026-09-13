/**
 * AI 图片生成服务 —— Pollinations.ai (Flux)
 *
 * 单一引擎：Pollinations.ai model=flux
 *   - 完全免费、无限量、无 Key
 *   - Flux 比 Turbo 线条更锐利清晰
 *   - 支持确定性 seed → 同一 seed + prompt = 同一张图
 *
 * Magic Prompt —— 用户实测验证 100% 稳定生成纯线稿
 *   "coloring book page of a {{SUBJECT}}, blank uncolored coloring sheet,
 *    black line art outline, isolated on stark pure white paper,
 *    no color, no fill, zero shading, no background scenery"
 *
 *   极度克制 + 所有负面约束打满 —— 绝不让 AI 上色、画背景、加阴影
 *
 * 防 CDN 缓存策略：
 *   seed 强制 + 777777 偏移量 —— 砸烂 Pollinations CDN 历史彩色图缓存
 *   （之前 seed=123456 生成过 red fox 水彩图，CDN 会缓存；偏移后用全新 seed）
 */

import type { GenerationRequest, GenerationResult } from "@/types";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

/** Default image dimensions — 1024x1024 */
export const DEFAULT_WIDTH = 1024;
export const DEFAULT_HEIGHT = 1024;

/** 强制使用 flux —— 线条比 turbo 更锐利清晰 */
const POLLINATIONS_MODEL = "flux";

/** seed 强制偏移量 —— 砸烂 Pollinations 历史 CDN 彩色图缓存 */
const SEED_CACHE_BUST_OFFSET = 777_777;

/**
 * Prompt 模板表 —— 双轨制
 *
 * adults → 精细 Zentangle / Mandala 线稿
 *   欧美成人涂色画行业标准：纯白底 + 密集精细空心几何花纹
 *
 * kids → 粗线条卡通简笔
 *   大块镂空适合蜡笔涂色
 *
 * 绝对约束（两个模板都包含）：
 *   - isolated on pure white background —— 严禁任何背景
 *   - hollow shapes —— 严禁实心黑块
 *   - line art / outline —— 强调纯线稿而非插画
 */
type Audience = "kids" | "adults";

/**
 * getSanitizedPromptSubject —— 关键词"去色净化"安全网
 *
 * 问题：SUBJECTS 数据里的 prompt 字段是完整自然语言描述句：
 *   "a clever red fox with bushy tail in autumn woods"
 * 直接喂给 Pollinations AI 会触发：
 *   - red → AI 给狐狸上色成红色
 *   - autumn woods → AI 画出背景（枫叶、草地）
 *
 * 本函数强制洗干净一切会触发上色/画背景的形容词和环境词，
 * 只保留纯净的主体名词（fox / dinosaur / elephant）。
 *
 * 两层净化：
 *   1. BANNED_WORDS 黑名单正则 —— 颜色词、环境词、拟人化形容词
 *   2. 兜底 —— 如果净化后为空（全是禁用词），返回 "animal"
 *
 * 同时支持 slug 输入（如 "cute-fox-for-kids"）—— 会先拆 slug 再净化。
 *
 * @param input —— 可以是完整 prompt 句子，也可以是 slug 格式
 * @returns       —— 纯净主体名词，可直接填入 Magic Prompt
 */
const BANNED_WORDS = [
  // 颜色词 —— 触发 AI 上色
  "red", "blue", "green", "yellow", "pink", "purple", "orange", "black", "white",
  "golden", "brown", "gray", "grey", "silver", "violet", "teal", "indigo",
  "multicolored", "colorful", "rainbow", "pastel",

  // 拟人化形容词 —— 让 AI 画表情/服饰/姿势（增加复杂度）
  "sly", "friendly", "happy", "spooky", "playful", "clever", "mighty", "gentle",
  "cute", "adorable", "tiny", "big", "great", "tall", "majestic", "fierce",
  "sweet", "silly", "sleepy", "fluffy", "soft", "warm", "cool", "fast", "slow",
  "busy", "charming", "powerful", "graceful", "mischievous",
  "fun", "funny", "cuddly", "chubby", "squishy", "sparkly", "shiny", "bright",
  "dark", "light", "pale", "deep", "vivid",

  // 环境/背景词 —— 触发 AI 画自然背景（森林、天空、海洋、建筑）
  // 注意：**保留可能出现在主体名里的词**（如 "sea" 在 "sea turtle" 中）
  "autumn", "winter", "spring", "summer",
  "jungle", "woods", "meadow", "tundra", "desert", "dune",
  "bamboo", "eucalyptus",
  "waves", "bubbles",
  "bats", "haunted", "mansion", "barn", "farm",
  "cushion", "honey", "pot", "basket", "carrot", "banana", "bananas", "nuts",

  // 具体背景场景词（肯定出现在主体描述里）
  "with", "nearby", "around", "background", "setting", "scene", "landscape",
  "surrounded", "surrounding", "near", "above", "below", "beside",

  // 身体部位/特征词 —— 让 AI 画额外细节（可能上色）
  "stripes", "spots", "pattern", "details", "detailed",
  "fur", "feathers", "whiskers", "tail", "ears", "trunk", "mane",
  "beak", "teeth", "claws", "wings", "shell", "fin", "flippers",
  "striped", "spotted", "patterned", "decorated",

  // 动作/姿势词 —— 让 AI 画复杂姿势（增加背景）
  "sitting", "standing", "jumping", "swimming", "flying", "walking", "running",
  "eating", "holding", "wearing", "wagging", "curled", "clinging", "roaring",
  "sleeping", "smiling", "playing", "chasing", "fighting", "dancing",
  "stretching", "perched", "nestling", "grazing", "galloping", "trotting",
];

export function getSanitizedPromptSubject(input: string): string {
  // 1. 先处理 slug 格式（如 "cute-fox-for-kids"）→ 拆成单词
  //    同时剥离停用词（a/an/the/with/in/on...）+ 清除标点
  let subject = input
    .replace(/for-(kids|toddlers|preschoolers|adults)/gi, "")
    .replace(/(cute|simple|detailed|easy|kawaii|intricate)-/gi, "")
    .replace(/\b(a|an|the|with|on|in|at|by|and|or|near|around|over|under|through)\b/gi, " ")
    .replace(/-/g, " ")
    .replace(/[,.;!?'"()]/g, " ")
    .trim();

  // 2. 正则剔除所有禁用词（大小写不敏感，完整单词匹配）
  const bannedRegex = new RegExp(`\\b(${BANNED_WORDS.join("|")})\\b`, "gi");
  subject = subject.replace(bannedRegex, "");

  // 3. 清理多余空格 → 取最后 2 个词（通常是核心名词）
  const words = subject
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(-2);

  subject = words.join(" ");

  // 4. 终极兜底
  if (!subject || subject.length < 2) {
    return "animal";
  }

  return subject;
}

const PROMPT_TEMPLATES: Record<Audience, string> = {
  adults:
    "detailed zentangle coloring page for adults, intricate line art of a {{SUBJECT}}, fine black contour outlines, complex mandala geometric patterns inside, hollow shapes, isolated on pure white background, no solid black fills, no background scenery, no buildings, no shading, no grayscale, printable coloring sheet",
  kids:
    "simple preschool coloring book page of a {{SUBJECT}}, bold clean outlines, hollow shapes, clip art, isolated on pure white background, no shading, no solid black, no background, uncolored sheet",
};

/**
 * Magic Prompt —— 用户实测 100% 稳定
 *
 * 极度克制 + 所有负面约束打满：
 *   - "coloring book page of a {{SUBJECT}}" —— 只说是什么，不说怎么画
 *   - "black line art outline" —— 明确是线稿而非插画
 *   - "isolated on stark pure white paper" —— 纯白底 + "stark" 强调
 *   - "no color, no fill, zero shading, no background scenery" —— 四道保险
 */
const MAGIC_PROMPT =
  "coloring book page of a {{SUBJECT}}, blank uncolored coloring sheet, black line art outline, isolated on stark pure white paper, no color, no fill, zero shading, no background scenery";

/** 构造 Pollinations 的完整 URL —— 用 Magic Prompt
 *
 * 无论调用方传什么 audience（kids / adults），现在**统一用 Magic Prompt**。
 * 原因：双轨 prompt（Zentangle vs Kids）在实测中反而不稳定 ——
 * Zentangle 模板有时让 AI 过度复杂化，Kids 模板有时让 AI 画卡通上色。
 * Magic Prompt 的"极度克制 + 纯负面约束"才是真正 100% 稳定的公式。
 *
 * @param params.prompt   —— 纯净主体词（如 "cat"、"superhero"、"fox"）
 * @param params.width    —— 默认 1024
 * @param params.height   —— 默认 1024
 * @param params.model    —— 强制 "flux"，忽略任何传入值
 * @param params.seed     —— 确定性种子（1 ~ 2^31-1）
 */
export function buildPollinationsUrl(params: {
  prompt: string;
  audience?: Audience; // 保留兼容，但现在不区分
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
}): string {
  const {
    prompt: rawPrompt,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    seed,
  } = params;

  // Step 1: 净化主体词（洗掉颜色词、环境词、拟人化形容词）
  const cleanSubject = getSanitizedPromptSubject(rawPrompt);

  // Step 2: 用 Magic Prompt —— 极度克制 + 所有负面约束
  const finalPrompt = MAGIC_PROMPT.replace(/\{\{SUBJECT\}\}/g, cleanSubject);
  const magicPrompt = encodeURIComponent(finalPrompt);

  // Step 3: 强制用 flux + seed 偏移 777777 防 CDN 缓存
  const finalSeed =
    seed !== undefined
      ? ((seed + SEED_CACHE_BUST_OFFSET) % 2_147_483_646) + 1
      : undefined;

  const usp = new URLSearchParams({
    width: String(width),
    height: String(height),
    model: POLLINATIONS_MODEL, // "flux"
    nologo: "true",
  });

  if (finalSeed !== undefined) {
    usp.set("seed", String(finalSeed));
  }

  return `${POLLINATIONS_BASE}/${magicPrompt}?${usp.toString()}`;
}

/** 保留兼容 —— 给需要手动构建完整 prompt 文本的场景 */
export function wrapLineartPrompt(rawPrompt: string): string {
  const cleanSubject = getSanitizedPromptSubject(rawPrompt);
  return MAGIC_PROMPT.replace(/\{\{SUBJECT\}\}/g, cleanSubject);
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
  // complexity: "adults" → Zentangle prompt，其余 → 粗线条 prompt
  const audience: Audience = req.complexity === "adults" ? "adults" : "kids";

  const targetUrl = buildPollinationsUrl({
    prompt: pureSubject,
    audience,
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
