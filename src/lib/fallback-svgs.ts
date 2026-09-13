/**
 * 首页 & 列表页卡片安全线稿库
 *
 * 三套方案自动切换：
 *   1. for-adults → generateMandalaSVG(subjectSeed)   参数化曼陀罗（精细 8-12 轴旋转对称）
 *   2. for-kids / for-preschoolers → 原有卡通简笔 SVG（平滑贝塞尔 + 粗线条）
 *   3. for-toddlers → 同 for-kids（已有粗线条）
 *
 * 设计原则：
 *   - 全部 stroke="#000" fill="none" —— 纯线稿风格，可直接涂色
 *   - viewBox="0 0 200 200" —— 正方形，适配卡片 aspect-square
 *   - 白底透明背景 —— 用 <img> 渲染时天然透明
 *   - 无任何外部依赖 —— 100% 内嵌 data URL，页面打开即渲染
 */

/* ==================== 通用工具 ==================== */

/** SVG 字符串 → data URL */
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    svg.replace(/\s+/g, " ").trim()
  )}`;
}

/** 字符串 → 32-bit hash seed（给曼陀罗生成器用） */
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 可预测的伪随机数（基于 seed）—— mulberry32 */
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ==================== 方案 1：参数化曼陀罗（for-adults） ==================== */

/**
 * generateMandalaSVG —— 纯函数，生成 8 轴旋转对称的复杂曼陀罗
 *
 * 算法：
 *   1. 用极坐标 (r, θ) 构造 1/N 扇区的基本花纹单元
 *   2. 旋转复制 N 次（N=8 或 12，由 seed 决定）形成完整对称
 *   3. 层叠同心环（花瓣 / 菱形 / 虚线圈 / 放射轮廓）
 *   4. 中心植入基于 subject 的几何多边形轮廓
 */
export function generateMandalaSVG(subject: string): string {
  const seed = hashString(subject);
  const rand = mulberry32(seed);
  const N = [8, 8, 8, 10, 10, 12][seed % 6]; // 8/10/12 轴对称
  const cx = 100, cy = 100;

  // ===== 构建 1/N 扇区的花纹路径 =====
  const paths: string[] = [];
  const angleStep = (Math.PI * 2) / N;

  for (let k = 0; k < N; k++) {
    const rot = k * angleStep;
    const deg = (rot * 180) / Math.PI;

    // ---- 每层扇区花纹（半径分层）----
    const layers = [
      { r1: 25, r2: 45, petals: 3 },   // 内花瓣层
      { r1: 50, r2: 70, petals: 2 },   // 中花瓣层
      { r1: 75, r2: 92, petals: 4 },   // 外菱形层
    ];

    for (const layer of layers) {
      const rMid = (layer.r1 + layer.r2) / 2;
      const rHalf = (layer.r2 - layer.r1) / 2;

      for (let p = 0; p < layer.petals; p++) {
        const t = (p / layer.petals) * angleStep + angleStep / (layer.petals + 1);
        const x = cx + Math.cos(rot + t) * rMid;
        const y = cy + Math.sin(rot + t) * rMid;

        // 贝塞尔花瓣 —— 外凸曲线
        const c1x = cx + Math.cos(rot + t - 0.15) * (rMid - rHalf * 0.8);
        const c1y = cy + Math.sin(rot + t - 0.15) * (rMid - rHalf * 0.8);
        const c2x = cx + Math.cos(rot + t + 0.15) * (rMid + rHalf * 0.8);
        const c2y = cy + Math.sin(rot + t + 0.15) * (rMid + rHalf * 0.8);
        const endX = cx + Math.cos(rot + t + angleStep / (layer.petals + 1) * 0.5) * layer.r2;
        const endY = cy + Math.sin(rot + t + angleStep / (layer.petals + 1) * 0.5) * layer.r2;

        paths.push(
          `<path d="M ${cx + Math.cos(rot) * layer.r1} ${cy + Math.sin(rot) * layer.r1} ` +
          `Q ${c1x} ${c1y} ${x} ${y} Q ${c2x} ${c2y} ${endX} ${endY}" ` +
          `transform="rotate(${deg - (rot * 180) / Math.PI} ${cx} ${cy})" opacity="0.9"/>`
        );
      }
    }

    // ---- 菱形晶体 ----
    const diaR = 65 + rand() * 10;
    const dx1 = cx + Math.cos(rot) * diaR;
    const dy1 = cy + Math.sin(rot) * diaR;
    const dx2 = cx + Math.cos(rot + angleStep / 2) * (diaR + 12);
    const dy2 = cy + Math.sin(rot + angleStep / 2) * (diaR + 12);
    const dx3 = cx + Math.cos(rot + angleStep) * diaR;
    const dy3 = cy + Math.sin(rot + angleStep) * diaR;
    const dx4 = cx + Math.cos(rot + angleStep / 2) * (diaR - 12);
    const dy4 = cy + Math.sin(rot + angleStep / 2) * (diaR - 12);
    paths.push(`<polygon points="${dx1},${dy1} ${dx2},${dy2} ${dx3},${dy3} ${dx4},${dy4}" />`);

    // ---- 放射细线（从中心到外圈）----
    const lineLen = 95;
    paths.push(
      `<line x1="${cx + Math.cos(rot) * 20}" y1="${cy + Math.sin(rot) * 20}" ` +
      `x2="${cx + Math.cos(rot) * lineLen}" y2="${cy + Math.sin(rot) * lineLen}" stroke-width="0.8"/>`
    );

    // ---- 外圈装饰小圆 ----
    const dotR = 88;
    paths.push(
      `<circle cx="${cx + Math.cos(rot + angleStep / 2) * dotR}" ` +
      `cy="${cy + Math.sin(rot + angleStep / 2) * dotR}" r="3" stroke-width="1"/>`
    );
  }

  // ===== 同心圆环（实线 + 虚线交替）=====
  const concentricRs = [12, 22, 35, 48, 58, 72, 82, 92];
  for (let i = 0; i < concentricRs.length; i++) {
    const r = concentricRs[i];
    if (i % 2 === 0) {
      paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" stroke-width="1"/>`);
    } else {
      paths.push(`<circle cx="${cx}" cy="${cy}" r="${r}" stroke-width="0.8" stroke-dasharray="3 3"/>`);
    }
  }

  // ===== 中心动物几何轮廓 =====
  paths.push(generateCenterAnimal(subject, cx, cy));

  // ===== 外层装饰：圆角多边形 =====
  const outerPts: string[] = [];
  const outerR = 96;
  for (let i = 0; i < N * 2; i++) {
    const a = (i / (N * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? outerR : outerR - 8;
    outerPts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`);
  }
  paths.push(`<polygon points="${outerPts.join(" ")}" stroke-width="1.2"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${paths.join("")}</svg>`;
}

/**
 * SUBJECT_ICONS —— 主题图标识别映射（仿 lucide 风格 SVG path）
 *
 * 覆盖所有 SUBJECTS 分类：animals / holidays / vehicles / fantasy / nature / food / characters / education
 * 每个条目包含：
 *   keywords: 匹配 subject slug 的关键字（includes 语义）
 *   path: lucide 图标 SVG path（viewBox 0 0 24 24，stroke-width 2）
 *   strokeW: 中心图标描边宽度（曼陀罗整体 1.2px，图标稍微粗一点 1.4-1.6 更醒目）
 */
const SUBJECT_ICONS: { keywords: string[]; path: string; strokeW: number }[] = [
  { keywords: ["cat", "tiger", "leopard"], path: "M12 5c.78 0 1.5-.1 2.13-.29C15.07 4.35 16 3.34 16 2M12 5c-.78 0-1.5-.1-2.13-.29C8.93 4.35 8 3.34 8 2M12 5v7M12 12c-3.87 0-7 3.13-7 7 0 2.39.82 4.58 2.19 6H16.81c1.37-1.42 2.19-3.61 2.19-6 0-3.87-3.13-7-7-7Z", strokeW: 1.6 },
  { keywords: ["dog", "wolf", "fox", "puppy"], path: "M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703.725 1.517 1.656 1.517h1.163c.726 0 1.442-.685 1.672-1.658.26-.884.833-2.012 1.429-3.012A.5.5 0 0 1 10 5.172ZM14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-.725 1.517-1.656 1.517h-1.163c-.726 0-1.442-.685-1.672-1.658-.26-.884-.833-2.012-1.429-3.012A.5.5 0 0 0 14 5.172ZM5 21v-1.73A4 4 0 0 1 8.27 15h7.46A4 4 0 0 1 19 19.27V21M2 15h20", strokeW: 1.6 },
  { keywords: ["butterfly"], path: "M12 12c-2 4-4 5-4 8 0-2 2-4 4-4s4 2 4 4c0-3-2-4-4-8ZM12 12c-2-4-4-5-4-8 0 2 2 4 4 4s-4 2-4 4ZM12 12c2-4 4-5 4-8 0 2-2 4-4 4s4 2 4 4ZM12 12c2 4 4 5 4 8 0-2-2-4-4-4M12 12v10M12 12V2M8 6l4-4 4 4", strokeW: 1.4 },
  { keywords: ["dinosaur", "rex"], path: "M3.5 12.5c1 0 1.5 1 2 2 .3.6.5 1.3.5 2 .2-2 1.3-4 3-5 2.5-1.4 5.5-1 7 1M16 11c3-1 5 1 5 4 0 3-2 4-4 4h-2l-1 3H7l-1-3h-2c-1 0-2-.5-2-1.5M12 8l2-3 2 3", strokeW: 1.6 },
  { keywords: ["turtle"], path: "M12 10a4 4 0 1 0-4 4v3a4 4 0 0 0 8 0v-3a4 4 0 0 0-4-4ZM4 6l2 2M20 6l-2 2M12 4v2M8 20l-2 2M16 20l2 2", strokeW: 1.6 },
  { keywords: ["whale"], path: "M2 12c0-3 2-5 5-5 1-2 4-3 6-1 1-1 3-2 5-1 2 1 3 3 3 5s-1 5-4 5H4c-1 0-2-1-2-3ZM2 12c0 3 2 4 4 4", strokeW: 1.6 },
  { keywords: ["shark"], path: "M2 14c4-2 8-4 14-4 3 0 5 1 6 3l2-1-2 3 2 3-2-1c-1 2-3 3-6 3-6 0-10-2-14-4ZM18 14l-1 3M7 9l1 2M10 7l1 2M13 6l1 2", strokeW: 1.6 },
  { keywords: ["dolphin"], path: "M6.5 14c-.5 1-1.5 2-2.5 2.5l3-3.5c.2.4.5.8 1 1M22 7c0 4-3 6-7 6-3 0-5-2-7-4l-3 3c1 2 2.5 4 5 5 4 2 9 0 11-3 1.5-2 1.5-5 1.5-7Z", strokeW: 1.6 },
  { keywords: ["snake"], path: "M4 12c0-3 3-4 3-6 0-2 2-2 2 0 0 2-3 3-3 6 0 3 3 4 3 6 0 2-2 2-2 0 0-2 3-3 3-6", strokeW: 1.8 },
  { keywords: ["spider"], path: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM4 4l8 8M4 20l8-8M20 4l-8 8M20 20l-8-8", strokeW: 1.6 },
  { keywords: ["bee"], path: "M8.5 4.3A2 2 0 0 1 10.5 3h3a2 2 0 0 1 2 2v2h.5c1.5 0 2.5 1 2.5 2.5 0 1.1-.7 2-1.7 2.3L16 13h2a2 2 0 0 1 2 2v.5c0 1.5-1 2.5-2.5 2.5H17l1 3.5c.2.7-.3 1.5-1 1.5h-4c-.7 0-1.2-.8-1-1.5l1-3.5h-1c-1.5 0-2.5-1-2.5-2.5V15a2 2 0 0 1 2-2h2l-.3-.9C7.2 11.8 6.5 10.9 6.5 9.8 6.5 8.3 7.5 7 9 7h1.5", strokeW: 1.4 },
  { keywords: ["horse"], path: "M12 22v-4h-2l-1-8c-.5-4 2-8 5-8s5.5 4 5 8l-1 8h-2v4M8 7c-1-3 0-4 1-5M16 7c1-3 2-4 1-5", strokeW: 1.6 },
  { keywords: ["unicorn"], path: "M12 22v-3M6 19l3-5h6l3 5M5 14l3 2M19 14l-3 2M12 7c-3 0-5 3-5 6v1c0 1-1 2-2 2M12 7c3 0 5 3 5 6v1c0 1 1 2 2 2M10 7c-1-3-1-5 1-6s5-1 5 1", strokeW: 1.6 },
  { keywords: ["lion"], path: "M12 12c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3Zm0 0v10M8 12c-3 1-6-1-6-4 0-2 1-4 3-5-.5 1.5 0 4 2 5M16 12c3 1 6-1 6-4 0-2-1-4-3-5 .5 1.5 0 4-2 5M12 2c-1.5 0-3 .5-4 1.5-1 2 0 4 2 4 1.5 0 2-2 1-3s2-2 3-2Z", strokeW: 1.6 },
  { keywords: ["panda", "bear"], path: "M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10ZM7 13c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2ZM17 13c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2ZM9 16c1 1 5 1 6 0", strokeW: 1.6 },
  { keywords: ["koala"], path: "M12 22c4.5 0 8-3.5 8-8 0-2.5-1-4.5-2.5-6l-2-1M12 22c-4.5 0-8-3.5-8-8 0-2.5 1-4.5 2.5-6l2-1M8 14c1-2 2-3 4-3s3 1 4 3M8 10v-1c0-1.5 1-3 3-3s3 1.5 3 3v1", strokeW: 1.6 },
  { keywords: ["elephant"], path: "M3.5 6.5C5.5 4 8 3 12 3s6.5 1 8.5 3.5c1.5 2 1.5 5 0 7-1.5 2-3 2-5 2h-10c-2 0-3.5 0-5-2-1.5-2-1.5-5 0-7ZM9 13c1 0 2 1 3 1s2-1 3-1M12 10c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2ZM22 7c-1 2-2 2-3 3-1 1-1.5 2-1.5 3M3 7c1 2 2 2 3 3 1 1 1.5 2 1.5 3", strokeW: 1.6 },
  { keywords: ["giraffe"], path: "M12 22v-4h-2l-1-8c-.5-4 2-8 5-8s5.5 4 5 8l-1 8h-2v4M10 2V0M14 2V0M11 6c.7 0 1-.3 1-1s-.3-1-1-1-1 .3-1 1 .3 1 1 1ZM16 6c.7 0 1-.3 1-1s-.3-1-1-1-1 .3-1 1 .3 1 1 1Z", strokeW: 1.6 },
  { keywords: ["monkey"], path: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM5 5c-1.5 0-3 1.5-3 3s1.5 3 3 3M19 5c1.5 0 3 1.5 3 3s-1.5 3-3 3M9 12c-1 0-2-1-2-2M15 12c1 0 2-1 2-2", strokeW: 1.6 },
  { keywords: ["bird", "owl", "chick", "duck"], path: "M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V6M3.4 18l-1.5 4.5M5 12c3.5 0 6 2 7 4", strokeW: 1.6 },
  { keywords: ["car", "police"], path: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10.2c-.4-.1-.9-.1-1.3 0l-1.2.3-1.1-2.5A2 2 0 0 0 12.5 6h-2.7A2 2 0 0 0 8 7.6L6.8 10.5l-1.1-.3c-.4-.1-.9-.1-1.3 0L1.5 10.1C.7 10.3 0 11.1 0 12v4c0 .6.4 1 1 1h2M7 17h10M7 20v-3M17 20v-3", strokeW: 1.6 },
  { keywords: ["truck", "bus"], path: "M10 17h8m4 0h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L20 9.2c-.4-.1-.9-.1-1.3 0l-1.2.3-1.1-2.5A2 2 0 0 0 14.5 5h-2.7A2 2 0 0 0 10 6.6M5 17h2m0 0v3m10-3v3M7 14v2M7 8c-2 0-4 2-4 4", strokeW: 1.6 },
  { keywords: ["bike", "bicycle"], path: "M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-17 1L12 3h4l-4 6h5", strokeW: 1.6 },
  { keywords: ["rocket", "space"], path: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09ZM12 15l-3-3a22 22 0 0 1 2-3.99A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2ZM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5", strokeW: 1.6 },
  { keywords: ["plane", "airplane"], path: "M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z", strokeW: 1.6 },
  { keywords: ["train"], path: "M3 17h18M3 7v10c0 1 1 2 2 2h14c1 0 2-1 2-2V7M3 7c0-1 1-2 2-2h14c1 0 2 1 2 2M7 12h10M7 7h10M8 22v-3M16 22v-3", strokeW: 1.6 },
  { keywords: ["ship", "sailboat"], path: "M2 20a2.4 2.4 0 0 0 2 1h16a2 2 0 0 0 2-2M4 18l8-14 8 14M12 4v14M8 18v-6M16 18v-6", strokeW: 1.6 },
  { keywords: ["halloween", "ghost"], path: "M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l4-3 4 3 4-3 4 3V10a8 8 0 0 0-8-8ZM8 14c1 1 2.5 1 3 0s2 1 3 0", strokeW: 1.6 },
  { keywords: ["pumpkin"], path: "M12 2c5 0 8 3 8 8 0 3-2 5-4 5h-8c-2 0-4-2-4-5 0-5 3-8 8-8Zm-1 5v2m4-2v2M8 14l1-2M16 14l-1-2M12 7v0", strokeW: 1.6 },
  { keywords: ["christmas", "tree"], path: "M12 2v4M4 20h16L12 4 4 20ZM7 20l5-10 5 10M8 20h8M10 20v-2M14 20v-2", strokeW: 1.6 },
  { keywords: ["santa"], path: "M12 2c4 0 7 3 7 7 0 2-1 3-2 4 1 1 2 3 2 5h-14c0-2 1-4 2-5-1-1-2-2-2-4 0-4 3-7 7-7Zm-3 9v1m6-1v1M9 14c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5", strokeW: 1.6 },
  { keywords: ["snowflake"], path: "M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1", strokeW: 1.6 },
  { keywords: ["snowman"], path: "M12 22a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 8h.01M16 8h.01M8 10l4-2 4 2", strokeW: 1.6 },
  { keywords: ["easter", "bunny"], path: "M12 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM10 8c0-3 1-5 2-5s2 2 2 5M9 8c-.5-2-.5-4 1-5M12 14v4", strokeW: 1.6 },
  { keywords: ["valentine", "heart", "love", "cupid"], path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", strokeW: 1.6 },
  { keywords: ["thanksgiving", "turkey"], path: "M12 22c-3 0-5-2-5-5v-3c0-2 2-4 5-4s5 2 5 4v3c0 3-2 5-5 5ZM8 10c0-1.5 2-2.5 4-2.5s4 1 4 2.5M4 8l2-2M20 8l-2-2M6 5l-1-2M18 5l1-2", strokeW: 1.6 },
  { keywords: ["fireworks", "sparkles"], path: "M12 3l1.9 5.8 5.8 1.9-5.8 1.9L12 18.5l-1.9-5.8L4.3 10.7l5.8-1.9ZM19 2l.7 2 2 .7-2 .7L19 8l-.7-2-2-.7 2-.7Z", strokeW: 1.6 },
  { keywords: ["princess", "crown", "queen"], path: "M3 8l3 4 4-6 4 6 4-4 3 6H3ZM5 18h14M5 21h14", strokeW: 1.6 },
  { keywords: ["castle"], path: "M3 22V10l3-2 3 2v-4l3-2 3 2v4l3-2 3 2v12M9 10v12M15 10v12M9 16h6", strokeW: 1.6 },
  { keywords: ["dragon"], path: "M5 12c0-3 2-5 5-5 2 0 3 1 4 1s1-1 0-2c-1-1-3-1-4-1-4 0-7 3-7 6M7 12c0-2 2-3 4-3s3 1 3 3v1c0 2-3 3-3 5M14 13c1 0 2-1 2-2 0-2-2-4-5-4-1 0-2 1-2 2M18 6c2 1 3 3 3 5 0 3-3 5-6 5", strokeW: 1.6 },
  { keywords: ["wizard", "magic", "wand"], path: "M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M15 9h0M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5", strokeW: 1.6 },
  { keywords: ["flower", "rose"], path: "M12 22v-8M12 14c-2-2-2-5 0-7 2 2 2 5 0 7ZM5 11C4 10 3 8 3 7c2 0 4 1 5 3M19 11c1-1 2-3 2-4-2 0-4 1-5 3M5 14c-1 1-2 2-2 3 2 0 4-1 5-3M19 14c1 1 2 2 2 3-2 0-4-1-5-3M12 7c-2-2-2-4 0-5 2 1 2 3 0 5Z", strokeW: 1.6 },
  { keywords: ["sun"], path: "M12 12h.01M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41", strokeW: 1.6 },
  { keywords: ["moon"], path: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z", strokeW: 1.6 },
  { keywords: ["mountain"], path: "m8 3 4 8 5-5 5 15H2L8 3Z", strokeW: 1.6 },
  { keywords: ["beach", "palm"], path: "M4 20c1-1 2-2 3-2s2 1 3 2M7 18c2-2 4-2 5 0s3 2 5 0c2-2 4-2 5 0M13 18v-8M13 10c-1-2-4-3-5-2 1 1 3 2 4 2-1-3 1-5 3-6M13 10c1-2 4-3 5-2-1 1-3 2-4 2 1-3-1-5-3-6", strokeW: 1.6 },
  { keywords: ["cloud"], path: "M17.5 19a4.5 4.5 0 1 0-1.4-8.8 6 6 0 0 0-11.4 2.3 4 4 0 0 0 .4 7.5Z", strokeW: 1.6 },
  { keywords: ["rain"], path: "M17.5 12a4.5 4.5 0 1 0-1.4-8.8 6 6 0 0 0-11.4 2.3 4 4 0 0 0 .4 7.5ZM8 14l-1 4M12 14l-1 4M16 14l-1 4", strokeW: 1.6 },
  { keywords: ["leaf"], path: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.3c1 1 .5 3-1.7 5-1.6 1.6-3.3 2.5-5.5 2.5-1.8 0-2-.5-2-1 0-1.6 1-4.8 1-7.5M2 21c1-1 2-2 4-2s2 1 3 2", strokeW: 1.6 },
  { keywords: ["star"], path: "M12 2l3 7 7 .8-5.5 4.8L18 22l-6-3-6 3 1.5-7.4L2 9.8 9 9Z", strokeW: 1.6 },
  { keywords: ["cake", "donut", "cupcake"], path: "M20 21H4c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h16c.6 0 1 .4 1 1v13c0 .6-.4 1-1 1ZM8 6V3c0-.6.4-1 1-1h6c.6 0 1 .4 1 1v3", strokeW: 1.6 },
  { keywords: ["pizza"], path: "M15 11h.01M15 15h.01M10 16h.01M21 16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5h14a2 2 0 0 1 2 2ZM3 4l18-2", strokeW: 1.6 },
  { keywords: ["apple"], path: "M12 14c2-3 6-4 6-8a6 6 0 0 0-12 0c0 4 4 5 6 8ZM12 6c-1-2 0-4 2-5M17 9v0", strokeW: 1.6 },
];

/**
 * 在曼陀罗中心植入 subject 专属图标（白色圆形画布 + 黑色图标 stroke）
 * 完美解决之前所有主题看起来一模一样的"猪鼻子六边形"问题
 */
function generateCenterAnimal(subject: string, cx: number, cy: number): string {
  const s = subject.toLowerCase();

  // 匹配 SUBJECT_ICONS —— 第一个 keywords 命中即返回
  for (const entry of SUBJECT_ICONS) {
    if (entry.keywords.some((kw) => s.includes(kw))) {
      return `<circle cx="${cx}" cy="${cy}" r="22" fill="#fff" stroke="#000" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${cy}" r="28" fill="none" stroke="#000" stroke-width="0.8" opacity="0.3"/>
        <g transform="translate(${cx - 12} ${cy - 12}) scale(1)">
          <path d="${entry.path}" fill="none" stroke="#000" stroke-width="${entry.strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
        </g>`;
    }
  }

  // 终极兜底：圆形 + 3 星点（中性但可区分）
  return `<circle cx="${cx}" cy="${cy}" r="22" fill="#fff" stroke="#000" stroke-width="1.5"/>
    <circle cx="${cx - 8}" cy="${cy - 6}" r="2" fill="#000"/>
    <circle cx="${cx + 8}" cy="${cy - 6}" r="2" fill="#000"/>
    <circle cx="${cx}" cy="${cy + 4}" r="2" fill="#000"/>`;
}

/* ==================== 方案 2/3：原有卡通简笔 SVG（for-kids / for-toddlers） ==================== */

type SvgEntry = { slug: string; title: string; dataUrl: string };

const S = (slug: string, title: string, body: string, sw = 3): SvgEntry => ({
  slug,
  title,
  dataUrl: svgToDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="#000" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  ),
});

/**
 * 18 个儿童主题卡通简笔 SVG —— 平滑贝塞尔曲线 + 粗线条 + 大镂空
 * 用 stroke-width="3" 适合蜡笔涂色
 */
export const HOMEPAGE_SVGS: SvgEntry[] = [
  /* ---------- Cat ---------- */
  S("cat", "Cat", `
    <path d="M50 80 Q40 40 70 45 Q80 30 100 40 Q120 30 130 45 Q160 40 150 80 Q160 110 130 125 Q100 140 70 125 Q40 110 50 80 Z"/>
    <path d="M60 65 L52 48 L70 58 Z"/>
    <path d="M140 65 L148 48 L130 58 Z"/>
    <circle cx="80" cy="85" r="3" fill="#000"/>
    <circle cx="120" cy="85" r="3" fill="#000"/>
    <path d="M95 100 Q100 108 105 100"/>
    <path d="M100 100 L100 108"/>`),

  /* ---------- Dog ---------- */
  S("dog", "Dog", `
    <ellipse cx="100" cy="110" rx="55" ry="45"/>
    <ellipse cx="60" cy="75" rx="22" ry="35"/>
    <ellipse cx="140" cy="75" rx="22" ry="35"/>
    <circle cx="82" cy="100" r="3" fill="#000"/>
    <circle cx="118" cy="100" r="3" fill="#000"/>
    <ellipse cx="100" cy="120" rx="8" ry="5" fill="#000"/>
    <path d="M92 130 Q100 140 108 130"/>`),

  /* ---------- Dinosaur ---------- */
  S("dinosaur", "Dinosaur", `
    <path d="M40 130 Q35 100 55 80 Q60 60 80 55 Q95 35 115 45 Q135 35 145 55 Q165 60 165 80 Q185 85 175 105 Q185 125 165 120 Q170 140 160 140 L140 140 L135 125 L65 125 L60 140 L40 140 Z"/>
    <circle cx="130" cy="70" r="4" fill="#000"/>
    <path d="M90 100 L100 95 L110 100"/>`),

  /* ---------- Lion ---------- */
  S("lion", "Lion", `
    <circle cx="100" cy="100" r="40"/>
    <circle cx="100" cy="100" r="55"/>
    <path d="M60 70 Q45 60 55 50 Q50 35 65 35 Q70 20 85 30 Q100 20 115 30 Q130 20 135 35 Q150 35 145 50 Q155 60 140 70"/>
    <circle cx="85" cy="95" r="3" fill="#000"/>
    <circle cx="115" cy="95" r="3" fill="#000"/>
    <path d="M95 110 Q100 118 105 110"/>`),

  /* ---------- Tiger ---------- */
  S("tiger", "Tiger", `
    <circle cx="100" cy="100" r="45"/>
    <path d="M60 70 L48 45 L72 60 Z"/>
    <path d="M140 70 L152 45 L128 60 Z"/>
    <path d="M55 85 L42 80 M55 100 L40 100 M55 115 L42 120"/>
    <path d="M145 85 L158 80 M145 100 L160 100 M145 115 L158 120"/>
    <circle cx="85" cy="95" r="3" fill="#000"/>
    <circle cx="115" cy="95" r="3" fill="#000"/>
    <path d="M92 108 Q100 115 108 108"/>`),

  /* ---------- Elephant ---------- */
  S("elephant", "Elephant", `
    <ellipse cx="100" cy="105" rx="50" ry="40"/>
    <ellipse cx="45" cy="100" rx="18" ry="28"/>
    <ellipse cx="155" cy="100" rx="18" ry="28"/>
    <path d="M100 135 Q95 155 90 165 Q85 170 80 165"/>
    <circle cx="85" cy="95" r="3" fill="#000"/>
    <circle cx="115" cy="95" r="3" fill="#000"/>
    <path d="M55 145 L55 170 M75 145 L75 170 M125 145 L125 170 M145 145 L145 170"/>`),

  /* ---------- Giraffe ---------- */
  S("giraffe", "Giraffe", `
    <ellipse cx="100" cy="135" rx="40" ry="30"/>
    <path d="M80 105 Q75 60 85 45 Q88 25 100 25 Q112 25 115 45 Q125 60 120 105"/>
    <circle cx="100" cy="30" r="10"/>
    <path d="M95 15 L95 5 M105 15 L105 5"/>
    <circle cx="95" cy="30" r="2" fill="#000"/>
    <path d="M65 160 L65 185 M135 160 L135 185 M85 160 L85 180 M115 160 L115 180"/>`),

  /* ---------- Monkey ---------- */
  S("monkey", "Monkey", `
    <circle cx="100" cy="100" r="45"/>
    <ellipse cx="100" cy="110" rx="30" ry="28"/>
    <circle cx="60" cy="65" r="15"/>
    <circle cx="140" cy="65" r="15"/>
    <circle cx="85" cy="95" r="4" fill="#000"/>
    <circle cx="115" cy="95" r="4" fill="#000"/>
    <ellipse cx="100" cy="115" rx="10" ry="8"/>
    <path d="M90 120 Q100 128 110 120"/>`),

  /* ---------- Panda ---------- */
  S("panda", "Panda", `
    <circle cx="100" cy="100" r="48"/>
    <ellipse cx="65" cy="65" rx="18" ry="22"/>
    <ellipse cx="135" cy="65" rx="18" ry="22"/>
    <ellipse cx="70" cy="95" rx="10" ry="13"/>
    <ellipse cx="130" cy="95" rx="10" ry="13"/>
    <circle cx="70" cy="95" r="3" fill="#000"/>
    <circle cx="130" cy="95" r="3" fill="#000"/>
    <ellipse cx="100" cy="110" rx="5" ry="3" fill="#000"/>
    <path d="M93 118 Q100 125 107 118"/>`),

  /* ---------- Koala ---------- */
  S("koala", "Koala", `
    <circle cx="100" cy="105" r="42"/>
    <circle cx="60" cy="65" r="18"/>
    <circle cx="140" cy="65" r="18"/>
    <ellipse cx="100" cy="110" rx="25" ry="22"/>
    <circle cx="85" cy="100" r="3" fill="#000"/>
    <circle cx="115" cy="100" r="3" fill="#000"/>
    <ellipse cx="100" cy="115" rx="5" ry="3"/>
    <path d="M100 118 L100 124"/>`),

  /* ---------- Dolphin ---------- */
  S("dolphin", "Dolphin", `
    <path d="M30 100 Q60 70 100 80 Q135 88 155 70 Q165 62 170 55 Q175 68 165 80 Q155 95 140 105 Q155 120 170 118 Q168 130 150 128 Q130 125 115 118 Q100 140 80 145 Q60 148 45 140 Q30 130 30 115 Z"/>
    <path d="M110 82 L120 72 L115 85 Z"/>
    <circle cx="125" cy="92" r="2" fill="#000"/>`),

  /* ---------- Shark ---------- */
  S("shark", "Shark", `
    <path d="M30 105 Q60 95 100 100 Q130 103 160 110 L175 115 L160 120 Q130 125 100 122 Q70 120 40 118 Z"/>
    <path d="M80 95 L88 78 L95 95 Z"/>
    <path d="M100 90 L108 75 L115 92 Z"/>
    <path d="M30 105 L22 100 L22 115 L30 110 Z"/>
    <path d="M40 118 L50 135 L55 118 Z"/>
    <circle cx="130" cy="108" r="2" fill="#000"/>
    <path d="M155 110 L175 110"/>`),

  /* ---------- Sea Turtle ---------- */
  S("turtle", "Sea Turtle", `
    <ellipse cx="100" cy="105" rx="55" ry="42"/>
    <circle cx="100" cy="105" r="25"/>
    <path d="M45 85 L25 75 L35 95 Z"/>
    <path d="M155 85 L175 75 L165 95 Z"/>
    <path d="M45 125 L25 135 L35 115 Z"/>
    <path d="M155 125 L175 135 L165 115 Z"/>
    <path d="M55 105 Q35 105 40 85 Q50 80 55 95"/>
    <circle cx="48" cy="88" r="1.5" fill="#000"/>`),

  /* ---------- Butterfly ---------- */
  S("butterfly", "Butterfly", `
    <line x1="100" y1="40" x2="100" y2="160"/>
    <path d="M100 60 Q60 40 45 75 Q40 100 65 110 Q85 115 100 100"/>
    <path d="M100 60 Q140 40 155 75 Q160 100 135 110 Q115 115 100 100"/>
    <path d="M100 100 Q70 115 55 140 Q50 155 70 155 Q90 155 100 140"/>
    <path d="M100 100 Q130 115 145 140 Q150 155 130 155 Q110 155 100 140"/>
    <circle cx="75" cy="80" r="4"/>
    <circle cx="125" cy="80" r="4"/>
    <circle cx="80" cy="125" r="3"/>
    <circle cx="120" cy="125" r="3"/>`),

  /* ---------- Puppy ---------- */
  S("puppy", "Puppy", `
    <ellipse cx="100" cy="110" rx="50" ry="40"/>
    <path d="M55 85 Q40 55 70 65"/>
    <path d="M145 85 Q160 55 130 65"/>
    <circle cx="82" cy="100" r="3" fill="#000"/>
    <circle cx="118" cy="100" r="3" fill="#000"/>
    <ellipse cx="100" cy="118" rx="6" ry="4" fill="#000"/>
    <path d="M92 128 Q100 138 108 128"/>`),

  /* ---------- Kitten ---------- */
  S("kitten", "Kitten", `
    <circle cx="100" cy="105" r="48"/>
    <path d="M55 70 L45 45 L70 60 Z"/>
    <path d="M145 70 L155 45 L130 60 Z"/>
    <circle cx="82" cy="98" r="3" fill="#000"/>
    <circle cx="118" cy="98" r="3" fill="#000"/>
    <path d="M95 115 Q100 122 105 115"/>
    <path d="M100 115 L100 122"/>
    <path d="M72 115 L50 110 M72 120 L50 122 M128 115 L150 110 M128 120 L150 122"/>`),

  /* ---------- T-Rex ---------- */
  S("trex", "T-Rex", `
    <path d="M40 135 Q30 100 55 80 Q65 55 90 50 Q105 30 120 45 Q145 40 155 70 Q175 85 165 110 Q180 125 160 130 Q165 150 150 150 L135 150 L135 135 L65 135 L65 150 L50 150 Q35 150 40 135 Z"/>
    <circle cx="130" cy="75" r="4" fill="#000"/>
    <path d="M140 55 L155 50"/>
    <path d="M90 100 L100 95 L110 100"/>`),

  /* ---------- Butterfly (unicorn placeholder handled separately) ---------- */
  S("unicorn", "Unicorn", `
    <ellipse cx="100" cy="120" rx="45" ry="35"/>
    <circle cx="100" cy="70" r="25"/>
    <path d="M100 45 L95 20 L105 20 Z" fill="#FFD700"/>
    <path d="M80 50 Q70 30 55 35 Q65 50 75 55"/>
    <path d="M120 50 Q130 30 145 35 Q135 50 125 55"/>
    <circle cx="92" cy="75" r="2.5" fill="#000"/>
    <path d="M60 130 L60 155 M80 130 L80 160 M120 130 L120 160 M140 130 L140 155"/>
    <path d="M45 115 Q30 110 35 130 Q40 145 55 130"/>`),
];

/* ==================== 导出 API ==================== */

/**
 * 根据 slug 智能选择 SVG 来源 —— 保证永远返回有效 data URL
 *
 * slug 格式：{style}-{subject}-{audience}
 *   cute-cat-for-kids   → 卡通简笔 SVG（HOMEPAGE_SVGS 库）
 *   intricate-cat-for-adults / 任何未知 slug → 通用参数化曼陀罗
 *
 * 【零 Coming Soon 政策】：任何 slug 都能生成独一无二的曼陀罗
 */
export function getHomepageSvg(slug: string): string {
  const pureSlug = slug
    .replace(/^(cute|simple|detailed|kawaii|easy|intricate)-/, "")
    .replace(/-for-(toddlers|preschoolers|kids|adults)$/, "");
  const audienceMatch = slug.match(/-for-(toddlers|preschoolers|kids|adults)$/);
  const audience = audienceMatch?.[1] ?? "for-kids";

  // 1. for-adults → 参数化曼陀罗（精细 1.5px 线条）
  if (audience === "adults") {
    return svgToDataUrl(generateMandalaSVG(pureSlug));
  }

  // 2. for-kids / for-preschoolers / for-toddlers → 卡通简笔 SVG（粗 3px 线条）
  const found = HOMEPAGE_SVGS.find((entry) => entry.slug === pureSlug);
  if (found) return found.dataUrl;

  // 3. 兜底：任何未覆盖的 subject（space-rocket, princess-castle, halloween-witch...）
  //    → 通用曼陀罗，seed=hash(pureSlug) 保证每个主题独一无二
  return svgToDataUrl(generateMandalaSVG(pureSlug));
}

/** 首页 featured 列表的 18 个主题 slug */
export const HOMEPAGE_FEATURED_SLUGS = HOMEPAGE_SVGS.map(
  (entry) => `cute-${entry.slug}-for-kids`
);
