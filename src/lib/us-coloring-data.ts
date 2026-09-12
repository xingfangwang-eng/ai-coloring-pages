/**
 * 北美市场着色页长尾词库 (us-coloring-data.ts)
 *
 * 目标：覆盖美国家长、K12 老师的高搜索意图关键词，
 *       通过 slug × 受众后缀矩阵组合生成 100+ 条 pSEO 落地页。
 *
 * 数据结构：
 *   - THEMES: 20+ 核心主题（节日、流行文化、自然、教育…）
 *   - AUDIENCES: 3 档受众（粗线条 for-toddlers / 标准 for-kids / 细致 for-adults）
 *   - 每个 slug 携带：英文 prompt（用于 AI 生成线稿）、title、meta 字段
 */

export interface ColoringTheme {
  /** URL slug 片段（kebab-case） */
  slug: string;
  /** 主题类别 —— 用于首页分类标签 */
  category:
    | "holidays"
    | "cartoons"
    | "animals"
    | "nature"
    | "vehicles"
    | "fantasy"
    | "education"
    | "food";
  /** AI 生成时的英文 prompt 主体（不含受众后缀） */
  prompt: string;
  /** 人类可读标题 */
  title: string;
  /** 英文描述（用于 SEO meta） */
  description: string;
  /** 建议 seed 偏移 —— 确保 pSEO 页确定性输出 */
  seedBase: number;
}

/** 三档目标受众（北美家庭搜索习惯） */
export interface Audience {
  slug: string;           // e.g. "for-toddlers"
  label: string;          // e.g. "for Toddlers"
  complexity: "kids" | "adults";
  /** 粗线/细线提示 —— 传给 AI 的额外 prompt tag */
  promptTag: string;
}

export const AUDIENCES: Audience[] = [
  {
    slug: "for-toddlers",
    label: "for Toddlers",
    complexity: "kids",
    promptTag: "extra thick bold outlines, simple shapes, large easy-to-color areas",
  },
  {
    slug: "for-kids",
    label: "for Kids",
    complexity: "kids",
    promptTag: "clean outlines, fun cartoon details, medium line weight",
  },
  {
    slug: "for-adults",
    label: "for Adults",
    complexity: "adults",
    promptTag: "intricate detailed line art, fine precise outlines, decorative patterns",
  },
];

/* ============================================================
 * 核心主题库 —— 覆盖北美高搜索意图
 * ============================================================ */

