/**
 * 着色页生成相关的类型定义
 */

/** 复杂度/风格选择 */
export type Complexity = "kids" | "adults";

/** AI 模型选择（当前 Pollinations 默认 flux） */
export type AIModel = "flux" | "flux-realism" | "turbo";

/** 会员等级 */
export type PlanTier = "free" | "pro";

/** 用户配额快照 */
export interface UserQuota {
  plan: PlanTier;
  /** 今日已用免费次数 */
  freeUsedToday: number;
  /** 今日剩余免费次数 */
  freeRemaining: number;
  /** 积分余额 */
  creditsRemaining: number;
  /** 累计获得积分（消耗 + 余额） */
  creditsTotal: number;
  /** 配额数据来源（anonymous = 未配置 / 未登录，supabase = 权威） */
  source: "anonymous" | "supabase";
}

/** 生成请求参数 */
export interface GenerationRequest {
  prompt: string;
  complexity: Complexity;
  width?: number;
  height?: number;
  model?: AIModel;
  seed?: number;
  /** 图片转线条模式：如果提供了 base64 图片，走 img2img */
  imageDataUrl?: string;
}

/** 生成成功的结果 */
export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  enhancedPrompt: string;
  seed: number;
  createdAt: number;
}

/** 历史记录条目 */
export interface HistoryItem {
  id: string;
  prompt: string;
  complexity: Complexity;
  imageUrl: string;
  thumbnailUrl?: string;
  seed: number;
  createdAt: number;
  source: "local" | "cloud";
  planTag?: PlanTier;
  hasWatermark?: boolean;
}

/** /api/generate 成功响应（带 quota 快照） */
export interface GenerateApiSuccess {
  ok: true;
  prompt: string;
  imageUrl: string;
  enhancedPrompt: string;
  seed: number;
  /** 本次是否加了水印（free 用户会） */
  watermarked: boolean;
  /** 当前配额快照 —— 前端用来刷新剩余次数显示 */
  quota: UserQuota;
}

/** /api/generate 失败响应 */
export interface GenerateApiError {
  ok: false;
  error: string;
  /** 可选：如果是配额耗尽，带 quota 快照方便前端显示升级引导 */
  quota?: UserQuota;
  /** 可选：quota_exhausted / server_error / ... */
  reason?: string;
}

export type GenerateApiResponse = GenerateApiSuccess | GenerateApiError;
