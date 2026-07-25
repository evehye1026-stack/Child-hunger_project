import type { Category, Product } from "./types";

// 곁들여 먹기 좋은 단백질 보충 카테고리로만 추천 후보를 제한한다 — 삼각김밥/도시락/면류 같은
// 한 끼 식사류를 "곁들일 메뉴"로 추천하면 어색하므로 제외.
const RECOMMENDATION_CATEGORIES: Category[] = ["닭가슴살", "계란", "두부", "그릭요거트"];

// 2015 한국인 영양소 섭취기준(보건복지부·한국영양학회) 남녀 평균, 하루치의 1/3(한 끼)
const PROTEIN_TARGETS: Array<{ maxAge: number; targetG: number }> = [
  { maxAge: 8, targetG: 9.2 },
  { maxAge: 11, targetG: 13.3 },
  { maxAge: 14, targetG: 17.5 },
  { maxAge: Infinity, targetG: 19.2 },
];

export function getProteinTargetG(age: number): number {
  const band = PROTEIN_TARGETS.find((b) => age <= b.maxAge);
  return band ? band.targetG : PROTEIN_TARGETS[PROTEIN_TARGETS.length - 1].targetG;
}

const SODIUM_LIMIT_MG = 500;

// 제조사명에 영문 3글자 이상 연속 포함 시 수입산으로 추정해 후보에서 제외
function isLikelyImported(manufacturer: string): boolean {
  return /[A-Za-z]{3,}/.test(manufacturer);
}

function supplementScore(p: Product): number {
  return p.proteinG - p.sodiumMg / 300;
}

// 카테고리별 최고점 하나씩만 뽑아 그중에서 무작위로 고른다. supplementScore를 전체
// 후보에서 그냥 top5 뽑으면 단백질 절대량이 높은 닭가슴살류가 항상 이겨서 두부/그릭요거트
// 같은 카테고리는 사실상 추천에 뽑힐 일이 없다 — 카테고리마다 기회를 준다.
function pickDiverseRecommendation(candidates: Product[]): Product {
  const bestByCategory = new Map<string, Product>();
  for (const p of candidates) {
    const current = bestByCategory.get(p.category);
    if (!current || supplementScore(p) > supplementScore(current)) {
      bestByCategory.set(p.category, p);
    }
  }
  const pool = [...bestByCategory.values()];
  return pool[Math.floor(Math.random() * pool.length)];
}

export type ProteinEvaluation = {
  targetG: number;
  deficitG: number;
  sufficient: boolean;
  recommendation: Product | null;
};

export function evaluateProtein(
  product: Product,
  age: number,
  allProducts: Product[]
): ProteinEvaluation {
  const targetG = getProteinTargetG(age);
  const deficitG = Math.max(0, targetG - product.proteinG);
  const sufficient = deficitG <= 0;

  if (sufficient) {
    return { targetG, deficitG: 0, sufficient, recommendation: null };
  }

  const candidates = allProducts
    .filter((p) => RECOMMENDATION_CATEGORIES.includes(p.category))
    .filter((p) => p.sodiumMg <= SODIUM_LIMIT_MG)
    .filter((p) => !isLikelyImported(p.manufacturer));

  if (candidates.length === 0) {
    return { targetG, deficitG, sufficient, recommendation: null };
  }

  const pick = pickDiverseRecommendation(candidates);

  return { targetG, deficitG, sufficient, recommendation: pick };
}

export type SodiumEvaluation = {
  percentile: number;
  message: string | null;
};

// 같은 카테고리 안에서의 상대 순위(백분위) — 절대 기준과 비교하지 않음
// product/categoryProducts는 Product 전체가 아니라 필요한 필드만 요구한다 —
// 원본 식약처 DB(298,271건)에서 매칭된 상품은 category가 255개 쪽 Category
// union이 아니라 식품중분류명(자유 문자열)이라 Product 타입을 그대로 못 쓴다.
export function evaluateSodium(
  product: { sodiumMg: number; category: string },
  categoryProducts: { sodiumMg: number }[]
): SodiumEvaluation {
  const total = categoryProducts.length;
  const lowerCount = categoryProducts.filter(
    (p) => p.sodiumMg < product.sodiumMg
  ).length;
  const percentile = total > 0 ? lowerCount / total : 0;

  let message: string | null = null;
  if (percentile >= 0.7) {
    message = `'${product.category}' 중에서는 나트륨이 짠 편이에요 → 같은 카테고리에서 더 싱거운 것도 있어요`;
  } else if (percentile <= 0.3) {
    message = `'${product.category}' 중에서는 나트륨이 낮은 편이에요 👍`;
  }

  return { percentile, message };
}

export type CarbEvaluation = {
  ratioPercent: number;
  message: string;
};

// 그 음식 자체의 에너지 구성 비율(AMDR 50~65%) — 한 끼 전체 대비 절대량으로 비교하지 않음
export function evaluateCarb(product: Product): CarbEvaluation {
  const ratio = (product.carbG * 4) / Math.max(product.energyKcal, 1);
  const ratioPercent = Math.round(ratio * 100);

  let message: string;
  if (ratio > 0.65) {
    message = `탄수화물 비중 ${ratioPercent}% → 탄수화물 위주예요, 계란/우유 같은 단백질을 곁들이면 좋아요`;
  } else if (ratio < 0.5) {
    message = `탄수화물 비중 ${ratioPercent}% → 탄수화물(에너지원)이 적은 편, 밥/빵류를 더해도 좋아요`;
  } else {
    message = `탄수화물 비중 ${ratioPercent}% → 균형이 잘 맞아요 👍`;
  }

  return { ratioPercent, message };
}
