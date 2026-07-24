import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { CATEGORY_EMOJI } from "./productHelpers";
import type { Category, Product } from "./types";

type CsvRow = {
  카테고리: string;
  상품명: string;
  제조사: string;
  "에너지(kcal)": string;
  "탄수화물(g)": string;
  "단백질(g)": string;
  "지방(g)": string;
  "나트륨(mg)": string;
};

function loadCsvRows(): CsvRow[] {
  const csvPath = path.join(process.cwd(), "convenience_products.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as CsvRow[];
}

let cache: Product[] | null = null;

export function getConvenienceProducts(): Product[] {
  if (cache) return cache;

  const rows = loadCsvRows();
  cache = rows.map((row, index) => {
    const category = row["카테고리"].trim() as Category;
    return {
      id: `cv${index}`,
      storeType: "convenience",
      category,
      name: row["상품명"].trim(),
      manufacturer: row["제조사"]?.trim() ?? "",
      emoji: CATEGORY_EMOJI[category] ?? "🍴",
      energyKcal: Number(row["에너지(kcal)"]),
      carbG: Number(row["탄수화물(g)"]),
      proteinG: Number(row["단백질(g)"]),
      fatG: Number(row["지방(g)"]),
      sodiumMg: Number(row["나트륨(mg)"]),
    };
  });

  return cache;
}
