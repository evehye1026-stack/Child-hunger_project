"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener("resize", callback);
  vv.addEventListener("scroll", callback);
  return () => {
    vv.removeEventListener("resize", callback);
    vv.removeEventListener("scroll", callback);
  };
}

function getSnapshot(): number {
  const vv = window.visualViewport;
  if (!vv) return 0;
  return Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
}

function getServerSnapshot(): number {
  return 0;
}

// 모바일 키보드가 화면을 얼마나 가리고 있는지(px)를 visualViewport로 직접 재서 알려준다.
// interactive-widget 메타 태그는 사파리 등 일부 브라우저가 아예 지원하지 않으므로,
// "레이아웃(dvh)이 안 줄어들게" 막는 방식만으론 부족하다 — 대신 이 값을 보고 채팅
// 패널은 입력창을 키보드 바로 위로 붙이고, 하단 탭바 같은 전역 UI는 아예 숨겨서
// (키보드가 떠 있는 동안) 화면이 밀리는 것처럼 보이는 문제 자체를 없앤다.
export function useKeyboardInset() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
