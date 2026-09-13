"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  Crown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GenerateForm } from "@/components/workspace/generate-form";
import { ResultPanel } from "@/components/workspace/result-panel";
import { HistoryGrid } from "@/components/workspace/history-grid";
import { PolishingLoader } from "@/components/workspace/polishing-loader";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { shortId } from "@/lib/utils";
import type {
  Complexity,
  GenerateApiError,
  GenerateApiSuccess,
  HistoryItem,
  UserQuota,
} from "@/types";

const HISTORY_KEY = "coloringpages:history:v1";
const HISTORY_MAX = 5;
const VIP_STORAGE_KEY = "coloringpages:vip:v1";

type VipStatus = {
  vip_status: "active" | "inactive";
  vip_type: "starter" | "lifetime" | "credits" | null;
  purchased_at: number | null;
};

const ANONYMOUS_QUOTA: UserQuota = {
  plan: "free",
  freeUsedToday: 0,
  freeRemaining: 3,
  creditsRemaining: 0,
  creditsTotal: 0,
  source: "anonymous",
};

export default function WorkspacePage() {
  // 受控状态
  const [prompt, setPrompt] = useState("");
  const [complexity, setComplexity] = useState<Complexity>("kids");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateApiSuccess | null>(null);
  const [quota, setQuota] = useState<UserQuota>(ANONYMOUS_QUOTA);
  const [mounted, setMounted] = useState(false);

  // VIP 状态（纯前端 localStorage）
  const [vip] = useState<VipStatus | null>(null);

  // 本地历史记录 —— 无登录架构下的唯一数据源
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(HISTORY_KEY, []);

  // mount 后才允许渲染真实数据 —— 彻底消除 hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  /** 本地推入历史 */
  const pushHistory = useCallback(
    async (item: HistoryItem) => {
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.seed !== item.seed);
        return [item, ...filtered].slice(0, HISTORY_MAX);
      });
    },
    [setHistory]
  );

  // =============== 生成逻辑 ===============
  const handleGenerate = useCallback(
    async (p: string, c: Complexity) => {
      setLoading(true);
      try {
        const resp = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p, complexity: c }),
        });

        const data = (await resp.json()) as
          | GenerateApiSuccess
          | GenerateApiError;

        if (!data.ok) {
          // 更新 quota（即使失败也可能返回最新快照）
          if (data.quota) setQuota(data.quota);

          if (data.reason === "quota_exhausted") {
            toast.error("Your free quota is exhausted. Upgrade or buy credits.", {
              action: {
                label: "View pricing",
                onClick: () => window.open("/pricing", "_blank"),
              },
            });
          } else {
            toast.error(data.error || "Generation failed");
          }
          return;
        }

        setResult(data);
        setQuota(data.quota);
        toast.success("Line art generated!");

        const item: HistoryItem = {
          id: shortId(),
          prompt: p,
          complexity: c,
          imageUrl: data.imageUrl,
          seed: data.seed,
          createdAt: Date.now(),
          source: "local",
          planTag: data.quota.plan,
          hasWatermark: false,
        };
        await pushHistory(item);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Request failed. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    },
    [pushHistory]
  );

  // =============== 历史操作 ===============
  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setPrompt(item.prompt);
    setComplexity(item.complexity);
    setResult({
      ok: true,
      prompt: item.prompt,
      imageUrl: item.imageUrl,
      enhancedPrompt: "",
      seed: item.seed,
      watermarked: item.hasWatermark ?? false,
      quota: {
        plan: item.planTag ?? "free",
        freeUsedToday: 0,
        freeRemaining: 3,
        creditsRemaining: 0,
        creditsTotal: 0,
        source: "anonymous",
      },
    });
    toast.info("Restored to studio. You can export or regenerate it now.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDeleteHistory = useCallback(
    async (id: string) => {
      setHistory((prev) => prev.filter((h) => h.id !== id));
    },
    [setHistory]
  );

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    toast.success("History cleared");
  }, [setHistory]);

  // =============== UI ===============
  return (
    <main className="flex-1">
      {/* mounted 守卫：SSR + 客户端首帧都渲染空 placeholder，彻底消除 hydration mismatch */}
      {!mounted ? (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="h-[280px] animate-pulse rounded-xl bg-muted lg:col-span-2" />
            <div className="h-[400px] animate-pulse rounded-xl bg-muted lg:col-span-3" />
          </div>
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* 工作台专属工具栏：状态徽章 */}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-base font-semibold">🎨 Studio</h1>
          <QuotaBadge quota={quota} vipActive={vip?.vip_status === "active"} vipType={vip?.vip_type} />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>🎨 Create new coloring page</CardTitle>
            </CardHeader>
            <CardContent>
              <GenerateForm
                prompt={prompt}
                complexity={complexity}
                onPromptChange={setPrompt}
                onComplexityChange={setComplexity}
                loading={loading}
                onGenerate={handleGenerate}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>🖼 Your coloring page</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <PolishingLoader prompt={prompt} />
              ) : result ? (
                <ResultPanel
                  result={result}
                  onRetry={() => handleGenerate(result.prompt, complexity)}
                />
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 历史记录区 */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">
            📚 History
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (Local only · browser storage)
            </span>
          </h2>
          <HistoryGrid
            items={history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearHistory}
          />
        </section>
      </div>
      )}
    </main>
  );
}

/** 顶部配额小徽章 */
function QuotaBadge({
  quota,
  vipActive,
  vipType,
}: {
  quota: UserQuota;
  vipActive?: boolean;
  vipType?: VipStatus["vip_type"] | null;
}) {
  // VIP 优先级最高 —— 覆盖一切服务端 quota
  if (vipActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-700 ring-1 ring-amber-500/30">
        <Crown className="size-3" />
        VIP · {vipType === "lifetime" ? "Lifetime" : vipType === "credits" ? "Credits" : "Starter"}
        <span className="text-amber-600">· Unlimited</span>
      </span>
    );
  }

  if (quota.plan === "pro") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-700">
        <Crown className="size-3" />
        Pro
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/60 px-2 py-0.5 text-[11px]">
      <Sparkles className="size-3 text-primary" />
      Free <span className="font-mono">{quota.freeRemaining}/3</span>
      {quota.creditsRemaining > 0 && (
        <>
          <span className="text-muted-foreground">·</span>
          <CreditCard className="size-3 text-primary" />
          <span className="font-mono">{quota.creditsRemaining}</span>
        </>
      )}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/20">
      <div className="max-w-sm px-6 text-center">
        <div className="mb-3 text-4xl">🎨</div>
        <p className="text-sm font-medium">No coloring pages yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Describe something on the left, click Generate, and AI will draw a black & white line art.
          You can then export the image or an A4-ready PDF.
        </p>
      </div>
    </div>
  );
}
