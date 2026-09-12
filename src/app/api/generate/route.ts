import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchColoringImage } from "@/lib/ai-generator";
import { consumeQuota, getQuotaState } from "@/lib/credits";
import type {
  Complexity,
  GenerateApiResponse,
  GenerationRequest,
} from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate —— 带配额检查
 *
 * 流程：
 *   1. 解析 body → 校验字段
 *   2. auth() 取当前登录用户（可选，未登录也能生成但配额靠前端）
 *   3. consumeQuota 扣减一次额度 → 不够返回 403 + quota 快照
 *   4. fetchColoringImage 调 Pollinations 拿图
 *   5. 返回带 quota + watermarked 标记的响应
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<GenerateApiResponse>> {
  // ---- 1. body 解析 ----
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Body must be an object" },
      { status: 400 }
    );
  }
  const b = body as Record<string, unknown>;
  const prompt = typeof b.prompt === "string" ? b.prompt.trim() : "";
  const complexity = b.complexity as Complexity | undefined;
  const width = typeof b.width === "number" ? b.width : undefined;
  const height = typeof b.height === "number" ? b.height : undefined;
  const model = typeof b.model === "string" ? (b.model as "flux") : undefined;
  const seed = typeof b.seed === "number" ? b.seed : undefined;

  if (!prompt) {
    return NextResponse.json(
      { ok: false, error: "prompt is required" },
      { status: 400 }
    );
  }
  if (complexity !== "kids" && complexity !== "adults") {
    return NextResponse.json(
      { ok: false, error: 'complexity must be "kids" or "adults"' },
      { status: 400 }
    );
  }

  // ---- 2. 获取 userId ----
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id;
  } catch {
    userId = undefined;
  }

  // ---- 3. 配额检查 ----
  const quotaResult = await consumeQuota(userId);
  if (!quotaResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          quotaResult.reason === "quota_exhausted"
            ? "Free quota exhausted. Upgrade or buy credits."
            : "Quota check failed. Please try again.",
        reason: quotaResult.reason,
        quota: quotaResult.quota,
      },
      { status: quotaResult.reason === "quota_exhausted" ? 403 : 502 }
    );
  }

  // ---- 4. 调 AI ----
  const reqBody: GenerationRequest = {
    prompt,
    complexity,
    width,
    height,
    model,
    seed,
  };

  try {
    const result = await fetchColoringImage(reqBody);

    return NextResponse.json({
      ok: true,
      prompt: result.prompt,
      imageUrl: result.imageUrl,
      enhancedPrompt: result.enhancedPrompt,
      seed: result.seed,
      watermarked: quotaResult.shouldWatermark,
      quota: quotaResult.quota,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/generate] AI failed:", msg);

    // 失败时 quota 已经被 consumeQuota 扣过了，
    // 但 SQL 函数是在 1 次调用里就扣了… 实际线上需要事务回滚。
    // MVP 阶段：这里简单给个 quota 快照，让前端知道状态。
    const quota = userId ? await getQuotaState(userId) : quotaResult.quota;

    return NextResponse.json(
      {
        ok: false,
        error: msg,
        quota,
      },
      { status: 502 }
    );
  }
}

/**
 * GET /api/generate —— 便捷入口，同样带配额
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<GenerateApiResponse>> {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt") ?? "";
  const complexity = searchParams.get("complexity") as Complexity | null;
  const seedStr = searchParams.get("seed");
  const widthStr = searchParams.get("width");
  const heightStr = searchParams.get("height");

  if (!prompt || !complexity) {
    return NextResponse.json(
      { ok: false, error: "prompt + complexity required" },
      { status: 400 }
    );
  }

  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id;
  } catch {
    userId = undefined;
  }

  const quotaResult = await consumeQuota(userId);
  if (!quotaResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Quota exhausted",
        reason: quotaResult.reason,
        quota: quotaResult.quota,
      },
      { status: 403 }
    );
  }

  try {
    const result = await fetchColoringImage({
      prompt,
      complexity,
      seed: seedStr ? Number(seedStr) : undefined,
      width: widthStr ? Number(widthStr) : undefined,
      height: heightStr ? Number(heightStr) : undefined,
    });

    return NextResponse.json({
      ok: true,
      prompt: result.prompt,
      imageUrl: result.imageUrl,
      enhancedPrompt: result.enhancedPrompt,
      seed: result.seed,
      watermarked: quotaResult.shouldWatermark,
      quota: quotaResult.quota,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const quota = userId ? await getQuotaState(userId) : quotaResult.quota;
    return NextResponse.json({ ok: false, error: msg, quota }, { status: 502 });
  }
}
