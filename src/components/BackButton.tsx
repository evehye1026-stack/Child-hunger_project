"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold shadow-sm transition active:scale-95"
    >
      ←
    </button>
  );
}
