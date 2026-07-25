"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { bestPickId, getTodaysPickId } from "@/lib/nutrition";
import {
  CATEGORY_EMOJI,
  getCategoryList,
  getMajorCategoryList,
  getProductById,
  getProductsByMajorCategory,
  MAJOR_CATEGORY_EMOJI,
} from "@/lib/productHelpers";
import type { MajorCategory, Product } from "@/lib/types";

type ListedTab = MajorCategory | "전체";
type Tab = ListedTab | "추천";

const ALL_TAB = "전체" as const;
const RECOMMEND_TAB = "추천" as const;

type Props = {
  products: Product[];
};

export default function CategoryProductBrowser({ products }: Props) {
  const majorCategories = getMajorCategoryList(products);
  const categories = getCategoryList(products);
  const tabs: ListedTab[] = [ALL_TAB, ...majorCategories];
  const [tab, setTab] = useState<Tab>(ALL_TAB);
  const [query, setQuery] = useState("");

  const searching = query.trim().length > 0;

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return products.filter((p) => p.name.includes(q));
  }, [products, query]);

  const tabProducts =
    tab === ALL_TAB || tab === RECOMMEND_TAB
      ? products
      : getProductsByMajorCategory(products, tab);

  const pickIds = useMemo(
    () => new Set(categories.map((c) => getTodaysPickId(products, c))),
    [products, categories]
  );

  const showingRecommend = !searching && tab === RECOMMEND_TAB;
  const visible = searching ? searchResults : tabProducts;

  const recommendations = useMemo(
    () =>
      majorCategories
        .map((major) => ({
          major,
          product: getProductById(
            products,
            bestPickId(getProductsByMajorCategory(products, major))
          ),
        }))
        .filter(
          (r): r is { major: MajorCategory; product: Product } =>
            r.product !== undefined
        ),
    [majorCategories, products]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-c-green/10 p-4">
        <p className="text-base font-bold text-c-green">
          🔍 궁금한 음식이 있으면 이름을 검색해서 영양정보를 확인해봐요!
        </p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="상품 이름으로 검색 (예: 삼각김밥)"
        className="h-14 w-full rounded-2xl border border-gray-100 bg-white px-4 text-lg font-bold text-gray-700 shadow-sm outline-none placeholder:text-gray-300"
      />

      {!searching && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-center shadow-sm transition active:scale-95 ${
                tab === t ? "bg-c-green text-white" : "bg-white text-gray-700"
              }`}
            >
              <span className="text-xl">
                {t === ALL_TAB ? "🍽️" : MAJOR_CATEGORY_EMOJI[t]}
              </span>
              <span className="text-xs font-bold leading-tight">{t}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setTab(RECOMMEND_TAB)}
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-center shadow-sm transition active:scale-95 ${
              tab === RECOMMEND_TAB
                ? "bg-c-green text-white"
                : "bg-white text-gray-700"
            }`}
          >
            <span className="text-xl">⭐</span>
            <span className="text-xs font-bold leading-tight">음식 추천</span>
          </button>
        </div>
      )}

      {searching && (
        <p className="text-sm text-gray-400">{visible.length}건 검색됨</p>
      )}

      {showingRecommend ? (
        <ul className="flex flex-col gap-3">
          {recommendations.map(({ major, product }) => (
            <li key={major}>
              <Link
                href={`/product/${product.id}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition active:scale-[0.98]"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                  <Icon icon={product.emoji} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-gray-400">
                    {MAJOR_CATEGORY_EMOJI[major]} {major}
                  </span>
                  <span className="block text-lg font-bold text-gray-800">
                    {product.name}
                  </span>
                </span>
                <span className="text-xl">👍</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((product) => (
            <li key={product.id}>
              <Link
                href={`/product/${product.id}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition active:scale-[0.98]"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                  <Icon icon={product.emoji} />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold text-gray-800">
                    {product.name}
                  </span>
                  <span className="block text-sm text-gray-400">
                    <Icon icon={CATEGORY_EMOJI[product.category]} />{" "}
                    {product.category}
                  </span>
                </span>
                {pickIds.has(product.id) && (
                  <span aria-label="오늘의 추천" className="text-xl">
                    👍
                  </span>
                )}
              </Link>
            </li>
          ))}
          {searching && visible.length === 0 && (
            <li className="py-8 text-center text-lg font-bold text-gray-400">
              검색 결과가 없어요
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
