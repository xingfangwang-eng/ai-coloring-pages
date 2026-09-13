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
 * 在曼陀罗中心植入基于 subject 的几何多边形轮廓
 * 不同动物 → 不同几何形态（圆形/三角形/菱形/星形/椭圆）
 */
function generateCenterAnimal(subject: string, cx: number, cy: number): string {
  const s = subject.toLowerCase();

  // 猫 / 虎 / 狮 → 三角形耳朵 + 圆头
  if (s.includes("cat") || s.includes("tiger") || s.includes("lion") || s.includes("leopard")) {
    return `<circle cx="${cx}" cy="${cy}" r="18" stroke-width="1.5"/>
      <polygon points="${cx - 14},${cy - 6} ${cx - 18},${cy - 22} ${cx - 4},${cy - 12}" stroke-width="1.5"/>
      <polygon points="${cx + 14},${cy - 6} ${cx + 18},${cy - 22} ${cx + 4},${cy - 12}" stroke-width="1.5"/>
      <circle cx="${cx - 6}" cy="${cy - 2}" r="1.5" fill="#000"/>
      <circle cx="${cx + 6}" cy="${cy - 2}" r="1.5" fill="#000"/>
      <path d="M ${cx} ${cy + 2} L ${cx} ${cy + 7} M ${cx - 3} ${cy + 5} L ${cx + 3} ${cy + 5}" stroke-width="1.2"/>`;
  }

  // 狗 / 狼 / 狐狸 → 椭圆 + 垂耳
  if (s.includes("dog") || s.includes("wolf") || s.includes("fox") || s.includes("puppy")) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="16" ry="14" stroke-width="1.5"/>
      <path d="M ${cx - 16} ${cy - 4} Q ${cx - 24} ${cy - 18} ${cx - 10} ${cy - 10}" stroke-width="1.5"/>
      <path d="M ${cx + 16} ${cy - 4} Q ${cx + 24} ${cy - 18} ${cx + 10} ${cy - 10}" stroke-width="1.5"/>
      <circle cx="${cx - 5}" cy="${cy - 3}" r="1.5" fill="#000"/>
      <circle cx="${cx + 5}" cy="${cy - 3}" r="1.5" fill="#000"/>
      <ellipse cx="${cx}" cy="${cy + 4}" rx="2.5" ry="2" fill="#000"/>`;
  }

  // 蝴蝶 → 菱形 + 对称翅膀
  if (s.includes("butterfly") || s.includes("moth")) {
    return `<line x1="${cx}" y1="${cy - 16}" x2="${cx}" y2="${cy + 16}" stroke-width="1.5"/>
      <path d="M ${cx} ${cy - 16} Q ${cx - 22} ${cy - 22} ${cx - 18} ${cy} Q ${cx - 22} ${cy + 22} ${cx} ${cy + 16}" stroke-width="1.5"/>
      <path d="M ${cx} ${cy - 16} Q ${cx + 22} ${cy - 22} ${cx + 18} ${cy} Q ${cx + 22} ${cy + 22} ${cx} ${cy + 16}" stroke-width="1.5"/>
      <circle cx="${cx - 14}" cy="${cy - 6}" r="2"/>
      <circle cx="${cx + 14}" cy="${cy - 6}" r="2"/>
      <circle cx="${cx - 12}" cy="${cy + 8}" r="1.5"/>
      <circle cx="${cx + 12}" cy="${cy + 8}" r="1.5"/>`;
  }

  // 恐龙 / 龙 → 锯齿形
  if (s.includes("dinosaur") || s.includes("dragon") || s.includes("rex")) {
    return `<path d="M ${cx - 20} ${cy + 8} L ${cx - 16} ${cy - 4} L ${cx - 10} ${cy + 6} L ${cx - 4} ${cy - 6} L ${cx + 2} ${cy + 4} L ${cx + 8} ${cy - 8} L ${cx + 14} ${cy + 2} L ${cx + 18} ${cy - 10}" stroke-width="1.8"/>
      <circle cx="${cx - 12}" cy="${cy - 8}" r="8" stroke-width="1.5"/>
      <circle cx="${cx - 14}" cy="${cy - 9}" r="1.2" fill="#000"/>`;
  }

  // 海龟 / 乌龟 → 六边形壳
  if (s.includes("turtle")) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push(`${cx + Math.cos(a) * 16},${cy + Math.sin(a) * 16}`);
    }
    return `<polygon points="${pts.join(" ")}" stroke-width="1.5"/>
      <polygon points="${pts.map((p) => {
        const [x, y] = p.split(",").map(Number);
        return `${cx + (x - cx) * 0.55},${cy + (y - cy) * 0.55}`;
      }).join(" ")}" stroke-width="1"/>`;
  }

  // 鲨鱼 / 鱼 / 鲸 / 海豚 → 梭形 + 尾巴
  if (s.includes("shark") || s.includes("fish") || s.includes("whale") || s.includes("dolphin")) {
    return `<path d="M ${cx - 18} ${cy} Q ${cx - 10} ${cy - 10} ${cx + 8} ${cy - 4} Q ${cx + 18} ${cy} ${cx + 24} ${cy - 8} L ${cx + 16} ${cy} L ${cx + 24} ${cy + 8} Q ${cx + 18} ${cy + 4} ${cx + 8} ${cy + 4} Q ${cx - 10} ${cy + 10} ${cx - 18} ${cy} Z" stroke-width="1.5"/>
      <circle cx="${cx - 2}" cy="${cy - 2}" r="1.5" fill="#000"/>`;
  }

  // 蛇 → S 曲线
  if (s.includes("snake")) {
    return `<path d="M ${cx - 18} ${cy - 8} Q ${cx - 6} ${cy + 12} ${cx + 6} ${cy - 8} Q ${cx + 14} ${cy - 18} ${cx + 18} ${cy - 4}" stroke-width="2" fill="none"/>
      <circle cx="${cx + 18}" cy="${cy - 4}" r="5" stroke-width="1.5"/>
      <circle cx="${cx + 20}" cy="${cy - 6}" r="0.8" fill="#000"/>`;
  }

  // 蜘蛛 / 昆虫 → 放射腿
  if (s.includes("spider")) {
    let legs = "";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x1 = cx + Math.cos(a) * 6;
      const y1 = cy + Math.sin(a) * 6;
      const x2 = cx + Math.cos(a) * 20;
      const y2 = cy + Math.sin(a) * 20;
      legs += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="1.2"/>`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="10" stroke-width="1.5"/>${legs}`;
  }

  // 鸟 / 鸡 / 鸭 → V 形 + 身体
  if (s.includes("bird") || s.includes("chick") || s.includes("duck") || s.includes("owl")) {
    return `<circle cx="${cx}" cy="${cy + 2}" r="12" stroke-width="1.5"/>
      <path d="M ${cx} ${cy - 10} Q ${cx - 12} ${cy - 20} ${cx - 4} ${cy - 14} Q ${cx} ${cy - 10} ${cx} ${cy - 10}" stroke-width="1.5"/>
      <path d="M ${cx + 8} ${cy + 2} L ${cx + 16} ${cy + 2} L ${cx + 8} ${cy + 5} Z" stroke-width="1.2"/>
      <circle cx="${cx - 4}" cy="${cy}" r="1.2" fill="#000"/>`;
  }

  // 默认：六边形（中性动物占位）
  const defPts = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    defPts.push(`${cx + Math.cos(a) * 16},${cy + Math.sin(a) * 16}`);
  }
  return `<polygon points="${defPts.join(" ")}" stroke-width="1.5"/>
    <circle cx="${cx - 5}" cy="${cy - 2}" r="1.2" fill="#000"/>
    <circle cx="${cx + 5}" cy="${cy - 2}" r="1.2" fill="#000"/>`;
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
