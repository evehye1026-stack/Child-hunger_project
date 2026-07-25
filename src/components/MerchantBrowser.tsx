"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Merchant } from "@/lib/merchants";

type Filter = "all" | "restaurant" | "convenience";

const PAGE_SIZE = 50;

type Props = {
  restaurants: Merchant[];
  convenience: Merchant[];
};

export default function MerchantBrowser({ restaurants, convenience }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const combined = useMemo(() => {
    if (filter === "restaurant") return restaurants;
    if (filter === "convenience") return convenience;
    return [...restaurants, ...convenience];
  }, [filter, restaurants, convenience]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return combined;
    return combined.filter(
      (m) => m.name.includes(q) || m.address.includes(q)
    );
  }, [combined, query]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setVisibleCount(PAGE_SIZE);
        }}
        placeholder="가맹점 이름이나 주소로 검색"
        className="h-14 w-full rounded-2xl border border-gray-100 bg-white px-4 text-lg font-bold text-gray-700 shadow-sm outline-none placeholder:text-gray-300"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            { key: "all", label: `전체 ${restaurants.length + convenience.length}` },
            { key: "restaurant", label: `일반 가맹점 ${restaurants.length}` },
            { key: "convenience", label: `편의점 ${convenience.length}` },
          ] as { key: Filter; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setFilter(tab.key);
              setVisibleCount(PAGE_SIZE);
            }}
            className={`flex h-12 shrink-0 items-center rounded-2xl px-4 text-base font-bold shadow-sm transition active:scale-95 ${
              filter === tab.key
                ? "bg-c-green text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400">{filtered.length}건 검색됨</p>

      <ul className="flex flex-col gap-3">
        {visible.map((m) => (
          <li key={m.id}>
            <Link
              href={`/merchants/${m.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition active:scale-[0.98]"
            >
              <span>
                <p className="text-lg font-bold text-gray-800">{m.name}</p>
                <p className="text-base text-gray-500">{m.address}</p>
                {m.phone && <p className="text-sm text-gray-400">{m.phone}</p>}
              </span>
              <span className="shrink-0 text-xl text-gray-300">→</span>
            </Link>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="py-8 text-center text-lg font-bold text-gray-400">
            검색 결과가 없어요
          </li>
        )}
      </ul>

      {visibleCount < filtered.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
          className="h-14 rounded-2xl bg-white text-lg font-bold text-c-blue shadow-sm transition active:scale-95"
        >
          더 보기 ({filtered.length - visibleCount}건 남음)
        </button>
      )}
    </div>
  );
}
