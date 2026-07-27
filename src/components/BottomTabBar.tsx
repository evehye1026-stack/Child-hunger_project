"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useKeyboardInset } from "@/lib/useKeyboardInset";

const TABS = [
  { href: "/", label: "홈", emoji: "🏠" },
  { href: "/map", label: "동네지도", emoji: "🗺️" },
  { href: "/nutrition", label: "편의점 영양 조회", emoji: "🔍" },
  { href: "/combos", label: "식단일기", emoji: "📔" },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const keyboardInset = useKeyboardInset();

  // 모바일 키보드가 떠 있는 동안엔 렌더링을 하지 않는다 — 키보드가 뜨면 dvh 기반
  // 레이아웃 자체가 줄어들어 이 탭바가 키보드 바로 위로 같이 밀려 올라와 버리므로,
  // visualViewport로 키보드가 실제로 떠 있는지 감지해 그 순간만 숨긴다.
  if (keyboardInset > 0) return null;

  return (
    <nav className="flex shrink-0 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-center transition active:scale-95 ${
              active ? "text-c-green" : "text-gray-400"
            }`}
          >
            <span className="text-2xl">{tab.emoji}</span>
            <span className="text-[11px] font-bold leading-tight">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
