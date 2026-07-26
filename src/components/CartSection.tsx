"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { saveCombo } from "@/lib/combos";
import { getMealFeedback, sumProducts } from "@/lib/nutrition";
import {
  getMajorCategoryList,
  getProductsByMajorCategory,
  MAJOR_CATEGORY_EMOJI,
} from "@/lib/productHelpers";
import { useCart } from "@/lib/useCart";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { MajorCategory, Product } from "@/lib/types";

type Tab = MajorCategory | "전체";

const ALL_TAB = "전체" as const;

// 좁은 화면에서 탭 라벨이 브라우저 마음대로 이상한 자리에서 줄바꿈되는 걸 막고,
// 지정된 위치에서만 줄바꿈되게 한다.
const TAB_LABEL_BREAKS: Partial<Record<Tab, [string, string]>> = {
  "빵·샌드위치": ["빵·샌드", "위치"],
  단백질간식: ["단백질", "간식"],
  "유제품·음료": ["유제품·", "음료"],
};

function renderTabLabel(t: Tab) {
  const parts = TAB_LABEL_BREAKS[t];
  if (!parts) return t;
  const [before, after] = parts;
  return (
    <>
      {before}
      <br />
      {after}
    </>
  );
}

type Props = {
  products: Product[];
};

export default function CartSection({ products }: Props) {
  const ready = useRequireAuth();
  const { cartIds, removeFromCart, removeMany } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>(ALL_TAB);

  const cartProducts = useMemo(
    () =>
      cartIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [cartIds, products]
  );

  const majorCategories = getMajorCategoryList(cartProducts);
  const tabs: Tab[] = [ALL_TAB, ...majorCategories];

  const visibleProducts =
    tab === ALL_TAB ? cartProducts : getProductsByMajorCategory(cartProducts, tab);

  const selectedProducts = useMemo(
    () => cartProducts.filter((p) => selectedIds.includes(p.id)),
    [cartProducts, selectedIds]
  );
  const totals = sumProducts(selectedProducts);
  const feedback =
    selectedProducts.length > 0 ? getMealFeedback(totals) : null;

  function toggleSelect(id: string) {
    setSaved(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleAddSelectedToDiary() {
    if (selectedProducts.length === 0 || !feedback) return;

    setError(null);
    setSaving(true);
    const { error: saveError } = await saveCombo(
      selectedProducts,
      feedback,
      "",
      false
    );
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }

    removeMany(selectedIds);
    setSelectedIds([]);
    setSaved(true);
  }

  if (!ready) {
    return (
      <section className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-base font-bold text-gray-400">불러오는 중...</p>
      </section>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <section className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 text-center shadow-sm">
        <span className="text-4xl">{saved ? "📔" : "🛒"}</span>
        <p className="text-base font-bold text-gray-400">
          {saved ? "식단일기에 추가했어요!" : "장바구니가 비어있어요"}
        </p>
        <p className="text-sm text-gray-300">
          {saved
            ? "또 담아서 기록해볼까요?"
            : "편의점 영양 조회에서 상품을 담아보세요"}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-gray-800">🛒 장바구니</p>
        <span className="text-sm text-gray-400">{cartProducts.length}개</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-center shadow-sm transition active:scale-95 ${
              tab === t ? "bg-c-green text-white" : "bg-white text-gray-700"
            }`}
          >
            <span className="text-lg">
              {t === ALL_TAB ? "🍽️" : MAJOR_CATEGORY_EMOJI[t]}
            </span>
            <span className="text-xs font-bold leading-tight">{renderTabLabel(t)}</span>
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {visibleProducts.map((p) => {
          const isSelected = selectedIds.includes(p.id);
          return (
            <li key={p.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSelect(p.id)}
                className={`flex flex-1 items-center gap-2 rounded-2xl border p-2 text-left transition active:scale-[0.98] ${
                  isSelected
                    ? "border-c-green bg-c-green/10"
                    : "border-gray-100 bg-white"
                }`}
              >
                <span className="text-xl">
                  <Icon icon={p.emoji} />
                </span>
                <span className="flex-1 text-base font-bold text-gray-800">
                  {p.name}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                    isSelected
                      ? "bg-c-green text-white"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeFromCart(p.id)}
                aria-label="장바구니에서 제거"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-lg text-gray-300"
              >
                ✕
              </button>
            </li>
          );
        })}
        {visibleProducts.length === 0 && (
          <li className="py-6 text-center text-base font-bold text-gray-300">
            이 카테고리엔 담은 음식이 없어요
          </li>
        )}
      </ul>

      {feedback && (
        <div className="flex flex-col gap-1 rounded-2xl bg-c-green/10 p-3">
          <p className="text-center text-base font-bold text-gray-800">
            {feedback}
          </p>
          <p className="text-center text-sm text-gray-400">
            {Math.round(totals.energyKcal)} kcal · 단백질{" "}
            {Math.round(totals.proteinG)}g · 나트륨{" "}
            {Math.round(totals.sodiumMg)}mg
          </p>
        </div>
      )}

      {error && (
        <p className="text-center text-sm font-bold text-c-red">{error}</p>
      )}
      {saved && (
        <p className="text-center text-sm font-bold text-c-green">
          식단일기에 추가했어요! 📔
        </p>
      )}

      <button
        type="button"
        onClick={handleAddSelectedToDiary}
        disabled={selectedIds.length === 0 || saving}
        className="h-12 w-full rounded-2xl bg-c-green text-base font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-40"
      >
        {selectedIds.length === 0
          ? "상품을 선택해주세요"
          : saving
            ? "추가하는 중..."
            : `선택한 ${selectedIds.length}개 식단일기에 추가`}
      </button>
    </section>
  );
}
