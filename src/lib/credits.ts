import { createClient } from "@supabase/supabase-js";
import type { PlanTier, UserQuota } from "@/types";

/**
 * 服务端配额系统
 *
 * 两种模式：
 *   1) 没配 Supabase → 所有请求都当 free 用户（前端自己管限额）
 *   2) 配了 Supabase → RPC consume_generation / profiles 表
 *
 * MVP 限额：免费 3 次/日，Pro 无限制，积分用户每次 -1
 */

const DEFAULT_FREE_PER_DAY = 3;

let _serverClient: ReturnType<typeof createClient> | null = null;

function getServerClient() {
  if (_serverClient) return _serverClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon) return null;

  _serverClient = createClient(url, serviceKey ?? anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _serverClient;
}

export function quotaBackendAvailable(): boolean {
  return Boolean(getServerClient());
}

interface ProfileRow {
  id: string;
  plan: PlanTier;
  daily_free_used: number;
  daily_free_date: string;
  credits: number;
  credits_used: number;
}

interface ConsumeRpcResult {
  allowed: boolean;
  plan: PlanTier;
  reason?: string;
  free_remaining: number;
  credits_remaining: number;
  credits_total: number;
}

function anonymousQuota(): UserQuota {
  return {
    plan: "free",
    freeUsedToday: 0,
    freeRemaining: DEFAULT_FREE_PER_DAY,
    creditsRemaining: 0,
    creditsTotal: 0,
    source: "anonymous",
  };
}

/** 获取用户当前配额状态（只读） */
export async function getQuotaState(
  userId: string | undefined
): Promise<UserQuota> {
  const sb = getServerClient();
  if (!sb || !userId) return anonymousQuota();

  try {
    const { data, error } = await sb
      .from("profiles")
      .select("plan, daily_free_used, daily_free_date, credits, credits_used")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return anonymousQuota();

    const row = data as unknown as ProfileRow;
    const today = new Date().toISOString().slice(0, 10);
    const used = row.daily_free_date === today ? row.daily_free_used : 0;

    return {
      plan: row.plan,
      freeUsedToday: used,
      freeRemaining: Math.max(0, DEFAULT_FREE_PER_DAY - used),
      creditsRemaining: row.credits,
      creditsTotal: row.credits + row.credits_used,
      source: "supabase",
    };
  } catch {
    return anonymousQuota();
  }
}

/** 扣减一次生成额度 —— 服务端权威决策 */
export async function consumeQuota(
  userId: string | undefined
): Promise<{
  allowed: boolean;
  quota: UserQuota;
  reason?: string;
  shouldWatermark: boolean;
}> {
  const sb = getServerClient();

  // 没 Supabase / 没登录 → 允许生成，水印开启
  if (!sb || !userId) {
    const q = anonymousQuota();
    return { allowed: true, quota: q, shouldWatermark: true };
  }

  // 调 consume_generation RPC
  try {
    const { data, error } = await sb.rpc("consume_generation", {
      p_uid: userId,
    } as never);

    if (error || !data) {
      const q = await getQuotaState(userId);
      return {
        allowed: false,
        quota: q,
        reason: "server_error",
        shouldWatermark: q.plan === "free",
      };
    }

    const row = data as unknown as ConsumeRpcResult;

    // 拿一下最新 daily_free_used 给 quota 快照
    const profileResp = await sb
      .from("profiles")
      .select("daily_free_used, plan")
      .eq("id", userId)
      .maybeSingle();

    const profile = (profileResp.data ?? {}) as unknown as Partial<ProfileRow>;

    const q: UserQuota = {
      plan: row.plan,
      freeUsedToday:
        typeof profile.daily_free_used === "number"
          ? profile.daily_free_used
          : 0,
      freeRemaining: row.free_remaining,
      creditsRemaining: row.credits_remaining,
      creditsTotal: row.credits_total,
      source: "supabase",
    };

    return {
      allowed: row.allowed,
      quota: q,
      reason: row.reason || undefined,
      shouldWatermark: row.plan === "free",
    };
  } catch (err) {
    console.warn("[credits] consumeQuota exception:", err);
    const q = await getQuotaState(userId);
    return {
      allowed: false,
      quota: q,
      reason: "server_error",
      shouldWatermark: q.plan === "free",
    };
  }
}