export const THEMES: ColoringTheme[] = [
  // ---------- 节日（北美 Top 5 大节日） ----------
  {
    slug: "thanksgiving-turkey",
    category: "holidays",
    prompt: "a happy cartoon turkey wearing a pilgrim hat, surrounded by fall leaves and pumpkins",
    title: "Thanksgiving Turkey",
    description: "A cheerful Thanksgiving turkey coloring page with pilgrim hat and autumn decorations.",
    seedBase: 1001,
  },
  {
    slug: "halloween-spooky-pumpkin",
    category: "holidays",
    prompt: "a spooky jack-o-lantern pumpkin with a mischievous grin, bats and haunted trees in the background",
    title: "Halloween Spooky Pumpkin",
    description: "A fun spooky jack-o-lantern coloring page perfect for Halloween parties and classroom activities.",
    seedBase: 1002,
  },
  {
    slug: "fourth-of-july-fireworks",
    category: "holidays",
    prompt: "a patriotic bald eagle with American flag, fireworks exploding in the night sky, Statue of Liberty silhouette",
    title: "4th of July Fireworks",
    description: "Celebrate Independence Day with this patriotic eagle, flag, and fireworks coloring sheet.",
    seedBase: 1003,
  },
  {
    slug: "christmas-santa",
    category: "holidays",
    prompt: "Santa Claus in his red suit carrying a sack of presents, reindeer and snowy Christmas tree in the background",
    title: "Christmas Santa",
    description: "Santa Claus with gift sack, reindeer, and Christmas tree — a classic holiday coloring page.",
    seedBase: 1004,
  },
  {
    slug: "easter-bunny",
    category: "holidays",
    prompt: "a cute Easter bunny holding a basket of decorated eggs, spring flowers and grass",
    title: "Easter Bunny",
    description: "A fluffy Easter bunny with decorated eggs and spring flowers coloring sheet.",
    seedBase: 1005,
  },
  {
    slug: "valentines-heart",
    category: "holidays",
    prompt: "a big heart-shaped box of chocolates, rose bouquet and Cupid with a bow",
    title: "Valentine's Heart",
    description: "Romantic Valentine coloring page with heart, Cupid, roses and chocolate.",
    seedBase: 1006,
  },
  {
    slug: "mardi-gras-mask",
    category: "holidays",
    prompt: "an ornate Mardi Gras mask with feathers and beads, purple green and gold festive decorations",
    title: "Mardi Gras Mask",
    description: "An ornate Mardi Gras mask coloring page with feathers and festive details.",
    seedBase: 1007,
  },
  {
    slug: "st-patricks-leprechaun",
    category: "holidays",
    prompt: "a tiny leprechaun with a red beard and green suit, holding a pot of gold at the end of a rainbow",
    title: "St. Patrick's Leprechaun",
    description: "A lucky leprechaun with pot of gold and rainbow — perfect for St. Patrick's Day.",
    seedBase: 1008,
  },

  // ---------- 流行文化 / 儿童最爱 ----------
  {
    slug: "cute-baby-yoda-style",
    category: "cartoons",
    prompt: "a cute big-eared green baby alien character with a robe, holding a tiny silver ball",
    title: "Cute Baby Alien",
    description: "An adorable baby alien character inspired by a famous galaxy far far away.",
    seedBase: 2001,
  },
  {
    slug: "friendly-t-rex-dinosaur",
    category: "cartoons",
    prompt: "a friendly smiling T-Rex dinosaur wearing a hat, surrounded by ferns and prehistoric plants",
    title: "Friendly T-Rex Dinosaur",
    description: "A cheerful T-Rex dinosaur coloring page — no teeth, just smiles!",
    seedBase: 2002,
  },
  {
    slug: "magical-unicorn-princess",
    category: "cartoons",
    prompt: "a beautiful unicorn with a flowing mane of stars and sparkles, standing in a magical rainbow forest",
    title: "Magical Unicorn Princess",
    description: "A majestic unicorn princess with starry mane in an enchanted forest setting.",
    seedBase: 2003,
  },
  {
    slug: "astronaut-pizza-space",
    category: "cartoons",
    prompt: "a silly astronaut floating in space holding a giant pizza slice, planets and a crescent moon in background",
    title: "Astronaut Pizza Space",
    description: "A fun astronaut floating with pizza among the planets and stars.",
    seedBase: 2004,
  },
  {
    slug: "monster-truck-jump",
    category: "cartoons",
    prompt: "a big monster truck with oversized wheels jumping over a pile of cars, ramps and crowd silhouette",
    title: "Monster Truck Jump",
    description: "An exciting monster truck mid-air jump coloring page with spectators.",
    seedBase: 2005,
  },
  {
    slug: "disney-style-castle",
    category: "fantasy",
    prompt: "a fairy tale castle with tall towers and flags, a princess waving from the balcony, swans in the moat",
    title: "Fairy Tale Castle",
    description: "A magical fairy tale castle with princess and swans in the moat.",
    seedBase: 2006,
  },
  {
    slug: "cute-puppy-dog",
    category: "animals",
    prompt: "an adorable puppy dog with floppy ears sitting on a rug, wagging tail and happy eyes",
    title: "Cute Puppy Dog",
    description: "A sweet puppy dog coloring page — perfect for little animal lovers.",
    seedBase: 2007,
  },
  {
    slug: "fluffy-kitten",
    category: "animals",
    prompt: "a fluffy kitten playing with a ball of yarn, on top of a cushion with paw prints around",
    title: "Fluffy Kitten",
    description: "An ultra-cute kitten playing with yarn — cat lovers will adore this one.",
    seedBase: 2008,
  },

  // ---------- 动物世界 ----------
  {
    slug: "jungle-lion-king",
    category: "animals",
    prompt: "a majestic lion king with a full mane, sitting proudly on a rock in the African savanna",
    title: "Jungle Lion King",
    description: "A regal lion king sitting on his savanna rock throne.",
    seedBase: 3001,
  },
  {
    slug: "ocean-whale",
    category: "animals",
    prompt: "a gentle giant humpback whale swimming in the ocean, surrounded by small fish and bubbles",
    title: "Ocean Whale",
    description: "A beautiful humpback whale with fish friends — under the sea adventure.",
    seedBase: 3002,
  },
  {
    slug: "forest-fox",
    category: "animals",
    prompt: "a sly red fox with a bushy tail, standing in an autumn forest with fallen leaves and mushrooms",
    title: "Forest Fox",
    description: "A clever red fox exploring an autumn forest full of leaves and mushrooms.",
    seedBase: 3003,
  },
  {
    slug: "butterfly-garden",
    category: "animals",
    prompt: "a monarch butterfly with detailed wing patterns, hovering over a flower garden with tulips and daisies",
    title: "Butterfly Garden",
    description: "A beautifully detailed butterfly in a flower garden — great for both kids and adults.",
    seedBase: 3004,
  },
  {
    slug: "farm-horse",
    category: "animals",
    prompt: "a brown horse with a white mane, standing in front of a red barn with hay bales",
    title: "Farm Horse",
    description: "A friendly farm horse in front of a classic red barn.",
    seedBase: 3005,
  },
  {
    slug: "polar-bear-igloo",
    category: "animals",
    prompt: "a polar bear with its cub standing next to an igloo, northern lights (aurora) dancing in the sky",
    title: "Polar Bear Igloo",
    description: "A polar bear family with igloo and aurora borealis — cold and cozy!",
    seedBase: 3006,
  },
  {
    slug: "underwater-turtle",
    category: "animals",
    prompt: "a sea turtle with a detailed shell swimming among coral reef and tropical fish",
    title: "Underwater Sea Turtle",
    description: "A graceful sea turtle exploring a colorful coral reef.",
    seedBase: 3007,
  },
  {
    slug: "squirrel-acorn",
    category: "animals",
    prompt: "a cheerful squirrel holding a big acorn, sitting on an oak tree branch with leaves",
    title: "Squirrel with Acorn",
    description: "A happy squirrel gathering acorns for winter.",
    seedBase: 3008,
  },

  // ---------- 自然 / 风景 ----------
  {
    slug: "mountain-landscape",
    category: "nature",
    prompt: "a majestic mountain landscape with snow-capped peaks, pine forests, a winding river and sun",
    title: "Mountain Landscape",
    description: "A scenic mountain landscape with snow peaks, pines and a river.",
    seedBase: 4001,
  },
  {
    slug: "sunset-beach",
    category: "nature",
    prompt: "a tranquil beach at sunset with palm trees, gentle waves, seashells on the sand",
    title: "Sunset Beach",
    description: "A peaceful beach sunset with palm trees and seashells.",
    seedBase: 4002,
  },
  {
    slug: "cherry-blossom-tree",
    category: "nature",
    prompt: "a beautiful cherry blossom tree full of flowers, petals falling, a park bench underneath",
    title: "Cherry Blossom Tree",
    description: "A stunning cherry blossom tree with petals falling in a peaceful park.",
    seedBase: 4003,
  },
  {
    slug: "camping-adventure",
    category: "nature",
    prompt: "a cozy tent pitched in the woods, campfire with flames, backpack and stars above",
    title: "Camping Adventure",
    description: "A fun camping scene with tent, campfire and starry sky.",
    seedBase: 4004,
  },
  {
    slug: "rainforest-parrot",
    category: "nature",
    prompt: "a colorful macaw parrot perched on a tropical tree branch, jungle leaves and flowers around",
    title: "Rainforest Parrot",
    description: "A vibrant tropical parrot in the lush rainforest.",
    seedBase: 4005,
  },
  {
    slug: "desert-cactus",
    category: "nature",
    prompt: "a tall saguaro cactus with flowers, desert landscape with mountains, roadrunner bird",
    title: "Desert Cactus",
    description: "An Arizona desert scene with saguaro cactus and roadrunner.",
    seedBase: 4006,
  },

  // ---------- 交通工具 ----------
  {
    slug: "police-car",
    category: "vehicles",
    prompt: "a friendly cartoon police car with smiling face, sirens flashing, neighborhood background",
    title: "Police Car",
    description: "A cheerful police car coloring page — safe and friendly.",
    seedBase: 5001,
  },
  {
    slug: "fire-truck",
    category: "vehicles",
    prompt: "a big red fire truck with extendable ladder, firefighter waving, fire station in background",
    title: "Fire Truck",
    description: "A classic red fire truck with firefighter hero — community helper series.",
    seedBase: 5002,
  },
  {
    slug: "school-bus",
    category: "vehicles",
    prompt: "a bright yellow school bus full of smiling kids, school building and trees behind",
    title: "School Bus",
    description: "The iconic yellow school bus heading to school with happy kids.",
    seedBase: 5003,
  },
  {
    slug: "train-steam-engine",
    category: "vehicles",
    prompt: "an old-fashioned steam train with smoke, crossing a bridge over a river, countryside",
    title: "Steam Engine Train",
    description: "A classic steam train chugging across a countryside bridge.",
    seedBase: 5004,
  },
  {
    slug: "airplane-clouds",
    category: "vehicles",
    prompt: "a commercial jet airplane flying through fluffy clouds, sun and birds around",
    title: "Airplane in Clouds",
    description: "A passenger jet cruising through soft cloud formations.",
    seedBase: 5005,
  },
  {
    slug: "bicycle-kids",
    category: "vehicles",
    prompt: "a child's bicycle with training wheels, balloon tied to handlebar, driveway scene",
    title: "Kid's Bicycle",
    description: "A cute kid's bicycle with training wheels — learning to ride!",
    seedBase: 5006,
  },
  {
    slug: "spaceship-rocket",
    category: "vehicles",
    prompt: "a cartoon rocket ship launching into space, flames and smoke, planets and stars",
    title: "Spaceship Rocket",
    description: "A playful cartoon rocket blasting off into the starry sky.",
    seedBase: 5007,
  },
  {
    slug: "tractor-farm",
    category: "vehicles",
    prompt: "a red farm tractor working in a field, hay bales and farmhouse in distance",
    title: "Farm Tractor",
    description: "A hardworking farm tractor in the golden fields.",
    seedBase: 5008,
  },

  // ---------- 幻想 / 魔法 ----------
  {
    slug: "mermaid-underwater",
    category: "fantasy",
    prompt: "a beautiful mermaid with flowing hair sitting on a rock, surrounded by fish, shells and seahorses",
    title: "Mermaid Underwater",
    description: "A graceful mermaid with fish friends in an underwater kingdom.",
    seedBase: 6001,
  },
  {
    slug: "dragon-fantasy",
    category: "fantasy",
    prompt: "a magnificent fantasy dragon with spread wings, breathing gentle smoke, mountain lair",
    title: "Fantasy Dragon",
    description: "A majestic fantasy dragon guarding its mountain lair.",
    seedBase: 6002,
  },
  {
    slug: "fairy-garden",
    category: "fantasy",
    prompt: "a tiny winged fairy sitting on a mushroom cap, magical flowers, dewdrops and butterflies",
    title: "Fairy Garden",
    description: "An enchanted fairy garden with mushrooms, flowers and sparkles.",
    seedBase: 6003,
  },
  {
    slug: "wizard-castle",
    category: "fantasy",
    prompt: "a wizard with a long beard and pointy hat, holding a glowing wand, mystical castle behind",
    title: "Wizard and Castle",
    description: "A wise wizard casting magic spells by his ancient castle.",
    seedBase: 6004,
  },
  {
    slug: "pegasus-flying",
    category: "fantasy",
    prompt: "a winged pegasus horse flying through clouds, stars twinkling, rainbow trail",
    title: "Flying Pegasus",
    description: "A magical pegasus with wings soaring through starry clouds.",
    seedBase: 6005,
  },
  {
    slug: "magical-bookshelf",
    category: "fantasy",
    prompt: "an enchanted bookshelf with floating books, glowing candles, a cat sleeping on top",
    title: "Magical Bookshelf",
    description: "A cozy magical bookshelf with floating books and candles.",
    seedBase: 6006,
  },

  // ---------- 教育 / 字母数字 ----------
  {
    slug: "alphabet-animals",
    category: "education",
    prompt: "ABC letters with cartoon animals: A for Apple, B for Bear, C for Cat, D for Dog",
    title: "Alphabet Animals",
    description: "Learn ABC with cute animal friends — preschool educational coloring.",
    seedBase: 7001,
  },
  {
    slug: "numbers-train",
    category: "education",
    prompt: "a number train with cars labeled 1 through 10, each carrying small objects to count",
    title: "Numbers Train",
    description: "Count from 1 to 10 with this cheerful number train.",
    seedBase: 7002,
  },
  {
    slug: "shapes-circle-square",
    category: "education",
    prompt: "basic shapes — circle, square, triangle, star, heart — each with a cute face and examples",
    title: "Shapes Learning",
    description: "Learn basic shapes with smiling faces — geometry for toddlers.",
    seedBase: 7003,
  },
  {
    slug: "colors-rainbow",
    category: "education",
    prompt: "a rainbow with labeled colors, paint palette, crayon box, sun and clouds",
    title: "Colors Rainbow",
    description: "A colorful rainbow with paint palette and crayons — learn colors!",
    seedBase: 7004,
  },

  // ---------- 食物 / 甜点 ----------
  {
    slug: "ice-cream-sundae",
    category: "food",
    prompt: "a giant ice cream sundae with multiple scoops, whipped cream, cherry on top, sprinkles",
    title: "Ice Cream Sundae",
    description: "A delicious over-the-top ice cream sundae — yum!",
    seedBase: 8001,
  },
  {
    slug: "pizza-slice",
    category: "food",
    prompt: "a large pizza with pepperoni, cheese, mushrooms, olives, a slice being pulled away",
    title: "Pizza Slice",
    description: "A mouth-watering pizza with all your favorite toppings.",
    seedBase: 8002,
  },
  {
    slug: "birthday-cake",
    category: "food",
    prompt: "a three-layer birthday cake with candles, balloons and presents around it",
    title: "Birthday Cake",
    description: "A festive three-layer birthday cake with glowing candles and balloons.",
    seedBase: 8003,
  },
  {
    slug: "donut-sprinkle",
    category: "food",
    prompt: "a cute donut with pink frosting and colorful sprinkles, coffee cup next to it",
    title: "Donut with Sprinkles",
    description: "A sweet donut with frosting and sprinkles — bakery fun!",
    seedBase: 8004,
  },
  {
    slug: "apple-orange-fruit",
    category: "food",
    prompt: "a basket of fresh fruits — apples, oranges, bananas, grapes, strawberries",
    title: "Fruit Basket",
    description: "A healthy fruit basket full of colorful goodies.",
    seedBase: 8005,
  },
];

