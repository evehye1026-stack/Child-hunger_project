"use client";

import { useRouter } from "next/navigation";

export default function BareBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="뒤로 가기"
      className="flex h-14 w-14 shrink-0 items-center justify-center text-2xl font-bold transition active:scale-95"
    >
      ←
    </button>
  );
}
