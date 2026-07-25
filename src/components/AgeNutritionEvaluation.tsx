"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import {
  evaluateCarb,
  evaluateProtein,
  evaluateSodium,
} from "@/lib/ageNutrition";
import { useChildAge } from "@/lib/useChildAge";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  allProducts: Product[];
};

export default function AgeNutritionEvaluation({
  product,
  allProducts,
}: Props) {
  const { age, setAge, clearAge } = useChildAge();
  const [ageInput, setAgeInput] = useState("");

  const categoryProducts = useMemo(
    () => allProducts.filter((p) => p.category === product.category),
    [allProducts, product.category]
  );

  const protein = useMemo(
    () => (age !== null ? evaluateProtein(product, age, allProducts) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.id, age, allProducts]
  );
  const sodium = useMemo(
    () => evaluateSodium(product, categoryProducts),
    [product, categoryProducts]
  );
  const carb = useMemo(() => evaluateCarb(product), [product]);

  if (age === null) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-lg font-bold text-gray-800">나이별 영양 평가</p>
        <p className="text-sm text-gray-400">
          나이를 입력하면 이 음식이 지금 우리 아이에게 맞는지 알려드려요
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={19}
            value={ageInput}
            onChange={(e) => setAgeInput(e.target.value)}
            placeholder="나이 (예: 10)"
            className="h-14 flex-1 rounded-2xl border border-gray-100 px-4 text-lg font-bold text-gray-700 outline-none placeholder:text-gray-300"
          />
          <button
            type="button"
            onClick={() => {
              const n = Number(ageInput);
              if (n > 0) setAge(n);
            }}
            className="h-14 shrink-0 rounded-2xl bg-c-green px-5 text-lg font-bold text-white shadow-sm transition active:scale-95"
          >
            확인
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-gray-800">
          나이별 영양 평가 ({age}세)
        </p>
        <button
          type="button"
          onClick={clearAge}
          className="text-sm font-bold text-gray-400"
        >
          나이 변경
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {protein?.sufficient ? (
          <p className="text-base font-bold text-c-green">
            이 나이 기준 단백질이 충분해요! 👍
          </p>
        ) : (
          <>
            <p className="text-base font-bold text-gray-800">
              단백질이 {protein?.deficitG.toFixed(1)}g 부족해요
            </p>
            {protein?.recommendation ? (
              <Link
                href={`/product/${protein.recommendation.id}`}
                className="flex items-center gap-2 rounded-2xl border border-gray-100 p-3 transition active:scale-[0.98]"
              >
                <span className="text-2xl">
                  <Icon icon={protein.recommendation.emoji} />
                </span>
                <span className="flex-1 text-sm font-bold text-gray-700">
                  {protein.recommendation.name}(으)로 채워볼까요?
                </span>
              </Link>
            ) : (
              <p className="text-sm text-gray-400">
                부족한 단백질을 채워줄 상품을 찾지 못했어요
              </p>
            )}
          </>
        )}
      </div>

      {sodium.message && (
        <p className="text-base font-bold text-gray-700">{sodium.message}</p>
      )}

      <p className="text-base font-bold text-gray-700">{carb.message}</p>
    </section>
  );
}
