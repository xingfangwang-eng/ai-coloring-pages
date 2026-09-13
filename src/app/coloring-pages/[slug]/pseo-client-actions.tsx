"use client";

/**
 * PSEO 页客户端操作组件 —— 双格式 PDF 导出 + PNG 下载
 *
 * 支持：
 *   - 🇺🇸 US Letter (8.5 × 11 in / 216 × 279 mm)
 *   - 📄 A4 (210 × 297 mm)
 *   - 🖼️ High-Res PNG
 */

import { useState } from "react";
import { Download, FileDown, FileText, Loader2 } from "lucide-react";
import {
  getCleanCroppedImageData,
  computePdfPlacement,
  paperSizeObj,
  PAPER_MM,
  DEFAULT_MARGIN_MM,
} from "@/lib/pdf-utils";

interface Props {
  imageUrl: string;
  displayTitle: string;
  seed: number;
}

type PaperSize = "us-letter" | "a4";

/** 浏览器安全的 Blob → data URL 转换（避免 Node.js Buffer） */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** 纸张尺寸映射（mm） */
const PAPER_SIZES: Record<PaperSize, { w: number; h: number; label: string; filename: string }> = {
  "us-letter": { w: 215.9, h: 279.4, label: "US Letter", filename: "USLetter" },
  a4: { w: 210, h: 297, label: "A4", filename: "A4" },
};

const MARGIN_MM = 12;

/** MIME → jsPDF format */
function mimeToJspdfFormat(mime: string): "JPEG" | "PNG" | "WEBP" {
  if (mime === "image/jpeg") return "JPEG";
  if (mime === "image/webp") return "WEBP";
  return "PNG";
}

/** 从 URL 或 data URL 提取 MIME */
function extractMime(url: string): string {
  const match = url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  if (match) return match[1];
  return "image/png";
}

/** 图片加载完成后返回 naturalWidth/naturalHeight */
function getImageNaturalSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1024, h: 978 }); // fallback（1024 - 4.5% ≈ 978）
    img.src = src;
  });
}

export function PseoClientActions({ imageUrl, displayTitle, seed }: Props) {
  const [exporting, setExporting] = useState<PaperSize | null>(null);

  /** 下载 PNG */
  const handleDownloadPng = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${displayTitle.replace(/\s+/g, "-").toLowerCase()}-${seed}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /** 导出指定尺寸 PDF */
  const handleExportPdf = async (size: PaperSize) => {
    setExporting(size);
    try {
      // 1. 先通过 Canvas 切掉 Pollinations 底部水印（4.5%）
      const cleanDataUrl = await getCleanCroppedImageData(imageUrl);

      // 2. 获取裁切后的图片自然尺寸（Canvas 加载完才知道）
      const cleanSize = await getImageNaturalSize(cleanDataUrl);

      const { default: jsPDF } = await import("jspdf");

      const paper = PAPER_SIZES[size];
      const pdfPaperMm =
        size === "us-letter" ? PAPER_MM.letter : PAPER_MM.a4;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pdfPaperMm, // [w, h] 数组 —— jsPDF 原生支持
      });

      // 3. 等比缩放 + 居中（修复正方形被拉伸变形）
      const { drawW, drawH, x, y } = computePdfPlacement(
        paperSizeObj(pdfPaperMm), // { w, h } 形式
        DEFAULT_MARGIN_MM,
        cleanSize
      );

      // 4. 用干净（去水印）的图写入 PDF
      pdf.addImage(cleanDataUrl, "PNG", x, y, drawW, drawH);

      const safeTitle = displayTitle.replace(/\s+/g, "-").toLowerCase();
      pdf.save(`${safeTitle}-${paper.filename}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert(`PDF export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setExporting(null);
    }
  };

  const safeLabel = displayTitle.replace(/[^\w\s-]/g, "").trim();

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm text-muted-foreground">
        ✨ All files are completely free — no sign-up required.
      </p>

      <div className="flex flex-wrap gap-2">
        {/* US Letter —— 最醒目的绿色按钮（北美用户首选） */}
        <button
          onClick={() => handleExportPdf("us-letter")}
          disabled={exporting !== null}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-medium text-white shadow transition hover:bg-green-700 disabled:opacity-60"
        >
          {exporting === "us-letter" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              🇺🇸 Print US Letter PDF
            </>
          )}
        </button>

        {/* A4 */}
        <button
          onClick={() => handleExportPdf("a4")}
          disabled={exporting !== null}
          className="inline-flex h-11 items-center gap-2 rounded-lg border bg-background px-5 text-sm font-medium transition hover:bg-accent disabled:opacity-60"
        >
          {exporting === "a4" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              📄 A4 PDF
            </>
          )}
        </button>

        {/* High-Res PNG */}
        <button
          onClick={handleDownloadPng}
          className="inline-flex h-11 items-center gap-2 rounded-lg border bg-background px-5 text-sm font-medium transition hover:bg-accent"
        >
          <Download className="h-4 w-4" />
          🖼️ High-Res PNG
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Paper size: US Letter (8.5 × 11 in) · A4 (210 × 297 mm) · Image: 2048 × 2048 px
      </p>

      {/* 隐藏的 label 元素 —— accessibility */}
      <span className="sr-only">{safeLabel}</span>
    </div>
  );
}
