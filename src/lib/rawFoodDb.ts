import fs from "node:fs";
import path from "node:path";
import { DatabaseSync, type SQLOutputRow } from "node:sqlite";

export type RawFood = {
  id: string;
  name: string;
  midCategory: string | null;
  energyKcal: number;
  carbG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
};

const DB_PATH = path.join(process.cwd(), "data", "food.db");
const MAX_RESULTS = 20;

// data/food.db is generated locally via `npm run db:build` (scripts/build-food-db.mjs)
// from the external 298,271-row raw CSV. If it hasn't been built yet, raw-tier search
// just comes back empty — curated (255개) matching still works without it.
let db: DatabaseSync | null | undefined;

function getDb(): DatabaseSync | null {
  if (db !== undefined) return db;
  db = fs.existsSync(DB_PATH) ? new DatabaseSync(DB_PATH, { readOnly: true }) : null;
  return db;
}

function rowToRawFood(row: SQLOutputRow): RawFood {
  return {
    id: String(row.food_code),
    name: String(row.name),
    midCategory: row.mid_category == null ? null : String(row.mid_category),
    energyKcal: Number(row.energy_kcal),
    carbG: Number(row.carb_g),
    proteinG: Number(row.protein_g),
    fatG: Number(row.fat_g),
    sodiumMg: Number(row.sodium_mg),
  };
}

// 완전 일치 우선, 없으면 부분 문자열 포함(짧은 이름 = 더 대표적인 상품으로 간주해 앞으로)
export function searchRawFoods(query: string): RawFood[] {
  const database = getDb();
  const q = query.trim();
  if (!database || !q) return [];

  const exact = database
    .prepare("SELECT * FROM raw_foods WHERE name = ? LIMIT ?")
    .all(q, MAX_RESULTS)
    .map(rowToRawFood);
  if (exact.length > 0) return exact;

  return database
    .prepare(
      "SELECT * FROM raw_foods WHERE name LIKE ? ORDER BY length(name) ASC LIMIT ?"
    )
    .all(`%${q}%`, MAX_RESULTS)
    .map(rowToRawFood);
}

// evaluateSodium의 categoryProducts 인자로 그대로 넘길 수 있는 최소 형태만 반환
export function getRawSodiumPeers(midCategory: string): { sodiumMg: number }[] {
  const database = getDb();
  if (!database || !midCategory) return [];

  return database
    .prepare("SELECT sodium_mg FROM raw_foods WHERE mid_category = ?")
    .all(midCategory)
    .map((row) => ({ sodiumMg: Number(row.sodium_mg) }));
}
