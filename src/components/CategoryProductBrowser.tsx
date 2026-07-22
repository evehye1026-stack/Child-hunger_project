"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_EMOJI, CATEGORY_LABEL, getProductsByCategory } from "@/lib/mockData";
import { getTodaysPickId } from "@/lib/nutrition";
import type { Category } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

export default function CategoryProductBrowser() {
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const products = getProductsByCategory(category);
  const pickId = getTodaysPickId(category);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`flex h-14 shrink-0 items-center gap-2 rounded-2xl px-4 text-lg font-bold shadow-sm transition active:scale-95 ${
              category === c ? "bg-c-green text-white" : "bg-white text-gray-700"
            }`}
          >
            <span className="text-2xl">{CATEGORY_EMOJI[c]}</span>
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/product/${product.id}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition active:scale-[0.98]"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                {product.emoji}
              </span>
              <span className="flex-1 text-lg font-bold text-gray-800">
                {product.name}
              </span>
              {product.id === pickId && (
                <span
                  aria-label="오늘의 추천"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-c-amber text-xl"
                >
                  ⭐
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
