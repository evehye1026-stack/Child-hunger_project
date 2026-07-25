"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const positions = new Map<string, number>();

// merchants 목록 페이지처럼 <main>이 아니라 문서(window) 자체가 스크롤되는
// 페이지용 스크롤 위치 기억 훅 — 상세페이지에 들어갔다가 뒤로가기를 눌러도
// 원래 보던 스크롤 위치가 유지되게 한다.
export function useWindowScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    const saved = positions.get(pathname);
    if (saved) window.scrollTo(0, saved);

    function handleScroll() {
      positions.set(pathname, window.scrollY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);
}
