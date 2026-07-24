import type { Category, MajorCategory, Product } from "./types";

export const CATEGORY_EMOJI: Record<Category, string> = {
  삼각김밥: "🍙",
  김밥: "🍣",
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
