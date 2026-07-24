import type { Category, NutrientLevel, Product } from "./types";

// PRD 3.3 영양점수 = w1*(단백질/기준값) + w2*(1 - 나트륨/기준값) + w3*(탄수화물 적정성)
const PROTEIN_REF_G = 15;
const SODIUM_REF_MG = 800;
const IDEAL_CARB_G = 45;
const W_PROTEIN = 0.5;
const W_SODIUM = 0.3;
const W_CARB = 0.2;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function nutritionScore(p: Product): number {
  const proteinScore = clamp01(p.proteinG / PROTEIN_REF_G);
  const sodiumScore = clamp01(1 - p.sodiumMg / SODIUM_REF_MG);
  const carbAdequacy = clamp01(1 - Math.abs(p.carbG - IDEAL_CARB_G) / IDEAL_CARB_G);
  return W_PROTEIN * proteinScore + W_SODIUM * sodiumScore + W_CARB * carbAdequacy;
}

export function bestPickId(products: Product[]): string {
  return products.reduce((best, p) =>
    nutritionScore(p) > nutritionScore(best) ? p : best
  ).id;
}

export function getTodaysPickId(products: Product[], category: Category): string {
  return bestPickId(products.filter((p) => p.category === category));
}

export function getOverallTodaysPickId(products: Product[]): string {
  return products.reduce((best, p) =>
    nutritionScore(p) > nutritionScore(best) ? p : best
  ).id;
}

export function proteinLevel(p: Product): NutrientLevel {
  if (p.proteinG < 5) return 1;
  if (p.proteinG < 10) return 2;
  return 3;
}

export function carbLevel(p: Product): NutrientLevel {
  if (p.carbG < 20) return 1;
  if (p.carbG < 45) return 2;
  return 3;
}

export function fatLevel(p: Product): NutrientLevel {
  if (p.fatG < 5) return 1;
  if (p.fatG < 12) return 2;
  return 3;
}

export function sodiumLevel(p: Product): NutrientLevel {
  if (p.sodiumMg < 300) return 1;
  if (p.sodiumMg < 700) return 2;
  return 3;
}

export type ComboAdvice = {
  message: string;
  showCombo: boolean;
};

export function getComboAdvice(p: Product): ComboAdvice {
  const level = proteinLevel(p);
  if (level === 1) {
    return { message: "단백질이 조금 부족해요", showCombo: true };
  }
  if (level === 2) {
    return { message: "단백질이 적당해요", showCombo: false };
  }
  return { message: "단백질이 충분해요!", showCombo: false };
}

export type MealTotals = {
  energyKcal: number;
  carbG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
};

export function sumProducts(products: Product[]): MealTotals {
  return products.reduce(
    (acc, p) => ({
      energyKcal: acc.energyKcal + p.energyKcal,
      carbG: acc.carbG + p.carbG,
      proteinG: acc.proteinG + p.proteinG,
      fatG: acc.fatG + p.fatG,
      sodiumMg: acc.sodiumMg + p.sodiumMg,
    }),
    { energyKcal: 0, carbG: 0, proteinG: 0, fatG: 0, sodiumMg: 0 }
  );
}

// PRD 3.3 영양점수 로직을 조합(여러 상품 합산) 단위로 재사용
export function getMealFeedback(totals: MealTotals): string {
  const proteinScore = clamp01(totals.proteinG / PROTEIN_REF_G);
  const sodiumScore = clamp01(1 - totals.sodiumMg / SODIUM_REF_MG);
  const carbAdequacy = clamp01(
    1 - Math.abs(totals.carbG - IDEAL_CARB_G) / IDEAL_CARB_G
  );

  if (proteinScore < 0.4) {
    return "단백질이 조금 부족해요. 계란이나 우유를 더해볼까요? 🥚";
  }
  if (sodiumScore < 0.4) {
    return "나트륨이 조금 많아요. 물을 충분히 마셔요! 💧";
  }
  if (carbAdequacy < 0.4) {
    return "탄수화물이 균형에서 조금 벗어났어요";
  }
  return "탄수화물+단백질 균형이 좋아요! 👍";
}
