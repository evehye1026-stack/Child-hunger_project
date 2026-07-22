import BottomTabBar from "@/components/BottomTabBar";
import CategoryProductBrowser from "@/components/CategoryProductBrowser";

export default function NutritionPage() {
  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="p-4">
        <h1 className="text-xl font-bold text-gray-800">편의점 영양 조회</h1>
        <p className="text-base text-gray-400">
          상품을 골라 영양정보를 확인해요
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <CategoryProductBrowser />
      </main>

      <BottomTabBar />
    </div>
  );
}
