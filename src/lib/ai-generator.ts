/**
 * AI 图片生成服务 —— Pollinations.ai (Turbo)
 *
 * 单一引擎：Pollinations.ai model=turbo
 *   - 完全免费、无限量、无 Key
 *   - 支持确定性 seed → 同一 seed + prompt = 同一张图
 *   - 用于：①Studio 工作台实时生成；②pSEO 页面静态产出；③首页实时生成
 *
 * Prompt 双轨制（用户实测验证 100% 稳定）：
 *   - for-adults → 精细 Zentangle / Mandala 线稿（纯白底、空心几何花纹）
 *   - for-kids/toddlers/preschoolers → 粗线条卡通简笔（大块镂空、纯白底）
 *
 * Prompt 绝对约束：
 *   - 主体必须 Isolated（孤立在纯白背景上）
 *   - 所有内部区域必须 Hollow（空心白底，留给用户填色）
 *   - 严禁任何背景建筑/天空/城市/灰度阴影/实心黑块
 *   - 严禁否定词（no X / without X）—— 会反向激活权重
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
 * sanitizeSubject —— 关键词"去色净化"安全网
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
 *   1. bannedWords 黑名单正则 —— 颜色词、环境词、拟人化形容词
 *   2. 兜底 —— 如果净化后为空（全是禁用词），返回 "animal"
 *
 * 同时支持 slug 输入（如 "cute-fox-for-kids"）—— 会先拆 slug 再净化。
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
  "spots", "striped", "spotted", "patterned", "decorated",

  // 动作/姿势词 —— 让 AI 画复杂姿势（增加背景）
  "sitting", "standing", "jumping", "swimming", "flying", "walking", "running",
  "eating", "holding", "wearing", "wagging", "curled", "clinging", "roaring",
  "sleeping", "smiling", "playing", "chasing", "fighting", "dancing",
  "stretching", "perched", "nestling", "grazing", "galloping", "trotting",
];

function sanitizeSubject(input: string): string {
  // 1. 先处理 slug 格式（如 "cute-fox-for-kids"）→ 拆成单词
  //    同时剥离停用词（a/an/the/with/in/on...）
  let subject = input
    .replace(/for-(kids|toddlers|preschoolers|adults)/gi, "")
    .replace(/(cute|simple|detailed|easy|kawaii|intricate)-/gi, "")
    .replace(/\b(a|an|the|with|on|in|at|by|and|or|near|around|over|under|through)\b/gi, " ")
    .replace(/-/g, " ")
    .replace(/[,.;!?'"()]/g, " ") // 清除标点！
    .trim();

  // 2. 正则剔除所有禁用词（大小写不敏感，完整单词匹配）
  const bannedRegex = new RegExp(`\\b(${BANNED_WORDS.join("|")})\\b`, "gi");
  subject = subject.replace(bannedRegex, "");

  // 3. 清理多余空格 → 取最后 2 个词（通常是核心名词）
  const words = subject
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(-2); // 最多保留 2 个核心名词（如 "sea turtle"、"rock hopper"）

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

/** 构造 Pollinations 的完整 URL
 *
 * @param params.prompt   —— 纯净主体词（如 "cat"、"superhero"）
 * @param params.audience —— "kids" (默认) | "adults"，决定用哪个 prompt 模板
 * @param params.width    —— 默认 1024
 * @param params.height   —— 默认 1024
 * @param params.model    —— 强制 "turbo"，忽略任何传入值
 * @param params.seed     —— 确定性种子（1 ~ 2^31-1）
 */
export function buildPollinationsUrl(params: {
  prompt: string;
  audience?: Audience;
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
}): string {
  const {
    prompt: rawPrompt,
    audience = "kids",
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    seed,
  } = params;

  // 先净化 —— 洗掉颜色词、环境词、拟人化形容词，只留核心名词
  const pureSubject = sanitizeSubject(rawPrompt);

  // 按 audience 选模板 → 套纯净主体词 → 编码
  const finalPrompt = PROMPT_TEMPLATES[audience].replace(
    /\{\{SUBJECT\}\}/g,
    pureSubject
  );
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
export function wrapLineartPrompt(rawPrompt: string, audience: Audience = "kids"): string {
  return PROMPT_TEMPLATES[audience].replace(/\{\{SUBJECT\}\}/g, rawPrompt);
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

  const enhancedPrompt = wrapLineartPrompt(pureSubject, audience);

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