/* ============================================================
 * 组合函数
 * ============================================================ */

/** 单个 pSEO 完整条目（theme + audience 组合） */
export interface ColoringEntry {
  /** 最终 slug = "theme-slug-for-audience" */
  slug: string;
  /** 基础主题信息 */
  theme: ColoringTheme;
  /** 目标受众 */
  audience: Audience;
  /** 完整 AI prompt */
  fullPrompt: string;
  /** 确定性 seed —— 保证同一 slug 每次生成同一张线稿 */
  deterministicSeed: number;
  /** HTML title（SEO 优化版） */
  htmlTitle: string;
  /** 人类可读展示标题 */
  displayTitle: string;
  /** SEO description */
  metaDescription: string;
  /** 建议文件 slug（不带受众后缀的短 slug） */
  shortSlug: string;
}

/** 将 slug 拆回 theme + audience 组件 */
export function parseSlug(fullSlug: string): { theme: ColoringTheme; audience: Audience } | null {
  const lower = fullSlug.toLowerCase();

  // 尝试匹配每个 audience 后缀
  for (const aud of AUDIENCES) {
    const suffix = `-${aud.slug}`;
    if (lower.endsWith(suffix)) {
      const themeSlug = lower.slice(0, -suffix.length);
      const theme = THEMES.find((t) => t.slug === themeSlug);
      if (theme) return { theme, audience: aud };
    }
  }
  return null;
}

