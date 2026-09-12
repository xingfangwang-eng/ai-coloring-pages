import { getSupabaseClient, isCloudSyncConfigured } from "./supabase-client";
import type { Complexity, HistoryItem } from "@/types";

/** Supabase coloring_pages 表的行结构 */
interface ColoringPageRow {
  id: string;
  user_id: string;
  prompt: string;
  complexity: Complexity;
  image_data: string; // data URL
  seed: number;
  created_at: string; // ISO timestamp
}

/** 是否开启了云端同步（启动时检查一次） */
export function cloudSyncAvailable(): boolean {
  return isCloudSyncConfigured();
}

/** 把 Supabase row 转成前端统一的 HistoryItem */
function rowToHistory(row: ColoringPageRow): HistoryItem {
  return {
    id: row.id,
    prompt: row.prompt,
    complexity: row.complexity,
    imageUrl: row.image_data,
    seed: row.seed,
    createdAt: new Date(row.created_at).getTime(),
    source: "cloud",
  };
}

/**
 * 列出当前用户的云端历史（按 created_at desc，最多 50 条）
 * 未配置 Supabase → 返回空数组（不报错）
 */
export async function listCloudHistory(
  supabaseUserId: string
): Promise<HistoryItem[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from("coloring_pages")
    .select("*")
    .eq("user_id", supabaseUserId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("[cloud-history] list failed:", error.message);
    return [];
  }

  return (data as ColoringPageRow[]).map(rowToHistory);
}

/**
 * 保存一条着色页到云端
 * @returns 成功返回 true；未配置 / 失败返回 false（静默）
 */
export async function saveCloudHistory(
  supabaseUserId: string,
  item: {
    prompt: string;
    complexity: Complexity;
    imageData: string;
    seed: number;
  }
): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  const { error } = await sb.from("coloring_pages").insert({
    user_id: supabaseUserId,
    prompt: item.prompt,
    complexity: item.complexity,
    image_data: item.imageData,
    seed: item.seed,
  });

  if (error) {
    // seed 唯一冲突说明已存在，不算错误
    if (error.code === "23505") return true;
    console.warn("[cloud-history] save failed:", error.message);
    return false;
  }
  return true;
}

/** 删除一条云端记录 */
export async function deleteCloudHistory(id: string): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  const { error } = await sb.from("coloring_pages").delete().eq("id", id);
  if (error) {
    console.warn("[cloud-history] delete failed:", error.message);
    return false;
  }
  return true;
}
