import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

export type Merchant = {
  id: string;
  name: string;
  signName: string;
  phone: string;
  postalCode: string;
  address: string;
  district: string;
};

type CsvRow = {
  가맹점명: string;
  간판명: string;
  전화번호: string;
  가맹점우편번호: string;
  주소: string;
  구: string;
  주소_정리: string;
};

// 등록된 가맹점명에 이 브랜드명이 포함되면 "카드 사용 가능 편의점"으로 분류한다.
// (서울시 급식카드 가맹점 CSV에는 일반음식점과 편의점이 한 파일에 섞여 있음)
const CONVENIENCE_BRAND_KEYWORDS = [
  "GS25",
  "CU",
  "세븐일레븐",
  "코리아세븐",
  "미니스톱",
  "이마트24",
  "emart24",
];

function isConvenienceBrand(name: string): boolean {
  return CONVENIENCE_BRAND_KEYWORDS.some((keyword) => name.includes(keyword));
}

function cleanPhone(phone: string): string {
  return phone.replace(/\s+/g, "").trim();
}

function loadCsvRows(): CsvRow[] {
  const csvPath = path.join(process.cwd(), "hwagok_sample30.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as CsvRow[];
}

export type MerchantData = {
  restaurants: Merchant[];
  convenience: Merchant[];
};

let cache: MerchantData | null = null;

export function getMerchantData(): MerchantData {
  if (cache) return cache;

  const rows = loadCsvRows();
  const restaurants: Merchant[] = [];
  const convenience: Merchant[] = [];

  rows.forEach((row, index) => {
    const name = row["가맹점명"]?.trim() ?? "";
    if (!name) return;

    const merchant: Merchant = {
      id: `m${index}`,
      name,
      signName: row["간판명"]?.trim() ?? "",
      phone: cleanPhone(row["전화번호"] ?? ""),
      postalCode: row["가맹점우편번호"]?.trim() ?? "",
      address: row["주소_정리"]?.trim() || row["주소"]?.trim() || "",
      district: row["구"]?.trim() ?? "",
    };

    if (isConvenienceBrand(name)) {
      convenience.push(merchant);
    } else {
      restaurants.push(merchant);
    }
  });

  cache = { restaurants, convenience };
  return cache;
}
