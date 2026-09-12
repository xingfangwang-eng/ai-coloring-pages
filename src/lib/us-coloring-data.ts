/**
 * 北美市场着色页长尾词库 —— 笛卡尔积版 (us-coloring-data.ts)
 *
 * 三重矩阵：SUBJECTS (100+) × STYLES (5) × AUDIENCES (4) ≈ 2000 条 pSEO slug
 * Slug 格式：{style}-{subject}-{audience}
 *   e.g. cute-cat-for-toddlers, detailed-dragon-for-adults
 *
 * 核心收益：
 *   - 覆盖北美长尾搜索 "cute dinosaur coloring page for toddlers"
 *   - 每个主题 × 风格 × 受众 都有独立 URL —— Google 收录面爆炸式扩张
 *   - 每个 slug → Pollinations 确定性 seed —— 爬虫每次扫到同一张图
 */

/* ============================================================
 * 类型定义
 * ============================================================ */

export type SubjectCategory =
  | "animals"
  | "holidays"
  | "vehicles"
  | "fantasy"
  | "nature"
  | "food"
  | "characters"
  | "education";

/** 主体：独立可着色对象 */
export interface Subject {
  /** URL slug（kebab-case，不带风格/受众） */
  slug: string;
  /** 英文标题 */
  title: string;
  /** AI 生成时的 prompt 主体 */
  prompt: string;
  /** SEO meta description */
  description: string;
  /** 分类 —— 用于首页展示 */
  category: SubjectCategory;
}

/** 修饰风格 */
export interface Style {
  slug: string;          // e.g. "cute"
  label: string;         // e.g. "Cute Style"
  /** AI prompt tag —— 传给图片模型 */
  promptTag: string;
  /** 复杂度 */
  complexity: "kids" | "adults";
}

/** 目标受众 */
export interface Audience {
  slug: string;          // e.g. "for-toddlers"
  label: string;         // e.g. "for Toddlers"
  promptTag: string;
  complexity: "kids" | "adults";
}

/* ============================================================
 * 风格库 (5 种)
 * ============================================================ */

export const STYLES: Style[] = [
  {
    slug: "cute",
    label: "Cute",
    promptTag: "super cute, adorable expression, big round eyes, chibi proportions",
    complexity: "kids",
  },
  {
    slug: "simple",
    label: "Simple",
    promptTag: "very simple minimal shapes, few lines, basic geometry",
    complexity: "kids",
  },
  {
    slug: "detailed",
    label: "Detailed",
    promptTag: "highly detailed with fine line work, intricate patterns, decorative borders",
    complexity: "adults",
  },
  {
    slug: "kawaii",
    label: "Kawaii",
    promptTag: "Japanese kawaii style, pastel influences, round squishy shapes, sparkles",
    complexity: "kids",
  },
  {
    slug: "easy",
    label: "Easy",
    promptTag: "thick bold outlines, very easy shapes, no tiny details",
    complexity: "kids",
  },
];

/* ============================================================
 * 目标受众 (4 档)
 * ============================================================ */

export const AUDIENCES: Audience[] = [
  {
    slug: "for-toddlers",
    label: "for Toddlers",
    promptTag: "extra thick bold outlines, very large simple shapes, large easy-to-color areas",
    complexity: "kids",
  },
  {
    slug: "for-preschoolers",
    label: "for Preschoolers",
    promptTag: "thick clean outlines, simple cartoon shapes, fun and playful details",
    complexity: "kids",
  },
  {
    slug: "for-kids",
    label: "for Kids",
    promptTag: "clean outlines, fun cartoon details, medium line weight, engaging compositions",
    complexity: "kids",
  },
  {
    slug: "for-adults",
    label: "for Adults",
    promptTag: "intricate detailed line art, fine precise outlines, decorative patterns, stress-relieving design",
    complexity: "adults",
  },
];

/* ============================================================
 * 主体库 (100+ 高频美式搜索词)
 * ============================================================ */

