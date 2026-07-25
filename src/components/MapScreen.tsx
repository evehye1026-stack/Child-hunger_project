"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import BottomTabBar from "@/components/BottomTabBar";
import { distanceMeters, walkMinutes } from "@/lib/distance";
import { MY_LOCATION, STORES } from "@/lib/mockData";
import { useMyLocation } from "@/lib/useMyLocation";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-lg font-bold text-gray-400">
      지도를 불러오는 중...
    </div>
  ),
});

export default function MapScreen() {
  const { location, hasRealLocation, status, error, requestLocation } =
    useMyLocation(MY_LOCATION);

  const visibleStores = useMemo(() => STORES.filter((s) => !s.closed), []);

  const sortedByDistance = useMemo(
    () =>
      visibleStores
        .map((store) => ({ store, meters: distanceMeters(location, store) }))
        .sort((a, b) => a.meters - b.meters),
    [visibleStores, location]
  );

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="flex items-center gap-3 p-4">
        <Link
          href="/"
          aria-label="홈으로 이동"
          className="flex h-14 w-14 shrink-0 items-center justify-center text-2xl font-bold transition active:scale-95"
        >
          ←
        </Link>
        <button
          type="button"
          onClick={requestLocation}
          disabled={status === "loading"}
          className="flex h-14 items-center gap-2 rounded-2xl bg-white px-4 text-lg font-bold text-gray-700 shadow-sm transition active:scale-95 disabled:opacity-60"
        >
          📍 {status === "loading" ? "찾는 중..." : "내 위치"}
        </button>
      </header>

      {error && (
        <p className="px-4 pb-2 text-center text-sm font-bold text-c-red">
          {error}
        </p>
      )}

      <div className="relative flex-1 min-h-[160px]">
        <MapView stores={visibleStores} myLocation={location} />
      </div>

      <section className="max-h-[42vh] overflow-y-auto rounded-t-3xl bg-cream p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <h2 className="mb-3 text-lg font-bold text-gray-400">
          가까운 곳{hasRealLocation ? " · 내 위치 기준" : ""}
        </h2>
        <ul className="flex flex-col gap-3">
          {sortedByDistance.map(({ store, meters }) => (
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
