"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", emoji: "🏠" },
  { href: "/map", label: "동네지도", emoji: "🗺️" },
  { href: "/nutrition", label: "편의점 영양 조회", emoji: "🔍" },
  { href: "/mypage", label: "마이페이지", emoji: "👤" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

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
