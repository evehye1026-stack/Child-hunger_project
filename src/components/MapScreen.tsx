"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import BottomTabBar from "@/components/BottomTabBar";
import { distanceMeters, walkMinutes } from "@/lib/distance";
import { MY_LOCATION, STORES } from "@/lib/mockData";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-lg font-bold text-gray-400">
      지도를 불러오는 중...
    </div>
  ),
});

export default function MapScreen() {
  const [hideConvenience, setHideConvenience] = useState(false);

  const visibleStores = useMemo(
    () =>
      STORES.filter(
        (s) => !s.closed && (!hideConvenience || s.type === "restaurant")
      ),
    [hideConvenience]
  );

  const sortedByDistance = useMemo(
    () =>
      visibleStores
        .map((store) => ({ store, meters: distanceMeters(MY_LOCATION, store) }))
        .sort((a, b) => a.meters - b.meters),
    [visibleStores]
  );

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          className="flex h-14 items-center gap-2 rounded-2xl bg-white px-4 text-lg font-bold text-gray-700 shadow-sm transition active:scale-95"
        >
          📍 내 위치
        </button>
        <button
          type="button"
          onClick={() => setHideConvenience((v) => !v)}
          aria-pressed={hideConvenience}
          className={`flex h-14 min-w-14 items-center justify-center gap-1 rounded-2xl px-4 text-2xl shadow-sm transition active:scale-95 ${
            hideConvenience ? "bg-c-green text-white" : "bg-white"
          }`}
        >
          <span>🍽️</span>
          {!hideConvenience && <span>🏪</span>}
        </button>
      </header>

      <div className="relative flex-1 min-h-[220px]">
        <MapView stores={visibleStores} />
      </div>

      <section className="max-h-[42vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <h2 className="mb-3 text-lg font-bold text-gray-400">가까운 곳</h2>
        <ul className="flex flex-col gap-3">
          {sortedByDistance.map(({ store, meters }) => (
            <li key={store.id}>
              <Link
                href={`/store/${store.id}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 transition active:scale-[0.98]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center text-2xl">
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
          {sortedByDistance.length === 0 && (
            <li className="py-8 text-center text-lg font-bold text-gray-400">
              다른 곳을 찾아볼까요?
            </li>
          )}
        </ul>
        <Link
          href="/merchants"
          className="mt-3 block text-center text-sm font-bold text-gray-400"
        >
          화곡동 가맹점 목록 보기 (지도 좌표 준비 중) →
        </Link>
      </section>

      <BottomTabBar />
    </div>
  );
}
