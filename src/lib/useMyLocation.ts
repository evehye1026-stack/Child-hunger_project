"use client";

import { useCallback, useState } from "react";

export type LatLng = { lat: number; lng: number };

type Status = "idle" | "loading" | "success" | "error";

// 브라우저 위치 확인(Geolocation API)을 감싼 훅. 권한이 없거나 실패하면 실제 위치를
// 얻기 전까지 fallback(강서구 목업 좌표)을 그대로 쓴다 — 지도가 빈 상태로 뜨지 않게.
export function useMyLocation(fallback: LatLng) {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setError("이 브라우저에서는 위치 확인을 지원하지 않아요");
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus("success");
      },
      (err) => {
        setStatus("error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "위치 권한이 꺼져있어요. 브라우저 설정에서 허용해주세요"
            : "위치를 찾지 못했어요. 다시 시도해주세요"
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return {
    location: location ?? fallback,
    hasRealLocation: location !== null,
    status,
    error,
    requestLocation,
  };
}
