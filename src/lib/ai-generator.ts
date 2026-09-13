/**
 * AI 图片生成服务 —— Pollinations.ai (Flux)
 *
 * 单一引擎：Pollinations.ai model=flux
 *   - 完全免费、无限量、无 Key
 *   - Flux 比 Turbo 线条更锐利清晰
 *   - 支持确定性 seed → 同一 seed + prompt = 同一张图
 *
 * Magic Prompt —— 极简正向版（实测最稳定，避免白熊效应）
 *   "coloring book page of a {{SUBJECT}}, simple black outline,
 *    line art, stark white paper background"
 *
 *   教训：之前加入 "no moon, no night sky" 等负向词触发白熊效应，
 *   AI 反而画出满月和黑夜背景。新策略：只说"要什么"，不说"不要什么"。
 *
 *   节日强场景词中性化映射：
 *     halloween-pumpkin → carved pumpkin
 *     halloween-ghost → cartoon ghost
 *     christmas-santa → santa claus character
 *     ...避开 halloween/night 的夜景联想链
 *
 * 防 CDN 缓存策略：
 *   seed 强制 + SEED_CACHE_BUST_OFFSET 偏移量（当前 123456）
 *   每次改 MAGIC_PROMPT 必须同步改偏移量！
 */

import type { GenerationRequest, GenerationResult } from "@/types";
import { SUBJECTS } from "@/lib/us-coloring-data";

/**
 * SUBJECT_SLUGS —— 白名单：所有在 SUBJECTS 里定义的主体 slug
 *
 * getSanitizedPromptSubject() 用它做白名单匹配 —— 比黑名单靠谱得多：
 *   黑名单永远有遗漏（"bushy"、"rock"、"grin" 没在黑名单里）
 *   白名单只接受肯定是主体名的词（SUBJECTS 里的 slug）
 *
 * 复合 slug 会被拆成空格形式匹配（"sea-turtle" → "sea turtle"）
 */
const SUBJECT_SLUGS: string[] = SUBJECTS.map((s) => s.slug.replace(/-/g, " "));

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

/** Default image dimensions — 1024x1024 */
export const DEFAULT_WIDTH = 1024;
export const DEFAULT_HEIGHT = 1024;

/** 强制使用 flux —— 线条比 turbo 更锐利清晰 */
const POLLINATIONS_MODEL = "flux";

/** seed 强制偏移量 —— 砸烂 Pollinations 历史 CDN 缓存
 * 每次改 MAGIC_PROMPT 必须同步改这个偏移量！
 * 当前：123456 —— 砸烂满月/黑夜缓存（之前的 Halloween 月亮是白熊效应反噬） */
