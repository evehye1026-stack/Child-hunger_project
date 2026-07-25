"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import type { Merchant } from "@/lib/merchants";

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

// 화곡동 대략 중심점 (지오코딩 실패 시 지도 기본 중심)
const HWAGOK_CENTER = { lat: 37.5417, lng: 126.8402 };

type Props = {
  restaurants: Merchant[];
  convenience: Merchant[];
};

function markerImage(
  kakaoNs: typeof window.kakao,
  type: "restaurant" | "convenience"
) {
  const borderColor = type === "restaurant" ? "#16A34A" : "#2563EB";
  const emoji = type === "restaurant" ? "🍽️" : "🏪";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <circle cx="20" cy="20" r="17" fill="white" stroke="${borderColor}" stroke-width="3" />
      <text x="20" y="26" font-size="18" text-anchor="middle">${emoji}</text>
    </svg>`;
  return new kakaoNs.maps.MarkerImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    new kakaoNs.maps.Size(40, 40),
    { offset: new kakaoNs.maps.Point(20, 20) }
  );
}

export default function KakaoMerchantMap({ restaurants, convenience }: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [status, setStatus] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const mapDivRef = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);

  function initMap() {
    if (initedRef.current || !mapDivRef.current) return;
    initedRef.current = true;

    const kakao = window.kakao;
    const map = new kakao.maps.Map(mapDivRef.current, {
      center: new kakao.maps.LatLng(HWAGOK_CENTER.lat, HWAGOK_CENTER.lng),
      level: 5,
    });

    const geocoder = new kakao.maps.services.Geocoder();
    const all: Array<{ merchant: Merchant; type: "restaurant" | "convenience" }> = [
      ...restaurants.map((m) => ({ merchant: m, type: "restaurant" as const })),
      ...convenience.map((m) => ({ merchant: m, type: "convenience" as const })),
    ];
    setStatus({ done: 0, total: all.length });

    const bounds = new kakao.maps.LatLngBounds();
    let placed = 0;
    let done = 0;

    all.forEach(({ merchant, type }) => {
      geocoder.addressSearch(merchant.address, (result, sdkStatus) => {
        done += 1;
        setStatus({ done, total: all.length });

        if (sdkStatus === kakao.maps.services.Status.OK && result[0]) {
          const position = new kakao.maps.LatLng(
            Number(result[0].y),
            Number(result[0].x)
          );
          const marker = new kakao.maps.Marker({
            map,
            position,
            image: markerImage(kakao, type),
            title: merchant.name,
          });

          const infowindow = new kakao.maps.InfoWindow({
            content: `
              <div style="padding:8px 12px;font-size:13px;white-space:nowrap;">
                <div style="font-weight:bold;margin-bottom:4px;">${merchant.name}</div>
                <a href="/merchants/${merchant.id}" style="font-weight:bold;color:#2f6fed;text-decoration:none;">자세히 보기 →</a>
              </div>`,
          });
          kakao.maps.event.addListener(marker, "click", () => {
            infowindow.open(map, marker);
          });

          bounds.extend(position);
          placed += 1;
          if (placed === 1 || placed % 10 === 0) {
            map.setBounds(bounds);
          }
        }

        if (done === all.length && placed > 0) {
          map.setBounds(bounds);
        }
      });
    });
  }

  if (!KAKAO_APP_KEY) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gray-50 p-6 text-center">
        <p className="text-lg font-bold text-gray-400">
          카카오맵 API 키가 설정되지 않았어요
        </p>
        <p className="text-sm text-gray-400">
          .env의 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 채워주세요
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onReady={() => {
          window.kakao.maps.load(() => {
            setSdkReady(true);
            initMap();
          });
        }}
      />
      <div ref={mapDivRef} className="h-full w-full" />
      {sdkReady && status.total > 0 && status.done < status.total && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white">
          가맹점 위치 찾는 중... {status.done}/{status.total}
        </div>
      )}
      {!sdkReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream text-lg font-bold text-gray-400">
          지도를 불러오는 중...
        </div>
      )}
    </div>
  );
}
