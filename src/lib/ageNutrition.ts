import type { Product } from "./types";

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

  // 주의: 추천 후보를 특정 카테고리로 제한하지 말 것 — 전체 상품에서 나트륨 기준으로만 거른다
  const candidates = allProducts
    .filter((p) => p.sodiumMg <= SODIUM_LIMIT_MG)
    .filter((p) => !isLikelyImported(p.manufacturer));

  if (candidates.length === 0) {
    return { targetG, deficitG, sufficient, recommendation: null };
  }

  const ranked = [...candidates].sort(
    (a, b) => supplementScore(b) - supplementScore(a)
  );
  const top5 = ranked.slice(0, 5);
  const pick = top5[Math.floor(Math.random() * top5.length)];

  return { targetG, deficitG, sufficient, recommendation: pick };
}

export type SodiumEvaluation = {
  percentile: number;
  message: string | null;
};

// 같은 카테고리 안에서의 상대 순위(백분위) — 절대 기준과 비교하지 않음
export function evaluateSodium(
  product: Product,
  categoryProducts: Product[]
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
