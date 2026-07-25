import Link from "next/link";
import BottomTabBar from "@/components/BottomTabBar";
import Icon from "@/components/Icon";
import { distanceMeters, walkMinutes } from "@/lib/distance";
import { MY_LOCATION, STORES } from "@/lib/mockData";
import { getOverallTodaysPickId } from "@/lib/nutrition";
import { getProductById } from "@/lib/productHelpers";
import { getConvenienceProducts } from "@/lib/products";

const FEATURES = [
  { href: "/map", emoji: "🗺️", title: "동네지도", desc: "식당·편의점" },
  { href: "/nutrition", emoji: "🔍", title: "영양 조회", desc: "상품 영양정보" },
  { href: "/recommend", emoji: "⭐", title: "음식 추천", desc: "오늘의 추천" },
];

export default function Home() {
  const products = getConvenienceProducts();
  const pick = getProductById(products, getOverallTodaysPickId(products));

  const nearby = STORES.filter((s) => !s.closed)
    .map((store) => ({ store, meters: distanceMeters(MY_LOCATION, store) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, 3);

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="p-4">
        <p className="text-base font-bold text-gray-400">📍 강서구</p>
        <h1 className="text-2xl font-bold text-gray-800">오늘도 든든하게 👋</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <section className="grid grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 text-center shadow-sm transition active:scale-95"
            >
              <span className="text-3xl">{f.emoji}</span>
              <span className="text-base font-bold text-gray-700">
                {f.title}
              </span>
              <span className="text-xs text-gray-400">{f.desc}</span>
            </Link>
          ))}
        </section>

        {pick && (
          <section className="mt-4">
            <h2 className="mb-2 text-lg font-bold text-gray-500">
              오늘의 추천
            </h2>
            <Link
              href={`/product/${pick.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition active:scale-[0.98]"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-4xl">
                <Icon icon={pick.emoji} />
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold text-gray-800">
                  {pick.name}
                </span>
                <span className="block text-sm text-gray-400">
                  {pick.energyKcal} kcal
                </span>
              </span>
              <span className="text-xl">👍</span>
            </Link>
          </section>
        )}

        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-500">가까운 매장</h2>
            <Link href="/map" className="text-sm font-bold text-c-blue">
              지도 보기 →
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {nearby.map(({ store, meters }) => (
              <li key={store.id}>
                <Link
                  href={`/store/${store.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition active:scale-[0.98]"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-white ${
                      store.type === "restaurant" ? "bg-c-green" : "bg-c-blue"
                    }`}
                  >
                    {store.type === "restaurant" ? "🍽️" : "🏪"}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-bold text-gray-800">
                      {store.name}
                    </span>
                    <span className="block text-sm text-gray-400">
                      {store.address}
                    </span>
                  </span>
                  <span className="text-lg font-bold text-c-blue">
                    {walkMinutes(meters)}분
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
}
