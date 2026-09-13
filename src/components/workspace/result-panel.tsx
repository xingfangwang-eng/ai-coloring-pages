"use client";

import { useState } from "react";
import { Download, FileDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { GenerateApiSuccess } from "@/types";
import { exportToPdf, getCleanCroppedImageData } from "@/lib/pdf-utils";

interface ResultPanelProps {
  result: GenerateApiSuccess;
  onRetry: () => void;
}

/** MIME → 文件扩展名 */
function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "png";
  }
}

/** 从 data URL 中提取 MIME 类型 */
function parseMimeType(dataUrl: string): string {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  return match?.[1] ?? "image/png";
}

export function ResultPanel({ result, onRetry }: ResultPanelProps) {
  const [exporting, setExporting] = useState(false);
  const mimeType = parseMimeType(result.imageUrl);
  const ext = mimeToExt(mimeType);

  /** 下载 PNG —— Canvas 物理去水印后下载，绝不跳转外部 URL */
  const handleDownloadImage = async () => {
    setExporting(true);
    try {
      // 1. Canvas 切掉底部 4.5% Pollinations 水印
      const { dataUrl } = await getCleanCroppedImageData(result.imageUrl);

      // 2. data URL → Blob → 虚拟 a 标签 → 触发下载
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = `coloring-page-${result.seed}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        URL.revokeObjectURL(url);
      }
      toast.success("Download started (no watermark ✨)");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setExporting(false);
    }
  };

  /** 导出 A4 PDF —— 统一委托 exportToPdf() */
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportToPdf(result.imageUrl, `coloring-page-${result.seed}-A4`, "a4");
      toast.success("A4 PDF exported ✨");
    } catch (err) {
      console.error("[ResultPanel] PDF export failed:", err);
      toast.error(
        err instanceof Error
          ? `PDF export failed: ${err.message}`
          : "PDF export failed"
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 预览图 —— overflow-hidden + scale(1.06) 物理裁切 Pollinations 右下角残留 Logo */}
      <div className="relative overflow-hidden rounded-xl border bg-white" style={{ aspectRatio: "1 / 1" }}>
        <img
          src={result.imageUrl}
          alt={`Coloring page - ${result.prompt}`}
          className="h-full w-full"
          style={{
            objectFit: "cover",
            transform: "scale(1.06)",
            transformOrigin: "top center",
          }}
        />
      </div>

      {/* 操作按钮栏 */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownloadImage} disabled={exporting} className="gap-2">
          <Download className="h-4 w-4" />
          {exporting ? "Downloading…" : `Download PNG`}
        </Button>
        <Button
          variant="secondary"
          onClick={handleExportPdf}
          disabled={exporting}
          className="gap-2"
        >
          {exporting ? (
            <>
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-secondary-foreground/40 border-t-secondary-foreground" />
              Generating PDF…
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Export A4 PDF <span className="text-[10px] opacity-70">(print-ready)</span>
            </>
          )}
        </Button>
        <Button variant="ghost" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>

      {/* 调试信息 */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer select-none">
          Show enhanced prompt (debug)
        </summary>
        <p className="mt-2 rounded-md bg-muted/50 p-3 font-mono leading-relaxed">
          {result.enhancedPrompt || "(none)"}
        </p>
      </details>
    </div>
  );
}
