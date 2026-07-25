"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const scrollPositions = new Map<string, number>();

// Next.js App Router는 window 스크롤만 자동으로 기억해준다. 이 앱은 실제로는
// <main className="overflow-y-auto">가 스크롤되는 구조라, 상세페이지에 들어갔다가
// 뒤로가기를 눌러도 그 <main>은 항상 맨 위(scrollTop 0)로 다시 마운트된다.
// 그래서 스크롤 위치를 경로별로 직접 기억해뒀다가 다시 이 경로로 돌아왔을 때 복원한다.
export function useScrollRestoration<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const saved = scrollPositions.get(pathname);
    if (saved) el.scrollTop = saved;

    function handleScroll() {
      scrollPositions.set(pathname, el!.scrollTop);
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return ref;
}
