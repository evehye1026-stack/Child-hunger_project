"use client";

import { useSyncExternalStore } from "react";

// 키보드가 없을 때의 "진짜" 전체 높이 기준선. Android 기본(resize) 모드에서는 키보드가
// 뜨면 visualViewport.height뿐 아니라 window.innerHeight까지 같이 줄어들어 버려서,
// 그 둘을 비교하면 차이가 0에 가까워 키보드를 띄운 걸 감지하지 못한다(iOS만 감지됨).
// 대신 지금까지 관찰된 가장 큰 뷰포트 높이를 기준선으로 저장해두고 거기서 얼마나
// 줄었는지로 키보드 높이를 추정한다. 너비가 바뀌면(회전) 기준선을 그 즉시 새로 잡는다 —
// 안 그러면 세로 모드의 기준선이 그대로 남아 가로 모드에서 키보드가 없어도 계속
// "떠 있다"고 오판하게 된다.
let maxViewportHeight = 0;
let lastViewportWidth = 0;

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

  if (vv.width !== lastViewportWidth) {
    lastViewportWidth = vv.width;
    maxViewportHeight = vv.height;
  } else {
    maxViewportHeight = Math.max(maxViewportHeight, vv.height);
  }

  return Math.max(0, Math.round(maxViewportHeight - vv.height));
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
