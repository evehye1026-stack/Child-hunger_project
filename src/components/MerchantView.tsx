"use client";

import { useState } from "react";
import KakaoMerchantMap from "@/components/KakaoMerchantMap";
import MerchantBrowser from "@/components/MerchantBrowser";
import type { Merchant } from "@/lib/merchants";

type Mode = "list" | "map";

type Props = {
  restaurants: Merchant[];
  convenience: Merchant[];
};

export default function MerchantView({ restaurants, convenience }: Props) {
  const [mode, setMode] = useState<Mode>("list");

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        {(
          [
            { key: "list" as const, label: "목록으로 보기" },
            { key: "map" as const, label: "지도로 보기" },
          ]
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMode(tab.key)}
            className={`h-12 flex-1 rounded-2xl text-base font-bold shadow-sm transition active:scale-95 ${
              mode === tab.key
                ? "bg-c-green text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "list" ? (
        <MerchantBrowser restaurants={restaurants} convenience={convenience} />
      ) : (
        <div className="h-[70vh] overflow-hidden rounded-2xl border border-gray-100">
          <KakaoMerchantMap restaurants={restaurants} convenience={convenience} />
        </div>
      )}
    </div>
  );
}