/**
 * 基于 slug 生成确定性 seed（hash 算法）
 * 相同 slug → 相同 seed → Pollinations 返回相同图片
 */
export function slugToDeterministicSeed(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  // Pollinations seed 范围: 1 ~ 2^31-1
  return Math.abs(hash) % 2_147_483_646 + 1;
}

/** 组合一个 theme + audience 为完整条目 */
export function buildEntry(theme: ColoringTheme, audience: Audience): ColoringEntry {
  const slug = `${theme.slug}-${audience.slug}`;
  const deterministicSeed = slugToDeterministicSeed(slug);

  return {
    slug,
    theme,
    audience,
    fullPrompt: `${theme.prompt}, ${audience.promptTag}`,
    deterministicSeed,
    htmlTitle: `Free Printable ${theme.title} Coloring Page ${audience.label} (Instant PDF Download) - wangdadi.xyz`,
    displayTitle: `${theme.title} Coloring Page ${audience.label}`,
    metaDescription: `Download free printable ${theme.title} coloring page ${audience.label}. Clean black-and-white line art ready for crayons and markers. 100% free, no sign-up required. Instant PDF download.`,
    shortSlug: theme.slug,
  };
}

/** 获取全量 100+ 条 pSEO slugs */
export function getAllUSColoringSlugs(): string[] {
  return THEMES.flatMap((theme) =>
    AUDIENCES.map((aud) => `${theme.slug}-${aud.slug}`)
  );
}

