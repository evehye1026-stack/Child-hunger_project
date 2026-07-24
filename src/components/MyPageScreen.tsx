"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomTabBar from "@/components/BottomTabBar";
import { getMyCombos, type SavedCombo } from "@/lib/combos";
import { supabase } from "@/lib/supabase";
import { useChildAge } from "@/lib/useChildAge";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function MyPageScreen() {
  const ready = useRequireAuth();
  const router = useRouter();
  const { age, setAge, clearAge } = useChildAge();
  const [ageInput, setAgeInput] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [combos, setCombos] = useState<SavedCombo[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    getMyCombos().then(setCombos);
  }, [ready]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-cream sm:h-full">
        <p className="text-lg font-bold text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="p-4">
        <h1 className="text-xl font-bold text-gray-800">마이페이지</h1>
        {email && <p className="text-base text-gray-400">{email}</p>}
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-lg font-bold text-gray-800">나이 설정</p>
            <p className="text-base text-gray-500">
              {age !== null ? `현재 설정: ${age}세` : "아직 설정하지 않았어요"}
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={19}
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                placeholder="나이 (예: 10)"
                className="h-14 flex-1 rounded-2xl border border-gray-100 px-4 text-lg font-bold text-gray-700 outline-none placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => {
                  const n = Number(ageInput);
                  if (n > 0) {
                    setAge(n);
                    setAgeInput("");
                  }
                }}
                className="h-14 shrink-0 rounded-2xl bg-c-green px-5 text-lg font-bold text-white shadow-sm transition active:scale-95"
              >
                저장
              </button>
            </div>
            {age !== null && (
              <button
                type="button"
                onClick={clearAge}
                className="self-start text-sm font-bold text-gray-400"
              >
                나이 설정 초기화
              </button>
            )}
          </section>

          <Link
            href="/combos"
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📔</span>
              <div>
                <p className="text-lg font-bold text-gray-800">식단 일기</p>
                <p className="text-sm text-gray-400">
                  {combos === null ? "불러오는 중..." : `${combos.length}건 기록됨`}
                </p>
              </div>
            </div>
            <span className="text-xl text-gray-300">→</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="h-14 rounded-2xl bg-white text-lg font-bold text-c-red shadow-sm transition active:scale-95"
          >
            로그아웃
          </button>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
