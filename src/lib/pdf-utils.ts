/**
 * PDF 导出共享工具 —— 解决两个顽固问题：
 *
 * 1. 变形 —— 正方形图片被硬撑满到长方形 A4/Letter
 *    → computePdfPlacement 等比缩放计算
 *
 * 2. 水印 —— Pollinations 右下角 logo 透传到 PDF
 *    → getCleanCroppedImageData 通过 Canvas 物理切除底部 4.5%
 *
 * 调用顺序（重要）：
 *   1. new jsPDF({ orientation, unit: "mm", format: [...] })  ← 先建 PDF
 *   2. pdf.internal.pageSize.getWidth()/getHeight()         ← 读页面真实尺寸
 *   3. computePdfPlacement(pageW, pageH, margin, imgW, imgH) ← 算绘制参数
 *   4. pdf.addImage(cleanDataUrl, "PNG", x, y, printW, printH) ← 写入
 */

/** 15mm 安全打印页边距（比 12mm 更保险，不怕打印机裁剪） */
export const DEFAULT_MARGIN_MM = 15;

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
 * 计算图片在 PDF 页面上的绘制参数（等比缩放 + 居中，单位 mm）
 *
 * 调用方先 new jsPDF()，然后直接从 pdf.internal.pageSize 读真实尺寸传入：
 *   computePdfPlacement(pdf.internal.pageSize.getWidth(),
 *                      pdf.internal.pageSize.getHeight(),
 *                      DEFAULT_MARGIN_MM,
 *                      img.naturalWidth, img.naturalHeight)
 *
 * 算法（contain，和你给的代码一致）：
 *   先按页面宽度适配 → 如果高度超出 maxPrintHeight → 切到按高度适配
 *   最后居中偏移
 *
 * @param pageW      —— 页面宽度 mm（pdf.internal.pageSize.getWidth()）
 * @param pageH      —— 页面高度 mm（pdf.internal.pageSize.getHeight()）
 * @param marginMm   —— 安全打印页边距 mm
 * @param imgW       —— 干净图片（去水印后）的像素宽度
 * @param imgH       —— 干净图片（去水印后）的像素高度
 * @returns          —— { printW, printH, x, y } 单位 mm
 */
export function computePdfPlacement(
  pageW: number,
  pageH: number,
  marginMm: number,
  imgW: number,
  imgH: number
): { printW: number; printH: number; x: number; y: number } {
  const maxPrintWidth = pageW - marginMm * 2;
  const maxPrintHeight = pageH - marginMm * 2;

  // 图片比例（裁切后的真实比例，约 1:0.955）
  const imgAspectRatio = imgW / imgH;

  // 先按页面宽度适配
  let printW = maxPrintWidth;
  let printH = printW / imgAspectRatio;

  // 如果高度超出 → 切到按高度适配
  if (printH > maxPrintHeight) {
    printH = maxPrintHeight;
    printW = printH * imgAspectRatio;
  }

  // 居中偏移
  const x = (pageW - printW) / 2;
  const y = (pageH - printH) / 2;

  return { printW, printH, x, y };
}
