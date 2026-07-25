"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomTabBar from "@/components/BottomTabBar";
import Icon from "@/components/Icon";
import {
  deleteCombo,
  getMyCombos,
  updateCombo,
  type SavedCombo,
} from "@/lib/combos";
import { getProductById } from "@/lib/productHelpers";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Product } from "@/lib/types";

type Filter = "all" | "liked";

type DayGroup = {
  key: string;
  label: string;
  combos: SavedCombo[];
};

function groupByDay(combos: SavedCombo[]): DayGroup[] {
  const groups: DayGroup[] = [];

  for (const combo of combos) {
    const date = new Date(combo.createdAt);
    const key = date.toLocaleDateString("en-CA");
    const label = date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.combos.push(combo);
    } else {
      groups.push({ key, label, combos: [combo] });
    }
  }

  return groups;
}

// 저장 당시 아이콘을 그대로 굳혀두지 않고, 편의점 영양 조회의 최신 아이콘 로직을
// 매번 다시 반영한다 — 아이콘 규칙이 바뀌면 예전 기록도 최신 모습으로 보이게.
function resolveEmoji(products: Product[], productId: string, fallback: string): string {
  return getProductById(products, productId)?.emoji ?? fallback;
}

type Props = {
  products: Product[];
};

export default function ComboListScreen({ products }: Props) {
  const ready = useRequireAuth();
  const [combos, setCombos] = useState<SavedCombo[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editLiked, setEditLiked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    getMyCombos().then(setCombos);
  }, [ready]);

  async function handleDelete(id: string) {
    setCombos((prev) => prev?.filter((c) => c.id !== id) ?? null);
    await deleteCombo(id);
  }

  function startEdit(c: SavedCombo) {
    setEditingId(c.id);
    setEditComment(c.comment ?? "");
    setEditLiked(c.liked);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    const { error } = await updateCombo(id, {
      comment: editComment,
      liked: editLiked,
    });
    setSaving(false);
    if (error) return;

    setCombos((prev) =>
      prev?.map((c) =>
        c.id === id
          ? { ...c, comment: editComment.trim() || null, liked: editLiked }
          : c
      ) ?? null
    );
    setEditingId(null);
  }

  if (!ready || combos === null) {
    return (
      <div className="flex h-dvh items-center justify-center bg-cream sm:h-full">
        <p className="text-lg font-bold text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  const visibleCombos =
    filter === "liked" ? combos.filter((c) => c.liked) : combos;
  const groups = groupByDay(visibleCombos);
  const likedCount = combos.filter((c) => c.liked).length;

  return (
    <div className="flex h-dvh flex-col bg-cream sm:h-full">
      <header className="flex items-center justify-between gap-3 p-4">
        <div className="ml-6">
          <h1 className="text-xl font-bold text-gray-800">나의 식사 일기</h1>
          <p className="text-base text-gray-400">
            며칠에 무엇을 먹었는지 기록해봐요
          </p>
        </div>
        <Link
          href="/log"
          className="flex h-14 shrink-0 items-center gap-1 rounded-2xl bg-c-green px-4 text-lg font-bold text-white shadow-sm transition active:scale-95"
        >
          + 추가
        </Link>
      </header>

      <div className="flex gap-2 px-4 pb-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex h-12 flex-1 items-center justify-center rounded-2xl text-base font-bold shadow-sm transition active:scale-95 ${
            filter === "all" ? "bg-c-green text-white" : "bg-white text-gray-700"
          }`}
        >
          전체 {combos.length}
        </button>
        <button
          type="button"
          onClick={() => setFilter("liked")}
          className={`flex h-12 flex-1 items-center justify-center rounded-2xl text-base font-bold shadow-sm transition active:scale-95 ${
            filter === "liked"
              ? "bg-c-green text-white"
              : "bg-white text-gray-700"
          }`}
        >
          다음에도 먹을래요 🩷 {likedCount}
        </button>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {groups.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">{filter === "liked" ? "🩷" : "📔"}</span>
            <p className="text-lg font-bold text-gray-400">
              {filter === "liked"
                ? "아직 다음에도 먹고 싶은 게 없어요"
                : "아직 기록한 식사가 없어요"}
            </p>
            <Link
              href="/log"
              className="rounded-2xl bg-c-green px-5 py-3 text-base font-bold text-white shadow-sm transition active:scale-95"
            >
              오늘 먹은 거 추가하기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <section key={group.key}>
                <h2 className="mb-3 text-lg font-bold text-gray-500">
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-3">
                  {group.combos.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-2xl bg-white p-4 shadow-sm"
                    >
                      {/* 카드 전체에 적용되는 정보(시간/수정/삭제)를 맨 위에 분리해서
                          "첫 번째 음식에만 딸린 버튼"처럼 보이지 않게 한다 */}
                      <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-bold text-gray-300">
                          {new Date(c.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            aria-label="수정"
                            className="flex h-11 items-center px-2 text-sm font-bold text-gray-400"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            aria-label="삭제"
                            className="flex h-11 w-11 items-center justify-center text-lg text-gray-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* 가장 중요한 정보 — 무엇을 먹었는지. 여러 개면 얇은 구분선으로
                          "한 끼에 같이 먹은 것들"임을 보여준다 */}
                      <ul className="divide-y divide-gray-100">
                        {c.productNames.map((name, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 py-2 first:pt-0 last:pb-0"
                          >
                            <span className="text-2xl">
                              <Icon
                                icon={resolveEmoji(
                                  products,
                                  c.productIds[i],
                                  c.productEmojis[i]
                                )}
                              />
                            </span>
                            <span className="text-base font-bold text-gray-900">
                              {name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* 보조 정보 — 영양 피드백은 작은 배지로 축소 */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-c-green/10 px-3 py-1 text-xs font-bold text-c-green">
                          {c.feedbackMessage}
                        </span>
                        {c.liked && (
                          <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-500">
                            다음에도 먹을래요 🩷
                          </span>
                        )}
                      </div>

                      {editingId === c.id ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <input
                            type="text"
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="한마디 남겨보세요 (선택)"
                            className="h-12 w-full rounded-2xl border border-gray-100 px-3 text-sm font-bold text-gray-700 outline-none placeholder:text-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setEditLiked((v) => !v)}
                            className={`flex h-10 w-full items-center justify-center gap-1 rounded-2xl text-sm font-bold transition active:scale-95 ${
                              editLiked
                                ? "bg-c-green text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            다음에도 먹을래요 🩷
                          </button>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="h-11 flex-1 rounded-2xl bg-gray-100 text-sm font-bold text-gray-600 transition active:scale-95"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEdit(c.id)}
                              disabled={saving}
                              className="h-11 flex-1 rounded-2xl bg-c-green text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
                            >
                              {saving ? "저장 중..." : "저장"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        c.comment && (
                          <p className="mt-2 text-xs text-gray-300">
                            &ldquo;{c.comment}&rdquo;
                          </p>
                        )
                      )}

                      {/* 부가 정보 — 맨 아래, 작고 옅게 */}
                      <p className="mt-1 text-xs text-gray-300">
                        {Math.round(c.energyKcal)} kcal
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
}
