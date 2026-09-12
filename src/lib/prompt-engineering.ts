import type { Complexity } from "@/types";

/**
 * 将用户简单提示词（"小猫坐在南瓜上"）包装成专业着色页 AI Prompt。
 * 目的：强制 AI 只输出黑白线稿，纯白背景，无阴影无渐变。
 */

/** 儿童风格：粗线条、简单轮廓、卡通化 */
const KIDS_STYLE_TAGS = [
  "coloring page for kids",
  "simple bold line art",
  "thick outlines",
  "cartoon style",
  "cute and friendly",
];

/** 成人风格：细致线稿、曼陀罗风、复杂花纹 */
const ADULTS_STYLE_TAGS = [
  "coloring page for adults",
  "intricate detailed line art",
  "mandala-inspired patterns",
  "fine precise outlines",
  "beautiful ornate details",
];

/** 所有着色页强制通用的负面/约束词 */
const UNIVERSAL_CONSTRAINTS = [
  "black and white only",
  "pure white background",
  "no shading",
  "no gradients",
  "no color",
  "no texture",
  "vector style illustration",
  "high contrast",
  "clean sharp edges",
  "no shadows",
  "no highlights",
  "no 3D rendering",
  "no photorealism",
  // === 防 AI 幻觉生成文字/签名 ===
  "no watermark",
  "no text",
  "no signature",
  "no logo",
  "pure white borders",
];

/**
 * 根据复杂度生成风格标签数组
 */
function getStyleTags(complexity: Complexity): string[] {
  return complexity === "kids" ? KIDS_STYLE_TAGS : ADULTS_STYLE_TAGS;
}

/**
 * 清洗用户输入：去除多余空白、限制长度
 */
function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ").slice(0, 200);
}

/**
 * 包装 prompt 的核心函数
 * @param userInput 用户原始描述
 * @param complexity 复杂度 kids | adults
 * @returns 完整的强化提示词
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

  // 用英文 + 逗号拼接（Pollinations 底层模型对英文 prompt 更友好）
  const parts = [...styleTags, clean, ...constraints];
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