export const SUBJECTS: Subject[] = [
  // ==================== 动物 (22) ====================
  { slug: "cat", title: "Cat", prompt: "a charming domestic cat sitting, whiskers, tail curled", description: "A charming cat coloring page with clear outlines.", category: "animals" },
  { slug: "dog", title: "Dog", prompt: "a happy dog wagging its tail, floppy ears, collar with tag", description: "A friendly dog coloring page for animal lovers.", category: "animals" },
  { slug: "puppy", title: "Puppy", prompt: "an adorable puppy with soft fluffy fur, floppy ears, tongue out", description: "An ultra-cute puppy coloring page.", category: "animals" },
  { slug: "kitten", title: "Kitten", prompt: "a tiny playful kitten with soft eyes, sitting on a cushion", description: "A sweet little kitten coloring page.", category: "animals" },
  { slug: "dinosaur", title: "Dinosaur", prompt: "a friendly prehistoric dinosaur in a fern forest", description: "A fun dinosaur coloring page for dino lovers.", category: "animals" },
  { slug: "t-rex", title: "T-Rex Dinosaur", prompt: "a T-Rex dinosaur with short arms, big teeth, roaring", description: "A mighty T-Rex dinosaur coloring page.", category: "animals" },
  { slug: "lion", title: "Lion", prompt: "a majestic lion with a full mane sitting proudly on a rock", description: "A noble lion king coloring page.", category: "animals" },
  { slug: "tiger", title: "Tiger", prompt: "a fierce tiger with stripe patterns, jungle background", description: "A powerful tiger coloring page.", category: "animals" },
  { slug: "elephant", title: "Elephant", prompt: "a gentle African elephant with large ears and trunk", description: "A giant elephant coloring page.", category: "animals" },
  { slug: "giraffe", title: "Giraffe", prompt: "a tall giraffe with spotted coat reaching for leaves", description: "A tall spotted giraffe coloring page.", category: "animals" },
  { slug: "monkey", title: "Monkey", prompt: "a playful monkey swinging from tree branches, bananas nearby", description: "A silly monkey coloring page.", category: "animals" },
  { slug: "panda", title: "Panda Bear", prompt: "a cute panda eating bamboo, black and white fur", description: "An adorable panda bear coloring page.", category: "animals" },
  { slug: "koala", title: "Koala", prompt: "a sleepy koala clinging to an eucalyptus tree", description: "A cute koala coloring page.", category: "animals" },
  { slug: "dolphin", title: "Dolphin", prompt: "a smiling dolphin jumping through ocean waves", description: "A playful dolphin coloring page.", category: "animals" },
  { slug: "shark", title: "Shark", prompt: "a great white shark swimming with teeth exposed, underwater", description: "A powerful shark coloring page.", category: "animals" },
  { slug: "whale", title: "Whale", prompt: "a giant humpback whale with tail flukes, ocean bubbles", description: "A gentle whale coloring page.", category: "animals" },
  { slug: "sea-turtle", title: "Sea Turtle", prompt: "a sea turtle with detailed patterned shell, underwater coral", description: "A graceful sea turtle coloring page.", category: "animals" },
  { slug: "butterfly", title: "Butterfly", prompt: "a colorful butterfly with detailed wing patterns on a flower", description: "A beautiful butterfly coloring page.", category: "animals" },
  { slug: "bee", title: "Honey Bee", prompt: "a bee with stripes and wings, flower and honeycomb nearby", description: "A busy honey bee coloring page.", category: "animals" },
  { slug: "fox", title: "Fox", prompt: "a clever red fox with bushy tail in autumn woods", description: "A sly red fox coloring page.", category: "animals" },
  { slug: "bear", title: "Bear", prompt: "a friendly brown bear with honey pot in forest", description: "A cuddly bear coloring page.", category: "animals" },
  { slug: "rabbit", title: "Rabbit", prompt: "a fluffy rabbit with long ears holding a carrot", description: "A cute rabbit coloring page.", category: "animals" },
  { slug: "farm-animals", title: "Farm Animals", prompt: "a group of farm animals: cow, pig, chicken, sheep, horse, barn background", description: "A cheerful farm animals coloring page.", category: "animals" },

  // ==================== 节日 (13) ====================
  { slug: "halloween-pumpkin", title: "Halloween Pumpkin", prompt: "a spooky jack-o-lantern pumpkin with mischievous grin, bats and haunted trees", description: "A fun Halloween pumpkin coloring page.", category: "holidays" },
  { slug: "halloween-ghost", title: "Halloween Ghost", prompt: "a friendly cartoon ghost with sheets, haunted house background", description: "A cute not-scary ghost coloring page for Halloween.", category: "holidays" },
  { slug: "halloween-witch", title: "Halloween Witch", prompt: "a witch with pointy hat and broomstick, cauldron with bubbling potion", description: "A classic witch coloring page.", category: "holidays" },
  { slug: "thanksgiving-turkey", title: "Thanksgiving Turkey", prompt: "a cartoon turkey wearing a pilgrim hat, fall leaves and pumpkins", description: "A cheerful Thanksgiving turkey coloring page.", category: "holidays" },
  { slug: "christmas-santa", title: "Christmas Santa", prompt: "Santa Claus in red suit with sack of presents, reindeer and Christmas tree", description: "A classic Santa Claus coloring page.", category: "holidays" },
  { slug: "christmas-tree", title: "Christmas Tree", prompt: "a decorated Christmas tree with lights ornaments and star on top, presents underneath", description: "A festive Christmas tree coloring page.", category: "holidays" },
  { slug: "christmas-reindeer", title: "Christmas Reindeer", prompt: "a flying reindeer with red nose pulling Santa's sleigh, snowy night sky", description: "A joyful Christmas reindeer coloring page.", category: "holidays" },
  { slug: "easter-bunny", title: "Easter Bunny", prompt: "an Easter bunny with basket of colorful decorated eggs, spring flowers", description: "A fluffy Easter bunny coloring page.", category: "holidays" },
  { slug: "easter-eggs", title: "Easter Eggs", prompt: "decorated Easter eggs with intricate patterns, grass and flowers around", description: "Decorative Easter eggs coloring page.", category: "holidays" },
  { slug: "4th-of-july-fireworks", title: "4th of July Fireworks", prompt: "patriotic bald eagle with American flag, fireworks exploding, Statue of Liberty", description: "A patriotic 4th of July coloring page.", category: "holidays" },
  { slug: "valentines-heart", title: "Valentine's Heart", prompt: "a big heart with cupid, roses, chocolates, love letters", description: "A romantic Valentine's Day coloring page.", category: "holidays" },
  { slug: "st-patricks-leprechaun", title: "St. Patrick's Leprechaun", prompt: "a tiny leprechaun with red beard and green suit, pot of gold at rainbow end", description: "A lucky leprechaun coloring page.", category: "holidays" },
  { slug: "birthday-cake", title: "Birthday Cake", prompt: "a multi-layer birthday cake with candles, balloons and presents", description: "A festive birthday cake coloring page.", category: "holidays" },

  // ==================== 交通与现代 (16) ====================
  { slug: "sports-car", title: "Sports Car", prompt: "a sleek red sports car with racing stripes, city street background", description: "A cool sports car coloring page.", category: "vehicles" },
  { slug: "monster-truck", title: "Monster Truck", prompt: "a monster truck with huge oversized wheels, jumping over cars", description: "An exciting monster truck coloring page.", category: "vehicles" },
  { slug: "police-car", title: "Police Car", prompt: "a friendly cartoon police car with flashing sirens, smile on front", description: "A safe friendly police car coloring page.", category: "vehicles" },
  { slug: "fire-truck", title: "Fire Truck", prompt: "a big red fire truck with extendable ladder, firefighter waving", description: "A heroic fire truck coloring page.", category: "vehicles" },
  { slug: "ambulance", title: "Ambulance", prompt: "a friendly ambulance with flashing lights, community helper scene", description: "A helpful ambulance coloring page.", category: "vehicles" },
  { slug: "school-bus", title: "School Bus", prompt: "a bright yellow school bus full of smiling kids, school building behind", description: "The iconic yellow school bus coloring page.", category: "vehicles" },
  { slug: "airplane", title: "Airplane", prompt: "a commercial jet airplane flying through fluffy white clouds, blue sky", description: "A passenger airplane coloring page.", category: "vehicles" },
  { slug: "rocket", title: "Rocket Ship", prompt: "a cartoon rocket ship launching into space, flames and smoke", description: "A fun rocket ship coloring page.", category: "vehicles" },
  { slug: "space-station", title: "Space Station", prompt: "an orbiting space station with solar panels, planet Earth behind", description: "A futuristic space station coloring page.", category: "vehicles" },
  { slug: "train", title: "Train", prompt: "a colorful cartoon train with several cars, countryside scenery", description: "A cheerful train coloring page.", category: "vehicles" },
  { slug: "tractor", title: "Farm Tractor", prompt: "a red farm tractor in golden fields, hay bales and farmhouse", description: "A hardworking farm tractor coloring page.", category: "vehicles" },
  { slug: "bicycle", title: "Bicycle", prompt: "a child's bicycle with training wheels and balloon, driveway scene", description: "A kid's bicycle coloring page.", category: "vehicles" },
  { slug: "boat", title: "Sailboat", prompt: "a sailboat with colorful sails on calm ocean waves", description: "A peaceful sailboat coloring page.", category: "vehicles" },
  { slug: "submarine", title: "Submarine", prompt: "a cartoon submarine underwater with fish swimming by, periscope up", description: "A fun submarine coloring page.", category: "vehicles" },
  { slug: "dump-truck", title: "Dump Truck", prompt: "a yellow construction dump truck with gravel, construction site", description: "A construction dump truck coloring page.", category: "vehicles" },
  { slug: "helicopter", title: "Helicopter", prompt: "a helicopter with spinning rotor blades, flying over mountains", description: "A helicopter coloring page.", category: "vehicles" },

  // ==================== 奇幻与角色 (16) ====================
  { slug: "princess", title: "Princess", prompt: "a beautiful princess in flowing gown, crown on head, castle background", description: "An elegant princess coloring page.", category: "fantasy" },
  { slug: "mermaid", title: "Mermaid", prompt: "a mermaid with flowing hair and fish tail, surrounded by fish and seashells", description: "A graceful mermaid coloring page.", category: "fantasy" },
  { slug: "fairy", title: "Fairy", prompt: "a tiny winged fairy sitting on a mushroom cap, magical flowers", description: "An enchanted fairy coloring page.", category: "fantasy" },
  { slug: "unicorn", title: "Unicorn", prompt: "a magical unicorn with spiral horn, starry mane, rainbow forest", description: "A magical unicorn coloring page.", category: "fantasy" },
  { slug: "dragon", title: "Fantasy Dragon", prompt: "a majestic dragon with spread wings, mountain lair, smoke from nostrils", description: "A powerful fantasy dragon coloring page.", category: "fantasy" },
  { slug: "superhero", title: "Superhero", prompt: "a brave superhero in cape and mask, standing tall on city rooftop", description: "An action superhero coloring page.", category: "fantasy" },
  { slug: "robot", title: "Robot", prompt: "a friendly cartoon robot with antenna, square head, winking eye", description: "A cute robot coloring page.", category: "fantasy" },
  { slug: "astronaut", title: "Astronaut", prompt: "an astronaut in spacesuit floating in space, planets and stars around", description: "A space explorer astronaut coloring page.", category: "fantasy" },
  { slug: "pirate", title: "Pirate", prompt: "a pirate captain with eye patch, hat with skull and crossbones, treasure chest", description: "A swashbuckling pirate coloring page.", category: "fantasy" },
  { slug: "knight", title: "Knight", prompt: "a brave knight in shining armor with sword and shield, castle behind", description: "A noble knight coloring page.", category: "fantasy" },
  { slug: "wizard", title: "Wizard", prompt: "a wizard with long beard and pointy hat, glowing wand, mystical castle", description: "A wise wizard coloring page.", category: "fantasy" },
  { slug: "pegasus", title: "Pegasus", prompt: "a winged pegasus horse flying through clouds, stars twinkling", description: "A flying pegasus coloring page.", category: "fantasy" },
  { slug: "anime-girl", title: "Anime Girl", prompt: "an anime-style girl with big eyes, colorful hair, cute expression", description: "A trendy anime girl coloring page.", category: "fantasy" },
  { slug: "fairy-castle", title: "Fairy Castle", prompt: "a fairy tale castle with tall towers and flags, princess on balcony", description: "A magical fairy castle coloring page.", category: "fantasy" },
  { slug: "leprechaun", title: "Leprechaun", prompt: "a tiny Irish leprechaun with green suit and red beard, pot of gold", description: "A lucky leprechaun coloring page.", category: "fantasy" },
  { slug: "gnome", title: "Garden Gnome", prompt: "a jolly garden gnome with red hat and white beard, mushrooms nearby", description: "A whimsical garden gnome coloring page.", category: "fantasy" },

  // ==================== 自然与风景 (12) ====================
  { slug: "mountain", title: "Mountain Landscape", prompt: "snow-capped mountains, pine forests, winding river, sun shining", description: "A scenic mountain landscape coloring page.", category: "nature" },
  { slug: "beach", title: "Sunset Beach", prompt: "a tranquil beach at sunset, palm trees, gentle waves, seashells", description: "A peaceful beach sunset coloring page.", category: "nature" },
  { slug: "forest", title: "Forest Scene", prompt: "a dense forest with tall trees, sunlight through leaves, mushrooms on ground", description: "A magical forest coloring page.", category: "nature" },
  { slug: "rainbow", title: "Rainbow", prompt: "a beautiful rainbow stretching across the sky, clouds, sun at end", description: "A colorful rainbow coloring page.", category: "nature" },
  { slug: "flowers", title: "Flower Bouquet", prompt: "a bouquet of mixed flowers: roses, tulips, daisies, lilies, in a vase", description: "A beautiful flower bouquet coloring page.", category: "nature" },
  { slug: "camping", title: "Camping Scene", prompt: "a tent in the woods, campfire with flames, backpack, starry sky", description: "A fun camping adventure coloring page.", category: "nature" },
  { slug: "desert", title: "Desert Landscape", prompt: "saguaro cactus, desert mountains, roadrunner bird, sunset sky", description: "A desert landscape coloring page.", category: "nature" },
  { slug: "cherry-blossom", title: "Cherry Blossom", prompt: "a cherry blossom tree full of pink flowers, petals falling, park bench", description: "A stunning cherry blossom coloring page.", category: "nature" },
  { slug: "jungle", title: "Jungle Scene", prompt: "a lush jungle with tropical plants, vines, waterfall, monkeys in trees", description: "A wild jungle coloring page.", category: "nature" },
  { slug: "ocean-life", title: "Ocean Life", prompt: "colorful coral reef, tropical fish, starfish, jellyfish, underwater", description: "An underwater ocean life coloring page.", category: "nature" },
  { slug: "volcano", title: "Volcano", prompt: "a volcano erupting with lava, smoke and ash, island with palm trees", description: "A dramatic volcano coloring page.", category: "nature" },
  { slug: "aurora-borealis", title: "Aurora Borealis", prompt: "northern lights dancing in the night sky, snowy landscape below, reindeer", description: "A beautiful aurora borealis coloring page.", category: "nature" },

  // ==================== 食物与甜点 (10) ====================
  { slug: "ice-cream", title: "Ice Cream", prompt: "a giant ice cream sundae with multiple scoops, whipped cream, cherry, sprinkles", description: "A delicious ice cream sundae coloring page.", category: "food" },
  { slug: "pizza", title: "Pizza", prompt: "a large pizza with pepperoni, cheese, mushrooms, olives, a slice pulled away", description: "A mouth-watering pizza coloring page.", category: "food" },
  { slug: "donut", title: "Donut", prompt: "a cute donut with pink frosting and colorful sprinkles, coffee cup next to it", description: "A sweet donut coloring page.", category: "food" },
  { slug: "cupcake", title: "Cupcake", prompt: "a fancy cupcake with swirled frosting, sprinkles, cherry on top, cupcake wrapper", description: "A delightful cupcake coloring page.", category: "food" },
  { slug: "hamburger", title: "Hamburger", prompt: "a juicy hamburger with layers: bun, patty, cheese, lettuce, tomato, onion", description: "A tasty hamburger coloring page.", category: "food" },
  { slug: "hot-dog", title: "Hot Dog", prompt: "a hot dog in a bun with mustard and ketchup, relish and onions", description: "A classic hot dog coloring page.", category: "food" },
  { slug: "fruit-basket", title: "Fruit Basket", prompt: "a basket full of fresh fruits: apples, oranges, bananas, grapes, strawberries", description: "A healthy fruit basket coloring page.", category: "food" },
  { slug: "cake-slice", title: "Cake Slice", prompt: "a slice of layered cake with frosting drips, plate and fork, flowers decoration", description: "A fancy cake slice coloring page.", category: "food" },
  { slug: "candy", title: "Candy Assortment", prompt: "various candies: lollipops, chocolates, hard candies, wrapped treats", description: "A sweet candy assortment coloring page.", category: "food" },
  { slug: "smoothie", title: "Smoothie Drink", prompt: "a tall smoothie glass with fruit, straw, umbrella, tropical style", description: "A refreshing smoothie coloring page.", category: "food" },

  // ==================== 教育 (5) ====================
  { slug: "alphabet", title: "Alphabet Letters", prompt: "ABC letters with cute cartoon animals: A for Apple, B for Bear, C for Cat", description: "Educational alphabet coloring page.", category: "education" },
  { slug: "numbers", title: "Numbers", prompt: "numbers 1 through 10 with corresponding objects to count, cheerful style", description: "Counting numbers coloring page.", category: "education" },
  { slug: "shapes", title: "Basic Shapes", prompt: "basic geometric shapes: circle, square, triangle, star, heart, pentagon", description: "Shapes learning coloring page.", category: "education" },
  { slug: "colors", title: "Rainbow Colors", prompt: "a rainbow, paint palette, crayon box, labeled colors, sun and clouds", description: "Learn colors with rainbow coloring page.", category: "education" },
  { slug: "math-symbols", title: "Math Symbols", prompt: "math symbols: plus, minus, multiply, divide, equals with cute cartoon faces", description: "Fun math symbols coloring page.", category: "education" },
];

