"use client";

import { useState } from "react";
import { Download, FileDown, RefreshCw, ZoomIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { desaturateImageToDataUrl } from "@/lib/ai-generator";
import type { GenerateApiSuccess } from "@/types";

interface ResultPanelProps {
  result: GenerateApiSuccess;
  onRetry: () => void;
}

/** A4 纸张尺寸（mm）+ 边距 */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_MARGIN_MM = 10;

/**
 * 从 data URL 中提取 MIME 类型
 * 例如 "data:image/jpeg;base64,...." → "image/jpeg"
 */
function parseMimeType(dataUrl: string): string {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  return match?.[1] ?? "image/png";
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

/** MIME → jsPDF addImage 的 format 参数 */
function mimeToJspdfFormat(mime: string): "JPEG" | "PNG" | "WEBP" {
  if (mime === "image/jpeg") return "JPEG";
  if (mime === "image/webp") return "WEBP";
  return "PNG";
}

export function ResultPanel({ result, onRetry }: ResultPanelProps) {
  const [exporting, setExporting] = useState(false);
  const mimeType = parseMimeType(result.imageUrl);
  const ext = mimeToExt(mimeType);

  /** 下载图片：利用 data URL + 临时 <a download> */
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

  /** Export A4 PDF：动态 import jsPDF，图片居中保持比例 */
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const maxW = A4_WIDTH_MM - A4_MARGIN_MM * 2;
      const maxH = A4_HEIGHT_MM - A4_MARGIN_MM * 2;

      // Pollinations 默认 1024x1024 正方形，保持比例即可
      const drawW = maxW;
      const drawH = maxH;
      const x = (A4_WIDTH_MM - drawW) / 2;
      const y = (A4_HEIGHT_MM - drawH) / 2;

      // Canvas 强制脱色 —— 保证 PDF 里是纯净黑白线稿
      const cleanDataUrl = await desaturateImageToDataUrl(result.imageUrl);

      pdf.addImage(
        cleanDataUrl,
        "PNG",
        x,
        y,
        drawW,
        drawH
      );
      pdf.save(`coloring-page-${result.seed}-A4.pdf`);

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
      {/* 预览图 */}
      <div className="relative overflow-hidden rounded-xl border bg-muted/30">
        <img
          src={result.imageUrl}
          alt={`Coloring page - ${result.prompt}`}
          onClick={handleOpenNewTab}
          className="aspect-square w-full cursor-zoom-in object-contain"
          style={{ filter: "grayscale(100%) contrast(280%) brightness(108%)" }}
        />

        {/* 免费用户水印蒙层（45° 半透明重复） */}
        {result.watermarked && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='120'><text x='50%' y='50%' fill='%23000' fill-opacity='0.08' font-size='14' font-family='sans-serif' font-weight='600' text-anchor='middle' dominant-baseline='middle' transform='rotate(-25 120 60)'>AI COLOURING PAGES · FREE</text></svg>\")",
            }}
          />
        )}

        <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-mono text-muted-foreground backdrop-blur">
          seed: {result.seed} · 2048×2048 · {ext.toUpperCase()}
          {result.watermarked && " · Free plan"}
        </div>
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
