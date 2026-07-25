"use client";

import { useEffect, useState } from "react";

// 든든이가 바운스인(0.4s)한 뒤 잠깐 멈춰서 보여주고, 홈 화면과 같은 배경색(cream)을
// 유지한 채 살짝 페이드아웃한다 — 배경색이 바뀌거나 뚝 끊기지 않게 하려는 것.
const HOLD_MS = 900;
const FADE_MS = 250;

type Phase = "enter" | "exit" | "hidden";

export default function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("exit"), HOLD_MS);
    return () => clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (phase !== "exit") return;
    const hideTimer = setTimeout(() => setPhase("hidden"), FADE_MS);
    return () => clearTimeout(hideTimer);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`absolute inset-0 z-[200] flex items-center justify-center bg-cream transition-opacity duration-[250ms] ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/deundeuni-default.png"
        alt="든든이"
        className="animate-bounce-in h-32 w-32 object-contain"
      />
    </div>
  );
}
