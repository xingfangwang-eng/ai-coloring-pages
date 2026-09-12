import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 客户端 —— 浏览器侧
 *
 * 如果环境变量没配好，getSupabaseClient() 返回 null，
 * 所有上游调用必须判空（cloud-history.ts 已统一兜底）。
 *
 * 为什么用 singleton？避免每次渲染重建 WebSocket 连接。
 */

let _browserClient: SupabaseClient | null = null;

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anon };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anon } = getSupabaseEnv();
  if (!url || !anon) return null;

  if (!_browserClient) {
    _browserClient = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _browserClient;
}

/** 云端同步是否可用（环境变量完整） */
export function isCloudSyncConfigured(): boolean {
  const { url, anon } = getSupabaseEnv();
  return Boolean(url && anon);
}
