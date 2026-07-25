// One-time ingest: streams the full 식약처 food-nutrition CSV (298,271 rows, ~117MB,
// lives outside this repo) into data/food.db (node:sqlite) so the chatbot's raw-tier
// search never has to load the whole CSV into the Next.js server process.
//
// Usage: npm run db:build
// Override the source path with RAW_FOOD_CSV_PATH if it's not at the default location.

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { parse } from "csv-parse";

const DEFAULT_RAW_CSV_PATH =
  "C:\\Users\\evehy\\Documents\\가톨릭대\\기타\\AI 몰입형 부트캠프\\아돌결식 가맹점 서비스\\food_nutrition_processed_20260626.csv";

const rawCsvPath = process.env.RAW_FOOD_CSV_PATH || DEFAULT_RAW_CSV_PATH;
const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "food.db");

function stripBom(value) {
  return typeof value === "string" ? value.replace(/^\uFEFF/, "").trim() : value;
}

function toNumberOrNull(value) {
  const cleaned = stripBom(value);
  if (cleaned === undefined || cleaned === null || cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  if (!fs.existsSync(rawCsvPath)) {
    console.error(`원본 CSV를 찾을 수 없습니다: ${rawCsvPath}`);
    console.error("RAW_FOOD_CSV_PATH 환경변수로 경로를 지정할 수 있습니다.");
    process.exit(1);
  }

  fs.mkdirSync(dbDir, { recursive: true });
  if (fs.existsSync(dbPath)) fs.rmSync(dbPath);

  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE raw_foods (
      food_code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mid_category TEXT,
      energy_kcal REAL NOT NULL,
      carb_g REAL NOT NULL,
      protein_g REAL NOT NULL,
      fat_g REAL NOT NULL,
      sodium_mg REAL NOT NULL
    );
    CREATE INDEX idx_raw_name ON raw_foods(name);
    CREATE INDEX idx_raw_midcat ON raw_foods(mid_category);
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO raw_foods
      (food_code, name, mid_category, energy_kcal, carb_g, protein_g, fat_g, sodium_mg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const parser = fs
    .createReadStream(rawCsvPath, { encoding: "utf-8" })
    .pipe(parse({ columns: true, bom: true, trim: true, skip_empty_lines: true }));

  let read = 0;
  let inserted = 0;
  let skipped = 0;
  let inTransaction = false;
  const BATCH_SIZE = 500;

  for await (const row of parser) {
    read++;

    if (!inTransaction) {
      db.exec("BEGIN");
      inTransaction = true;
    }

    const foodCode = stripBom(row["식품코드"]);
    const name = stripBom(row["식품명"]);
    const midCategory = stripBom(row["식품중분류명"]) || null;
    const energyKcal = toNumberOrNull(row["에너지(kcal)"]);
    const carbG = toNumberOrNull(row["탄수화물(g)"]);
    const proteinG = toNumberOrNull(row["단백질(g)"]);
    const fatG = toNumberOrNull(row["지방(g)"]) ?? 0;
    const sodiumMg = toNumberOrNull(row["나트륨(mg)"]);

    if (
      !foodCode ||
      !name ||
      energyKcal === null ||
      carbG === null ||
      proteinG === null ||
      sodiumMg === null
    ) {
      skipped++;
    } else {
      insert.run(foodCode, name, midCategory, energyKcal, carbG, proteinG, fatG, sodiumMg);
      inserted++;
    }

    if (read % BATCH_SIZE === 0) {
      db.exec("COMMIT");
      inTransaction = false;
    }
    if (read % 50000 === 0) {
      console.log(`${read}행 처리 중... (적재 ${inserted} / 스킵 ${skipped})`);
    }
  }

  if (inTransaction) db.exec("COMMIT");

  db.close();
  console.log(`완료: ${read}행 읽음, ${inserted}행 적재, ${skipped}행 스킵(필수 필드 누락)`);
  console.log(`DB 파일: ${dbPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
