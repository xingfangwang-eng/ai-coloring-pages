"use client";

import { useState } from "react";
import { Download, FileDown, RefreshCw, ZoomIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { GenerateApiSuccess } from "@/types";
import { exportToPdf } from "@/lib/pdf-utils";

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

  /** 下载 PNG —— 直接用浏览器原生 <a download> */
  const handleDownloadImage = () => {
    try {
      const a = document.createElement("a");
      a.href = result.imageUrl;
      a.download = `coloring-page-${result.seed}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed. Please try again.");
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

  const handleOpenNewTab = () => {
    window.open(result.imageUrl, "_blank", "noopener");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 预览图 —— overflow-hidden + scale(1.06) 物理裁切 Pollinations 右下角残留 Logo */}
      <div className="relative overflow-hidden rounded-xl border bg-white" style={{ aspectRatio: "1 / 1" }}>
        <img
          src={result.imageUrl}
          alt={`Coloring page - ${result.prompt}`}
          onClick={handleOpenNewTab}
          className="h-full w-full cursor-zoom-in"
          style={{
            objectFit: "cover",
            transform: "scale(1.06)",
            transformOrigin: "top center",
          }}
        />
      </div>

      {/* 操作按钮栏 */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownloadImage} className="gap-2">
          <Download className="h-4 w-4" />
          Download {ext.toUpperCase()} <span className="text-[10px] opacity-70">(2048×2048)</span>
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
        <Button variant="outline" onClick={handleOpenNewTab} className="gap-2">
          <ZoomIn className="h-4 w-4" />
          Zoom in
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
