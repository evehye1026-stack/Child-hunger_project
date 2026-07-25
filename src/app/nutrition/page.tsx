import Link from "next/link";
import BottomTabBar from "@/components/BottomTabBar";
import CartIconLink from "@/components/CartIconLink";
import CategoryProductBrowser from "@/components/CategoryProductBrowser";
import ChatWidget from "@/components/ChatWidget";
import ScrollRestoreMain from "@/components/ScrollRestoreMain";
import { getConvenienceProducts } from "@/lib/products";

export default function NutritionPage() {
  const products = getConvenienceProducts();

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="홈으로 이동"
            className="flex h-14 w-14 shrink-0 items-center justify-center text-2xl font-bold transition active:scale-95"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">편의점 영양 조회</h1>
            <p className="text-base text-gray-400">
              상품을 골라 영양정보를 확인해요
            </p>
          </div>
        </div>
        <CartIconLink />
      </header>

      <ScrollRestoreMain className="flex-1 overflow-y-auto px-4 pb-4">
        <CategoryProductBrowser products={products} />
      </ScrollRestoreMain>

      <ChatWidget />
      <BottomTabBar />
    </div>
  );
}
