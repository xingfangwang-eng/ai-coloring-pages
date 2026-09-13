/**
 * PDF 导出共享工具 —— 解决两个顽固问题：
 *
 * 1. 变形 —— 正方形图片被硬撑满到长方形 A4/Letter
 *    → computePdfPlacement 等比缩放计算
 *
 * 2. 水印 —— Pollinations 右下角 logo 透传到 PDF
 *    → getCleanCroppedImageData 通过 Canvas 物理切除底部 4.5%
 *
 * 所有 PDF 导出调用方（result-panel、pseo-client-actions）都用这套工具。
 */

/**
 * Paper dimensions for jsPDF
 * jsPDF format 参数接受 [w, h] 数组（单位由构造函数 unit 决定）
 */
export const PAPER_MM = {
  a4: [210, 297] as [number, number],
  letter: [215.9, 279.4] as [number, number],
};

/** 以 { w, h } 形式读取纸张尺寸（给 computePdfPlacement 用） */
export function paperSizeObj(
  paperMm: [number, number]
): { w: number; h: number } {
  return { w: paperMm[0], h: paperMm[1] };
}

/** Default margin inside paper in millimeters */
export const DEFAULT_MARGIN_MM = 12;

/**
 * 等比缩放：让 src 图片完整显示在 maxW × maxH 框内（contain）
 * 返回 drawW/drawH（mm），调用方用它居中
 */
export function fitInsideMm(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number
): { drawW: number; drawH: number } {
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return {
    drawW: srcW * ratio,
    drawH: srcH * ratio,
  };
}

/**
 * 物理去水印 + 获取干净的图片 data URL
 *
 * Pollinations Turbo 生成的 1024×1024 图，右下角有极小 logo（约占底部 3-4%）。
 * 通过 Canvas 把它物理切掉（底部裁掉 4.5%），输出新的 data URL。
 *
 * 如果 imgSrc 已经是 data URL（如 fallback-svgs 的 SVG data URL 或 Studio 生成后
 * 已存成 data URL 的图），这个函数也能正常处理。
 *
 * @param imgSrc  —— 可以是 http(s) URL 或 data URL
 * @returns         —— 切掉水印后的 PNG data URL；失败时返回原 src
 */
export async function getCleanCroppedImageData(
  imgSrc: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(imgSrc);

        // Pollinations 水印在底部最下方，物理切掉 4.5% 高度
        const cropBottomPercent = 0.045;
        const cleanHeight = Math.floor(
          img.naturalHeight * (1 - cropBottomPercent)
        );

        canvas.width = img.naturalWidth;
        canvas.height = cleanHeight;

        // 从原图画到 canvas —— 只画到 cleanHeight，底部水印被切掉
        ctx.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          cleanHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // 输出 PNG data URL（保持无损）
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(imgSrc);
      }
    };

    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
}

/**
 * 给定纸张 + 图片源 → 返回 PDF 中的绘制参数
 *
 * @param paper       —— 纸张尺寸 mm，如 PAPER_MM.a4
 * @param marginMm    —— 页边距 mm
 * @param naturalSize —— 原始图片像素尺寸 { w, h }
 * @returns             —— { drawW, drawH, x, y } 单位 mm，已居中 + 等比缩放
 */
export function computePdfPlacement(
  paper: { w: number; h: number },
  marginMm: number,
  naturalSize: { w: number; h: number }
): { drawW: number; drawH: number; x: number; y: number } {
  const maxW = paper.w - marginMm * 2;
  const maxH = paper.h - marginMm * 2;

  const { drawW, drawH } = fitInsideMm(
    naturalSize.w,
    naturalSize.h,
    maxW,
    maxH
  );

  return {
    drawW,
    drawH,
    x: (paper.w - drawW) / 2,
    y: (paper.h - drawH) / 2,
  };
}
