"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import Icon from "@/components/Icon";
import { saveCombo } from "@/lib/combos";
import { getMealFeedback, sumProducts } from "@/lib/nutrition";
import {
  getMajorCategoryList,
  getProductsByMajorCategory,
  MAJOR_CATEGORY_EMOJI,
} from "@/lib/productHelpers";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { MajorCategory, Product } from "@/lib/types";

type Tab = MajorCategory | "전체";

const ALL_TAB = "전체" as const;

type Props = {
  products: Product[];
};

export default function LogMealScreen({ products }: Props) {
  const ready = useRequireAuth();
  const router = useRouter();

  const majorCategories = getMajorCategoryList(products);
  const tabs: Tab[] = [ALL_TAB, ...majorCategories];
  const [tab, setTab] = useState<Tab>(ALL_TAB);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searching = query.trim().length > 0;

  const listProducts = useMemo(() => {
    if (searching) {
      const q = query.trim();
      return products.filter((p) => p.name.includes(q));
    }
    return tab === ALL_TAB
      ? products
      : getProductsByMajorCategory(products, tab);
  }, [products, searching, query, tab]);

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [selectedIds, products]
  );

  const totals = sumProducts(selectedProducts);
  const feedback = selectedProducts.length > 0 ? getMealFeedback(totals) : null;

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSave(liked: boolean) {
    if (selectedProducts.length === 0 || !feedback) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await saveCombo(
      selectedProducts,
      feedback,
      comment,
      liked
    );
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setSaved(true);
    setTimeout(() => {
      router.push("/combos");
      router.refresh();
    }, 800);
  }

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-cream sm:h-full">
        <p className="text-lg font-bold text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="flex items-center gap-3 p-4">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold text-gray-800">오늘 뭐 먹었어요?</h1>
          <p className="text-base text-gray-400">
            먹은 음식을 골라주세요 (여러 개 선택 가능)
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-4">
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className="flex items-center gap-1 rounded-2xl bg-c-green px-3 py-2 text-sm font-bold text-white shadow-sm transition active:scale-95"
                >
                  <Icon icon={p.emoji} /> {p.name}{" "}
                  <span className="text-white/70">×</span>
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품 이름으로 검색"
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
                    tab === t
                      ? "bg-c-green text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <span className="text-xl">
                    {t === ALL_TAB ? "🍽️" : MAJOR_CATEGORY_EMOJI[t]}
                  </span>
                  <span className="text-xs font-bold leading-tight">
                    {t}
                  </span>
                </button>
              ))}
            </div>
          )}

          <ul className="flex flex-col gap-2">
            {listProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                      isSelected
                        ? "border-c-green bg-c-green/10"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                      <Icon icon={p.emoji} />
                    </span>
                    <span className="flex-1 text-base font-bold text-gray-800">
                      {p.name}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg ${
                        isSelected
                          ? "bg-c-green text-white"
                          : "bg-gray-100 text-gray-300"
                      }`}
                    >
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </main>

      {selectedProducts.length > 0 && (
        <section className="flex flex-col gap-3 rounded-t-3xl bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {feedback && (
            <p className="text-center text-lg font-bold text-gray-800">
              {feedback}
            </p>
          )}
          <p className="text-center text-sm text-gray-400">
            {Math.round(totals.energyKcal)} kcal · 단백질{" "}
            {Math.round(totals.proteinG)}g · 나트륨{" "}
            {Math.round(totals.sodiumMg)}mg
          </p>

          {saved ? (
            <p className="text-center text-base font-bold text-c-green">
              일기에 저장했어요! 🩷
            </p>
          ) : (
            <>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="한마디 남겨보세요 (선택)"
                className="h-12 w-full rounded-2xl border border-gray-100 bg-white px-4 text-base font-bold text-gray-700 outline-none placeholder:text-gray-300"
              />
              {error && (
                <p className="text-center text-sm font-bold text-c-red">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="h-14 flex-1 rounded-2xl bg-white text-lg font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition active:scale-95 disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "추가하기"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="h-14 flex-1 rounded-2xl bg-c-green text-lg font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "다음에도 먹을래요 🩷"}
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
