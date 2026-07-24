import type { Category, MajorCategory, Product } from "./types";

export const CATEGORY_EMOJI: Record<Category, string> = {
  삼각김밥: "🍙",
  김밥: "/icons/kimbap.png",
  샌드위치: "🥪",
  도시락: "🍱",
  "밥류(컵밥/덮밥/볶음밥)": "🍚",
  만두: "🥟",
  면류: "🍜",
  "빵(식사대용)": "🥐",
  "국/탕(즉석국)": "🍲",
  계란: "🥚",
  "우유/두유": "🥛",
  닭가슴살: "🍗",
  두부: "🧊",
  치즈: "🧀",
  그릭요거트: "🍶",
};

// 상품 카드 좌측 큰 아이콘 전용: 상품명 속 주요 재료 키워드로 아이콘을 정하고,
// 매치되는 게 없으면 카테고리 아이콘(CATEGORY_EMOJI)으로 대체한다.
// 주의: 상품명 아래의 하위카테고리 배지는 CATEGORY_EMOJI를 직접 쓰므로 이 함수와 무관하다.
const INGREDIENT_EMOJI_RULES: Array<{ pattern: RegExp; emoji: string }> = [
  { pattern: /(치킨|닭)/, emoji: "🍗" },
  { pattern: /돼지/, emoji: "🐖" },
  { pattern: /(돈육|베이컨)/, emoji: "🥓" },
  {
    pattern:
      /(한돈|소고기|한우|고기|스테이크|갈비|돈불|우육|제육|(?<!소이)미트|순대|설렁|장터|내장)/,
    emoji: "🥩",
  },
  { pattern: /치즈/, emoji: "🧀" },
  { pattern: /두유/, emoji: "🫘" },
  { pattern: /참치/, emoji: "🐟" },
  { pattern: /(계란|에그)/, emoji: "🥚" },
  { pattern: /(야채|콩나물|크래미)/, emoji: "🥬" },
  { pattern: /(새우|해산물)/, emoji: "🦐" },
  { pattern: /떡/, emoji: "🍡" },
  { pattern: /(핫도그|햄|소시지)/, emoji: "/icons/sausage.png" },
  { pattern: /카레/, emoji: "🍛" },
  { pattern: /감자/, emoji: "🥔" },
  { pattern: /소이미트/, emoji: "🌱" },
  { pattern: /멘츠까스/, emoji: "🍖" },
  { pattern: /오리(?!지널|엔탈)/, emoji: "🦆" },
  { pattern: /낙지/, emoji: "/icons/nakji.png" },
  { pattern: /대게/, emoji: "🦀" },
  { pattern: /김치/, emoji: "/icons/kimchi.png" },
  { pattern: /(버섯|양송이|쉬림프)/, emoji: "/icons/mushroom.png" },
  { pattern: /(파스타|스파게티)/, emoji: "🍝" },
  { pattern: /(딸기|블루베리|스트로베리|바나나)/, emoji: "/icons/fruits.png" },
  { pattern: /(땡초|고추)/, emoji: "🌶️" },
  { pattern: /오징어/, emoji: "/icons/squid.png" },
  {
    pattern: /(장어|전복|복국|알(?!찬)|황태)/,
    emoji: "/icons/seafood.png",
  },
];

// 특정 상품명은 일반 키워드 규칙보다 먼저 이 아이콘으로 고정한다
const PRODUCT_NAME_EMOJI_OVERRIDES: Record<string, string> = {
  "마루산 두유 바나나맛": "/icons/fruits.png",
  "Allfresh하루과일도시락": "/icons/fruits.png",
  "에어로-블루베리크림치즈샌드위치": "/icons/fruits.png",
};

export function getIngredientEmoji(name: string, fallbackEmoji: string): string {
  if (PRODUCT_NAME_EMOJI_OVERRIDES[name]) {
    return PRODUCT_NAME_EMOJI_OVERRIDES[name];
  }
  for (const rule of INGREDIENT_EMOJI_RULES) {
    if (rule.pattern.test(name)) return rule.emoji;
  }
  return fallbackEmoji;
}

export function getCategoryList(products: Product[]): Category[] {
  const seen = new Set<Category>();
  const ordered: Category[] = [];
  for (const p of products) {
    if (!seen.has(p.category)) {
      seen.add(p.category);
      ordered.push(p.category);
    }
  }
  return ordered;
}

export function getProductsByCategory(
  products: Product[],
  category: Category
): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductById(
  products: Product[],
  id: string
): Product | undefined {
  return products.find((p) => p.id === id);
}

// 세부 15종 카테고리를 6개 대분류로 묶는다 (탭/필터 UI 전용 — 세부 카테고리 데이터 자체는 그대로 유지)
export const MAJOR_CATEGORY_EMOJI: Record<MajorCategory, string> = {
  밥류: "🍚",
  "분식·면류": "🍜",
  "빵·샌드위치": "🥐",
  단백질간식: "💪",
  국물요리: "🍲",
  "유제품·음료": "🥛",
};

const CATEGORY_TO_MAJOR: Record<Category, MajorCategory> = {
  삼각김밥: "밥류",
  김밥: "밥류",
  도시락: "밥류",
  "밥류(컵밥/덮밥/볶음밥)": "밥류",
  만두: "분식·면류",
  면류: "분식·면류",
  "빵(식사대용)": "빵·샌드위치",
  샌드위치: "빵·샌드위치",
  계란: "단백질간식",
  닭가슴살: "단백질간식",
  두부: "단백질간식",
  "국/탕(즉석국)": "국물요리",
  "우유/두유": "유제품·음료",
  치즈: "유제품·음료",
  그릭요거트: "유제품·음료",
};

const MAJOR_CATEGORY_ORDER: MajorCategory[] = [
  "밥류",
  "분식·면류",
  "빵·샌드위치",
  "단백질간식",
  "국물요리",
  "유제품·음료",
];

export function getMajorCategory(category: Category): MajorCategory {
  return CATEGORY_TO_MAJOR[category];
}

export function getMajorCategoryList(products: Product[]): MajorCategory[] {
  const present = new Set(products.map((p) => getMajorCategory(p.category)));
  return MAJOR_CATEGORY_ORDER.filter((m) => present.has(m));
}

export function getProductsByMajorCategory(
  products: Product[],
  major: MajorCategory
): Product[] {
  return products.filter((p) => getMajorCategory(p.category) === major);
}