/* ============================================================
 * 兼容旧接口 —— 别名（向后兼容）
 * ============================================================ */

/** @deprecated 用 SUBJECTS */
export const THEMES = SUBJECTS;

/** @deprecated 用 Subject */
export type ColoringTheme = Subject;

/** @deprecated 用 getPopularSubjectSlugs —— 保留兼容 */
export const getPopularThemeSlugs = getPopularSubjectSlugs;

/** @deprecated 用 getSubjectsByCategory —— 保留兼容 */
export const getThemesByCategory = getSubjectsByCategory;

/* ============================================================
 * 组合函数
 * ============================================================ */

export interface ColoringEntry {
  /** 完整 slug = "{style}-{subject}-{audience}" */
  slug: string;
  style: Style;
  subject: Subject;
  audience: Audience;
  /** 完整 AI prompt（主体 + 风格 + 受众） */
  fullPrompt: string;
  /** 确定性 seed */
  deterministicSeed: number;
  /** SEO HTML title */
  htmlTitle: string;
  /** 展示标题 */
  displayTitle: string;
  /** SEO meta description */
  metaDescription: string;
  /** 不带 style/audience 的短 slug */
  shortSlug: string;
}

/** 确定性 seed —— hash 算法（Pollinations 要求 1 ~ 2^31-1） */
export function slugToDeterministicSeed(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2_147_483_646 + 1;
}