const SEED_CACHE_BUST_OFFSET = 123_456;

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
  // Step 0: 如果输入本身就是 slug 格式（如 "cute-fox-for-kids"），
  // 先拆 slug → 此时已经是干净的 "fox" 了，直接返回
  if (/^[a-z]+-[a-z]+(-[a-z]+)*$/i.test(input)) {
    let slugOnly = input
      .replace(/^(cute|simple|detailed|easy|kawaii|intricate)-/i, "")
      .replace(
        /-(for-(kids|toddlers|preschoolers|adults))$/i,
        ""
      );

    // 🔥 节日强场景词中性化映射 —— 避开触发夜景/氛围的大词
    // halloween → night/moon/spooky 联想链极强，christmas-reindeer 自带 "snowy night sky"
    const FESTIVE_NEUTRAL_MAP: Record<string, string> = {
      "halloween-pumpkin": "carved pumpkin",      // 雕刻南瓜灯（去掉 halloween 的 night 联想）
      "halloween-ghost": "cartoon ghost",          // 卡通幽灵（去掉 spooky/haunted）
      "halloween-witch": "witch character",         // 单体女巫形象（去掉 cauldron/broom 场景）
      "christmas-santa": "santa claus character",   // 单体圣诞老人（去掉 sleigh/reindeer/tree）
      "christmas-reindeer": "reindeer character",   // 单体驯鹿（去掉 snowy night sky）
      "christmas-tree": "decorated tree",           // 装饰树（去掉 christmas 的场景联想）
      "thanksgiving-turkey": "cartoon turkey",      // 卡通火鸡（去掉 fall leaves/pilgrim）
    };
    if (FESTIVE_NEUTRAL_MAP[slugOnly]) {
      return FESTIVE_NEUTRAL_MAP[slugOnly];
    }

    slugOnly = slugOnly.replace(/-/g, " ");
    if (slugOnly && slugOnly.length >= 2) return slugOnly;
    return "animal";
  }

  // Step 1: 完整句子 —— 先剥离停用词 + 标点
  let subject = input
    .replace(/for-(kids|toddlers|preschoolers|adults)/gi, "")
    .replace(/(cute|simple|detailed|easy|kawaii|intricate)-/gi, "")
    .replace(/\b(a|an|the|with|on|in|at|by|and|or|near|around|over|under|through|its|it|from|to|of|is|was|are|were|be|been|being|has|have|had|do|does|did|will|would|can|could|should|may|might|must|shall)\b/gi, " ")
    .replace(/[,.;!?'"()]/g, " ")
    .trim();

  // Step 2: 正则剔除所有禁用词（大小写不敏感，完整单词匹配）
  const bannedRegex = new RegExp(`\\b(${BANNED_WORDS.join("|")})\\b`, "gi");
  subject = subject.replace(bannedRegex, "");

  // Step 3: 清理多余空格 → 尝试找出"看起来像主体"的词
  // 主体通常是：名词（不是形容词/动词/副词）
  const words = subject.split(/\s+/).filter((w) => w.length >= 2);

  if (words.length === 0) return "animal";
  if (words.length === 1) return words[0];

  // 启发式：第一个词（通常是冠词 a/an/the 去掉后）或组合最后两个词
  // 但更靠谱的是——找白名单 SUBJECT_SLUGS 里的匹配
  const lowerWords = words.map((w) => w.toLowerCase());
  const lowerSubject = lowerWords.join(" ");

  // 白名单匹配（按 SUBJECTS 里的 slug 精确匹配）
  for (const slug of SUBJECT_SLUGS) {
    if (lowerSubject.includes(slug)) {
      // 如果找到了精确 slug，直接返回（复合 slug 如 "sea turtle" 也匹配）
      if (slug.includes(" ")) return slug;
      // 单 word slug 也可以匹配任意 word
      for (const w of lowerWords) {
        if (w === slug) return slug;
      }
    }
  }

  // 兜底：取最短的 noun-like 词（通常主体比形容词短）
  // 或组合前 1-2 个词
  const sortedByLen = [...lowerWords].sort((a, b) => a.length - b.length);
  return sortedByLen[0]; // 最短的词通常是核心名词
}

const PROMPT_TEMPLATES: Record<Audience, string> = {
  adults:
    "detailed zentangle coloring page for adults, intricate line art of a {{SUBJECT}}, fine black contour outlines, complex mandala geometric patterns inside, hollow shapes, isolated on pure white background, no solid black fills, no background scenery, no buildings, no shading, no grayscale, printable coloring sheet",
  kids:
    "simple preschool coloring book page of a {{SUBJECT}}, bold clean outlines, hollow shapes, clip art, isolated on pure white background, no shading, no solid black, no background, uncolored sheet",
};

/**
 * Magic Prompt —— 极简版（彻底删除白熊效应否定词）
 *
 * 实测教训："no moon, no circle, no night sky" 等带具体物体的否定词会触发白熊效应，
 * AI 反而在画面中画出满月、黑夜等元素！
 *
 * 新策略：只说"要什么"（纯线稿 + 纯白背景），不说"不要什么"。
 * 用正向描述锚定：simple black outline / line art / stark white paper background
 * 让 AI 自然生成纯净线稿，避免负面词反噬。
 *
 * 每改一次 Magic Prompt 必须同步改 SEED_CACHE_BUST_OFFSET！
 */
const MAGIC_PROMPT =
  "coloring book page of a {{SUBJECT}}, simple black outline, line art, stark white paper background";

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
