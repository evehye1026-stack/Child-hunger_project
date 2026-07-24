import { supabase } from "./supabase";
import type { Product } from "./types";
import { sumProducts } from "./nutrition";

export type SavedCombo = {
  id: string;
  productIds: string[];
  productNames: string[];
  productEmojis: string[];
  energyKcal: number;
  carbG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
  feedbackMessage: string;
  comment: string | null;
  liked: boolean;
  createdAt: string;
};

type ComboRow = {
  id: string;
  product_ids: string[];
  product_names: string[];
  product_emojis: string[];
  energy_kcal: number;
  carb_g: number;
  protein_g: number;
  fat_g: number;
  sodium_mg: number;
  feedback_message: string;
  comment: string | null;
  liked: boolean;
  created_at: string;
};

function fromRow(row: ComboRow): SavedCombo {
  return {
    id: row.id,
    productIds: row.product_ids,
    productNames: row.product_names,
    productEmojis: row.product_emojis,
    energyKcal: row.energy_kcal,
    carbG: row.carb_g,
    proteinG: row.protein_g,
    fatG: row.fat_g,
    sodiumMg: row.sodium_mg,
    feedbackMessage: row.feedback_message,
    comment: row.comment,
    liked: row.liked,
    createdAt: row.created_at,
  };
}

export async function saveCombo(
  products: Product[],
  feedbackMessage: string,
  comment: string,
  liked: boolean
): Promise<{ error: string | null }> {
  const totals = sumProducts(products);

  const { error } = await supabase.from("combos").insert({
    product_ids: products.map((p) => p.id),
    product_names: products.map((p) => p.name),
    product_emojis: products.map((p) => p.emoji),
    energy_kcal: totals.energyKcal,
    carb_g: totals.carbG,
    protein_g: totals.proteinG,
    fat_g: totals.fatG,
    sodium_mg: totals.sodiumMg,
    feedback_message: feedbackMessage,
    comment: comment.trim() || null,
    liked,
  });

  return { error: error?.message ?? null };
}

export async function getMyCombos(): Promise<SavedCombo[]> {
  const { data, error } = await supabase
    .from("combos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as ComboRow[]).map(fromRow);
}

export async function deleteCombo(id: string): Promise<void> {
  await supabase.from("combos").delete().eq("id", id);
}

export async function updateCombo(
  id: string,
  updates: { comment: string; liked: boolean }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("combos")
    .update({
      comment: updates.comment.trim() || null,
      liked: updates.liked,
    })
    .eq("id", id);

  return { error: error?.message ?? null };
}
