import { PRODUCTS } from "./mockData";
import type { NutrientLevel, Product } from "./types";

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

export function getTodaysPickId(category: Product["category"]): string {
  const inCategory = PRODUCTS.filter((p) => p.category === category);
  return inCategory.reduce((best, p) =>
    nutritionScore(p) > nutritionScore(best) ? p : best
  ).id;
}

export function getOverallTodaysPickId(): string {
  return PRODUCTS.reduce((best, p) =>
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
