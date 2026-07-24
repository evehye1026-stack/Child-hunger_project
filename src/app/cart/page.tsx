import BottomTabBar from "@/components/BottomTabBar";
import CartSection from "@/components/CartSection";
import { getConvenienceProducts } from "@/lib/products";

export default function CartPage() {
  const products = getConvenienceProducts();

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="p-4">
        <h1 className="text-xl font-bold text-gray-800">장바구니</h1>
        <p className="text-base text-gray-400">
          담은 음식을 확인하고 식단일지에 추가해요
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <CartSection products={products} />
      </main>

      <BottomTabBar />
    </div>
  );
}
