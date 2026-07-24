"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";

export default function CartIconLink() {
  const { cartIds } = useCart();

  if (cartIds.length === 0) return null;

  return (
    <Link
      href="/cart"
      aria-label="장바구니로 이동"
      className="relative flex h-14 w-14 shrink-0 items-center justify-center self-start rounded-2xl bg-white text-2xl shadow-sm transition active:scale-95"
    >
      🛒
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-c-red text-[11px] font-bold text-white">
        {cartIds.length}
      </span>
    </Link>
  );
}