/** 三重笛卡尔积：style × subject × audience */
export function getAllUSColoringSlugs(): string[] {
  const slugs: string[] = [];
  for (const style of STYLES) {
    for (const subject of SUBJECTS) {
      for (const audience of AUDIENCES) {
        slugs.push(`${style.slug}-${subject.slug}-${audience.slug}`);
      }
    }
  }
  return slugs;
}

/** 全量条目（带完整数据） */
export function getAllColoringEntries(): ColoringEntry[] {
  const entries: ColoringEntry[] = [];
  for (const style of STYLES) {
    for (const subject of SUBJECTS) {
      for (const audience of AUDIENCES) {
        entries.push(buildEntry(subject, style, audience));
      }
    }
  }
  return entries;
}

/** 全局负向约束词 —— 防 AI 幻觉生成文字/签名 */
const PROMPT_NEGATIVE_TAGS = [
  "no watermark",
  "no text",
  "no signature",
  "no logo",
  "pure white borders",
];

/** 构建单个 pSEO 条目 */
export function buildEntry(
  subject: Subject,
  style: Style,
  audience: Audience
): ColoringEntry {
  const slug = `${style.slug}-${subject.slug}-${audience.slug}`;
  const deterministicSeed = slugToDeterministicSeed(slug);
  const displayTitle = `${style.label} ${subject.title} Coloring Page ${audience.label}`;

  return {
    slug,
    style,
    subject,
    audience,
    fullPrompt: [
      subject.prompt,
      style.promptTag,
      audience.promptTag,
      ...PROMPT_NEGATIVE_TAGS,
    ].join(", "),
    deterministicSeed,
    htmlTitle: `Free Printable ${displayTitle} (Instant PDF Download) - wangdadi.xyz`,
    displayTitle,
    metaDescription: `Download free printable ${displayTitle}. Clean black-and-white line art ready for crayons and markers. 100% free, no sign-up required. Instant PDF download.`,
    shortSlug: subject.slug,
  };
}

