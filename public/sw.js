// 손으로 작성한 서비스워커 (빌드 플러그인 없음 — Turbopack엔 next-pwa의 웹팩 훅이 안 먹는다).
// 목표: 오프라인이어도 "마지막으로 보던 화면"이 뜨게 하는 것. 실시간 데이터/로그인/저장까지
// 오프라인에서 되게 하려는 게 아니라, 문서 요청을 네트워크 우선으로 캐싱해뒀다가
// 네트워크가 죽으면 그 URL의 캐시된 마지막 버전을 그대로 돌려준다.
// v1 캐시엔 예전에 캐싱된 낡은 JS 청크가 남아있을 수 있어 이름을 올려서 폐기시킨다
// (activate 핸들러가 이름이 다른 캐시는 전부 지운다).
const CACHE_NAME = "deundeuni-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(request) {
  return (
    request.url.includes("/_next/static/") ||
    request.url.includes("/icons/") ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  // Supabase 등 외부(cross-origin) 요청엔 절대 관여하지 않는다 — 로그인/회원가입처럼
  // 이 앱 밖으로 나가는 fetch는 서비스워커가 손대지 않고 그대로 지나가야 한다.
  if (new URL(request.url).origin !== self.location.origin) return;

  // 페이지 이동(문서) 요청 — 네트워크 우선, 성공하면 캐시 갱신, 실패(오프라인)하면
  // 같은 URL의 캐시된 마지막 버전을 반환한다.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/");
          return fallback || Response.error();
        })
    );
    return;
  }

  // 정적 리소스 — 캐시 우선, 없으면 네트워크에서 받아와 캐싱
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});
