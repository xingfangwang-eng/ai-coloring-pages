"use client";

/**
 * PSEO 页客户端操作组件 —— 双格式 PDF 导出 + PNG 下载
 *
 * 支持：
 *   - 🇺🇸 US Letter (8.5 × 11 in / 216 × 279 mm)
 *   - 📄 A4 (210 × 297 mm)
 *   - 🖼️ High-Res PNG
 *
 * PDF 导出统一委托给 @/lib/pdf-utils 的 exportToPdf() ——
 *   Canvas 物理切底部水印 + jsPDF contain 等比缩放（绝对不变形）
 */

import { useState } from "react";
import { Download, FileDown, FileText, Loader2 } from "lucide-react";
import { exportToPdf } from "@/lib/pdf-utils";

interface Props {
  imageUrl: string;
  displayTitle: string;
  seed: number;
}

type PaperSize = "us-letter" | "a4";

/** 仅保留 filename 映射（mm 尺寸不再需要 —— exportToPdf 自己从 jsPDF 内部读） */
const PAPER_SIZES: Record<PaperSize, { label: string; filename: string; format: "letter" | "a4" }> = {
  "us-letter": { label: "US Letter", filename: "USLetter", format: "letter" },
  a4: { label: "A4", filename: "A4", format: "a4" },
};

export function PseoClientActions({ imageUrl, displayTitle, seed }: Props) {
  const [exporting, setExporting] = useState<PaperSize | null>(null);

  /** 下载 PNG —— 直接用浏览器原生 <a download> */
  const handleDownloadPng = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${displayTitle.replace(/\s+/g, "-").toLowerCase()}-${seed}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /** 导出 PDF —— 统一委托 exportToPdf() */
  const handleExportPdf = async (size: PaperSize) => {
    setExporting(size);
    try {
      const safeTitle = displayTitle.replace(/\s+/g, "-").toLowerCase();
      const paper = PAPER_SIZES[size];
      await exportToPdf(imageUrl, `${safeTitle}-${paper.filename}`, paper.format);
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
