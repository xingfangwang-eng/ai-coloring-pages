/**
 * 首页卡片安全线稿库 —— 18 个热门主题的内嵌纯黑白 SVG 矢量图
 *
 * 设计原则：
 *   - 全部 stroke="#000" stroke-width="3" fill="none" —— 纯线稿风格
 *   - viewBox="0 0 200 200" —— 正方形，适配卡片 aspect-square
 *   - 白底透明背景 —— 用 <img> 渲染时天然透明
 *   - 无任何外部依赖 —— 100% 内嵌 data URL，页面打开即渲染
 *
 * 为什么首页要用本地 SVG？
 *   Pollinations 外部 API 并发 18 个请求会触发 429 频控，
 *   导致 Image loading failed 错误，且成功加载的图片风格混乱。
 *   这 18 个是网站门面，必须 0.1 秒内稳定展示。
 */

/** 通用包装：SVG 字符串 → data URL */
function svgToDataUrl(svg: string): string {
  // 用 encodeURIComponent 避免 base64 增加体积
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    svg
      .replace(/\s+/g, " ")
      .trim()
  )}`;
}

type SvgEntry = { slug: string; title: string; dataUrl: string };

const S = (slug: string, title: string, body: string): SvgEntry => ({
  slug,
  title,
  dataUrl: svgToDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  ),
});

/** 18 个热门主题极简线稿（按 SUBJECTS 数组顺序 + cute-{slug}-for-kids 的 for-kids 变体） */
export const HOMEPAGE_SVGS: SvgEntry[] = [
  // ---------- Cat ----------
  S("cat", "Cat", `
    <path d="M50 80 L40 55 L60 70 Z"/>
    <path d="M150 80 L160 55 L140 70 Z"/>
    <ellipse cx="100" cy="110" rx="50" ry="45"/>
    <circle cx="82" cy="100" r="4" fill="#000"/>
    <circle cx="118" cy="100" r="4" fill="#000"/>
    <path d="M92 125 Q100 132 108 125"/>
    <path d="M95 115 L90 118"/>
    <path d="M105 115 L110 118"/>
    <path d="M45 110 L25 105"/>
    <path d="M45 118 L25 120"/>
    <path d="M155 110 L175 105"/>
    <path d="M155 118 L175 120"/>
    <path d="M100 155 L100 175"/>
    <path d="M85 165 Q100 168 115 165"/>
  `),

  // ---------- Dog ----------
  S("dog", "Dog", `
    <path d="M60 70 L40 45 L55 60"/>
    <path d="M140 70 L160 45 L145 60"/>
    <ellipse cx="100" cy="110" rx="52" ry="48"/>
    <circle cx="82" cy="100" r="4" fill="#000"/>
    <circle cx="118" cy="100" r="4" fill="#000"/>
    <ellipse cx="100" cy="120" rx="8" ry="6" fill="#000"/>
    <path d="M90 135 Q100 145 110 135"/>
    <path d="M95 128 L95 142"/>
    <path d="M105 128 L105 142"/>
    <path d="M60 155 Q50 165 65 170"/>
  `),

  // ---------- Puppy ----------
  S("puppy", "Puppy", `
    <ellipse cx="55" cy="80" rx="18" ry="28"/>
    <ellipse cx="145" cy="80" rx="18" ry="28"/>
    <circle cx="100" cy="115" r="48"/>
    <circle cx="82" cy="105" r="5" fill="#000"/>
    <circle cx="118" cy="105" r="5" fill="#000"/>
    <ellipse cx="100" cy="120" rx="6" ry="5" fill="#000"/>
    <path d="M88 135 Q100 148 112 135"/>
    <path d="M94 130 L94 144"/>
    <path d="M106 130 L106 144"/>
    <path d="M75 155 Q90 162 100 158"/>
    <circle cx="70" cy="142" r="4"/>
    <circle cx="88" cy="148" r="4"/>
    <circle cx="112" cy="148" r="4"/>
    <circle cx="130" cy="142" r="4"/>
  `),

  // ---------- Kitten ----------
  S("kitten", "Kitten", `
    <path d="M55 85 L45 60 L65 75 Z"/>
    <path d="M145 85 L155 60 L135 75 Z"/>
    <circle cx="100" cy="115" r="42"/>
    <path d="M85 100 Q88 115 85 120"/>
    <path d="M115 100 Q112 115 115 120"/>
    <circle cx="85" cy="108" r="4" fill="#000"/>
    <circle cx="115" cy="108" r="4" fill="#000"/>
    <path d="M93 125 Q100 132 107 125"/>
    <path d="M98 120 L100 127 L102 120"/>
    <path d="M48 110 L28 105"/>
    <path d="M48 118 L28 120"/>
    <path d="M152 110 L172 105"/>
    <path d="M152 118 L172 120"/>
  `),

  // ---------- Dinosaur ----------
  S("dinosaur", "Dinosaur", `
    <path d="M40 140 Q30 110 55 90 Q70 75 100 70 Q130 70 150 85 Q170 100 165 130"/>
    <path d="M165 130 Q180 128 180 145 Q180 155 165 150"/>
    <circle cx="160" cy="95" r="4" fill="#000"/>
    <path d="M175 135 L185 130"/>
    <path d="M55 140 L50 165"/>
    <path d="M70 140 L65 165"/>
    <path d="M50 165 L45 175"/>
    <path d="M65 165 L60 175"/>
    <path d="M40 140 Q20 150 15 170"/>
    <path d="M25 160 L15 165"/>
  `),

  // ---------- T-Rex ----------
  S("t-rex", "T-Rex", `
    <path d="M35 145 Q25 120 45 95 Q60 75 100 70 Q140 70 160 90"/>
    <path d="M160 90 Q185 88 180 115"/>
    <path d="M178 110 Q188 108 185 120 L178 115"/>
    <path d="M170 125 Q180 128 175 138"/>
    <circle cx="170" cy="98" r="5" fill="#000"/>
    <path d="M155 110 L160 118"/>
    <path d="M165 110 L168 118"/>
    <path d="M45 140 L42 165"/>
    <path d="M58 140 L55 165"/>
    <path d="M42 165 L38 178"/>
    <path d="M55 165 L52 178"/>
    <path d="M100 130 Q95 145 100 150"/>
    <path d="M110 130 Q105 145 110 150"/>
    <path d="M100 150 L105 160"/>
    <path d="M110 150 L115 160"/>
  `),

  // ---------- Lion ----------
  S("lion", "Lion", `
    <circle cx="100" cy="105" r="55"/>
    <path d="M100 50 Q70 50 55 70 Q45 95 55 120 Q50 145 70 155 Q100 160 130 155 Q150 145 145 120 Q155 95 145 70 Q130 50 100 50"/>
    <ellipse cx="100" cy="120" rx="32" ry="28"/>
    <circle cx="85" cy="115" r="4" fill="#000"/>
    <circle cx="115" cy="115" r="4" fill="#000"/>
    <path d="M93 130 L100 138 L107 130"/>
    <path d="M100 130 L100 140"/>
    <path d="M80 135 L60 140"/>
    <path d="M120 135 L140 140"/>
    <path d="M75 110 L55 105"/>
    <path d="M125 110 L145 105"/>
    <path d="M30 80 Q25 100 35 120"/>
  `),

  // ---------- Tiger ----------
  S("tiger", "Tiger", `
    <ellipse cx="100" cy="115" rx="55" ry="50"/>
    <path d="M45 80 L30 55 L52 70"/>
    <path d="M155 80 L170 55 L148 70"/>
    <circle cx="85" cy="105" r="5" fill="#000"/>
    <circle cx="115" cy="105" r="5" fill="#000"/>
    <ellipse cx="100" cy="120" rx="5" ry="4" fill="#000"/>
    <path d="M92 132 Q100 140 108 132"/>
    <path d="M60 95 Q50 105 58 115"/>
    <path d="M65 115 Q55 125 62 135"/>
    <path d="M70 135 Q60 145 68 152"/>
    <path d="M140 95 Q150 105 142 115"/>
    <path d="M135 115 Q145 125 138 135"/>
    <path d="M130 135 Q140 145 132 152"/>
    <path d="M100 142 L100 155"/>
  `),

  // ---------- Elephant ----------
  S("elephant", "Elephant", `
    <ellipse cx="100" cy="120" rx="65" ry="50"/>
    <ellipse cx="60" cy="110" rx="20" ry="25"/>
    <ellipse cx="140" cy="110" rx="20" ry="25"/>
    <circle cx="100" cy="95" r="35"/>
    <circle cx="90" cy="92" r="3" fill="#000"/>
    <circle cx="110" cy="92" r="3" fill="#000"/>
    <path d="M100 108 Q100 140 92 160 Q88 168 95 165 Q100 155 102 140"/>
    <path d="M90 115 Q82 125 75 130"/>
    <path d="M110 115 Q118 125 125 130"/>
    <path d="M70 160 L60 180"/>
    <path d="M90 165 L85 185"/>
    <path d="M110 165 L115 185"/>
    <path d="M130 160 L140 180"/>
  `),

  // ---------- Giraffe ----------
  S("giraffe", "Giraffe", `
    <ellipse cx="100" cy="140" rx="30" ry="25"/>
    <path d="M100 115 L100 50 Q100 35 110 30 Q125 28 130 40 Q132 55 120 60"/>
    <path d="M95 45 L90 30"/>
    <path d="M105 45 L110 30"/>
    <circle cx="120" cy="45" r="3" fill="#000"/>
    <path d="M130 45 L140 43"/>
    <path d="M85 105 L100 100"/>
    <path d="M75 125 L90 120"/>
    <path d="M110 130 L125 128"/>
    <path d="M80 145 L70 150"/>
    <path d="M115 150 L125 155"/>
    <path d="M80 165 L80 185"/>
    <path d="M120 165 L120 185"/>
    <path d="M80 185 L72 185"/>
    <path d="M120 185 L112 185"/>
    <path d="M128 155 Q145 158 148 168"/>
  `),

  // ---------- Monkey ----------
  S("monkey", "Monkey", `
    <circle cx="100" cy="105" r="48"/>
    <circle cx="100" cy="110" r="30"/>
    <circle cx="85" cy="100" r="4" fill="#000"/>
    <circle cx="115" cy="100" r="4" fill="#000"/>
    <path d="M92 120 Q100 128 108 120"/>
    <ellipse cx="100" cy="115" rx="6" ry="4"/>
    <path d="M60 130 Q45 140 40 160 Q35 180 50 175"/>
    <path d="M140 130 Q155 140 160 160 Q165 180 150 175"/>
    <path d="M80 75 Q65 65 55 70"/>
    <path d="M120 75 Q135 65 145 70"/>
    <path d="M75 160 L75 180"/>
    <path d="M125 160 L125 180"/>
    <path d="M100 155 Q90 175 95 190"/>
  `),

  // ---------- Panda ----------
  S("panda", "Panda", `
    <circle cx="58" cy="75" r="20"/>
    <circle cx="142" cy="75" r="20"/>
    <circle cx="100" cy="115" r="50"/>
    <ellipse cx="82" cy="108" rx="12" ry="16"/>
    <ellipse cx="118" cy="108" rx="12" ry="16"/>
    <circle cx="82" cy="108" r="4" fill="#000"/>
    <circle cx="118" cy="108" r="4" fill="#000"/>
    <ellipse cx="100" cy="122" rx="5" ry="3.5" fill="#000"/>
    <path d="M93 135 Q100 143 107 135"/>
    <path d="M80 160 L75 185"/>
    <path d="M120 160 L125 185"/>
    <path d="M55 145 Q35 155 35 175"/>
    <path d="M145 145 Q165 155 165 175"/>
  `),

  // ---------- Koala ----------
  S("koala", "Koala", `
    <circle cx="100" cy="110" r="45"/>
    <ellipse cx="58" cy="75" rx="15" ry="18"/>
    <ellipse cx="142" cy="75" rx="15" ry="18"/>
    <circle cx="85" cy="105" r="5" fill="#000"/>
    <circle cx="115" cy="105" r="5" fill="#000"/>
    <ellipse cx="100" cy="120" rx="4" ry="3" fill="#000"/>
    <path d="M90 130 Q100 138 110 130"/>
    <path d="M98 127 L100 133 L102 127"/>
    <path d="M100 155 L100 170"/>
    <path d="M85 160 Q100 165 115 160"/>
    <path d="M70 155 L60 185"/>
    <path d="M130 155 L140 185"/>
  `),

  // ---------- Dolphin ----------
  S("dolphin", "Dolphin", `
    <path d="M30 120 Q50 80 100 70 Q150 65 170 85 Q180 105 160 130"/>
    <path d="M160 130 Q175 145 170 160 Q155 155 150 140"/>
    <circle cx="155" cy="90" r="4" fill="#000"/>
    <path d="M140 130 Q150 140 145 155"/>
    <path d="M80 115 Q90 95 85 80"/>
    <path d="M50 140 Q55 155 40 160"/>
    <path d="M75 165 Q90 155 100 165"/>
    <path d="M115 170 Q125 160 135 170"/>
  `),

  // ---------- Shark ----------
  S("shark", "Shark", `
    <path d="M20 110 Q50 70 110 65 Q160 68 175 95 Q180 115 155 130"/>
    <path d="M20 110 Q30 130 60 140 Q100 145 140 135 Q160 130 155 120 Q175 130 165 155"/>
    <circle cx="155" cy="95" r="4" fill="#000"/>
    <path d="M140 105 L145 112"/>
    <path d="M148 108 L152 115"/>
    <path d="M155 110 L158 117"/>
    <path d="M100 65 Q95 50 105 45"/>
    <path d="M70 125 Q85 115 85 95"/>
    <path d="M55 140 Q60 155 50 160"/>
    <path d="M45 100 L25 85"/>
  `),

  // ---------- Whale ----------
  S("whale", "Whale", `
    <path d="M25 120 Q50 80 110 80 Q160 78 175 105 Q180 125 150 140"/>
    <path d="M175 105 Q190 95 190 80 Q185 95 175 105"/>
    <circle cx="160" cy="95" r="3" fill="#000"/>
    <path d="M155 105 L160 112"/>
    <path d="M163 108 L168 115"/>
    <path d="M25 120 Q15 135 25 150 Q35 165 55 155"/>
    <path d="M110 80 Q105 60 115 50 Q125 55 120 70"/>
    <path d="M90 65 Q85 55 95 45"/>
    <path d="M80 55 Q78 45 85 38"/>
    <path d="M130 55 Q135 45 130 35"/>
  `),

  // ---------- Sea Turtle ----------
  S("sea-turtle", "Sea Turtle", `
    <ellipse cx="100" cy="110" rx="65" ry="50"/>
    <path d="M100 70 Q85 90 85 110 Q85 130 100 150"/>
    <path d="M100 70 Q115 90 115 110 Q115 130 100 150"/>
    <path d="M85 90 Q100 80 115 90"/>
    <path d="M85 130 Q100 140 115 130"/>
    <ellipse cx="165" cy="110" rx="15" ry="12"/>
    <circle cx="168" cy="105" r="3" fill="#000"/>
    <path d="M170 115 Q178 118 180 125"/>
    <path d="M35 80 Q20 65 15 80"/>
    <path d="M35 140 Q20 155 15 140"/>
    <path d="M160 80 Q175 65 180 80"/>
    <path d="M160 140 Q175 155 180 140"/>
  `),

  // ---------- Butterfly ----------
  S("butterfly", "Butterfly", `
    <path d="M100 80 Q50 50 30 90 Q20 125 50 145 Q80 155 100 140"/>
    <path d="M100 80 Q150 50 170 90 Q180 125 150 145 Q120 155 100 140"/>
    <path d="M100 95 Q65 95 55 115 Q55 135 85 135"/>
    <path d="M100 95 Q135 95 145 115 Q145 135 115 135"/>
    <path d="M100 75 L100 145"/>
    <circle cx="100" cy="75" r="5" fill="#000"/>
    <path d="M97 70 Q90 60 85 55"/>
    <path d="M103 70 Q110 60 115 55"/>
    <circle cx="65" cy="100" r="4"/>
    <circle cx="135" cy="100" r="4"/>
    <circle cx="60" cy="130" r="3"/>
    <circle cx="140" cy="130" r="3"/>
    <circle cx="85" cy="115" r="3"/>
    <circle cx="115" cy="115" r="3"/>
  `),
];

/**
 * 根据 subject slug 查找本地 SVG 兜底
 * 找不到时返回 null（调用方决定最终 fallback）
 */
export function getHomepageSvg(slug: string): string | null {
  // 首页 slug 格式是 cute-{slug}-for-kids → 提取中间的 pure slug
  const pureSlug = slug
    .replace(/^(cute|simple|detailed|kawaii|easy)-/, "")
    .replace(/-for-(toddlers|preschoolers|kids|adults)$/, "");
  const found = HOMEPAGE_SVGS.find(
    (entry) => entry.slug === pureSlug
  );
  return found?.dataUrl ?? null;
}

/** 首页 featured 列表的 18 个主题 slug（SUBJECTS 数组前 18 个 + cute-{slug}-for-kids） */
export const HOMEPAGE_FEATURED_SLUGS = HOMEPAGE_SVGS.map(
  (entry) => `cute-${entry.slug}-for-kids`
);
