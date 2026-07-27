"use client";

import Link from "next/link";
import AgeSettingCard from "@/components/AgeSettingCard";
import BottomTabBar from "@/components/BottomTabBar";
import ChatWidget from "@/components/ChatWidget";
import { distanceMeters, walkMinutes } from "@/lib/distance";
import { MY_LOCATION, STORES } from "@/lib/mockData";
import { useMyLocation } from "@/lib/useMyLocation";

const FEATURES = [
  { href: "/map", emoji: "🗺️", title: "동네지도", desc: "식당·편의점" },
  { href: "/nutrition", emoji: "🔍", title: "영양 조회", desc: "상품 영양정보" },
  { href: "/cart", emoji: "🛒", title: "장바구니", desc: "담은 상품" },
];

export default function Home() {
  const { location, hasRealLocation, status, error, requestLocation } =
    useMyLocation(MY_LOCATION);

  const nearby = STORES.filter((s) => !s.closed)
    .map((store) => ({ store, meters: distanceMeters(location, store) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, 3);

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="p-4">
        <h1 className="ml-6 mt-2 flex items-center gap-2 text-2xl font-bold text-gray-800">
          오늘도 든든하게
          <button
            type="button"
            onClick={requestLocation}
            disabled={status === "loading"}
            className="text-base font-bold text-gray-400 transition active:scale-95 disabled:opacity-60"
          >
            📍 {status === "loading" ? "찾는 중..." : "내 위치"}
          </button>
        </h1>
        {error && (
          <p className="ml-6 mt-1 text-sm font-bold text-c-red">{error}</p>
        )}
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

        <AgeSettingCard />

        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-500">
              가까운 매장{hasRealLocation ? " · 내 위치 기준" : ""}
            </h2>
            <Link href="/map" className="text-sm font-bold text-c-green">
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
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-2xl">
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
                  <span className="text-lg font-bold text-c-green">
                    {walkMinutes(meters)}분
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <ChatWidget />
      <BottomTabBar />
    </div>
  );
}
