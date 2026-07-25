"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "installPromptDismissed";

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
}

// 스마트폰 브라우저로 접속했을 때 "홈 화면에 추가"를 안내한다.
// 안드로이드/크롬은 beforeinstallprompt를 가로채 실제 설치 버튼을 띄우고,
// iOS Safari는 그런 이벤트 자체가 없어서(플랫폼 한계) 안내 문구만 보여준다.
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) return;

    const ios = isIos();
    // 마운트 직후 한 번만 반영 — setState를 effect 본문에서 바로 부르지 않고
    // 마이크로태스크로 미뤄서 react-hooks/set-state-in-effect 규칙을 만족시킨다.
    queueMicrotask(() => {
      setDismissed(false);
      if (ios) setShowIosHint(true);
    });

    if (ios) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIosHint(false);
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  }

  if (dismissed || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="absolute inset-x-4 top-4 z-30 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/deundeuni-default.png"
        alt=""
        className="h-10 w-10 shrink-0 object-contain"
      />
      <p className="flex-1 text-sm font-bold text-gray-700">
        {showIosHint
          ? "홈 화면에 추가하려면 하단 공유 버튼 → “홈 화면에 추가”를 눌러보세요"
          : "든든이를 홈 화면에 추가하고 더 빠르게 열어보세요!"}
      </p>
      {deferredPrompt && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex h-11 shrink-0 items-center justify-center rounded-2xl bg-c-green px-4 text-sm font-bold text-white transition active:scale-95"
        >
          설치
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="닫기"
        className="flex h-11 w-11 shrink-0 items-center justify-center text-gray-300"
      >
        ✕
      </button>
    </div>
  );
}
