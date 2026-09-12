/**
 * POST /api/generate-live —— 首页实时生成（无鉴权、无配额）
 *
 * 面向北美 C 端用户的免费生成接口：
 *   - 无需登录、无次数限制、返回纯 JSON
 *   - 自动双引擎：Google AI Studio Imagen → 降级 Pollinations Flux
 *   - 目的就是 "100% 可靠返回图片 URL"
 *
 * 请求体：
 *   { prompt: string, complexity?: "kids" | "adults" }
 *
 * 响应：
 *   { ok: true, imageUrl, prompt, enhancedPrompt, seed, engine }
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchColoringImage } from "@/lib/ai-generator";
import type { GenerationRequest, Complexity } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Body must be object" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const prompt = typeof b.prompt === "string" ? b.prompt.trim() : "";
  const complexity: Complexity =
    b.complexity === "adults" ? "adults" : "kids";

  if (!prompt) {
    return NextResponse.json({ ok: false, error: "prompt is required" }, { status: 400 });
  }

  // 限制 prompt 长度，防止滥用
  if (prompt.length > 300) {
    return NextResponse.json(
      { ok: false, error: "prompt too long (max 300 chars)" },
      { status: 400 }
    );
  }

  const reqBody: GenerationRequest = {
    prompt,
    complexity,
    width: 2048,
    height: 2048,
  };

  try {
    const result = await fetchColoringImage(reqBody);

    return NextResponse.json({
      ok: true,
      prompt: result.prompt,
      imageUrl: result.imageUrl,
      enhancedPrompt: result.enhancedPrompt,
      seed: result.seed,
      engine: result.engine,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/generate-live] Failed:", msg);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 502 }
    );
  }
}