/**
 * 反向解析 slug → { style, subject, audience }
 * 支持格式：{style}-{subject}-{audience}
 */
export function parseSlug(
  fullSlug: string
): { style: Style; subject: Subject; audience: Audience } | null {
  const lower = fullSlug.toLowerCase();

  // 1. 先匹配 audience 后缀
  for (const audience of AUDIENCES) {
    const audSuffix = `-${audience.slug}`;
    if (!lower.endsWith(audSuffix)) continue;

    const rest = lower.slice(0, -audSuffix.length);

    // 2. 再匹配 style 前缀
    for (const style of STYLES) {
      const stylePrefix = `${style.slug}-`;
      if (!rest.startsWith(stylePrefix)) continue;

      const subjectSlug = rest.slice(stylePrefix.length);
      const subject = SUBJECTS.find((s) => s.slug === subjectSlug);
      if (subject) return { style, subject, audience };
    }
  }

  return null;
}

/** slug → 人类可读英文标题 */
export function slugToTitle(slug: string): string {
  const parsed = parseSlug(slug);
  if (parsed) return buildEntry(parsed.subject, parsed.style, parsed.audience).displayTitle;
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** 按类别分组（用于首页分类展示） */
export function getSubjectsByCategory(): Record<string, Subject[]> {
  const map: Record<string, Subject[]> = {};
  for (const s of SUBJECTS) {
    if (!map[s.category]) map[s.category] = [];
    map[s.category].push(s);
  }
  return map;
}

/**
 * 首页推荐 slug —— 每个类别取前 N 个，
 * 默认用 "cute" 风格 + "for-kids" 受众（搜索量最大）
 */
export function getPopularSubjectSlugs(limitPerCategory = 3): string[] {
  const style = STYLES.find((s) => s.slug === "cute") ?? STYLES[0];
  const audience = AUDIENCES.find((a) => a.slug === "for-kids") ?? AUDIENCES[0];
  const grouped = getSubjectsByCategory();
  const slugs: string[] = [];
  for (const subjects of Object.values(grouped)) {
    for (let i = 0; i < Math.min(limitPerCategory, subjects.length); i++) {
      slugs.push(`${style.slug}-${subjects[i].slug}-${audience.slug}`);
    }
  }
  return slugs;
}

/** 类别元数据（首页卡片用） */
export const CATEGORY_META: Record<SubjectCategory, { label: string; emoji: string }> = {
  holidays: { label: "Holidays", emoji: "🎄" },
  animals: { label: "Animals", emoji: "🐶" },
  vehicles: { label: "Vehicles", emoji: "🚗" },
  fantasy: { label: "Fantasy & Characters", emoji: "🦄" },
  nature: { label: "Nature & Landscapes", emoji: "🌳" },
  food: { label: "Food & Sweets", emoji: "🍕" },
  characters: { label: "Characters", emoji: "⭐" },
  education: { label: "Educational", emoji: "🔤" },
};
