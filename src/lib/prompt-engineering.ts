import type { Complexity } from "@/types";

/**
 * 将用户简单提示词包装成专业着色页 AI Prompt。
 *
 * 终极原则：只用正向词！严禁任何否定式（no X / without X）！
 * 原因：Pollinations 底层的 Flux/Turbo 会把否定词里的名词权重拉高，
 *       "no gray" → gray 被激活 → 灰底大圆球
 */

/** 着色页强制通用的正向约束词（全部正向，无任何否定式） */
const UNIVERSAL_CONSTRAINTS = [
  "coloring book page",
  "clean black line art outline",
  "simple uncolored drawing",
  "white background",
  "vector style illustration",
  "high contrast",
  "clean sharp edges",
];

/** 儿童风格：粗线条、简单轮廓、卡通化 */
const KIDS_STYLE_TAGS = [
  "simple thick outlines",
  "cartoon style",
  "bold contour lines",
];

/** 成人风格：细致线稿、曼陀罗风 */
const ADULTS_STYLE_TAGS = [
  "intricate detailed line art",
  "fine precise outlines",
  "decorative patterns",
];

/** 根据复杂度生成风格标签数组 */
function getStyleTags(complexity: Complexity): string[] {
  return complexity === "kids" ? KIDS_STYLE_TAGS : ADULTS_STYLE_TAGS;
}

/** 清洗用户输入：去除多余空白、限制长度 */
function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ").slice(0, 200);
}

/**
 * 包装 prompt 的核心函数
 * @param userInput 用户原始描述
 * @param complexity 复杂度 kids | adults
 * @returns 完整的强化提示词（全正向，无否定词）
 */
export function buildColoringPrompt(
  userInput: string,
  complexity: Complexity
): string {
  const clean = sanitizeInput(userInput);
  if (!clean) {
    throw new Error("Prompt cannot be empty");
  }

  const styleTags = getStyleTags(complexity);
  const constraints = UNIVERSAL_CONSTRAINTS;

  // 前缀强制着色书身份 → 让 AI 优先输出线稿
  const prefix = "coloring book page, clean black line art outline, simple uncolored drawing, white background: ";

  // 用英文 + 逗号拼接（Pollinations 底层模型对英文 prompt 更友好）
  const parts = [prefix.trim(), clean, ...styleTags, ...constraints];
  return parts.join(", ");
}

/** 热门预设 tag —— 便于前端快速填入 */
export const POPULAR_TAGS = [
  "kitten sitting on a pumpkin",
  "dinosaur family portrait",
  "astronaut in space",
  "Santa delivering gifts",
  "underwater world",
  "deer in the forest",
  "princess and castle",
  "cute robot",
  "mandala pattern",
  "butterfly garden",
] as const;
