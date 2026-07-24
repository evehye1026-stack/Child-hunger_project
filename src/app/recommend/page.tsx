import Link from "next/link";
import BottomTabBar from "@/components/BottomTabBar";
import { bestPickId } from "@/lib/nutrition";
import {
  getMajorCategoryList,
  getProductById,
  getProductsByMajorCategory,
  MAJOR_CATEGORY_EMOJI,
} from "@/lib/productHelpers";
import { getConvenienceProducts } from "@/lib/products";

export default function RecommendPage() {
  const products = getConvenienceProducts();
  const majorCategories = getMajorCategoryList(products);

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="p-4">
        <h1 className="text-xl font-bold text-gray-800">편의점 음식 추천</h1>
        <p className="text-base text-gray-400">
          카테고리별 오늘의 추천이에요
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <ul className="flex flex-col gap-3">
          {majorCategories.map((major) => {
            const product = getProductById(
              products,
              bestPickId(getProductsByMajorCategory(products, major))
            );
            if (!product) return null;
            return (
              <li key={major}>
                <Link
                  href={`/product/${product.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition active:scale-[0.98]"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                    {product.emoji}
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
            );
          })}
        </ul>
      </main>

      <BottomTabBar />
    </div>
  );
}
