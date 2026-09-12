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
import { urlToColoringDataUrl } from "@/components/lineart-image";

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
  // URL 方式默认 png
  return "image/png";
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
      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: size === "us-letter" ? [215.9, 279.4] : "a4",
      });

      const paper = PAPER_SIZES[size];
      const maxW = paper.w - MARGIN_MM * 2;
      const maxH = paper.h - MARGIN_MM * 2;

      // 计算等比缩放后的居中位置
      const drawW = maxW;
      const drawH = maxH;
      const x = (paper.w - drawW) / 2;
      const y = (paper.h - drawH) / 2;

      // Canvas 二值化 —— PDF 里绝对是纯白底 + 纯黑线条
      const cleanDataUrl = await urlToColoringDataUrl(imageUrl);

      pdf.addImage(
        cleanDataUrl,
        "PNG",
        x,
        y,
        drawW,
        drawH
      );

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