/** 全量条目（带完整数据） */
export function getAllColoringEntries(): ColoringEntry[] {
  return THEMES.flatMap((theme) => AUDIENCES.map((aud) => buildEntry(theme, aud)));
}

/** 按类别分组（用于首页推荐流） */
export function getThemesByCategory(): Record<string, ColoringTheme[]> {
  const map: Record<string, ColoringTheme[]> = {};
  for (const t of THEMES) {
    if (!map[t.category]) map[t.category] = [];
    map[t.category].push(t);
  }
  return map;
}

/**
 * 将 slug 转为地道英文标题
 *   e.g. "cute-baby-yoda-style-for-toddlers" → "Cute Baby Alien Coloring Page for Toddlers"
 */
export function slugToTitle(slug: string): string {
  const parsed = parseSlug(slug);
  if (parsed) {
    return buildEntry(parsed.theme, parsed.audience).displayTitle;
  }
  // 兜底：简单 camel-case + title-case
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** 首页推荐用 —— 每个类别的代表 slug 数量 */
export function getPopularThemeSlugs(limitPerCategory = 3): string[] {
  const grouped = getThemesByCategory();
  const slugs: string[] = [];
  for (const [, themes] of Object.entries(grouped)) {
    for (let i = 0; i < Math.min(limitPerCategory, themes.length); i++) {
      // 默认给 for-kids 后缀 —— 最通用
      slugs.push(`${themes[i].slug}-for-kids`);
    }
  }
  return slugs;
}
