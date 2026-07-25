import BottomTabBar from "@/components/BottomTabBar";
import CartIconLink from "@/components/CartIconLink";
import CategoryProductBrowser from "@/components/CategoryProductBrowser";
import ChatWidget from "@/components/ChatWidget";
import { getConvenienceProducts } from "@/lib/products";

export default function NutritionPage() {
  const products = getConvenienceProducts();

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="flex items-start justify-between gap-3 p-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">편의점 영양 조회</h1>
          <p className="text-base text-gray-400">
            상품을 골라 영양정보를 확인해요
          </p>
        </div>
        <CartIconLink />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <CategoryProductBrowser products={products} />
      </main>

      <ChatWidget />
      <BottomTabBar />
    </div>
  );
}
