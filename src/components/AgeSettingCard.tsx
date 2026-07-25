"use client";

import { useState } from "react";
import { useChildAge } from "@/lib/useChildAge";

const MIN_AGE = 1;
const MAX_AGE = 19;

export default function AgeSettingCard() {
  const { age, setAge, clearAge } = useChildAge();
  const [ageInput, setAgeInput] = useState("");

  if (age === null) {
    return (
      <section className="mt-4">
        <h2 className="mb-2 text-lg font-bold text-gray-500">나이 설정</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-400">
            나이를 입력하면 든든이가 우리 아이에게 맞는 영양 평가를 해줘요
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              max={MAX_AGE}
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              placeholder="나이 (예: 10)"
              className="h-14 flex-1 rounded-2xl border border-gray-100 px-4 text-lg font-bold text-gray-700 outline-none placeholder:text-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                const n = Number(ageInput);
                if (n >= MIN_AGE && n <= MAX_AGE) setAge(n);
              }}
              className="h-14 shrink-0 rounded-2xl bg-c-green px-5 text-lg font-bold text-white shadow-sm transition active:scale-95"
            >
              확인
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4">
      <h2 className="mb-2 text-lg font-bold text-gray-500">나이 설정</h2>
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <span className="text-lg font-bold text-gray-800">{age}세로 설정되어 있어요</span>
        <button
          type="button"
          onClick={clearAge}
          className="text-sm font-bold text-gray-400"
        >
          나이 변경
        </button>
      </div>
    </section>
  );
}
