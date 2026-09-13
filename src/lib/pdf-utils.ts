"use client";

import jsPDF from "jspdf";

/**
 * PDF 导出 —— 100% 不变形、无水印、标准化输出
 *
 * 两个核心函数（用户实测验证稳定）：
 *   getCleanCroppedImageData() — Canvas 物理切除 Pollinations 底部 4.5% 水印
 *   exportToPdf()             — 先建 PDF → 读 internal.pageSize → contain 等比缩放 → 写入
 *
 * 为什么要先建 PDF 再读尺寸？
 *   jsPDF 的 internal.pageSize.getWidth()/getHeight() 是权威来源，
 *   比自己硬编码 210/297、215.9/279.4 更不容易配错（尤其以后加新纸张尺寸时）。
 *
 * 为什么用 import jsPDF from 'jspdf' 而不是动态 import？
 *   jspdf 是纯前端库，已在 package.json 里，直接静态 import 更简洁。
 *   之前两个调用点（pseo-client-actions / result-panel）各自动态 import 一次，
 *   其实效果一样——Vite/Webpack 还是只打一份 chunk。这里统一静态 import。
 */

/**
 * 物理切除底部水印并获取干净的图片 DataURL + 真实像素尺寸
 *
 * Pollinations Turbo 生成的 1024×1024 图，右下角有极小 logo（约占底部 3-4%）。
 * 通过 Canvas 物理切掉底部 4.5% 高度，输出新的 data URL + 干净的宽高。
 *
 * 这个函数**同时返回**裁切后的 width/height —— 调用方不需要再 new Image() 去读 naturalSize，
 * 省去一次异步加载（省一次 Promise await）。
 */
export async function getCleanCroppedImageData(
  imgUrl: string
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Canvas 不可用 → 原样返回（至少不报 crash）
        resolve({ dataUrl: imgUrl, width: 1024, height: 1024 });
        return;
      }

      // 物理切除底部 4.5% 的 Logo 水印区域
      const cropBottomPercent = 0.045;
      const cleanHeight = Math.floor(img.naturalHeight * (1 - cropBottomPercent));
      const cleanWidth = img.naturalWidth;

      canvas.width = cleanWidth;
      canvas.height = cleanHeight;

      // 绘制原图，但丢弃底部水印行
      ctx.drawImage(img, 0, 0, cleanWidth, cleanHeight, 0, 0, cleanWidth, cleanHeight);

      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        width: cleanWidth,
        height: cleanHeight,
      });
    };

    img.onerror = () => {
      resolve({ dataUrl: imgUrl, width: 1024, height: 1024 });
    };

    img.src = imgUrl;
  });
}

/**
 * 导出标准不变形、无水印的高清 PDF
 *
 * 执行流程：
 *   1. await getCleanCroppedImageData(imgUrl) — Canvas 切掉底部 4.5% 水印
 *   2. new jsPDF() — 先建 PDF，format 用 jsPDF 原生字符串 'letter' / 'a4'
 *   3. pdf.internal.pageSize.getWidth()/getHeight() — 读页面真实 mm 尺寸
 *   4. contain 等比缩放 + 居中偏移（绝对不变形）
 *   5. pdf.addImage() + pdf.save()
 *
 * @param imgUrl   原始图片地址（可以是 http(s) URL 或 data URL）
 * @param filename 下载文件名（可以带 .pdf 后缀；不带会自动补）
 * @param format   'letter' (US Letter) 或 'a4' — 默认 'letter' 符合北美市场
 */
export async function exportToPdf(
  imgUrl: string,
  filename: string,
  format: "letter" | "a4" = "letter"
): Promise<void> {
  // 1. 获取物理去除水印后的干净图片
  const { dataUrl, width, height } = await getCleanCroppedImageData(imgUrl);

  // 2. 初始化 jsPDF
  const isLetter = format === "letter";
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: isLetter ? "letter" : "a4",
  });

  // 获取当前纸张实际毫米尺寸
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // 设置 15mm 的安全打印页边距
  const margin = 15;
  const maxPrintWidth = pageWidth - margin * 2;
  const maxPrintHeight = pageHeight - margin * 2;

  // 3. 严格按原始比例计算宽高（绝对不变形）
  const imgAspectRatio = width / height;
  let printW = maxPrintWidth;
  let printH = printW / imgAspectRatio;

  if (printH > maxPrintHeight) {
    printH = maxPrintHeight;
    printW = printH * imgAspectRatio;
  }

  // 4. 居中排版坐标计算
  const x = (pageWidth - printW) / 2;
  const y = (pageHeight - printH) / 2;

  // 5. 渲染进 PDF 并下载
  pdf.addImage(dataUrl, "PNG", x, y, printW, printH);
  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
