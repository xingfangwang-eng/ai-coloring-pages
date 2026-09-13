"use client";

import { useState } from "react";
import { Download, FileDown, RefreshCw, ZoomIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { GenerateApiSuccess } from "@/types";
import {
  getCleanCroppedImageData,
  computePdfPlacement,
  paperSizeObj,
  PAPER_MM,
  DEFAULT_MARGIN_MM,
} from "@/lib/pdf-utils";

interface ResultPanelProps {
  result: GenerateApiSuccess;
  onRetry: () => void;
}

/**
 * 图片加载完成后返回 naturalWidth/naturalHeight
 * 用于等比缩放计算（Canvas 裁切后高度会变，必须动态读取）
 */
function getImageNaturalSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1024, h: 978 }); // fallback
    img.src = src;
  });
}

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

  /** 导出 A4 PDF：先去水印 → 再等比缩放居中 */
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      // 1. Canvas 物理切掉底部 4.5% 水印
      const cleanDataUrl = await getCleanCroppedImageData(result.imageUrl);

      // 2. 读取裁切后图片的真实尺寸（不再是 1024×1024 正方形了）
      const cleanSize = await getImageNaturalSize(cleanDataUrl);

      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: PAPER_MM.a4, // [w, h] 数组 —— jsPDF 原生支持
      });

      // 3. 等比缩放 + 居中（fix: 正方形不再被撑成长方形）
      const { drawW, drawH, x, y } = computePdfPlacement(
        paperSizeObj(PAPER_MM.a4), // { w, h } 形式
        DEFAULT_MARGIN_MM,
        cleanSize
      );

      // 4. 写入干净的 PNG（Canvas 输出一定是 PNG）
      pdf.addImage(cleanDataUrl, "PNG", x, y, drawW, drawH);
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
