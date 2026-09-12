"use client";

/**
 * 首页实时生成器组件 —— Client Component
 *
 * 调用 /api/generate-live 端点，支持：
 *   - kids / adults 复杂度切换
 *   - 结果预览 + 双格式 PDF 导出 + PNG 下载
 *   - 加载动画
 */

import { useState, useRef } from "react";
import { Sparkles, Download, FileDown, FileText, Loader2, RefreshCw, Wand2 } from "lucide-react";

interface LiveResult {
  ok: true;
  imageUrl: string;
  prompt: string;
  seed: number;
  engine: string;
}

const EXAMPLE_PROMPTS = [
  "cute unicorn in a magical forest",
  "happy puppy with a frisbee",
  "T-Rex dinosaur wearing a hat",
  "princess and her dragon friend",
  "spaceship flying through stars",
  "tropical beach with palm trees",
];

export function LiveGenerator() {
  const [prompt, setPrompt] = useState("");
  const [complexity, setComplexity] = useState<"kids" | "adults">("kids");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LiveResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    // 取消上一次请求
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const resp = await fetch("/api/generate-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), complexity }),
        signal: ctrl.signal,
      });

      const data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleExample(p: string) {
    setPrompt(p);
  }

  /** 导出 PDF（US Letter / A4） */
  async function handleExportPdf(size: "us-letter" | "a4") {
    if (!result) return;
    const { default: jsPDF } = await import("jspdf");
    const PAPER = size === "us-letter"
      ? { w: 215.9, h: 279.4, fmt: [215.9, 279.4] as [number, number], name: "USLetter" }
      : { w: 210, h: 297, fmt: "a4" as const, name: "A4" };

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: PAPER.fmt });
    const MARGIN = 12;
    const drawW = PAPER.w - MARGIN * 2;
    const drawH = PAPER.h - MARGIN * 2;
    pdf.addImage(result.imageUrl, "PNG", MARGIN, MARGIN, drawW, drawH);
    pdf.save(`coloring-page-${result.seed}-${PAPER.name}.pdf`);
  }

  /** 下载 PNG */
  function handleDownloadPng() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.imageUrl;
    a.download = `coloring-page-${result.seed}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="rounded-2xl border bg-card/80 p-6 shadow-lg backdrop-blur sm:p-8">
      {/* Input area */}
      <div className="space-y-4">
        <label htmlFor="cg-prompt" className="block text-sm font-medium text-muted-foreground">
          Describe your coloring page in English
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="cg-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="e.g. cute unicorn in a magical forest"
            className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Coloring Page
              </>
            )}
          </button>
        </div>

        {/* Complexity toggle */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Style:</span>
          <div className="inline-flex rounded-full border p-0.5">
            <button
              onClick={() => setComplexity("kids")}
              className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                complexity === "kids"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🎨 For Kids
            </button>
            <button
              onClick={() => setComplexity("adults")}
              className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                complexity === "adults"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🖌️ For Adults
            </button>
          </div>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleExample(p)}
              className="rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              💡 {p}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="mt-6 flex flex-col items-center gap-4 py-12">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <Wand2 className="absolute inset-0 m-auto h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Drawing your coloring page… {complexity === "kids" ? "bold outlines" : "intricate details"}
          </p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-6 space-y-4">
          <div className="relative overflow-hidden rounded-xl border bg-white">
            <img
              src={result.imageUrl}
              alt={`Generated coloring page: ${result.prompt}`}
              className="aspect-square w-full object-contain"
            />
          </div>

          {/* Engine badge */}
          <div className="text-xs text-muted-foreground">
            Generated by{" "}
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
              {result.engine === "google-imagen" ? "Google Imagen ✨" : "Pollinations Flux"}
            </span>{" "}
            · seed: {result.seed}
          </div>

          {/* Download buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExportPdf("us-letter")}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition hover:bg-green-700"
            >
              <FileDown className="h-4 w-4" />
              🇺🇸 US Letter PDF
            </button>
            <button
              onClick={() => handleExportPdf("a4")}
              className="inline-flex h-10 items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-accent"
            >
              <FileText className="h-4 w-4" />
              📄 A4 PDF
            </button>
            <button
              onClick={handleDownloadPng}
              className="inline-flex h-10 items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-accent"
            >
              <Download className="h-4 w-4" />
              🖼️ High-Res PNG
            </button>
            <button
              onClick={handleGenerate}
              className="inline-flex h-10 items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-accent"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
