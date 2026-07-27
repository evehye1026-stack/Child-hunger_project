"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // 개발 중(npm run dev)에는 서비스워커를 등록하지 않는다 — 캐시 우선으로 정적 청크를
    // 서빙하는 sw.js가 dev 중엔 방금 고친 코드를 계속 예전 버전으로 가리는 문제가
    // 반복됐다. 이미 설치돼 있던 서비스워커/캐시가 있으면(이전 개발 빌드에서 등록된
    // 것) 여기서 지워서 항상 최신 코드가 뜨게 한다.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
