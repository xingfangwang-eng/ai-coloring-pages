"use client";

/**
 * PSEO 页客户端操作组件 —— 双格式 PDF 导出 + 无水印 PNG 下载
 *
 * 支持：
 *   - 🇺🇸 US Letter (8.5 × 11 in / 216 × 279 mm) — 无水印（Canvas 物理裁切）
 *   - 📄 A4 (210 × 297 mm) — 无水印
 *   - 🖼️ High-Res PNG — 无水印（Canvas 物理切掉底部 4.5%）
 *
 * PDF 导出统一委托给 @/lib/pdf-utils 的 exportToPdf()
 * PNG 下载直接用 getCleanCroppedImageData() + canvas.toBlob() ——
 *   100% 本地处理，不引导用户去外部带水印的 Pollinations URL
 */

import { useState } from "react";
import { Download, FileDown, FileText, Loader2 } from "lucide-react";
import { exportToPdf, getCleanCroppedImageData } from "@/lib/pdf-utils";

interface Props {
  imageUrl: string;
  displayTitle: string;
  seed: number;
  /** 用于生成文件名的 slug（纯名词，如 "fox"） */
  slug?: string;
}

type PaperSize = "us-letter" | "a4";

const PAPER_SIZES: Record<PaperSize, { label: string; filename: string; format: "letter" | "a4" }> = {
  "us-letter": { label: "US Letter", filename: "USLetter", format: "letter" },
  a4: { label: "A4", filename: "A4", format: "a4" },
};

export function PseoClientActions({ imageUrl, displayTitle, seed, slug }: Props) {
  const [exporting, setExporting] = useState<PaperSize | null>(null);
  const [downloadingPng, setDownloadingPng] = useState(false);

  /** 下载 PNG —— Canvas 物理去水印后下载，绝不跳转外部 URL */
  const handleDownloadPng = async () => {
    setDownloadingPng(true);
    try {
      // 1. Canvas 物理切掉 Pollinations 底部 4.5% 水印
      const { dataUrl } = await getCleanCroppedImageData(imageUrl);

      // 2. data URL → Blob → 虚拟 a 标签 → 触发下载
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const fileName = `${(slug ?? displayTitle).replace(/\s+/g, "-").toLowerCase()}-${seed}.png`;
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("PNG download failed:", err);
      alert(`Download failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setDownloadingPng(false);
    }
  };

  /** 导出 PDF —— 统一委托 exportToPdf() */
  const handleExportPdf = async (size: PaperSize) => {
    setExporting(size);
    try {
      const safeTitle = (slug ?? displayTitle).replace(/\s+/g, "-").toLowerCase();
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
  const busy = exporting !== null || downloadingPng;

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm text-muted-foreground">
        ✨ All files are completely free — no sign-up required.
      </p>

      <div className="flex flex-wrap gap-2">
        {/* US Letter —— 最醒目的绿色按钮（北美用户首选） */}
        <button
          onClick={() => handleExportPdf("us-letter")}
          disabled={busy}
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
          disabled={busy}
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

        {/* High-Res PNG —— Canvas 物理去水印后下载，不跳转外部 URL */}
        <button
          onClick={handleDownloadPng}
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-lg border bg-background px-5 text-sm font-medium transition hover:bg-accent disabled:opacity-60"
        >
          {downloadingPng ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              🖼️ High-Res PNG
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Paper size: US Letter (8.5 × 11 in) · A4 (210 × 297 mm) · Image: 1024 × 1024 px · Canvas-cropped (no watermark)
      </p>

      {/* 隐藏的 label 元素 —— accessibility */}
      <span className="sr-only">{safeLabel}</span>
    </div>
  );
}
