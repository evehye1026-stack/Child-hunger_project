"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import { useChildAge } from "@/lib/useChildAge";
import type { ChatReply, MatchedFood, MiniCard } from "@/lib/chatbot";

const MASCOT_SRC = "/deundeuni-mascot.png";

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
  card?: MiniCard;
  recommendationCard?: MiniCard;
  alternatives?: MatchedFood[];
  matched?: boolean;
  showAlternatives?: boolean;
};

const GREETING = "안녕! 나는 든든이야. 지금 뭐 먹으려고?";
const MIN_AGE = 1;
const MAX_AGE = 19;

// 홈/편의점 영양 조회 화면 우측 하단에만 뜨는 플로팅 챗봇 버튼 + 패널.
// 별도 탭/페이지 없이 이 위젯 하나로만 존재한다.
export default function ChatWidget() {
  const { age, setAge } = useChildAge();
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: "bot", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [awaitingAge, setAwaitingAge] = useState(false);
  const [loading, setLoading] = useState(false);

  function addMessage(msg: Omit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: nextId() }]);
  }

  async function askBot(message: string, currentAge: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, age: currentAge }),
      });
      if (!res.ok) throw new Error("chat request failed");
      const data: ChatReply & { needsAge: boolean } = await res.json();
      addMessage({
        role: "bot",
        text: data.reply,
        card: data.card ?? undefined,
        recommendationCard: data.recommendationCard ?? undefined,
        alternatives:
          data.alternatives && data.alternatives.length > 0 ? data.alternatives : undefined,
        matched: data.matched,
        showAlternatives: !data.matched,
      });
    } catch {
      addMessage({ role: "bot", text: "잠깐 문제가 생겼어요. 다시 한 번 말해줄래?" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    addMessage({ role: "user", text });

    if (awaitingAge) {
      const digits = text.match(/\d+/);
      const parsedAge = digits ? Number(digits[0]) : NaN;
      if (!Number.isFinite(parsedAge) || parsedAge < MIN_AGE || parsedAge > MAX_AGE) {
        addMessage({ role: "bot", text: "숫자로 몇 살인지 말해줄래?" });
        return;
      }
      setAge(parsedAge);
      setAwaitingAge(false);
      const original = pendingMessage;
      setPendingMessage(null);
      if (original) await askBot(original, parsedAge);
      return;
    }

    if (age === null) {
      setPendingMessage(text);
      setAwaitingAge(true);
      addMessage({ role: "bot", text: "몇 살이에요?" });
      return;
    }

    await askBot(text, age);
  }

  function toggleAlternatives(id: number) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, showAlternatives: !m.showAlternatives } : m))
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="든든이 챗봇 열기"
        className="absolute bottom-24 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition active:scale-95"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT_SRC} alt="든든이" className="h-12 w-12 object-contain" />
      </button>
    );
  }

  return (
    <div className="absolute inset-x-4 bottom-24 top-16 z-50 flex flex-col overflow-hidden rounded-3xl bg-cream shadow-2xl ring-1 ring-black/10 sm:inset-x-6">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT_SRC} alt="" className="h-9 w-9 object-contain" />
        <span className="flex-1 text-base font-bold text-gray-800">든든이</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-gray-400 transition active:scale-95"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} onToggleAlternatives={() => toggleAlternatives(m.id)} />
        ))}
        {loading && (
          <div className="max-w-[80%] self-start rounded-2xl bg-white px-4 py-3 text-sm text-gray-400 shadow-sm">
            생각 중...
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex shrink-0 gap-2 border-t border-gray-100 bg-white p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 참치김밥 먹으려고"
          className="h-12 flex-1 rounded-2xl border border-gray-100 bg-cream px-4 text-base font-bold text-gray-700 outline-none placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 shrink-0 rounded-2xl bg-c-green px-4 text-base font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  );
}

function ChatBubble({
  message,
  onToggleAlternatives,
}: {
  message: ChatMessage;
  onToggleAlternatives: () => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={MASCOT_SRC} alt="" className="h-6 w-6 shrink-0 object-contain" />
      )}
      <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-bold shadow-sm ${
            isUser ? "bg-c-green text-white" : "bg-white text-gray-800"
          }`}
        >
          {message.text}
        </div>

        {message.card && <NutrientMiniCard card={message.card} />}
        {message.recommendationCard && (
          <NutrientMiniCard card={message.recommendationCard} highlight />
        )}

        {message.alternatives && message.alternatives.length > 0 && (
          <>
            {message.matched && (
              <button
                type="button"
                onClick={onToggleAlternatives}
                className="text-xs font-bold text-gray-400 underline underline-offset-2"
              >
                {message.showAlternatives
                  ? "접기"
                  : `다른 ${message.alternatives[0].category}도 볼래요?`}
              </button>
            )}
            {message.showAlternatives && (
              <div className="flex w-full max-w-[85%] flex-col gap-2">
                {message.alternatives.map((alt) => (
                  <div
                    key={alt.id}
                    className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-2"
                  >
                    <span className="text-xl">
                      <Icon icon={alt.emoji} />
                    </span>
                    <span className="text-xs font-bold text-gray-700">{alt.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NutrientMiniCard({ card, highlight }: { card: MiniCard; highlight?: boolean }) {
  return (
    <div
      className={`flex max-w-[85%] items-center gap-3 rounded-2xl border p-3 ${
        highlight ? "border-c-green bg-c-green/5" : "border-gray-100 bg-white"
      }`}
    >
      <span className="text-2xl">
        <Icon icon={card.emoji} />
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-800">{card.name}</span>
        <span className="text-xs text-gray-400">
          에너지 {card.energyKcal}kcal · 단백질 {card.proteinG}g · 나트륨 {card.sodiumMg}mg
        </span>
      </div>
    </div>
  );
}
